# FWI Publication Identity Rollout Report

**Standard:** FWI-PUB-ID-1.0  
**Implementation date:** 15 July 2026  
**Rollout branch:** `agent/fwi-publication-metadata-rollout-20260715`  
**Public validation status:** Retrospective validation pending  

## Outcome

The approved publication identity and metadata package has been applied to all 72 primary FutureWorld Intelligence publications in the controlled inventory. The rollout changes public identity, discovery metadata and governance disclosures; it does not bulk-validate substantive claims.

| Publication family | Pages updated |
|---|---:|
| Research and Strategic Analysis | 20 |
| Briefs and Applied Knowledge | 4 |
| Principles and Explainers | 27 |
| Courses and Learning Resources | 16 |
| Multimedia Publications | 2 |
| Institutional Publications | 3 |
| **Total** | **72** |

## Information added

Every primary publication now provides or preserves:

- Publication family and precise publication type
- Domain, series and number or transparent numbering-review statement
- Institutional author
- Supported publication year, or `Not recorded` with `n.d.` citation treatment
- Web edition and metadata-update date
- Purpose, intended audience and method/evidence basis
- Evidence cut-off treatment
- Limitations and disclosure statement
- Controlled validation status
- Recommended institutional citation
- Absolute canonical URL
- Citation, Open Graph and Twitter/X metadata
- Schema.org structured data using the closest accurate publication subtype

## Date integrity

Publication dates were not invented. Thirty-nine pages had an existing page-level year record; 33 did not. The latter display `Publication year: Not recorded`, omit an unsupported machine-readable publication date and use `n.d.` in the recommended citation.

## Validation controls

- Controlled manifest count: 72/72
- Unique source paths: 72/72
- Unique canonical URLs: 72/72
- One visible identity package per primary publication: passed
- Required citation, author, publisher, canonical, Open Graph and structured metadata: passed
- JSON-LD parse and type checks: passed
- Shared CSS delimiter and brace checks: passed
- Social-image repository target checks: passed
- Reusable implementation idempotence: passed (`Updated 0 publication pages` on the second run)
- Governance regression suite: 19/19 tests passed
- Existing visible publication text outside the generated identity package: unchanged on 71 pages; only the previously approved Force No. 1 pilot wording differs

## Special implementation cases

- Multimedia and GIS presentations receive a scroll-accessible identity section after the full-screen presentation surface.
- Course lectures place the identity package after the existing hero and before the instructional body.
- Geopolitics Intelligence #011 remains a legacy runtime loader; its host page and fetched report both receive the controlled metadata and identity package, and the loader JavaScript passes syntax validation.
- Force No. 1 remains the approved reference implementation and retains its publication-specific evidence and limitation links.

## Excluded from this rollout

The 34 non-primary artifacts were not given a full publication identity package:

- 17 legacy or duplicate publications
- 11 redirects or URL aliases
- 4 supporting components
- 1 promotional derivative
- 1 incomplete or withhold item

They require separate redirect, archive, source-attribution, completion or indexing decisions.

## Remaining approval gates

1. Review representative deployed pages on desktop and mobile.
2. Reactivate the `main` ruleset before merging the rollout.
3. Run the repaired FWI governance gate.
4. Do not change any page to `Validated — human approved` until its individual retrospective evidence, citation, originality, disclosure and approval records are complete.
