from pathlib import Path
import json
import logging
import re
from difflib import SequenceMatcher
from typing import Any

from fastapi import FastAPI, Query, Request

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "nlq_catalog.json"

with DATA_PATH.open("r", encoding="utf-8") as data_file:
    CATALOG = json.load(data_file)

app = FastAPI(title="NLQ Catalog API", version="0.1.0")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("nlq.catalog")

_NON_WORD_PATTERN = re.compile(r"[^0-9a-zA-Z가-힣]+")


def _normalize(text: str) -> str:
    return _NON_WORD_PATTERN.sub(" ", text.strip().lower())


def _tokenize(text: str) -> set[str]:
    normalized = _normalize(text)
    word_tokens = {token for token in normalized.split() if token}
    compact = normalized.replace(" ", "")
    bigrams = {compact[index : index + 2] for index in range(len(compact) - 1)} if len(compact) >= 2 else set()
    return word_tokens | bigrams


def _jaccard_similarity(left: str, right: str) -> float:
    left_tokens = _tokenize(left)
    right_tokens = _tokenize(right)
    if not left_tokens and not right_tokens:
        return 1.0
    if not left_tokens or not right_tokens:
        return 0.0
    intersection = left_tokens & right_tokens
    union = left_tokens | right_tokens
    return len(intersection) / len(union)


def _sequence_similarity(left: str, right: str) -> float:
    left_normalized = _normalize(left)
    right_normalized = _normalize(right)
    if not left_normalized or not right_normalized:
        return 0.0
    return SequenceMatcher(None, left_normalized, right_normalized).ratio()


def _combined_similarity(query: str, candidate: str) -> float:
    return max(_jaccard_similarity(query, candidate), _sequence_similarity(query, candidate))


def _build_template_index(catalog: dict[str, Any]) -> list[dict[str, Any]]:
    questions_by_category = {
        entry["name"]: entry.get("questions", []) for entry in catalog.get("categories", [])
    }

    template_index: list[dict[str, Any]] = []
    for template in catalog.get("templates", []):
        category = template.get("category", "")
        question_type = template.get("question_type", "")
        sample_questions = questions_by_category.get(category, [])
        search_text = " ".join([category, question_type, *sample_questions])
        template_index.append(
            {
                "category": category,
                "question_type": question_type,
                "parameters": template.get("parameters", []),
                "base_table": template.get("base_table", ""),
                "sql": template.get("sql", ""),
                "search_text": search_text,
            }
        )
    return template_index


TEMPLATE_INDEX = _build_template_index(CATALOG)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(
        "request start method=%s path=%s query=%s",
        request.method,
        request.url.path,
        request.url.query,
    )
    response = await call_next(request)
    logger.info(
        "request end method=%s path=%s status=%s",
        request.method,
        request.url.path,
        response.status_code,
    )
    return response


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/catalog")
def catalog() -> dict:
    return CATALOG


@app.get("/match")
def match_query(
    query: str = Query(..., min_length=2, description="사용자가 입력한 자연어 질문"),
    top_k: int = Query(3, ge=1, le=5, description="반환할 상위 매칭 템플릿 수"),
    min_score: float = Query(0.2, ge=0.0, le=1.0, description="매칭 결과로 인정할 최소 점수"),
) -> dict[str, Any]:
    scored = [
        {
            "score": _combined_similarity(query, template["search_text"]),
            **template,
        }
        for template in TEMPLATE_INDEX
    ]
    scored.sort(key=lambda item: item["score"], reverse=True)
    top_matches = [match for match in scored[:top_k] if match["score"] >= min_score]
    logger.info(
        "match query=%s top_k=%s min_score=%.2f matches=%s top_score=%.3f",
        query,
        top_k,
        min_score,
        len(top_matches),
        scored[0]["score"] if scored else 0.0,
    )
    return {
        "query": query,
        "strategy": "lexical_jaccard_bigrams_or_sequence_match",
        "min_score": min_score,
        "matches": top_matches,
    }
