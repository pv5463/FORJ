"""
GitHub Analysis Job Handler for FORJ Worker.
Executes repository analysis, stores rule-based & AI-interpreted skill evidence,
and calculates the candidate's skill readiness report.
"""

from datetime import datetime
import json
import logging
from typing import Any, Dict
import asyncpg

from ..analysis.analyzer import RepositoryAnalyzer
from ..analysis.readiness import generate_readiness_report
from ..config import settings
from ..metrics import increment

logger = logging.getLogger("forj-worker.jobs.github")


async def execute_github_analysis(payload: Dict[str, Any]) -> None:
    """
    Process a 'github_analysis' job.
    payload: {
      "analysis_id": str,
      "user_id": str,
      "github_username": str,
      "role_profile_id": Optional[str]
    }
    """
    analysis_id = payload.get("analysis_id")
    user_id = payload.get("user_id")
    username = payload.get("github_username")
    role_profile_id = payload.get("role_profile_id")

    if not analysis_id or not user_id or not username:
        raise ValueError(f"Incomplete payload for github_analysis: {payload}")

    logger.info(f"Starting GitHub analysis {analysis_id} for user {user_id} (@{username})")

    conn = await asyncpg.connect(settings.database_url, ssl="require", statement_cache_size=0)
    try:
        # Mark analysis as running
        await conn.execute(
            """
            UPDATE public.github_analyses
            SET status = 'running', started_at = now()
            WHERE id = $1::uuid
            """,
            analysis_id,
        )

        analyzer = RepositoryAnalyzer()
        analysis_result = await analyzer.analyze_candidate_github(
            username=username,
            user_id=user_id,
            analysis_id=analysis_id,
        )

        repositories = analysis_result.get("repositories", [])
        evidence_items = analysis_result.get("evidence", [])

        # 1. Upsert repositories into public.repositories
        repo_id_map: Dict[int, str] = {}  # github_repo_id -> internal UUID
        for r in repositories:
            pushed_at_dt = None
            if r.get("pushed_at"):
                if isinstance(r["pushed_at"], str):
                    try:
                        pushed_at_dt = datetime.fromisoformat(r["pushed_at"].replace("Z", "+00:00"))
                    except Exception:
                        pushed_at_dt = None
                else:
                    pushed_at_dt = r["pushed_at"]

            row = await conn.fetchrow(
                """
                INSERT INTO public.repositories (
                  user_id, github_repo_id, full_name, description,
                  primary_language, languages, is_fork, stars, pushed_at, selected, last_analyzed_at
                )
                VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, now())
                ON CONFLICT (user_id, github_repo_id) DO UPDATE
                SET full_name = EXCLUDED.full_name,
                    description = EXCLUDED.description,
                    primary_language = EXCLUDED.primary_language,
                    languages = EXCLUDED.languages,
                    stars = EXCLUDED.stars,
                    pushed_at = EXCLUDED.pushed_at,
                    last_analyzed_at = now()
                RETURNING id, github_repo_id
                """,
                user_id,
                r["github_repo_id"],
                r["full_name"],
                r["description"],
                r["primary_language"],
                json.dumps(r["languages"]),
                r["is_fork"],
                r["stars"],
                pushed_at_dt,
                r["selected"],
            )
            if row:
                repo_id_map[row["github_repo_id"]] = str(row["id"])

        # 2. Insert skill evidence into public.user_skill_evidence
        for ev in evidence_items:
            internal_repo_id = repo_id_map.get(ev.get("github_repo_id"))
            await conn.execute(
                """
                INSERT INTO public.user_skill_evidence (
                  user_id, skill_id, repository_id, analysis_id,
                  evidence_type, detail, evidence_url, observed_by, confidence
                )
                VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, $8, $9)
                """,
                user_id,
                ev["skill_id"],
                internal_repo_id,
                analysis_id,
                ev["evidence_type"],
                ev["detail"],
                ev["evidence_url"],
                ev["observed_by"],
                ev["confidence"],
            )

        # 3. Determine target role profile for readiness report
        if not role_profile_id:
            # Pick default Junior Python or Frontend role
            default_role = await conn.fetchrow(
                "SELECT id FROM public.role_profiles ORDER BY name ASC LIMIT 1"
            )
            if default_role:
                role_profile_id = str(default_role["id"])

        if role_profile_id:
            role_row = await conn.fetchrow(
                "SELECT id, name, description, weights FROM public.role_profiles WHERE id = $1::uuid",
                role_profile_id,
            )
            if role_row:
                role_profile = dict(role_row)
                if isinstance(role_profile.get("weights"), str):
                    role_profile["weights"] = json.loads(role_profile["weights"])

                # Fetch required role skills with display names
                skill_rows = await conn.fetch(
                    """
                    SELECT rps.skill_id, rps.required_level, rps.importance, s.name as skill_name, s.category
                    FROM public.role_profile_skills rps
                    JOIN public.skills s ON s.id = rps.skill_id
                    WHERE rps.role_profile_id = $1::uuid
                    """,
                    role_profile_id,
                )
                role_skills = [dict(sr) for sr in skill_rows]

                readiness = generate_readiness_report(
                    role_profile=role_profile,
                    role_skills=role_skills,
                    user_evidence=evidence_items,
                    repositories=repositories,
                )

                # Save skill readiness report
                await conn.execute(
                    """
                    INSERT INTO public.skill_readiness_reports (
                      user_id, role_profile_id, analysis_id, breakdown, overall_score
                    )
                    VALUES ($1::uuid, $2::uuid, $3::uuid, $4::jsonb, $5)
                    """,
                    user_id,
                    role_profile_id,
                    analysis_id,
                    json.dumps(readiness["breakdown"]),
                    readiness["overall_score"],
                )

        # 4. Update analysis record to completed
        await conn.execute(
            """
            UPDATE public.github_analyses
            SET status = 'completed',
                finished_at = now(),
                repos_considered = $2
            WHERE id = $1::uuid
            """,
            analysis_id,
            len(repositories),
        )

        # 5. Update github_connections last_analyzed_at
        await conn.execute(
            """
            UPDATE public.github_connections
            SET last_analyzed_at = now()
            WHERE user_id = $1::uuid
            """,
            user_id,
        )

        increment("github_analyses_completed")
        logger.info(
            f"GitHub analysis {analysis_id} completed: {len(repositories)} repos, {len(evidence_items)} evidence items"
        )

    except Exception as exc:
        err_msg = f"{type(exc).__name__}: {exc}"
        logger.exception(f"GitHub analysis {analysis_id} failed: {err_msg}")
        await conn.execute(
            """
            UPDATE public.github_analyses
            SET status = 'failed',
                finished_at = now(),
                error = $2
            WHERE id = $1::uuid
            """,
            analysis_id,
            err_msg[:2000],
        )
        raise exc
    finally:
        await conn.close()
