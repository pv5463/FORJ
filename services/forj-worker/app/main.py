"""
FORJ Worker — FastAPI service for long-running jobs.
Exposes /health and /metrics only.
All job work happens in the background loop (run_loop.py).
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.config import settings
from app.metrics import get_metrics

app = FastAPI(
    title="FORJ Worker",
    description="Background job processor for GitHub analysis and sandbox assessment",
    version="0.1.0",
    docs_url=None,    # No public swagger in prod
    redoc_url=None,
)


@app.get("/health", tags=["ops"])
async def health():
    """Liveness probe — returns 200 if the worker process is alive."""
    return {"status": "ok", "version": "0.1.0"}


@app.get("/metrics", tags=["ops"])
async def metrics():
    """Prometheus-compatible metrics for monitoring."""
    return JSONResponse(content=get_metrics())
