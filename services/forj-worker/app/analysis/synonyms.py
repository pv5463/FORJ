"""
Synonym map and skill identifier dictionary for FORJ Skill Verification.
Maps programming languages, dependency package names, and tool identifiers
to the stable skill IDs seeded in FORJ database.
"""

from typing import Dict, Optional, Tuple

# Stable UUIDs matching seed.sql / migration 0004
SKILL_MAP: Dict[str, Tuple[str, str, str]] = {
    # identifier -> (skill_id, display_name, category)
    "python": ("11111111-0001-0001-0001-000000000001", "Python", "programming"),
    "javascript": ("11111111-0001-0001-0001-000000000002", "JavaScript", "programming"),
    "typescript": ("11111111-0001-0001-0001-000000000003", "TypeScript", "programming"),
    "java": ("11111111-0001-0001-0001-000000000004", "Java", "programming"),
    "c++": ("11111111-0001-0001-0001-000000000005", "C++", "programming"),
    "go": ("11111111-0001-0001-0001-000000000006", "Go", "programming"),
    "rust": ("11111111-0001-0001-0001-000000000007", "Rust", "programming"),
    "react": ("11111111-0001-0001-0001-000000000011", "React", "frontend"),
    "next.js": ("11111111-0001-0001-0001-000000000012", "Next.js", "frontend"),
    "vue.js": ("11111111-0001-0001-0001-000000000013", "Vue.js", "frontend"),
    "tailwind css": ("11111111-0001-0001-0001-000000000015", "Tailwind CSS", "frontend"),
    "css": ("11111111-0001-0001-0001-000000000016", "CSS", "frontend"),
    "html": ("11111111-0001-0001-0001-000000000017", "HTML", "frontend"),
    "node.js": ("11111111-0001-0001-0001-000000000021", "Node.js", "backend"),
    "fastapi": ("11111111-0001-0001-0001-000000000022", "FastAPI", "backend"),
    "django": ("11111111-0001-0001-0001-000000000023", "Django", "backend"),
    "postgresql": ("11111111-0001-0001-0001-000000000024", "PostgreSQL", "backend"),
    "mysql": ("11111111-0001-0001-0001-000000000025", "MySQL", "backend"),
    "redis": ("11111111-0001-0001-0001-000000000026", "Redis", "backend"),
    "graphql": ("11111111-0001-0001-0001-000000000027", "GraphQL", "backend"),
    "rest apis": ("11111111-0001-0001-0001-000000000028", "REST APIs", "backend"),
    "docker": ("11111111-0001-0001-0001-000000000029", "Docker", "devops"),
    "kubernetes": ("11111111-0001-0001-0001-000000000030", "Kubernetes", "devops"),
    "git": ("11111111-0001-0001-0001-000000000033", "Git", "devops"),
    "github actions": ("11111111-0001-0001-0001-000000000034", "GitHub Actions", "devops"),
    "ci/cd": ("11111111-0001-0001-0001-000000000035", "CI/CD", "devops"),
    "machine learning": ("11111111-0001-0001-0001-000000000036", "Machine Learning", "data_ai"),
    "data analysis": ("11111111-0001-0001-0001-000000000040", "Data Analysis", "data_ai"),
    "pandas": ("11111111-0001-0001-0001-000000000041", "Pandas", "data_ai"),
    "system design": ("11111111-0001-0001-0001-000000000081", "System Design", "architecture"),
    "microservices": ("11111111-0001-0001-0001-000000000082", "Microservices", "architecture"),
}

# Package name synonyms mapped to primary skill identifier
DEPENDENCY_SYNONYMS: Dict[str, str] = {
    # Python
    "fastapi": "fastapi",
    "uvicorn": "fastapi",
    "starlette": "fastapi",
    "django": "django",
    "djangorestframework": "django",
    "flask": "python",
    "sqlalchemy": "postgresql",
    "psycopg2": "postgresql",
    "psycopg2-binary": "postgresql",
    "asyncpg": "postgresql",
    "pymysql": "mysql",
    "mysqlclient": "mysql",
    "redis": "redis",
    "pandas": "pandas",
    "numpy": "data analysis",
    "scipy": "data analysis",
    "scikit-learn": "machine learning",
    "torch": "machine learning",
    "tensorflow": "machine learning",
    "pytest": "python",
    "httpx": "rest apis",
    "requests": "rest apis",
    # JavaScript / Node
    "react": "react",
    "react-dom": "react",
    "next": "next.js",
    "vue": "vue.js",
    "nuxt": "vue.js",
    "express": "node.js",
    "koa": "node.js",
    "fastify": "node.js",
    "nestjs": "node.js",
    "@nestjs/core": "node.js",
    "tailwindcss": "tailwind css",
    "@tailwind": "tailwind css",
    "pg": "postgresql",
    "prisma": "postgresql",
    "@prisma/client": "postgresql",
    "typeorm": "postgresql",
    "mysql2": "mysql",
    "graphql": "graphql",
    "@apollo/server": "graphql",
    "axios": "rest apis",
    "typescript": "typescript",
}


def resolve_skill(raw_term: str) -> Optional[Tuple[str, str, str]]:
    """
    Resolve raw technology term (e.g. from GitHub language or package name)
    to (skill_id, display_name, category).
    """
    cleaned = raw_term.lower().strip()

    # Direct match in SKILL_MAP
    if cleaned in SKILL_MAP:
        return SKILL_MAP[cleaned]

    # Match in DEPENDENCY_SYNONYMS
    if cleaned in DEPENDENCY_SYNONYMS:
        mapped_key = DEPENDENCY_SYNONYMS[cleaned]
        return SKILL_MAP.get(mapped_key)

    return None
