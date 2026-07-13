#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import pathlib
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "fwi_governance_gate", ROOT / "scripts" / "fwi_governance_gate.py"
)
GATE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = GATE
SPEC.loader.exec_module(GATE)

HEAD = "a" * 40
DOMAIN = "geopolitics"
SLUG = "test-report"
PUBLIC_PATH = f"content/{DOMAIN}/{SLUG}/index.html"

R1_SCORES = {
    "D1": 7,
    "D2": 15,
    "D3": 15,
    "D4": 12,
    "D5": 8,
    "D6": 8,
    "D7": 7,
    "D8": 4,
    "D9": 3,
    "D10": 4,
}

R3_SCORES = {
    "D1": 7,
    "D2": 16,
    "D3": 16,
    "D4": 13,
    "D5": 9,
    "D6": 9,
    "D7": 7,
    "D8": 4,
    "D9": 4,
    "D10": 5,
}


def valid_approval(**overrides: object) -> dict[str, object]:
    data: dict[str, object] = {
        "schema_version": "1.0",
        "template_pack_version": "1.1",
        "record_status": "completed",
        "report_id": "geopolitics-test-001",
        "public_report_path": PUBLIC_PATH,
        "private_backend_path": f"reports-backend/{DOMAIN}/{SLUG}/",
        "domain": DOMAIN,
        "report_slug": SLUG,
        "report_title": "Controlled test report",
        "reviewed_commit_sha": HEAD,
        "workstream_classification": "PI",
        "publication_category": "test-report",
        "risk_tier": "R1",
        "status": "approved",
        "readiness_score": sum(R1_SCORES.values()),
        "minimum_required_score": 80,
        "rubric_version": "FWI-RR-1.0",
        "hard_block_catalog_version": "FWI-HB-1.0",
        "evaluator_version": "FWI-RR-1.0",
        "evaluator_decision": "READY_FOR_HUMAN_APPROVAL",
        "readiness_assessment_reference": "fact-check-summary.md#9-readiness-scorecard",
        "scoring_completed": True,
        "dimension_floor_passed": True,
        "hard_block_present": False,
        "hard_block_assessment_completed": True,
        "hard_block_ids": "none",
        "hard_block_summary": "All controls cleared or documented not applicable.",
        "open_critical_findings": 0,
        "open_high_findings": 0,
        "independent_review_required": False,
        "independent_review_completed": False,
        "independent_reviewer_eligible": False,
        "report_intake_completed": True,
        "evidence_register_completed": True,
        "citation_audit_completed": True,
        "similarity_check_completed": True,
        "review_checklist_completed": True,
        "chatgpt_validation_completed": True,
        "fact_check_completed": True,
        "update_log_completed": True,
        "validation_run_checklist_completed": True,
        "human_review_completed": True,
        "funding_and_external_role_disclosed": True,
        "conflicts_reviewed": True,
        "ai_use_reviewed": True,
        "rights_and_safety_reviewed": True,
        "data_and_visual_reviewed": True,
        "public_disclosures_completed": True,
        "public_path_match_confirmed": True,
        "author_or_producer": "Author One",
        "editorial_reviewer": "Editor Two",
        "validation_reviewer": "Validator Three",
        "independent_reviewer": "",
        "authorized_human_approver": "Approver Four",
        "review_completed_date": "2025-01-01",
        "approved_by": "Approver Four",
        "approval_date": "2025-01-01",
        "approval_expiry_or_review_trigger": "material change before publication",
    }
    for dimension, score in R1_SCORES.items():
        data[f"dimension_{dimension.lower()}_score"] = score
    data.update(overrides)
    return data


def yaml_text(data: dict[str, object]) -> str:
    lines = []
    for key, value in data.items():
        if isinstance(value, bool):
            rendered = "true" if value else "false"
        elif isinstance(value, int):
            rendered = str(value)
        else:
            rendered = f'"{value}"'
        lines.append(f"{key}: {rendered}")
    return "\n".join(lines) + "\n"


def write_backend(root: pathlib.Path, approval: dict[str, object] | None = None) -> pathlib.Path:
    backend = root / "reports-backend" / DOMAIN / SLUG
    backend.mkdir(parents=True)
    generic = (
        "# FutureWorld Intelligence\n"
        "**Template status:** Completed controlled record\n"
        "Review completed with no unresolved controlled-template fields.\n"
    )
    for name in GATE.REQUIRED_BACKEND_FILES:
        if name.endswith(".md"):
            (backend / name).write_text(generic, encoding="utf-8")
    (backend / "fact-check-summary.md").write_text(
        generic + "Rubric FWI-RR-1.0\nDecision READY_FOR_HUMAN_APPROVAL\n", encoding="utf-8"
    )
    hard_blocks = "\n".join(f"HB-{number:02d}: cleared" for number in range(1, 19))
    (backend / "validation-run-checklist.md").write_text(
        generic + "Rubric FWI-RR-1.0\n" + hard_blocks + "\n", encoding="utf-8"
    )
    (backend / "evidence-register.csv").write_text(
        "Claim ID,Claim Statement,Materiality,Source ID,Source URL or Reference,Verification Status,Verified By\n"
        "C-001,Controlled test claim,Material,S-001,https://example.org/source,Verified,Validator Three\n",
        encoding="utf-8",
    )
    (backend / "approval.yml").write_text(
        yaml_text(approval or valid_approval()), encoding="utf-8"
    )
    return backend


def report_change(status: str = "modified", filename: str = PUBLIC_PATH):
    return GATE.ChangedFile(filename, status)


class GovernanceGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.governance = pathlib.Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def evaluate(self, changes, head: str = HEAD):
        return GATE.evaluate_changes(changes, self.governance, head)

    def codes(self, result):
        return {check.code for check in result.checks if not check.passed}

    def test_non_report_change_passes(self):
        result = self.evaluate([GATE.ChangedFile("pages/about/index.html")])
        self.assertTrue(result.passed)

    def test_workflow_uses_current_trusted_default_branch_revision(self):
        workflow = (ROOT / "workflows" / "fwi-governance-gate.yml").read_text(
            encoding="utf-8"
        )
        self.assertIn("ref: ${{ github.sha }}", workflow)
        self.assertNotIn("github.event.pull_request.base.sha", workflow)
        self.assertNotIn("ref: ${{ github.event.pull_request.head.sha }}", workflow)

    def test_complete_r1_report_passes(self):
        write_backend(self.governance)
        result = self.evaluate([report_change()])
        self.assertTrue(result.passed)
        self.assertIn("FWI-GATE-299", {check.code for check in result.checks})

    def test_asset_only_change_is_gated(self):
        result = self.evaluate([report_change(filename=f"content/{DOMAIN}/{SLUG}/assets/map.webp")])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-101", self.codes(result))

    def test_missing_one_of_ten_backend_files_blocks(self):
        backend = write_backend(self.governance)
        (backend / "chatgpt-validation-notes.md").unlink()
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-102", self.codes(result))

    def test_active_hard_block_cannot_be_compensated_by_score(self):
        write_backend(self.governance, valid_approval(hard_block_present=True, hard_block_ids="HB-05"))
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-210", self.codes(result))

    def test_below_threshold_score_blocks(self):
        data = valid_approval(readiness_score=79)
        data["dimension_d1_score"] = 3
        write_backend(self.governance, data)
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-217", self.codes(result))

    def test_dimension_floor_blocks_even_at_threshold(self):
        data = valid_approval(readiness_score=80)
        data["dimension_d1_score"] = 4
        write_backend(self.governance, data)
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-218", self.codes(result))

    def test_score_must_equal_dimension_sum(self):
        write_backend(self.governance, valid_approval(readiness_score=99))
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-215", self.codes(result))

    def test_incomplete_hard_block_assessment_blocks(self):
        write_backend(self.governance, valid_approval(hard_block_assessment_completed=False))
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-209", self.codes(result))

    def test_approval_must_bind_exact_pr_head(self):
        write_backend(self.governance, valid_approval(reviewed_commit_sha="b" * 40))
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-201", self.codes(result))

    def test_r3_requires_eligible_independent_review(self):
        data = valid_approval(risk_tier="R3", minimum_required_score=90, readiness_score=90)
        for dimension, score in R3_SCORES.items():
            data[f"dimension_{dimension.lower()}_score"] = score
        write_backend(self.governance, data)
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-219", self.codes(result))

    def test_r2_partner_supported_requires_independent_review(self):
        data = valid_approval(
            risk_tier="R2",
            workstream_classification="PS",
            minimum_required_score=85,
            readiness_score=85,
        )
        data.update(
            dimension_d1_score=7,
            dimension_d2_score=15,
            dimension_d3_score=15,
            dimension_d4_score=12,
            dimension_d5_score=9,
            dimension_d6_score=8,
            dimension_d7_score=7,
            dimension_d8_score=4,
            dimension_d9_score=4,
            dimension_d10_score=4,
        )
        write_backend(self.governance, data)
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-219", self.codes(result))

    def test_unresolved_template_placeholder_blocks(self):
        backend = write_backend(self.governance)
        (backend / "review-checklist.md").write_text("# Review\n[TBD]\n", encoding="utf-8")
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-112", self.codes(result))

    def test_duplicate_approval_key_blocks(self):
        backend = write_backend(self.governance)
        with (backend / "approval.yml").open("a", encoding="utf-8") as handle:
            handle.write('status: "approved"\n')
        result = self.evaluate([report_change()])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-104", self.codes(result))

    def test_gate_control_change_without_private_record_blocks(self):
        result = self.evaluate([GATE.ChangedFile(".github/scripts/fwi_governance_gate.py")])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-301", self.codes(result))

    def test_gate_control_change_with_exact_private_record_passes(self):
        path = ".github/scripts/fwi_governance_gate.py"
        record_dir = self.governance / "gate-changes"
        record_dir.mkdir()
        record = {
            "schema_version": "1.0",
            "status": "approved",
            "public_repository": "jamilahmad488/futureworld",
            "public_head_sha": HEAD,
            "changed_paths_sha256": GATE.sensitive_change_digest([path]),
            "security_review_completed": True,
            "tests_completed": True,
            "least_privilege_review_completed": True,
            "rollback_plan_present": True,
            "authorized_human_approver": "Approver Four",
            "approved_by": "Approver Four",
            "approval_date": "2025-01-01",
        }
        (record_dir / f"{HEAD}.yml").write_text(yaml_text(record), encoding="utf-8")
        result = self.evaluate([GATE.ChangedFile(path)])
        self.assertTrue(result.passed)

    def test_report_removal_requires_withdrawal_record(self):
        write_backend(self.governance)
        result = self.evaluate([report_change(status="removed")])
        self.assertFalse(result.passed)
        self.assertIn("FWI-GATE-204", self.codes(result))

    def test_public_report_details_are_not_embedded_in_report(self):
        result = self.evaluate([report_change()])
        rendered = GATE.render_report(result)
        self.assertNotIn("Fact-Check Summary Returned", rendered)
        self.assertIn("Private evidence and review narratives are not reproduced", rendered)


if __name__ == "__main__":
    unittest.main()
