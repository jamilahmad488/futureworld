# FutureWorld Intelligence Publication Identity and Metadata Standard

**Standard identifier:** FWI-PUB-ID-1.0  
**Status:** Controlled pilot standard — human approval required before universal rollout  
**Owner:** FutureWorld Intelligence  
**Pilot date:** 14 July 2026  
**Pilot publication:** Force No. 1 — Climate Change

## 1. Purpose

This standard gives every substantive FutureWorld Intelligence publication a clear, consistent and auditable public identity. It distinguishes the publication's broad family from its precise document type, records essential scope and evidence information, and aligns visible page information with canonical, social-sharing and structured metadata.

Classification does not equal validation. A page must never be described as validated, approved or peer reviewed unless the corresponding controlled review and human approval records exist.

## 2. Applicability

The complete publication inventory contains 106 publication-related artifacts. Apply this standard as follows:

| Governance stratum | Count | Required treatment |
|---|---:|---|
| Primary publication | 72 | Full visible identity block and metadata package |
| Promotional derivative | 1 | Derivative identity plus link to its approved source publication |
| Incomplete / withhold | 1 | Complete before publication or apply noindex/withhold controls |
| Legacy / duplicate publication | 17 | Mark superseded, archive, redirect or remove from indexing after approval |
| Redirect / URL alias | 11 | Redirect and canonical controls only |
| Supporting component | 4 | No standalone publication identity |

## 3. Two-level public classification

Every primary publication must use two related labels:

1. **Publication family** — the broad reader-facing knowledge family.
2. **Publication type** — the precise document form that determines structure and validation requirements.

Example:

```text
Publication family: Research and Strategic Analysis
Publication type: FWI Strategic Research Report
```

The precise publication type must never be replaced by the family label alone.

## 4. Approved publication families

| Publication family | Included publication types |
|---|---|
| Research and Strategic Analysis | Strategic Research Report; Evidence Review / Conceptual Research Report; Strategic Intelligence Report; Foresight & Scenario Report; Strategic Foresight Brief; Visual Evidence Report; Field/GIS Assessment Presentation |
| Briefs and Applied Knowledge | Intelligence Brief; Practice Brief |
| Principles and Explainers | Key Principle / Research Explainer; Key Principle / Educational Explainer |
| Courses and Learning Resources | Course Landing Page; Module Guide; Course Lecture; Learning Resource / Prompt Library; Course Roadmap |
| Multimedia Publications | Multimedia Intelligence Brief; Multimedia Derivative |
| Institutional Publications | Institutional policy and legal publications |

## 5. Required visible publication information

Place the identity block after the hero and before the substantive publication body.

| Field | Requirement |
|---|---|
| Publication family | Required |
| Precise publication type | Required |
| Domain | Required |
| Series | Required when the item belongs to a series |
| Publication number | Required when numbered |
| Institutional author | Required |
| Publication date or year | Required; do not invent an unavailable exact date |
| Current edition/version | Required after the standard is adopted |
| Metadata updated date | Required when identity or metadata changes |
| Purpose | Required |
| Intended audience | Required |
| Method/evidence basis | Required for analytical publications |
| Evidence cut-off | Required; state transparently when the historical cut-off was not recorded |
| Validation status | Required and limited to the controlled vocabulary below |
| Limitations/disclosure link or statement | Required where claims could affect decisions |
| Recommended citation | Required |
| Canonical URL | Required in HTML metadata; may also appear in the citation |

## 6. Public validation-status vocabulary

Use only one of these labels:

- **Retrospective validation pending** — published before completion of the current validation system.
- **Validation in progress** — an active controlled validation run exists.
- **Validated — human approved** — all required checks passed and the accountable human approver recorded approval.
- **Revision required** — validation identified material corrections that must be completed before approval.
- **Withdrawn or superseded** — the artifact is no longer authoritative.

Do not publish internal readiness scores, security-sensitive reviewer notes or private approval records unless separately approved for disclosure.

## 7. Required HTML metadata

Each primary publication must contain:

- A unique and descriptive `<title>`.
- A concise meta description.
- A canonical URL.
- Author and publisher metadata.
- Citation title, author, publication year/date, language and public URL metadata.
- Open Graph title, description, type, URL and image.
- Twitter/X card metadata without inventing an unverified account handle.
- Indexing instructions appropriate to the publication state.
- Schema.org JSON-LD using the closest accurate CreativeWork subtype.
- Publication and modification dates only when supported by the record.
- A stable, accessible social-sharing image.

## 8. Structured-data mapping

Use the closest accurate Schema.org type:

| FWI type | Preferred Schema.org type |
|---|---|
| Strategic Research Report | `Report` |
| Evidence Review / Conceptual Research Report | `ScholarlyArticle` or `Report`, according to the actual method |
| Strategic Intelligence Report | `Report` |
| Intelligence Brief / Practice Brief | `Article` or `Report` |
| Key Principle / Research Explainer | `Article` |
| Course landing page | `Course` |
| Course lecture / learning resource | `LearningResource` |
| Multimedia publication | `VideoObject`, `ImageObject` or another accurate media type |
| Institutional policy / legal publication | `DigitalDocument` or `WebPage` |

Structured data must describe the actual publication. It must not claim external peer review, accreditation, organizational affiliation, awards or approval that cannot be evidenced.

## 9. Citation pattern

Use this institutional-author pattern unless a named authorship decision is approved:

```text
FutureWorld Intelligence. (Year). Title (Series and number; edition). Canonical URL
```

## 10. Backend governance fields

The following belong in the controlled backend record and are not automatically public:

- Inventory ID
- Workstream classification
- Risk tier
- Evidence-register location
- Citation-audit status
- Fact-check status
- Originality/similarity status
- AI-use record
- Rights and safety review
- Readiness score
- Approval record and approver
- Publication gate result

The public validation label must be derived from these records, never entered as an unsupported marketing statement.

## 11. Treatment of non-primary artifacts

### Legacy or duplicate pages

Choose one authoritative publication. Then redirect, archive, noindex or mark the other version as superseded. Preserve audit history before removal.

### Redirects and aliases

Use a single-hop redirect to the authoritative clean URL. Do not add a full publication block to a redirect page.

### Incomplete items

Do not present placeholders as completed publications. Complete them or withhold/noindex them until ready.

### Multimedia derivatives

Name and link the approved source publication, state that the item is an adaptation, and recheck factual consistency, rights and accessibility.

## 12. Pilot and rollout rule

1. Implement and visually verify Force No. 1.
2. Obtain human approval of the wording, classification and page presentation.
3. Resolve critical numbering and canonical-route conflicts.
4. Convert the approved pilot into reusable shared styles/components.
5. Apply the standard category by category following the controlled inventory.
6. Validate each publication separately; do not bulk-assign validated status.

## 13. Page-level QA checklist

- Family and precise publication type are both present and consistent with the inventory.
- Series name and number do not conflict with another publication.
- Purpose, audience and method accurately describe the artifact.
- Dates and evidence cut-off are supported or transparently marked as unavailable.
- Validation status is supported by governance records.
- Recommended citation uses the canonical URL.
- Canonical, Open Graph, citation and JSON-LD metadata agree.
- Social image exists and has an accurate accessible description where displayed.
- The identity block is readable on desktop and mobile.
- Existing navigation, sources, limitations and accessibility behavior remain functional.

