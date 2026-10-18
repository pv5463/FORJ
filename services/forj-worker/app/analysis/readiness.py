"""
Skill Readiness Report generator for FORJ Skill Verification Engine.
Evaluates repository evidence against a specific role profile.
Enforces:
- Per-skill status is 'observed' or 'not_assessed' (missing evidence is NEVER zero).
- Proposed weights per role: technical skills 35, project quality 30, testing 20, documentation 15.
- Repository analysis is reported separately from practical challenge verification.
"""

from typing import Any, Dict, List, Optional


def generate_readiness_report(
    role_profile: Dict[str, Any],
    role_skills: List[Dict[str, Any]],
    user_evidence: List[Dict[str, Any]],
    repositories: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Compute structured breakdown and overall readiness score.
    """
    weights = role_profile.get("weights") or {
        "technical_skills": 35,
        "project_quality": 30,
        "testing_practices": 20,
        "documentation": 15,
    }

    # Group evidence by skill_id
    evidence_by_skill: Dict[str, List[Dict[str, Any]]] = {}
    for ev in user_evidence:
        sid = str(ev["skill_id"])
        evidence_by_skill.setdefault(sid, []).append(ev)

    skill_evaluations: List[Dict[str, Any]] = []
    observed_required_count = 0
    total_required_count = 0
    observed_total_count = 0

    for rs in role_skills:
        sid = str(rs["skill_id"])
        skill_name = rs.get("name") or rs.get("skill_name") or "Unknown"
        importance = rs.get("importance", 2)
        required_level = rs.get("required_level", 2)

        if importance >= 3:
            total_required_count += 1

        ev_list = evidence_by_skill.get(sid, [])
        if ev_list:
            observed_total_count += 1
            if importance >= 3:
                observed_required_count += 1

            # Format evidence items
            items = []
            for ev in ev_list:
                items.append(
                    {
                        "detail": ev.get("detail", ""),
                        "evidence_url": ev.get("evidence_url"),
                        "evidence_type": ev.get("evidence_type", "language_use"),
                        "observed_by": ev.get("observed_by", "rule"),
                        "confidence": float(ev.get("confidence", 1.0)),
                    }
                )

            skill_evaluations.append(
                {
                    "skill_id": sid,
                    "skill_name": skill_name,
                    "status": "observed",
                    "importance": importance,
                    "required_level": required_level,
                    "evidence_items": items,
                }
            )
        else:
            # MISSING EVIDENCE IS NOT ZERO — MARKED AS 'not_assessed'
            skill_evaluations.append(
                {
                    "skill_id": sid,
                    "skill_name": skill_name,
                    "status": "not_assessed",
                    "importance": importance,
                    "required_level": required_level,
                    "evidence_items": [],
                    "action_needed": "Complete practical challenge to verify this skill.",
                }
            )

    # ─── DIMENSION SCORES (0 - 100) ──────────────────────────────────
    # 1. Technical skills dimension: coverage of role skills
    tech_coverage = (
        (observed_total_count / max(1, len(role_skills))) * 100 if role_skills else 50.0
    )

    # 2. Project quality dimension: stars, multi-repo activity
    repo_count = len(repositories)
    has_manifests = sum(
        1 for r in repositories if r.get("languages") and len(r.get("languages")) > 0
    )
    quality_score = min(100.0, 40.0 + (min(repo_count, 5) * 8.0) + (min(has_manifests, 3) * 6.0))

    # 3. Testing practices dimension: test suite presence
    test_evidence_count = sum(
        1 for ev in user_evidence if ev.get("evidence_type") == "tests"
    )
    ci_evidence_count = sum(
        1 for ev in user_evidence if ev.get("evidence_type") == "structure" and "ci" in ev.get("detail", "").lower()
    )
    test_score = 30.0
    if test_evidence_count > 0:
        test_score += 40.0
    if ci_evidence_count > 0:
        test_score += 30.0
    test_score = min(100.0, test_score)

    # 4. Documentation dimension: READMEs and architecture
    doc_evidence_count = sum(
        1 for ev in user_evidence if ev.get("evidence_type") == "documentation"
    )
    doc_score = min(100.0, 40.0 + (min(doc_evidence_count, 3) * 20.0))

    # ─── WEIGHTED OVERALL READINESS SCORE ───────────────────────────
    w_tech = float(weights.get("technical_skills", 35))
    w_quality = float(weights.get("project_quality", 30))
    w_testing = float(weights.get("testing_practices", 20))
    w_docs = float(weights.get("documentation", 15))
    total_w = w_tech + w_quality + w_testing + w_docs

    overall_score = round(
        (
            tech_coverage * w_tech
            + quality_score * w_quality
            + test_score * w_testing
            + doc_score * w_docs
        )
        / max(1.0, total_w),
        1,
    )

    # Missing gaps for next actions
    gaps = [s for s in skill_evaluations if s["status"] == "not_assessed"]

    breakdown = {
        "role_title": role_profile.get("name", "Target Role"),
        "proposed_weights": weights,
        "weights_notice": "Proposed weights: technical skills 35%, project quality 30%, testing practices 20%, documentation 15%.",
        "dimensions": {
            "technical_skills": round(tech_coverage, 1),
            "project_quality": round(quality_score, 1),
            "testing_practices": round(test_score, 1),
            "documentation": round(doc_score, 1),
        },
        "stats": {
            "total_skills": len(role_skills),
            "observed_skills": observed_total_count,
            "not_assessed_skills": len(gaps),
            "required_observed": observed_required_count,
            "required_total": total_required_count,
            "repositories_analyzed": repo_count,
        },
        "skills": skill_evaluations,
        "next_actions": [
            {
                "skill_name": gap["skill_name"],
                "importance": gap["importance"],
                "recommendation": f"Take the '{gap['skill_name']}' practical verification challenge to fill this readiness gap.",
            }
            for gap in gaps[:4]
        ],
    }

    return {
        "overall_score": overall_score,
        "breakdown": breakdown,
    }
