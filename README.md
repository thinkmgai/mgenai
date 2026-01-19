# NLQ Search Workspace

This repository is split into `front` (Next.js UI) and `back` (FastAPI service).

## Front (Next.js)

```bash
cd front
npm install
npm run dev
```

## Back (FastAPI)

```bash
cd back
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`: basic health check
- `GET /catalog`: full catalog payload (questions, templates, auto-generation rules)
