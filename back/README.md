# NLQ Catalog API (Back)

FastAPI service that exposes a catalog of natural-language analytics questions and SQL template mappings.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`: basic health check
- `GET /match`: query-to-template matcher using lightweight lexical similarity (query params: `query`, `top_k`, `min_score`)

## API samples

### Match a natural-language question

Request:

```bash
curl "http://localhost:8000/match?query=로딩 시간이 가장 긴 페이지 TOP 10 알려줘&top_k=2&min_score=0.2"
```

Response (example):

```json
{
  "query": "로딩 시간이 가장 긴 페이지 TOP 10 알려줘",
  "strategy": "lexical_jaccard_bigrams_or_sequence_match",
  "min_score": 0.2,
  "matches": [
    {
      "score": 0.54,
      "category": "성능/로딩",
      "question_type": "로딩시간 TOP N",
      "parameters": ["days", "topN"],
      "base_table": "maxy_page_daily",
      "sql": "SELECT page_name, avgMerge(avg_loading_tm) AS avg_loading FROM maxy_page_daily WHERE log_date >= today()-{days} GROUP BY page_name ORDER BY avg_loading DESC LIMIT {topN}",
      "search_text": "성능/로딩 로딩시간 TOP N ..."
    }
  ]
}
```

Notes:

- `min_score` 이하의 결과는 필터링됩니다. 질문과 템플릿이 매칭되지 않는 경우 `matches` 배열이 비어 있습니다.
- `strategy` 필드는 매칭 방식(lexical Jaccard + 문자 bigram or 시퀀스 유사도)을 설명합니다.
<<<<<<< HEAD

=======
>>>>>>> 9131af1b1be34c8bbdd3a1ce47155e5e32a3cad5
