
import asyncio
from app.jobs.github_handler import execute_github_analysis

payload = {
    "analysis_id": "5c5242d4-fa63-4dad-8cba-250e1cb615c0",
    "user_id": "aaaaaaaa-0000-0000-0000-000000000001",
    "github_username": "forj-demo-engineer",
    "role_profile_id": "cccccccc-0001-0001-0001-000000000001"
}

asyncio.run(execute_github_analysis(payload))
print("PYTHON_WORKER_SUCCESS")
