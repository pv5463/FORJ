"""Simple in-memory metrics counters for the worker."""
import time
from threading import Lock

_lock = Lock()
_start_time = time.time()
_counters: dict[str, int] = {
    "jobs_claimed": 0,
    "jobs_completed": 0,
    "jobs_failed": 0,
    "jobs_recovered": 0,
    "noop_jobs": 0,
}


def increment(key: str, by: int = 1) -> None:
    with _lock:
        _counters[key] = _counters.get(key, 0) + by


def get_metrics() -> dict:
    with _lock:
        return {
            "uptime_seconds": round(time.time() - _start_time, 1),
            **_counters,
        }
