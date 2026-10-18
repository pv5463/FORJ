"""
Repository and Skill Analyzer for FORJ Skill Verification Engine.
Performs rule-based evidence extraction (languages, manifests, tests, structure)
and AI-assisted interpretation with untrusted input defenses.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from app.github.client import GitHubClient
from app.llm.client import LLMClient
from app.analysis.synonyms import resolve_skill

logger = logging.getLogger("forj-worker.analyzer")


class RepositoryAnalyzer:
    """Extracts verified technical evidence from GitHub repositories."""

    def __init__(self, github_client: Optional[GitHubClient] = None, llm_client: Optional[LLMClient] = None):
        # Import here to avoid circular dependency
        from app.config import settings
        
        self.github = github_client or GitHubClient(token=settings.github_token)
        self.llm = llm_client or LLMClient()

    async def analyze_candidate_github(
        self,
        username: str,
        user_id: str,
        analysis_id: str,
    ) -> Dict[str, Any]:
        """
        Main analysis flow:
        1. Fetch repositories
        2. Extract rule-based evidence from languages, dependencies, tests, CI
        3. Extract AI interpretation from READMEs with strict prompt isolation
        4. Return structured repo data and skill evidence items
        """
        logger.info(f"Analyzing GitHub profile for {username} (analysis_id={analysis_id})")

        repos = await self.github.list_repositories(username)
        if not repos:
            logger.info(f"No eligible repositories found for {username}")
            return {"repositories": [], "evidence": []}

        saved_repos: List[Dict[str, Any]] = []
        evidence_items: List[Dict[str, Any]] = []

        for repo in repos:
            owner = username
            repo_name = repo["name"]
            full_name = repo["full_name"]
            primary_lang = repo["primary_language"]

            # 1. Fetch language breakdown
            languages = await self.github.get_repository_languages(owner, repo_name)
            repo["languages"] = languages

            # 2. Check directory tree
            tree_info = await self.github.check_directory_tree(owner, repo_name)

            # 3. Fetch manifest files and parse dependencies
            extracted_dependencies = await self._extract_manifest_dependencies(owner, repo_name, tree_info["manifest_files"])

            # 4. Fetch README
            readme_text = await self.github.get_readme(owner, repo_name)

            saved_repos.append(
                {
                    "user_id": user_id,
                    "github_repo_id": repo["github_repo_id"],
                    "full_name": full_name,
                    "description": repo["description"],
                    "primary_language": primary_lang,
                    "languages": languages,
                    "is_fork": repo["is_fork"],
                    "stars": repo["stars"],
                    "pushed_at": repo["pushed_at"],
                    "selected": True,
                }
            )

            # ─── RULE-BASED EVIDENCE EXTRACTION ──────────────────────
            # A. Language use evidence
            for lang, bytes_count in languages.items():
                resolved = resolve_skill(lang)
                if resolved:
                    skill_id, skill_name, _ = resolved
                    evidence_items.append(
                        {
                            "user_id": user_id,
                            "skill_id": skill_id,
                            "github_repo_id": repo["github_repo_id"],
                            "analysis_id": analysis_id,
                            "evidence_type": "language_use",
                            "detail": f"Active {skill_name} codebase ({bytes_count:,} bytes written in {repo_name}).",
                            "evidence_url": repo["html_url"],
                            "observed_by": "rule",
                            "confidence": 1.00,
                        }
                    )

            # B. Framework & dependency evidence from manifests
            for dep in extracted_dependencies:
                resolved = resolve_skill(dep)
                if resolved:
                    skill_id, skill_name, _ = resolved
                    evidence_items.append(
                        {
                            "user_id": user_id,
                            "skill_id": skill_id,
                            "github_repo_id": repo["github_repo_id"],
                            "analysis_id": analysis_id,
                            "evidence_type": "framework",
                            "detail": f"Declared dependency '{dep}' in project manifest for {repo_name}.",
                            "evidence_url": repo["html_url"],
                            "observed_by": "rule",
                            "confidence": 0.95,
                        }
                    )

            # C. Testing evidence
            if tree_info["has_tests"]:
                # Map to primary language test practice
                resolved = resolve_skill(primary_lang)
                if resolved:
                    skill_id, skill_name, _ = resolved
                    test_dirs = ", ".join(tree_info["test_dirs"])
                    evidence_items.append(
                        {
                            "user_id": user_id,
                            "skill_id": skill_id,
                            "github_repo_id": repo["github_repo_id"],
                            "analysis_id": analysis_id,
                            "evidence_type": "tests",
                            "detail": f"Dedicated automated test suite found ({test_dirs}) for {skill_name} in {repo_name}.",
                            "evidence_url": f"{repo['html_url']}/tree/{repo['default_branch']}/{tree_info['test_dirs'][0]}",
                            "observed_by": "rule",
                            "confidence": 0.90,
                        }
                    )

            # D. CI / CD evidence
            if tree_info["has_ci"]:
                resolved_ci = resolve_skill("github actions")
                if resolved_ci:
                    skill_id, skill_name, _ = resolved_ci
                    evidence_items.append(
                        {
                            "user_id": user_id,
                            "skill_id": skill_id,
                            "github_repo_id": repo["github_repo_id"],
                            "analysis_id": analysis_id,
                            "evidence_type": "structure",
                            "detail": f"Automated CI/CD pipeline configured with GitHub Actions in {repo_name}.",
                            "evidence_url": f"{repo['html_url']}/tree/{repo['default_branch']}/.github",
                            "observed_by": "rule",
                            "confidence": 0.90,
                        }
                    )

            # E. Documentation evidence (Rule-based)
            if readme_text and len(readme_text) > 300:
                resolved = resolve_skill(primary_lang)
                if resolved:
                    skill_id, skill_name, _ = resolved
                    evidence_items.append(
                        {
                            "user_id": user_id,
                            "skill_id": skill_id,
                            "github_repo_id": repo["github_repo_id"],
                            "analysis_id": analysis_id,
                            "evidence_type": "documentation",
                            "detail": f"Comprehensive technical documentation and usage guide in {repo_name} ({len(readme_text)} chars).",
                            "evidence_url": f"{repo['html_url']}#readme",
                            "observed_by": "rule",
                            "confidence": 0.85,
                        }
                    )

            # ─── AI-ASSISTED INTERPRETATION (Untrusted Input Defended) ───
            if readme_text and len(readme_text.strip()) > 50:
                ai_output = await self.llm.interpret_readme(repo_name, primary_lang, readme_text)
                if ai_output:
                    for skill_name_raw in ai_output.observed_skills:
                        resolved = resolve_skill(skill_name_raw)
                        if resolved:
                            skill_id, skill_name, _ = resolved
                            evidence_items.append(
                                {
                                    "user_id": user_id,
                                    "skill_id": skill_id,
                                    "github_repo_id": repo["github_repo_id"],
                                    "analysis_id": analysis_id,
                                    "evidence_type": "documentation",
                                    "detail": f"AI-interpreted demonstration of {skill_name} in {repo_name}: {ai_output.summary[:150]}",
                                    "evidence_url": f"{repo['html_url']}#readme",
                                    "observed_by": "ai_interpretation",
                                    "confidence": round(ai_output.confidence, 2),
                                }
                            )

        # Deduplicate evidence per (skill_id, evidence_type, repo_id, observed_by)
        deduped_evidence: List[Dict[str, Any]] = []
        seen_keys = set()
        for ev in evidence_items:
            key = (ev["skill_id"], ev["evidence_type"], ev.get("github_repo_id"), ev["observed_by"])
            if key not in seen_keys:
                seen_keys.add(key)
                deduped_evidence.append(ev)

        return {
            "repositories": saved_repos,
            "evidence": deduped_evidence,
        }

    async def _extract_manifest_dependencies(
        self, owner: str, repo: str, manifest_files: List[str]
    ) -> List[str]:
        """Parse dependency names from package.json, requirements.txt, pyproject.toml."""
        deps: List[str] = []

        for mfile in manifest_files:
            content = await self.github.get_file_content(owner, repo, mfile)
            if not content:
                continue

            if mfile == "package.json":
                try:
                    data = json.loads(content)
                    all_deps = {
                        **data.get("dependencies", {}),
                        **data.get("devDependencies", {}),
                    }
                    deps.extend(all_deps.keys())
                except Exception:
                    pass

            elif mfile in ["requirements.txt", "Pipfile"]:
                for line in content.splitlines():
                    line = line.strip()
                    if line and not line.startswith("#"):
                        # Extract pkg name before ==, >=, <=, etc.
                        pkg = re.split(r"[=><~;]", line)[0].strip().lower()
                        if pkg:
                            deps.append(pkg)

            elif mfile == "pyproject.toml":
                # Simple regex extraction for dependencies
                matches = re.findall(r'["\']([a-zA-Z0-9_\-\.]+)(?:[=><~].*)?["\']', content)
                deps.extend([m.lower() for m in matches])

        return list(set(deps))
