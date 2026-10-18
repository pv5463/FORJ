"""
Hidden automated test suite for Mini Job Application API.
Evaluates endpoints, validation, status transitions, and data integrity.
"""
import pytest
from fastapi.testclient import TestClient

def test_api_suite(solution_module):
    """Run all hidden test cases against the candidate's FastAPI app."""
    assert hasattr(solution_module, "app"), "Candidate code must define a FastAPI instance named 'app'"
    client = TestClient(solution_module.app)

    # 1. Test POST /applications with valid payload
    payload = {
        "candidate_name": "Alice Turing",
        "email": "alice@example.com",
        "role_id": "role-101",
        "experience_years": 3,
    }
    r = client.post("/applications", json=payload)
    assert r.status_code == 201, f"Expected 201 Created on POST /applications, got {r.status_code}: {r.text}"
    data = r.json()
    assert "id" in data, "Created application must have an 'id'"
    assert data["status"] == "pending", "Initial status must be 'pending'"
    app_id = data["id"]

    # 2. Test POST /applications with invalid email
    bad_payload = {
        "candidate_name": "Bob",
        "email": "not-an-email",
        "role_id": "role-101",
        "experience_years": 2,
    }
    r_bad = client.post("/applications", json=bad_payload)
    assert r_bad.status_code in [400, 422], f"Expected 400/422 for invalid email, got {r_bad.status_code}"

    # 3. Test GET /applications/{id}
    r_get = client.get(f"/applications/{app_id}")
    assert r_get.status_code == 200, f"Expected 200 for existing application, got {r_get.status_code}"
    assert r_get.json()["id"] == app_id
    assert r_get.json()["candidate_name"] == "Alice Turing"

    # 4. Test GET /applications/missing-id returns 404
    r_404 = client.get("/applications/non-existent-uuid-999")
    assert r_404.status_code == 404, f"Expected 404 for missing application, got {r_404.status_code}"

    # 5. Test PUT /applications/{id}/status valid transition
    r_put = client.put(f"/applications/{app_id}/status", json={"status": "shortlisted"})
    assert r_put.status_code == 200, f"Expected 200 on valid status update, got {r_put.status_code}"
    assert r_put.json()["status"] == "shortlisted"

    # 6. Test PUT /applications/{id}/status invalid status
    r_put_bad = client.put(f"/applications/{app_id}/status", json={"status": "bogus_status_xyz"})
    assert r_put_bad.status_code in [400, 422], f"Expected 400 for invalid status, got {r_put_bad.status_code}"

    # 7. Test GET /applications filter by role_id
    client.post("/applications", json={
        "candidate_name": "Charlie",
        "email": "charlie@example.com",
        "role_id": "role-202",
        "experience_years": 5,
    })
    r_filter = client.get("/applications?role_id=role-101")
    assert r_filter.status_code == 200
    filtered = r_filter.json()
    assert all(item["role_id"] == "role-101" for item in filtered), "Filter by role_id failed"
