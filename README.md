# NLQ Catalog API

FastAPI service that exposes a catalog of natural-language analytics questions and SQL template mappings.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`: basic health check
- `GET /catalog`: full catalog payload (questions, templates, auto-generation rules)
