#!/usr/bin/env python3
"""
FWI Governance Gate

Checks public FutureWorld Intelligence report changes against the private
fwi-internal-governance repository backend records.

This is a semi-automated gate. It does not independently fact-check the report.
It verifies that the private backend fact-check process exists, is complete,
and has approved the report for publication/update.
"""

from __future__ import annotations

import os
import pathlib
import subprocess
import sys
from typing import Dict, List, Optional, Tuple

PUBLIC_ROOT = pathlib.Path.cwd()
GOVERNANCE_ROOT = pathlib.Path(os.environ.get("GOVERNANCE_ROOT", "governance"))
MIN_DEFAULT_SCORE = 80

REQUIRED_BACKEND_FILES = [
    "evidence-register.csv",
    "citation-audit.md",
    "similarity-check.md",
    "review-checklist.md",
    "update-log.md",
    "fact-check-summary.md",
    "approval.yml",
]

REQUIRED_BOOLEAN_FIELDS = [
    "evidence_register_completed",
    "citation_audit_completed",
    "similarity_check_completed",
    "review_checklist_completed",
    "fact_check_completed",
]


def git_changed_files() -> List[str]:
    base_sha = os.environ.get("BASE_SHA", "")
    head_sha = os.environ.get("HEAD_SHA", "")
    if base_sha and head_sha:
        try:
            out = subprocess.check_output(
                ["git", "diff", "--name-only", base_sha, head_sha],
                text=True,
                stderr=subprocess.STDOUT,
            )
            return [line.strip() for line in out.splitlines() if line.strip()]
        except subprocess.CalledProcessError as exc:
            print(exc.output)

    out = subprocess.check_output(["git", "diff", "--name-only", "HEAD~1", "HEAD"], text=True)
    return [line.strip() for line in out.splitlines() if line.strip()]


def report_identity(path: str) -> Optional[Tuple[str, str, str]]:
    """Return (domain, slug, public_path) for changed public report HTML files."""
    if not path.startswith("content/") or not path.endswith(".html"):
        return None
    parts = path.split("/")
    if len(parts) < 3:
        return None

    domain = parts[1]
    if len(parts) >= 4 and parts[-1] == "index.html":
        slug = parts[-2]
    else:
        slug = pathlib.Path(parts[-1]).stem

    if not domain or not slug:
        return None
    return domain, slug, path


def parse_simple_yml(path: pathlib.Path) -> Dict[str, str]:
    data: Dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip().strip('"').strip("'")
        data[key.strip()] = value
    return data


def as_bool(value: str) -> bool:
    return str(value).strip().lower() in {"true", "yes", "1", "passed", "complete", "completed"}


def as_int(value: str, default: int = 0) -> int:
    try:
        return int(float(str(value).strip()))
    except Exception:
        return default


def truncate(text: str, limit: int = 12000) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n... [Fact-check summary truncated in PR comment. Open the private governance repo for full text.]"


def check_report(domain: str, slug: str, public_path: str) -> Tuple[bool, str]:
    backend_dir = GOVERNANCE_ROOT / "reports-backend" / domain / slug
    lines: List[str] = []
    passed = True

    lines.append(f"### Report: `{domain}/{slug}`")
    lines.append("")
    lines.append(f"- Public path: `{public_path}`")
    lines.append(f"- Expected backend path: `reports-backend/{domain}/{slug}/`")
    lines.append("")

    if not backend_dir.exists():
        lines.append("❌ **Gate failed:** backend folder not found in private governance repo.")
        lines.append("")
        lines.append("Required folder:")
        lines.append(f"`reports-backend/{domain}/{slug}/`")
        return False, "\n".join(lines)

    missing = [name for name in REQUIRED_BACKEND_FILES if not (backend_dir / name).exists()]
    if missing:
        passed = False
        lines.append("❌ **Missing required backend files:**")
        for name in missing:
            lines.append(f"- `{name}`")
        lines.append("")
    else:
        lines.append("✅ Required backend files are present.")
        lines.append("")

    approval_path = backend_dir / "approval.yml"
    if not approval_path.exists():
        lines.append("❌ **Gate failed:** `approval.yml` is missing.")
        return False, "\n".join(lines)

    approval = parse_simple_yml(approval_path)
    status = approval.get("status", "").lower()
    score = as_int(approval.get("readiness_score", "0"), 0)
    minimum_score = as_int(approval.get("minimum_required_score", str(MIN_DEFAULT_SCORE)), MIN_DEFAULT_SCORE)
    category = approval.get("publication_category", "")
    approved_by = approval.get("approved_by", "")
    approval_date = approval.get("approval_date", "")
    declared_public_path = approval.get("public_report_path", "")

    lines.append("#### Approval Gate")
    lines.append("")
    lines.append("| Check | Result |")
    lines.append("|---|---|")
    lines.append(f"| Status | `{status or 'missing'}` |")
    lines.append(f"| Readiness score | `{score}` |")
    lines.append(f"| Minimum required score | `{minimum_score}` |")
    lines.append(f"| Publication category | `{category or 'missing'}` |")
    lines.append(f"| Approved by | `{approved_by or 'missing'}` |")
    lines.append(f"| Approval date | `{approval_date or 'missing'}` |")

    if declared_public_path:
        path_match = declared_public_path == public_path
        lines.append(f"| Public path match | `{'passed' if path_match else 'failed'}` |")
        if not path_match:
            passed = False
    else:
        lines.append("| Public path match | `missing public_report_path` |")
        passed = False
    lines.append("")

    if status != "approved":
        passed = False
        lines.append("❌ `status` must be `approved`.")
    if score < minimum_score:
        passed = False
        lines.append(f"❌ Readiness score `{score}` is below the required score `{minimum_score}`.")

    for field in REQUIRED_BOOLEAN_FIELDS:
        if not as_bool(approval.get(field, "false")):
            passed = False
            lines.append(f"❌ `{field}` must be `true`.")

    if passed:
        lines.append("✅ Approval metadata passed.")
    lines.append("")

    fact_path = backend_dir / "fact-check-summary.md"
    if fact_path.exists():
        fact_text = truncate(fact_path.read_text(encoding="utf-8"))
        lines.append("#### Fact-Check Summary Returned by Gate")
        lines.append("")
        lines.append(fact_text)
        lines.append("")
    else:
        passed = False
        lines.append("❌ Fact-check summary is missing, so the gate cannot return the fact-check record.")
        lines.append("")

    return passed, "\n".join(lines)


def main() -> int:
    changed = git_changed_files()
    reports = []
    seen = set()
    for path in changed:
        ident = report_identity(path)
        if not ident:
            continue
        domain, slug, public_path = ident
        key = (domain, slug, public_path)
        if key not in seen:
            seen.add(key)
            reports.append(key)

    report_lines: List[str] = []
    report_lines.append("<!-- FWI_FACT_CHECK_GATE_REPORT -->")
    report_lines.append("# FWI Fact-Check Gate Report")
    report_lines.append("")
    report_lines.append("This report was generated automatically by the semi-automated FutureWorld Intelligence governance gate. It checks whether the private backend fact-check and approval files exist and are marked complete before public report publication/update.")
    report_lines.append("")

    if not reports:
        report_lines.append("✅ No public report HTML files were changed. Governance gate passed.")
        final_pass = True
    else:
        final_pass = True
        report_lines.append(f"Changed report file(s) detected: **{len(reports)}**")
        report_lines.append("")
        for domain, slug, public_path in reports:
            ok, section = check_report(domain, slug, public_path)
            if not ok:
                final_pass = False
            report_lines.append(section)
            report_lines.append("---")
            report_lines.append("")

    if final_pass:
        report_lines.append("## Final Gate Decision: PASSED ✅")
        result = "PASS"
    else:
        report_lines.append("## Final Gate Decision: BLOCKED ❌")
        report_lines.append("")
        report_lines.append("The public report update should not be merged until the private governance backend is completed and approved.")
        result = "FAIL"

    body = "\n".join(report_lines)
    pathlib.Path("fwi-fact-check-gate-report.md").write_text(body, encoding="utf-8")
    pathlib.Path("fwi-gate-result.txt").write_text(result, encoding="utf-8")

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        pathlib.Path(summary_path).write_text(body, encoding="utf-8")

    print(body)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
