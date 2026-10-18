"""Worker configuration from environment variables."""
import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

# Search for root .env or local .env
root_dir = Path(__file__).resolve().parent.parent.parent.parent
env_candidates = [root_dir / ".env", Path(".env")]
for env_path in env_candidates:
    if env_path.exists():
        load_dotenv(env_path)
        break


@dataclass
class Settings:
    # Supabase
    supabase_url: str = field(
        default_factory=lambda: os.environ.get("SUPABASE_URL")
        or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://mlhrtysatsqqtnyfmldg.supabase.co")
    )
    supabase_service_role_key: str = field(
        default_factory=lambda: os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    )
    database_url: str = field(
        default_factory=lambda: os.environ.get(
            "DATABASE_URL",
            "postgresql://postgres.mlhrtysatsqqtnyfmldg:TgQLumsltmlmWXbg@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
        )
    )

    # GitHub
    github_token: str = field(default_factory=lambda: os.environ.get("GITHUB_TOKEN", ""))

    # LLM
    llm_api_key: str = field(default_factory=lambda: os.environ.get("LLM_API_KEY", ""))
    llm_api_url: str = field(
        default_factory=lambda: os.environ.get(
            "LLM_API_URL",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        )
    )

    # Worker
    worker_id: str = field(default_factory=lambda: os.environ.get("WORKER_ID", "worker-local"))
    poll_interval_seconds: float = field(
        default_factory=lambda: float(os.environ.get("POLL_INTERVAL_SECONDS", "5"))
    )
    job_types: list = field(
        default_factory=lambda: os.environ.get(
            "JOB_TYPES", "github_analysis,assessment_run,noop"
        ).split(",")
    )

    # Docker sandbox
    sandbox_network: str = field(
        default_factory=lambda: os.environ.get("SANDBOX_NETWORK", "none")
    )
    sandbox_memory_mb: int = field(
        default_factory=lambda: int(os.environ.get("SANDBOX_MEMORY_MB", "256"))
    )
    sandbox_cpu_quota: int = field(
        default_factory=lambda: int(os.environ.get("SANDBOX_CPU_QUOTA", "50000"))  # 50% of 1 CPU
    )


settings = Settings()
