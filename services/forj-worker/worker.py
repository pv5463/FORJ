"""Worker entrypoint — runs FastAPI + job loop together."""
import asyncio
import logging
import threading

import uvicorn

from app.jobs.dispatcher import run_job_loop
from app.main import app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


def _run_loop_in_thread() -> None:
    """Run the asyncio job loop in its own thread (separate from uvicorn's loop)."""
    asyncio.run(run_job_loop())


if __name__ == "__main__":
    # Start job loop in a daemon thread so it dies with the process
    loop_thread = threading.Thread(target=_run_loop_in_thread, daemon=True, name="job-loop")
    loop_thread.start()

    # Start FastAPI server (blocking)
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info",
        access_log=True,
    )
