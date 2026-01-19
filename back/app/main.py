from pathlib import Path
import json
import re
from typing import Any

from fastapi import FastAPI, Query

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "nlq_catalog.json"

with DATA_PATH.open("r", encoding="utf-8") as data_file:
    CATALOG = json.load(data_file)

app = FastAPI(title="NLQ Catalog API", version="0.1.0")

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
) -> dict[str, Any]:
    scored = [
        {
            "score": _jaccard_similarity(query, template["search_text"]),
            **template,
        }
        for template in TEMPLATE_INDEX
    ]
    scored.sort(key=lambda item: item["score"], reverse=True)
    top_matches = scored[:top_k]
    return {
        "query": query,
        "strategy": "lexical_jaccard_with_bigrams",
        "matches": top_matches,
    }
