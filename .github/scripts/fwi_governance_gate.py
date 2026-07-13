#!/usr/bin/env python3
"""FWI cross-repository publication governance gate.

The trusted public-repository workflow supplies changed-file metadata and a
read-only checkout of the private governance repository. This program treats
pull-request content as data, validates the Step 5 readiness controls, and
writes a public-safe decision report without exposing private review content.
"""

from __future__ import annotations

import csv
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
from dataclasses import dataclass, field
from typing import Iterable

RUBRIC_ID = "FWI-RR-1.0"
HARD_BLOCK_CATALOG_ID = "FWI-HB-1.0"
PUBLIC_REPOSITORY = "jamilahmad488/futureworld"

DIMENSIONS = {
    "D1": 8,
    "D2": 18,
    "D3": 18,
    "D4": 14,
    "D5": 10,
    "D6": 10,
    "D7": 8,
    "D8": 5,
    "D9": 4,
    "D10": 5,
}

TIERS = {
    "R1": {"threshold": 80, "general_floor": 0.60, "evidence_floor": 0.75},
    "R2": {"threshold": 85, "general_floor": 0.70, "evidence_floor": 0.80},
    "R3": {"threshold": 90, "general_floor": 0.75, "evidence_floor": 0.85},
}

REQUIRED_BACKEND_FILES = (
    "report-intake-form.md",
    "evidence-register.csv",
    "citation-audit.md",
    "similarity-check.md",
    "review-checklist.md",
    "chatgpt-validation-notes.md",
    "fact-check-summary.md",
    "update-log.md",
    "validation-run-checklist.md",
    "approval.yml",
)

TRUE_FIELDS = (
    "scoring_completed",
    "dimension_floor_passed",
    "hard_block_assessment_completed",
    "report_intake_completed",
    "evidence_register_completed",
    "citation_audit_completed",
    "similarity_check_completed",
    "review_checklist_completed",
    "chatgpt_validation_completed",
    "fact_check_completed",
    "update_log_completed",
    "validation_run_checklist_completed",
    "human_review_completed",
    "funding_and_external_role_disclosed",
    "conflicts_reviewed",
    "ai_use_reviewed",
    "rights_and_safety_reviewed",
    "data_and_visual_reviewed",
    "public_disclosures_completed",
    "public_path_match_confirmed",
)

NONEMPTY_FIELDS = (
    "report_id",
    "report_title",
    "publication_category",
    "readiness_assessment_reference",
    "author_or_producer",
    "editorial_reviewer",
    "validation_reviewer",
    "authorized_human_approver",
    "approved_by",
    "approval_date",
    "approval_expiry_or_review_trigger",
)

EVIDENCE_REQUIRED_COLUMNS = {
    "Claim ID",
    "Claim Statement",
    "Materiality",
    "Source ID",
    "Source URL or Reference",
    "Verification Status",
    "Verified By",
}

SENSITIVE_GATE_PATHS = {
    ".github/workflows/fwi-governance-gate.yml",
    ".github/workflows/fwi-gate-bootstrap.yml",
    ".github/scripts/fwi_governance_gate.py",
    ".github/tests/test_fwi_governance_gate.py",
    ".github/CODEOWNERS",
    "GOVERNANCE_GATE.md",
}

PLACEHOLDER_PATTERNS = (
    re.compile(r"\[TBD(?:[^\]]*)\]", re.IGNORECASE),
    re.compile(r"\[Named human(?:[^\]]*)\]", re.IGNORECASE),
    re.compile(r"\[YYYY-MM-DD(?:[^\]]*)\]", re.IGNORECASE),
    re.compile(r"\[(?:R1 / R2 / R3|Yes / No(?: / N/A)?|None / IDs)\]", re.IGNORECASE),
    re.compile(r"Template status:\*\*\s*Blank controlled template", re.IGNORECASE),
    re.compile(r"\|\s*\[not_assessed\]\s*\|", re.IGNORECASE),
)


@dataclass(frozen=True)
class ChangedFile:
    filename: str
    status: str = "modified"
    previous_filename: str | None = None


@dataclass(frozen=True)
class ReportChange:
    domain: str
    slug: str
    public_path: str
    action: str


@dataclass
class CheckResult:
    passed: bool
    code: str
    message: str


@dataclass
class GateResult:
    passed: bool = True
    checks: list[CheckResult] = field(default_factory=list)

    def add(self, passed: bool, code: str, message: str) -> None:
        self.checks.append(CheckResult(passed, code, message))
        if not passed:
            self.passed = False


class RecordError(ValueError):
    pass


def parse_bool(value: str, field_name: str) -> bool:
    normalized = str(value).strip().lower()
    if normalized not in {"true", "false"}:
        raise RecordError(f"{field_name} must be exactly true or false")
    return normalized == "true"


def parse_int(value: str, field_name: str) -> int:
    if not re.fullmatch(r"-?\d+", str(value).strip()):
        raise RecordError(f"{field_name} must be an integer")
    return int(str(value).strip())


def parse_iso_date(value: str, field_name: str) -> dt.date:
    try:
        parsed = dt.date.fromisoformat(str(value).strip())
    except ValueError as exc:
        raise RecordError(f"{field_name} must use YYYY-MM-DD") from exc
    if parsed > dt.datetime.now(dt.timezone.utc).date():
        raise RecordError(f"{field_name} cannot be in the future")
    return parsed


def parse_flat_yaml(path: pathlib.Path) -> dict[str, str]:
    data: dict[str, str] = {}
    for number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            raise RecordError(f"line {number} is not a flat key/value record")
        key, value = line.split(":", 1)
        key = key.strip()
        if not re.fullmatch(r"[a-z][a-z0-9_]*", key):
            raise RecordError(f"line {number} has an invalid key")
        if key in data:
            raise RecordError(f"duplicate key: {key}")
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]
        data[key] = value.strip()
    return data


def report_identity(path: str) -> tuple[str, str, str] | None:
    pure = pathlib.PurePosixPath(path)
    parts = pure.parts
    if len(parts) < 3 or parts[0] != "content":
        return None
    domain = parts[1]
    if len(parts) >= 4:
        slug = parts[2]
        public_path = f"content/{domain}/{slug}/index.html"
    elif pure.suffix.lower() == ".html" and pure.name != "index.html":
        slug = pure.stem
        public_path = path
    else:
        return None
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", domain) or not re.fullmatch(
        r"[a-z0-9][a-z0-9-]*", slug
    ):
        return None
    return domain, slug, public_path


def identify_report_changes(changes: Iterable[ChangedFile]) -> list[ReportChange]:
    found: dict[tuple[str, str, str], ReportChange] = {}
    for item in changes:
        status = item.status.lower()
        current = report_identity(item.filename)
        if current and status != "removed":
            domain, slug, public_path = current
            found[(domain, slug, "publish")] = ReportChange(domain, slug, public_path, "publish")
        if current and status == "removed":
            domain, slug, public_path = current
            found[(domain, slug, "withdraw")] = ReportChange(domain, slug, public_path, "withdraw")
        if status == "renamed" and item.previous_filename:
            previous = report_identity(item.previous_filename)
            if previous:
                domain, slug, public_path = previous
                found[(domain, slug, "withdraw")] = ReportChange(domain, slug, public_path, "withdraw")
    return sorted(found.values(), key=lambda x: (x.domain, x.slug, x.action))


def validate_no_placeholders(backend: pathlib.Path, result: GateResult) -> None:
    for name in REQUIRED_BACKEND_FILES:
        path = backend / name
        if path.suffix != ".md":
            continue
        text = path.read_text(encoding="utf-8")
        for pattern in PLACEHOLDER_PATTERNS:
            if pattern.search(text):
                result.add(False, "FWI-GATE-112", f"{name} contains an unresolved controlled-template placeholder")
                break


def validate_evidence_register(path: pathlib.Path, result: GateResult) -> None:
    try:
        with path.open(newline="", encoding="utf-8") as handle:
            rows = list(csv.DictReader(handle))
    except (OSError, csv.Error) as exc:
        result.add(False, "FWI-GATE-113", f"evidence-register.csv is unreadable: {exc}")
        return
    columns = set(rows[0].keys()) if rows else set()
    missing = EVIDENCE_REQUIRED_COLUMNS - columns
    if missing:
        result.add(False, "FWI-GATE-114", "evidence-register.csv lacks required controlled columns")
        return
    material_rows = [row for row in rows if any((value or "").strip() for value in row.values())]
    if not material_rows:
        result.add(False, "FWI-GATE-115", "evidence-register.csv has no completed evidence rows")
        return
    for index, row in enumerate(material_rows, start=2):
        for field_name in EVIDENCE_REQUIRED_COLUMNS:
            if not (row.get(field_name) or "").strip():
                result.add(False, "FWI-GATE-116", f"evidence-register.csv row {index} has an incomplete required field")
                return
        status = (row.get("Verification Status") or "").strip().lower()
        if status not in {"verified", "verified with limitations", "not applicable"}:
            result.add(False, "FWI-GATE-117", f"evidence-register.csv row {index} is not resolved")
            return
    result.add(True, "FWI-GATE-118", "Evidence register structure and resolved rows passed")


def validate_approval(
    approval: dict[str, str],
    change: ReportChange,
    backend: pathlib.Path,
    head_sha: str,
    result: GateResult,
) -> None:
    expected_backend = f"reports-backend/{change.domain}/{change.slug}/"
    exact_values = {
        "schema_version": "1.0",
        "template_pack_version": "1.1",
        "rubric_version": RUBRIC_ID,
        "hard_block_catalog_version": HARD_BLOCK_CATALOG_ID,
        "evaluator_version": RUBRIC_ID,
        "domain": change.domain,
        "report_slug": change.slug,
        "public_report_path": change.public_path,
        "private_backend_path": expected_backend,
        "reviewed_commit_sha": head_sha,
    }
    for key, expected in exact_values.items():
        if approval.get(key, "") != expected:
            result.add(False, "FWI-GATE-201", f"approval.yml field {key} does not match the controlled value")

    for key in NONEMPTY_FIELDS:
        if not approval.get(key, "").strip():
            result.add(False, "FWI-GATE-202", f"approval.yml field {key} is required")

    workstream = approval.get("workstream_classification", "")
    if workstream not in {"PI", "PS", "CS"}:
        result.add(False, "FWI-GATE-203", "workstream_classification must be PI, PS, or CS")

    if change.action == "withdraw":
        if approval.get("status", "").lower() != "withdrawn":
            result.add(False, "FWI-GATE-204", "removed or renamed-away reports require status withdrawn")
        for key in ("withdrawal_reason", "withdrawal_review_completed"):
            if not approval.get(key, ""):
                result.add(False, "FWI-GATE-205", f"withdrawal record requires {key}")
        if approval.get("withdrawal_review_completed"):
            try:
                if not parse_bool(approval["withdrawal_review_completed"], "withdrawal_review_completed"):
                    result.add(False, "FWI-GATE-206", "withdrawal review must be completed")
            except RecordError as exc:
                result.add(False, "FWI-GATE-206", str(exc))
        return

    if approval.get("status", "").lower() != "approved":
        result.add(False, "FWI-GATE-207", "publication status must be approved")
    if approval.get("evaluator_decision", "") != "READY_FOR_HUMAN_APPROVAL":
        result.add(False, "FWI-GATE-208", "evaluator decision must be READY_FOR_HUMAN_APPROVAL")

    for key in TRUE_FIELDS:
        try:
            if not parse_bool(approval.get(key, ""), key):
                result.add(False, "FWI-GATE-209", f"approval.yml field {key} must be true")
        except RecordError as exc:
            result.add(False, "FWI-GATE-209", str(exc))

    try:
        if parse_bool(approval.get("hard_block_present", ""), "hard_block_present"):
            result.add(False, "FWI-GATE-210", "an active hard block prevents publication")
    except RecordError as exc:
        result.add(False, "FWI-GATE-210", str(exc))

    if approval.get("hard_block_ids", "").strip().lower() not in {"", "none"}:
        result.add(False, "FWI-GATE-211", "hard_block_ids must be empty or none")

    try:
        critical = parse_int(approval.get("open_critical_findings", ""), "open_critical_findings")
        high = parse_int(approval.get("open_high_findings", ""), "open_high_findings")
        if critical != 0 or high != 0:
            result.add(False, "FWI-GATE-212", "Critical and High findings must both be zero")
    except RecordError as exc:
        result.add(False, "FWI-GATE-212", str(exc))

    tier_name = approval.get("risk_tier", "")
    tier = TIERS.get(tier_name)
    if not tier:
        result.add(False, "FWI-GATE-213", "risk_tier must be R1, R2, or R3")
        return

    scores: dict[str, int] = {}
    try:
        for dimension, maximum in DIMENSIONS.items():
            key = f"dimension_{dimension.lower()}_score"
            score = parse_int(approval.get(key, ""), key)
            if not 0 <= score <= maximum:
                raise RecordError(f"{key} must be between 0 and {maximum}")
            scores[dimension] = score
        readiness_score = parse_int(approval.get("readiness_score", ""), "readiness_score")
        minimum_score = parse_int(approval.get("minimum_required_score", ""), "minimum_required_score")
    except RecordError as exc:
        result.add(False, "FWI-GATE-214", str(exc))
        return

    if sum(scores.values()) != readiness_score:
        result.add(False, "FWI-GATE-215", "readiness_score must equal the ten dimension scores")
    if minimum_score != tier["threshold"]:
        result.add(False, "FWI-GATE-216", "minimum_required_score does not match the risk tier")
    if readiness_score < tier["threshold"]:
        result.add(False, "FWI-GATE-217", "readiness score is below the tier threshold")

    for dimension, score in scores.items():
        floor = tier["evidence_floor"] if dimension in {"D2", "D3"} else tier["general_floor"]
        if score / DIMENSIONS[dimension] < floor:
            result.add(False, "FWI-GATE-218", f"{dimension} is below its mandatory tier floor")

    required_by_policy = tier_name == "R3" or (tier_name == "R2" and workstream in {"PS", "CS"})
    try:
        declared_required = parse_bool(
            approval.get("independent_review_required", ""), "independent_review_required"
        )
        completed = parse_bool(
            approval.get("independent_review_completed", ""), "independent_review_completed"
        )
        eligible = parse_bool(
            approval.get("independent_reviewer_eligible", ""), "independent_reviewer_eligible"
        )
        if required_by_policy and not declared_required:
            result.add(False, "FWI-GATE-219", "the risk tier or workstream requires independent review")
        if declared_required:
            reviewer = approval.get("independent_reviewer", "").strip()
            if not (completed and eligible and reviewer):
                result.add(False, "FWI-GATE-220", "required independent review is incomplete or ineligible")
            if reviewer and reviewer in {
                approval.get("author_or_producer", "").strip(),
                approval.get("authorized_human_approver", "").strip(),
            }:
                result.add(False, "FWI-GATE-221", "independent reviewer must be distinct from author and approver")
    except RecordError as exc:
        result.add(False, "FWI-GATE-220", str(exc))

    if approval.get("approved_by", "").strip() != approval.get("authorized_human_approver", "").strip():
        result.add(False, "FWI-GATE-222", "approved_by must match the authorized human approver")
    try:
        parse_iso_date(approval.get("approval_date", ""), "approval_date")
    except RecordError as exc:
        result.add(False, "FWI-GATE-223", str(exc))

    fact_text = (backend / "fact-check-summary.md").read_text(encoding="utf-8")
    if RUBRIC_ID not in fact_text or "READY_FOR_HUMAN_APPROVAL" not in fact_text:
        result.add(False, "FWI-GATE-224", "fact-check summary lacks the adopted rubric decision")
    checklist_text = (backend / "validation-run-checklist.md").read_text(encoding="utf-8")
    if RUBRIC_ID not in checklist_text or any(f"HB-{number:02d}" not in checklist_text for number in range(1, 19)):
        result.add(False, "FWI-GATE-225", "validation checklist lacks the complete hard-block run record")


def validate_report(change: ReportChange, governance_root: pathlib.Path, head_sha: str) -> GateResult:
    result = GateResult()
    backend = governance_root / "reports-backend" / change.domain / change.slug
    if not backend.is_dir():
        result.add(False, "FWI-GATE-101", "matching private report backend is missing")
        return result
    missing = [name for name in REQUIRED_BACKEND_FILES if not (backend / name).is_file()]
    if missing:
        result.add(False, "FWI-GATE-102", f"private backend is missing {len(missing)} required artifact(s)")
        return result
    empty = [name for name in REQUIRED_BACKEND_FILES if (backend / name).stat().st_size == 0]
    if empty:
        result.add(False, "FWI-GATE-103", f"private backend contains {len(empty)} empty artifact(s)")
        return result

    validate_no_placeholders(backend, result)
    validate_evidence_register(backend / "evidence-register.csv", result)
    try:
        approval = parse_flat_yaml(backend / "approval.yml")
    except (OSError, UnicodeError, RecordError) as exc:
        result.add(False, "FWI-GATE-104", f"approval.yml is invalid: {exc}")
        return result
    validate_approval(approval, change, backend, head_sha, result)
    if result.passed:
        result.add(True, "FWI-GATE-299", "All report publication controls passed")
    return result


def sensitive_change_digest(paths: Iterable[str]) -> str:
    material = "\n".join(sorted(set(paths))) + "\n"
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def validate_gate_change(
    sensitive_paths: list[str], governance_root: pathlib.Path, head_sha: str
) -> GateResult:
    result = GateResult()
    if not sensitive_paths:
        return result
    record_path = governance_root / "gate-changes" / f"{head_sha}.yml"
    if not record_path.is_file():
        result.add(False, "FWI-GATE-301", "governance-control change lacks a private approved change record")
        return result
    try:
        record = parse_flat_yaml(record_path)
    except (OSError, UnicodeError, RecordError) as exc:
        result.add(False, "FWI-GATE-302", f"gate-change record is invalid: {exc}")
        return result
    expected = {
        "schema_version": "1.0",
        "status": "approved",
        "public_repository": PUBLIC_REPOSITORY,
        "public_head_sha": head_sha,
        "changed_paths_sha256": sensitive_change_digest(sensitive_paths),
    }
    for key, value in expected.items():
        if record.get(key, "") != value:
            result.add(False, "FWI-GATE-303", f"gate-change record field {key} is invalid")
    for key in (
        "security_review_completed",
        "tests_completed",
        "least_privilege_review_completed",
        "rollback_plan_present",
    ):
        try:
            if not parse_bool(record.get(key, ""), key):
                result.add(False, "FWI-GATE-304", f"gate-change record field {key} must be true")
        except RecordError as exc:
            result.add(False, "FWI-GATE-304", str(exc))
    approver = record.get("authorized_human_approver", "").strip()
    if not approver or record.get("approved_by", "").strip() != approver:
        result.add(False, "FWI-GATE-305", "gate change lacks matching authorized human approval")
    try:
        parse_iso_date(record.get("approval_date", ""), "approval_date")
    except RecordError as exc:
        result.add(False, "FWI-GATE-306", str(exc))
    if result.passed:
        result.add(True, "FWI-GATE-399", "Governance-control change authorization passed")
    return result


def evaluate_changes(changes: list[ChangedFile], governance_root: pathlib.Path, head_sha: str) -> GateResult:
    final = GateResult()
    if not re.fullmatch(r"[0-9a-f]{40}", head_sha):
        final.add(False, "FWI-GATE-001", "HEAD_SHA is missing or invalid")
        return final

    sensitive = sorted({item.filename for item in changes if item.filename in SENSITIVE_GATE_PATHS})
    control_result = validate_gate_change(sensitive, governance_root, head_sha)
    for check in control_result.checks:
        final.add(check.passed, check.code, check.message)

    reports = identify_report_changes(changes)
    if not reports:
        final.add(True, "FWI-GATE-002", "No public report content changed")
    for report in reports:
        report_result = validate_report(report, governance_root, head_sha)
        for check in report_result.checks:
            prefix = f"{report.domain}/{report.slug} ({report.action}): "
            final.add(check.passed, check.code, prefix + check.message)
    return final


def load_changes(path: pathlib.Path) -> list[ChangedFile]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("changed-files input must be a JSON array")
    changes: list[ChangedFile] = []
    for item in raw:
        if not isinstance(item, dict) or not isinstance(item.get("filename"), str):
            raise ValueError("each changed-file item needs a filename")
        changes.append(
            ChangedFile(
                filename=item["filename"],
                status=str(item.get("status", "modified")),
                previous_filename=item.get("previous_filename"),
            )
        )
    return changes


def render_report(result: GateResult) -> str:
    lines = [
        "<!-- FWI_FACT_CHECK_GATE_REPORT -->",
        "# FWI Governance Gate Report",
        "",
        "The trusted cross-repository gate evaluated publication metadata against FWI-RR-1.0 and FWI-HB-1.0. Private evidence and review narratives are not reproduced in this public comment.",
        "",
        "| Result | Code | Control |",
        "|---|---|---|",
    ]
    for check in result.checks:
        icon = "✅" if check.passed else "❌"
        safe_message = check.message.replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {icon} | `{check.code}` | {safe_message} |")
    lines.extend(
        [
            "",
            f"## Final Gate Decision: {'PASSED ✅' if result.passed else 'BLOCKED ❌'}",
            "",
        ]
    )
    if not result.passed:
        lines.append("The pull request must not be merged until every blocking control is resolved and the gate is rerun.")
    else:
        lines.append("Automated controls passed. This check does not replace authorized human publication approval.")
    return "\n".join(lines) + "\n"


def main() -> int:
    output_root = pathlib.Path(os.environ.get("OUTPUT_ROOT", ".")).resolve()
    governance_root = pathlib.Path(os.environ.get("GOVERNANCE_ROOT", "governance")).resolve()
    changed_path = pathlib.Path(os.environ.get("CHANGED_FILES_JSON", "changed-files.json")).resolve()
    head_sha = os.environ.get("HEAD_SHA", "").strip().lower()
    try:
        changes = load_changes(changed_path)
        result = evaluate_changes(changes, governance_root, head_sha)
    except (OSError, UnicodeError, ValueError, json.JSONDecodeError) as exc:
        result = GateResult(False)
        result.add(False, "FWI-GATE-000", f"Gate input failure: {exc}")

    report = render_report(result)
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "fwi-fact-check-gate-report.md").write_text(report, encoding="utf-8")
    (output_root / "fwi-gate-result.txt").write_text(
        "PASS" if result.passed else "FAIL", encoding="utf-8"
    )
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        pathlib.Path(summary_path).write_text(report, encoding="utf-8")
    print(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
