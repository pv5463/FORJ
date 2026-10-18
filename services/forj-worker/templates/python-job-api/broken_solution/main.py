"""
Broken solution for Mini Job Application API.
Has missing endpoints, broken validation, and incorrect status codes.
"""
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/applications")
def create():
    # Broken: returns 200 instead of 201, no validation, hardcoded id
    return {"id": "1", "status": "always_pending"}

@app.get("/applications/{app_id}")
def get_app(app_id: str):
    # Broken: always returns empty dict
    return {}
