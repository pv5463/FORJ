"""
Job dispatcher and loop.
Claims jobs from the Postgres queue and dispatches them.
Runs in a separate thread alongside the FastAPI server.
"""
import asyncio
import json
import logging
import time

import asyncpg

from app.config import settings
from app.metrics import increment

logger = logging.getLogger(__name__)


# ─── Job handlers ─────────────────────────────────────────────
async def handle_noop(payload: dict) -> None:
    """No-op job for smoke-testing the queue end-to-end."""
    logger.info("noop job: payload=%s", payload)
    increment("noop_jobs")
    await asyncio.sleep(0.1)   # simulate tiny work


async def handle_github_analysis(payload: dict) -> None:
    """Full implementation for Phase 2A: analyzes GitHub repos and generates readiness report."""
    from .github_handler import execute_github_analysis
    await execute_github_analysis(payload)


async def handle_assessment_run(payload: dict) -> None:
    """Stub: full implementation in Phase 2B (sandbox module)."""
    from .assessment import runner  # noqa: F401 — will raise ImportError until Phase 2B
    await runner.run(payload)


HANDLERS = {
    "noop": handle_noop,
    "github_analysis": handle_github_analysis,
    "assessment_run": handle_assessment_run,
}


# ─── Queue interaction (asyncpg) ───────────────────────────────
async def claim_job(conn: asyncpg.Connection) -> dict | None:
    types_sql = "ARRAY[" + ",".join(f"'{t}'::job_type" for t in settings.job_types) + "]"
    row = await conn.fetchrow(
        f"SELECT * FROM claim_job($1, {types_sql})",
        settings.worker_id,
    )
    return dict(row) if row else None


async def complete_job(conn: asyncpg.Connection, job_id: str) -> None:
    await conn.execute("SELECT complete_job($1::uuid)", job_id)


async def fail_job(conn: asyncpg.Connection, job_id: str, error: str) -> None:
    await conn.execute("SELECT fail_job($1::uuid, $2)", job_id, error[:2000])


async def recover_stale(conn: asyncpg.Connection) -> int:
    result = await conn.fetchval("SELECT recover_stale_jobs(10)")
    return result or 0


# ─── Main job loop ─────────────────────────────────────────────
async def run_job_loop() -> None:
    """
    Continuous poll loop.
    1. Connect to Postgres directly (bypasses Supabase pooler for SKIP LOCKED).
    2. Claim one job.
    3. Dispatch to handler.
    4. Mark complete or fail with exponential backoff retry.
    """
    logger.info("Job loop starting. Worker ID: %s", settings.worker_id)
    pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=1,
        max_size=3,
        ssl="require",
        statement_cache_size=0,
    )

    iteration = 0
    while True:
        try:
            async with pool.acquire() as conn:
                # Every 60 iterations (~5 min at default poll rate) recover stale jobs
                if iteration % 60 == 0:
                    recovered = await recover_stale(conn)
                    if recovered:
                        logger.warning("Recovered %d stale jobs", recovered)
                        increment("jobs_recovered", recovered)

                job = await claim_job(conn)

            if job is None:
                await asyncio.sleep(settings.poll_interval_seconds)
                iteration += 1
                continue

            job_id = str(job["id"])
            job_type = job["type"]
            payload = job["payload"] or {}
            
            # Parse payload if it's a JSON string
            if isinstance(payload, str):
                import json
                payload = json.loads(payload) if payload else {}
            
            logger.info("Claimed job %s type=%s attempt=%d", job_id, job_type, job["attempts"])
            increment("jobs_claimed")

            handler = HANDLERS.get(job_type)
            if handler is None:
                async with pool.acquire() as conn:
                    await fail_job(conn, job_id, f"No handler registered for type: {job_type}")
                increment("jobs_failed")
            else:
                try:
                    await handler(payload)
                    async with pool.acquire() as conn:
                        await complete_job(conn, job_id)
                    logger.info("Job %s completed", job_id)
                    increment("jobs_completed")
                except Exception as exc:
                    err_msg = f"{type(exc).__name__}: {exc}"
                    logger.exception("Job %s failed: %s", job_id, err_msg)
                    async with pool.acquire() as conn:
                        await fail_job(conn, job_id, err_msg)
                    increment("jobs_failed")

        except Exception as outer_exc:
            logger.exception("Job loop error (will retry): %s", outer_exc)
            await asyncio.sleep(settings.poll_interval_seconds * 2)

        iteration += 1
