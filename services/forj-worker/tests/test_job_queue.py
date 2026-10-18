"""Tests for the job loop (uses a real Supabase connection for integration tests)."""
import asyncio
import os
import uuid

import asyncpg
import pytest

DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("TEST_DATABASE_URL")


@pytest.fixture
async def db():
    """Async asyncpg connection pool for tests."""
    pool = await asyncpg.create_pool(
        DATABASE_URL, ssl="require", min_size=1, max_size=2, statement_cache_size=0
    )
    yield pool
    await pool.close()


@pytest.mark.asyncio
async def test_enqueue_and_claim_noop_job(db):
    """Enqueue a noop job via SQL, claim it, complete it. Verifies queue round-trip."""
    worker_id = f"test-worker-{uuid.uuid4().hex[:8]}"

    async with db.acquire() as conn:
        # Enqueue
        job_id = await conn.fetchval(
            "SELECT enqueue_job($1::job_type, $2::jsonb)",
            "noop",
            '{"test": true}',
        )
        assert job_id is not None, "enqueue_job returned no id"

        # Claim
        row = await conn.fetchrow(
            "SELECT * FROM claim_job($1, ARRAY['noop'::job_type])", worker_id
        )
        assert row is not None, "claim_job returned no row"
        assert str(row["id"]) == str(job_id)
        assert row["status"] == "running"
        assert row["locked_by"] == worker_id

        # Complete
        await conn.execute("SELECT complete_job($1::uuid)", job_id)
        done = await conn.fetchrow("SELECT * FROM jobs WHERE id=$1", job_id)
        assert done["status"] == "done"


@pytest.mark.asyncio
async def test_fail_job_retries_with_backoff(db):
    """Failing a job requeues it with run_after in the future (backoff)."""
    worker_id = f"test-worker-{uuid.uuid4().hex[:8]}"

    async with db.acquire() as conn:
        job_id = await conn.fetchval(
            "SELECT enqueue_job($1::job_type, $2::jsonb)", "noop", '{"fail_test": true}'
        )
        # Claim
        await conn.fetchrow("SELECT * FROM claim_job($1, ARRAY['noop'::job_type])", worker_id)
        # Fail once (attempts=1, max=3, should requeue)
        await conn.execute("SELECT fail_job($1::uuid, $2)", job_id, "test error")
        row = await conn.fetchrow("SELECT * FROM jobs WHERE id=$1", job_id)
        assert row["status"] == "queued", f"Expected queued after first fail, got {row['status']}"
        assert row["last_error"] == "test error"
        # run_after should be in the future
        import datetime
        assert row["run_after"] > datetime.datetime.now(datetime.timezone.utc), \
            "run_after should be in the future after backoff"

        # Claim and fail again
        # Force run_after to NOW so we can claim it again
        await conn.execute("UPDATE jobs SET run_after=NOW() WHERE id=$1", job_id)
        await conn.fetchrow("SELECT * FROM claim_job($1, ARRAY['noop'::job_type])", worker_id)
        await conn.execute("SELECT fail_job($1::uuid, $2)", job_id, "test error 2")

        # Claim and fail final time (attempts=3 = max, should be 'failed')
        await conn.execute("UPDATE jobs SET run_after=NOW() WHERE id=$1", job_id)
        await conn.fetchrow("SELECT * FROM claim_job($1, ARRAY['noop'::job_type])", worker_id)
        await conn.execute("SELECT fail_job($1::uuid, $2)", job_id, "test error final")
        final = await conn.fetchrow("SELECT * FROM jobs WHERE id=$1", job_id)
        assert final["status"] == "failed", f"Expected failed after max attempts, got {final['status']}"
        assert "test error final" in final["last_error"]

        # Cleanup
        await conn.execute("DELETE FROM jobs WHERE id=$1", job_id)


@pytest.mark.asyncio
async def test_has_role_function_exists(db):
    """Verify has_role SQL function was created correctly."""
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT routine_name FROM information_schema.routines
            WHERE routine_schema='public' AND routine_name='has_role'
            """
        )
        assert row is not None, "has_role() function not found in public schema"


@pytest.mark.asyncio
async def test_user_roles_table_exists(db):
    """Verify user_roles table exists with correct RLS enabled."""
    async with db.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT tablename, rowsecurity FROM pg_tables
            WHERE schemaname='public' AND tablename='user_roles'
            """
        )
        assert row is not None, "user_roles table not found"
        assert row["rowsecurity"] is True, "RLS not enabled on user_roles"


@pytest.mark.asyncio
async def test_role_profiles_seeded(db):
    """Verify 6 role profiles were seeded."""
    async with db.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM role_profiles")
        assert count >= 6, f"Expected >= 6 role profiles, got {count}"


@pytest.mark.asyncio
async def test_role_profile_skills_seeded(db):
    """Verify role_profile_skills has entries for all 6 roles."""
    async with db.acquire() as conn:
        count = await conn.fetchval(
            "SELECT COUNT(DISTINCT role_profile_id) FROM role_profile_skills"
        )
        assert count >= 6, f"Expected skills for >= 6 role profiles, got {count}"
