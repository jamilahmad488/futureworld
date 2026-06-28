# FutureWorld Intelligence Internal Report Writing Architecture

**Status:** Internal working standard  
**Purpose:** Backend governance for FutureWorld Intelligence reports  
**Audience:** FWI editors, researchers, contributors and AI-assisted report preparation workflows  
**Visibility:** Internal repository documentation; not intended for public website navigation

## 1. Core Standard

Every FutureWorld Intelligence report shall be prepared under the following standard:

> AI-assisted, human-verified, source-grounded, citation-audited and transparently governed.

AI may support research organization, drafting, summarization, editing, translation, visual planning and structure. AI shall not be treated as an independent source of evidence. Final responsibility for accuracy, integrity, interpretation and publication remains with FutureWorld Intelligence.

## 2. Institutional Purpose

FutureWorld Intelligence exists to support public understanding, policy awareness, responsible futures thinking and real-world problem solving. Reports should serve humanity through objective, evidence-based and constructive analysis. The platform shall avoid propaganda, unsupported claims, sensationalism, hate, manipulation, hidden plagiarism and unverifiable content.

## 3. Source Hierarchy

### Tier 1: Primary and Institutional Sources
Use as the factual backbone of reports.

Examples: IPCC, UNFCCC, WMO, UNEP, FAO, WHO, World Bank, IMF, IEA, UNHCR, UNCTAD, SIPRI, OECD, government statistical agencies and official datasets.

### Tier 2: Peer-Reviewed and Academic Sources
Use for research depth and interpretation.

Examples: journal articles, university publications, research institutes and academic books.

### Tier 3: Professional Policy and Technical Sources
Use for context and current analysis.

Examples: reputable think tanks, development agencies, technical working papers, recognized professional bodies and sectoral institutions.

### Tier 4: News and Public Media
Use only for current events, examples and timeline context. Avoid using media sources as the sole support for core factual or scientific claims.

### Tier 5: Blogs, Opinion, Social Media and Unverified Material
Avoid for core claims. Use only when clearly labelled as public discourse, opinion or stakeholder communication.

## 4. Mandatory Report Stages

### Stage 1: Research Plan
Before drafting, define the report title, domain, main question, core thesis, scope, intended audience, source base and expected publication level.

### Stage 2: Source Collection
Collect sources before drafting. Use Zotero or a structured source folder. Major reports should rely mainly on Tier 1 and Tier 2 sources.

### Stage 3: AI-Assisted Drafting
AI may help prepare an outline, summarize sources, improve structure and draft readable explanations. All statistics, institutional claims and technical statements must later be checked manually.

### Stage 4: Claim-Level Verification
Every major claim must be classified as evidence, analysis or projection.

- **Evidence:** directly supported by a cited source.
- **Analysis:** FutureWorld Intelligence interpretation based on evidence.
- **Projection:** future-oriented assessment; not certainty.

### Stage 5: Citation Audit
Check that every major factual claim has a real, accessible and relevant source. Verify that the source actually supports the exact claim.

### Stage 6: Similarity and Originality Check
Check similarity against source materials and previous FWI reports. Rewrite high-similarity text. Direct quotes must be short, clearly quoted and cited.

### Stage 7: Human Review
Conduct factual, editorial, policy-neutrality and source-integrity review before publication.

### Stage 8: Publication and Update Log
Publish only after readiness scoring. Maintain an internal update log for corrections, source updates and future revisions.

## 5. Mandatory Internal Files Per Report

Each major report folder should include:

```text
/content/<domain>/<report-slug>/
├── index.html
├── assets/
├── sources/
├── evidence-register.csv
├── citation-audit.md
├── similarity-check.md
├── review-checklist.md
└── update-log.md
```

These files are for internal accountability and report preparation. They should not be linked from public report pages unless FWI chooses to publish a transparency archive.

## 6. Publication Readiness Categories

| Category | Score | Meaning |
|---|---:|---|
| Research-ready | 90-100 | Claim-level verified, strong references, full audit complete |
| Policy-briefing ready | 80-89 | Strong source base and suitable for policy discussion |
| Educational/public briefing | 70-79 | Useful for awareness but not formal research-grade |
| Draft only | Below 70 | Not ready for publication |

## 7. FWI Report Readiness Score

| Category | Marks |
|---|---:|
| Source quality | 20 |
| Claim verification | 20 |
| Citation completeness | 20 |
| Originality and similarity | 15 |
| Neutrality and objectivity | 10 |
| AI-use governance | 5 |
| Limitations and uncertainty | 5 |
| Visual and data integrity | 5 |
| **Total** | **100** |

## 8. Responsible AI Rule

Before any future FWI report is drafted, this architecture should be checked first. The report shall not proceed directly from AI generation to publication. It must pass through source collection, claim verification, citation audit, originality check and human review.

## 9. Internal Principle

The strength of FWI shall not be the volume of content it produces. Its strength shall be the integrity of its evidence, the discipline of its method, the neutrality of its language and the usefulness of its work for people, communities, institutions and the planet.
