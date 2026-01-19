from pathlib import Path
import json

from fastapi import FastAPI

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "nlq_catalog.json"

with DATA_PATH.open("r", encoding="utf-8") as data_file:
    CATALOG = json.load(data_file)

app = FastAPI(title="NLQ Catalog API", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/catalog")
def catalog() -> dict:
    return CATALOG
