# FutureWorld Intelligence GitHub Governance Gate

| Control | Adopted value |
|---|---|
| Gate version | 2.1 |
| Readiness rubric | FWI-RR-1.0 |
| Hard-block catalog | FWI-HB-1.0 |
| Required check name | `FWI Fact-Check Gate` |
| Public repository | `jamilahmad488/futureworld` |
| Private governance repository | `jamilahmad488/fwi-internal-governance` |
| Effective date | 13 July 2026 |

## 1. Purpose

The gate prevents a public report publication, update, asset-only alteration, rename, or removal from merging unless its matching private governance backend is complete, bound to the exact pull-request commit, and authorized under the adopted readiness policy.

The gate verifies process evidence and approval metadata. It does not independently fact-check a report and does not replace the authorized human approver.

## 2. Security architecture

The workflow runs on `pull_request_target` because it must read a private repository. It therefore follows a strict trust boundary:

- gate code is checked out from the protected pull-request base commit;
- pull-request code is never checked out or executed;
- changed-file metadata is obtained through the GitHub API;
- the private repository token is used only by `actions/checkout`;
- checkout credentials are not persisted;
- workflow actions are pinned to full commit SHAs;
- job permissions are limited to repository reads and the PR comment;
- private fact-check content is never reproduced in the public comment;
- gate-control changes require an exact-SHA private change-approval record.

The secret `FWI_GOVERNANCE_TOKEN` must be a read-only, fine-grained credential limited to private-repository contents. It must be rotated after suspected exposure and reviewed periodically.

## 3. Publication-change detection

The trusted file `governance/fwi-publication-map.json` provides the exact mapping for all 72 controlled publications. Every record has a unique inventory ID, exact public source path and unique private backend path. This covers research reports, briefs, principles, multimedia, courses, learning resources and institutional publications, including nested and legacy uppercase paths.

Exact HTML matches identify the publication. Asset changes use the deepest matching registered publication root, preventing a nested lecture or principle from inheriting its parent publication's approval. An unregistered publication-like HTML path under `content/` or `courses/` fails closed and requires a reviewed map entry.

Renames require both a controlled withdrawal record for the previous identity and a publication record for the new identity.

## 4. Required private backend

Each gated report requires all ten controlled artifacts:

1. `report-intake-form.md`
2. `evidence-register.csv`
3. `citation-audit.md`
4. `similarity-check.md`
5. `review-checklist.md`
6. `chatgpt-validation-notes.md`
7. `fact-check-summary.md`
8. `update-log.md`
9. `validation-run-checklist.md`
10. `approval.yml`

Blank files, unresolved template placeholders, unresolved evidence rows, duplicate approval keys, or path/version mismatches block release.

## 5. Enforced readiness decision

For publication or update, the gate requires:

- the exact FWI-RR-1.0 threshold for R1, R2, or R3;
- the total score to equal the sum of D1–D10;
- every general and D2/D3 dimension floor to pass;
- evaluator decision `READY_FOR_HUMAN_APPROVAL`;
- no active or unassessed hard block;
- zero open Critical and High findings;
- required independent review to be completed by an eligible, distinct reviewer;
- all template, disclosure, validation, and human-review flags to be complete;
- approval by the named authorized human;
- `reviewed_commit_sha` to equal the pull-request head SHA exactly.

An automated pass means only that the authorized approval record and its controls passed machine verification.

## 6. Gate self-protection

A pull request changing the workflow, evaluator, regression tests, controlled publication map, CODEOWNERS entry, or this control document must have a private record at:

```text
gate-changes/<public-head-sha>.yml
```

The record must bind the exact head SHA and the SHA-256 digest of the sorted sensitive paths, document security and least-privilege review, confirm tests and rollback planning, and contain matching authorized human approval.

## 7. Test and failure behavior

The trusted regression suite runs during every gate execution. Missing inputs, malformed records, private-repository checkout failure, absent result artifacts, or a failed control all fail closed. The public PR comment contains control codes and remediation direction but excludes private evidence and reviewer narratives.

The repository's `main` protection must continue to require the status check named `FWI Fact-Check Gate`. CODEOWNERS protection should require the institutional owner to review governance-control changes.

## 8. One-time trigger migration

The adoption PR includes `fwi-gate-bootstrap.yml` solely because GitHub will not execute a new `pull_request_target` workflow until that workflow exists on the default branch, while repository rules correctly require the existing check before merge. The bootstrap has no secrets or write permissions, is path-scoped to its own file, is restricted to adoption PR #8, and runs the regression suite. It must be removed immediately after gate version 2.0 reaches `main`; that removal is then evaluated by the real trusted-base gate.
