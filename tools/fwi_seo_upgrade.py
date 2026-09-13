#!/usr/bin/env python3
"""Apply and verify the FWI public-page SEO contract.

The controlled publication map remains the authority for publications. This
script only manages public hub-page metadata, clean-route migration, and the
canonical sitemap assembled from those two sources.
"""

from __future__ import annotations

import argparse
import html
import json
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SITE = "https://futureworldintelligence.org"
OG_IMAGE = f"{SITE}/assets/logo.png"
SEO_START = "<!-- FWI-SEO:START -->"
SEO_END = "<!-- FWI-SEO:END -->"


@dataclass(frozen=True)
class Page:
    source: str
    route: str
    title: str
    description: str
    schema_type: str = "WebPage"
    legacy: str | None = None

    @property
    def url(self) -> str:
        return f"{SITE}{self.route}"


PAGES = (
    Page(
        "index.html",
        "/",
        "FutureWorld Intelligence | Global Futures Dashboard",
        "FutureWorld Intelligence is a public-interest intelligence and educational platform for climate, AI, geopolitics, energy and strategic futures.",
        "WebPage",
    ),
    Page(
        "connect/index.html",
        "/connect/",
        "Connect | FutureWorld Intelligence",
        "Connect with FutureWorld Intelligence through its reports, free courses, resources, newsletter and public knowledge channels.",
        "ContactPage",
    ),
    Page(
        "pages/climate/index.html",
        "/pages/climate/",
        "Climate Intelligence | FutureWorld Intelligence",
        "FutureWorld Climate Intelligence explains climate change, forestry, watersheds, restoration, biodiversity, climate finance and community resilience.",
        "CollectionPage",
        "pages/climate.html",
    ),
    Page(
        "pages/ai/index.html",
        "/pages/ai/",
        "AI Intelligence | FutureWorld Intelligence",
        "FutureWorld AI Intelligence explains AI technologies, agents, automation, literacy, governance, risks, productivity and human potential.",
        "CollectionPage",
    ),
    Page(
        "pages/geopolitics/index.html",
        "/pages/geopolitics/",
        "Geopolitics | FutureWorld Intelligence",
        "FutureWorld Geopolitics explains global power, maritime routes, institutions, corridors, multipolarity and systems capacity through neutral educational briefings.",
        "CollectionPage",
        "pages/geopolitics.html",
    ),
    Page(
        "pages/energy/index.html",
        "/pages/energy/",
        "Energy Intelligence | FutureWorld Intelligence",
        "FutureWorld Energy Intelligence examines energy security, transition systems, grids, infrastructure, critical minerals, access and climate-development connections.",
        "CollectionPage",
        "pages/energy.html",
    ),
    Page(
        "pages/futures/index.html",
        "/pages/futures/",
        "Strategic Futures | FutureWorld Intelligence",
        "FutureWorld Strategic Futures connects climate, AI, geopolitics, energy and foresight capacity through scenarios, signals, resilience and anticipatory governance.",
        "CollectionPage",
        "pages/futures.html",
    ),
    Page(
        "pages/intelligence-index/index.html",
        "/pages/intelligence-index/",
        "Intelligence Index | FutureWorld Intelligence",
        "Browse FutureWorld Intelligence reports, briefings and media across climate, AI, geopolitics, energy and strategic futures.",
        "CollectionPage",
        "pages/intelligence-index.html",
    ),
    Page(
        "pages/resources/index.html",
        "/pages/resources/",
        "Resources | FutureWorld Intelligence",
        "Explore FutureWorld Intelligence reports, research tools, publishing templates, learning resources and public knowledge assets.",
        "CollectionPage",
    ),
    Page(
        "pages/gallery/index.html",
        "/pages/gallery/",
        "Gallery | FutureWorld Intelligence",
        "Explore the FutureWorld Intelligence visual archive for climate action, restoration, maps, dashboards, learning resources and public media.",
        "CollectionPage",
    ),
    Page(
        "pages/about/index.html",
        "/pages/about/",
        "About | FutureWorld Intelligence",
        "Learn about FutureWorld Intelligence, an independent public-interest platform for evidence-led education, research and strategic analysis.",
        "AboutPage",
    ),
    Page(
        "pages/intro/index.html",
        "/pages/intro/",
        "Understanding Today, Anticipating Tomorrow | FutureWorld Intelligence",
        "An introduction to FutureWorld Intelligence and its work across climate, AI, geopolitics, energy, strategic futures and human development.",
        "WebPage",
    ),
    Page(
        "pages/privacy/index.html",
        "/pages/privacy/",
        "Privacy & Cookie Policy | FutureWorld Intelligence",
        "Read the FutureWorld Intelligence privacy and cookie policy, including analytics choices and public-interest data safeguards.",
        "WebPage",
        "pages/privacy.html",
    ),
    Page(
        "pages/climate/evidence-explorer/index.html",
        "/pages/climate/evidence-explorer/",
        "Climate Evidence Explorer | FutureWorld Intelligence",
        "Explore global-to-community climate evidence through administrative boundaries, Earth-observation maps, thematic evidence and field-verification pathways.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/themes/index.html",
        "/pages/climate/evidence-explorer/themes/",
        "Climate Evidence Themes | FutureWorld Intelligence",
        "Explore evidence pathways for climate, forests, water, drought, wildfire, biodiversity, mountains, vulnerability and implementation.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/global/index.html",
        "/pages/climate/evidence-explorer/global/",
        "Global Climate Intelligence | FutureWorld Intelligence",
        "Explore global climate and Earth-observation evidence for temperature, emissions, forests, water, fire, ecosystems, snow and hazards.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/national/index.html",
        "/pages/climate/evidence-explorer/national/",
        "National Climate Intelligence | FutureWorld Intelligence",
        "Explore country-level climate evidence aligned with national geography, policies, institutions, commitments and reporting needs.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/national/pakistan/index.html",
        "/pages/climate/evidence-explorer/national/pakistan/",
        "Pakistan Climate Intelligence | FutureWorld Intelligence",
        "Explore Pakistan climate evidence, national priorities, Earth-observation pathways and connections to subnational implementation.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/subnational/index.html",
        "/pages/climate/evidence-explorer/subnational/",
        "Subnational Climate Intelligence | FutureWorld Intelligence",
        "Explore province, state, district, watershed and landscape climate evidence for locally relevant planning and action.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/subnational/pakistan/khyber-pakhtunkhwa/index.html",
        "/pages/climate/evidence-explorer/subnational/pakistan/khyber-pakhtunkhwa/",
        "Khyber Pakhtunkhwa Climate Intelligence | FutureWorld Intelligence",
        "Explore climate, forest, watershed, hazard and community-action evidence for Khyber Pakhtunkhwa, Pakistan.",
        "CollectionPage",
    ),
    Page(
        "pages/climate/evidence-explorer/community-action/index.html",
        "/pages/climate/evidence-explorer/community-action/",
        "Community Climate Action | FutureWorld Intelligence",
        "Connect Earth-observation evidence with community knowledge, field verification, restoration planning and local climate action.",
        "CollectionPage",
    ),
    Page(
        "services/community-climate-services/index.html",
        "/services/community-climate-services/",
        "Community Climate Project and Proposal Support | FutureWorld Intelligence",
        "Practical climate project readiness, concept-note review, proposal development and community-based forestry, watershed restoration and climate-resilience advisory services.",
        "WebPage",
    ),
)


def json_ld(page: Page) -> str:
    graph: list[dict[str, object]] = []
    if page.route == "/":
        graph.extend(
            [
                {
                    "@type": "Organization",
                    "@id": f"{SITE}/#organization",
                    "name": "FutureWorld Intelligence",
                    "url": f"{SITE}/",
                    "logo": {"@type": "ImageObject", "url": OG_IMAGE},
                },
                {
                    "@type": "WebSite",
                    "@id": f"{SITE}/#website",
                    "url": f"{SITE}/",
                    "name": "FutureWorld Intelligence",
                    "publisher": {"@id": f"{SITE}/#organization"},
                    "inLanguage": "en",
                },
            ]
        )
    graph.append(
        {
            "@type": page.schema_type,
            "@id": f"{page.url}#webpage",
            "url": page.url,
            "name": page.title,
            "description": page.description,
            "isPartOf": {"@id": f"{SITE}/#website"},
            "about": {"@id": f"{SITE}/#organization"},
            "inLanguage": "en",
        }
    )
    if page.route == "/services/community-climate-services/":
        graph.extend(
            [
                {
                    "@type": "Service",
                    "@id": f"{page.url}#service",
                    "name": "Community Climate Project Readiness and Proposal Support",
                    "url": page.url,
                    "provider": {"@id": f"{SITE}/#organization"},
                    "areaServed": "Worldwide",
                    "serviceType": [
                        "Climate project readiness assessment",
                        "Climate concept note review",
                        "Small grant proposal support",
                        "Community-based climate action advisory",
                        "Forestry and watershed restoration advisory",
                    ],
                    "description": page.description,
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Professional climate services",
                        "itemListElement": [
                            {"@type": "Offer", "price": "25000", "priceCurrency": "PKR", "itemOffered": {"@type": "Service", "name": "Written climate project readiness diagnostic"}},
                            {"@type": "Offer", "priceCurrency": "PKR", "priceSpecification": {"@type": "PriceSpecification", "minPrice": "75000", "maxPrice": "150000", "priceCurrency": "PKR"}, "itemOffered": {"@type": "Service", "name": "Climate concept-note development and donor-alignment review"}},
                            {"@type": "Offer", "priceCurrency": "PKR", "priceSpecification": {"@type": "PriceSpecification", "minPrice": "250000", "maxPrice": "500000", "priceCurrency": "PKR"}, "itemOffered": {"@type": "Service", "name": "Complete small-grant proposal support"}},
                            {"@type": "Offer", "priceCurrency": "PKR", "priceSpecification": {"@type": "PriceSpecification", "minPrice": "300000", "maxPrice": "750000", "priceCurrency": "PKR"}, "itemOffered": {"@type": "Service", "name": "Forestry, assisted natural regeneration and watershed technical planning"}},
                            {"@type": "Offer", "priceCurrency": "PKR", "priceSpecification": {"@type": "PriceSpecification", "minPrice": "150000", "maxPrice": "300000", "priceCurrency": "PKR"}, "itemOffered": {"@type": "Service", "name": "Monthly institutional climate advisory support"}},
                        ],
                    },
                },
                {
                    "@type": "FAQPage",
                    "@id": f"{page.url}#faq",
                    "mainEntity": [
                        {"@type": "Question", "name": "What makes a climate project grant-ready?", "acceptedAnswer": {"@type": "Answer", "text": "A grant-ready climate project clearly defines the climate problem, affected population, evidence baseline, intervention logic, measurable results, safeguards, implementation capacity, budget and sustainability pathway."}},
                        {"@type": "Question", "name": "Can FWI guarantee that a donor will fund a proposal?", "acceptedAnswer": {"@type": "Answer", "text": "No. FutureWorld Intelligence improves readiness, evidence, structure and donor alignment but does not guarantee funding or claim influence over donor decisions."}},
                        {"@type": "Question", "name": "Which climate projects does FWI support?", "acceptedAnswer": {"@type": "Answer", "text": "FWI supports lawful public-benefit initiatives involving community climate action, forestry, assisted natural regeneration, watershed restoration, biodiversity, nurseries, climate resilience, monitoring and related livelihoods."}},
                    ],
                },
            ]
        )
    return json.dumps(
        {"@context": "https://schema.org", "@graph": graph},
        ensure_ascii=False,
        indent=2,
    )


def metadata_block(page: Page) -> str:
    esc = html.escape
    return "\n".join(
        [
            SEO_START,
            f'<link rel="canonical" href="{page.url}" />',
            '<meta property="og:site_name" content="FutureWorld Intelligence" />',
            '<meta property="og:type" content="website" />',
            f'<meta property="og:title" content="{esc(page.title, quote=True)}" />',
            f'<meta property="og:description" content="{esc(page.description, quote=True)}" />',
            f'<meta property="og:url" content="{page.url}" />',
            f'<meta property="og:image" content="{OG_IMAGE}" />',
            '<meta name="twitter:card" content="summary_large_image" />',
            f'<meta name="twitter:title" content="{esc(page.title, quote=True)}" />',
            f'<meta name="twitter:description" content="{esc(page.description, quote=True)}" />',
            f'<meta name="twitter:image" content="{OG_IMAGE}" />',
            '<script type="application/ld+json">',
            json_ld(page),
            "</script>",
            SEO_END,
        ]
    )


def remove_unmanaged_canonical(document: str) -> str:
    return re.sub(
        r"\s*<link\b(?=[^>]*\brel=[\"']canonical[\"'])[^>]*>\s*",
        "\n",
        document,
        flags=re.IGNORECASE,
    )


def apply_metadata(document: str, page: Page) -> str:
    document = re.sub(
        rf"\s*{re.escape(SEO_START)}.*?{re.escape(SEO_END)}\s*",
        "\n",
        document,
        flags=re.DOTALL,
    )
    document = remove_unmanaged_canonical(document)
    if "</head>" not in document.lower():
        raise ValueError(f"{page.source}: missing </head>")
    return re.sub(
        r"</head>", f"{metadata_block(page)}\n</head>", document, count=1, flags=re.I
    )


def canonical_from(document: str, source: str) -> str:
    match = re.search(
        r"<link\b(?=[^>]*\brel=[\"']canonical[\"'])(?=[^>]*\bhref=[\"']([^\"']+)[\"'])[^>]*>",
        document,
        flags=re.I,
    )
    if not match:
        raise ValueError(f"{source}: canonical URL missing")
    url = match.group(1)
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "futureworldintelligence.org":
        raise ValueError(f"{source}: non-authoritative canonical URL {url}")
    return url


def publication_urls() -> set[str]:
    mapping = json.loads((ROOT / "governance/fwi-publication-map.json").read_text())
    publications = mapping["publications"]
    if len(publications) != mapping["publication_count"]:
        raise ValueError("Controlled publication count does not match publication map")
    urls = set()
    for item in publications:
        source = item["source_path"]
        urls.add(canonical_from((ROOT / source).read_text(encoding="utf-8"), source))
    if len(urls) != len(publications):
        raise ValueError("Controlled publications do not have unique canonical URLs")
    return urls


def sitemap_urls() -> list[str]:
    urls = {page.url for page in PAGES}
    urls.update(publication_urls())
    for source in (
        "copyright/index.html",
        "pages/institutional-editorial-charter/index.html",
        "pages/research-commercial-independence/index.html",
    ):
        urls.add(canonical_from((ROOT / source).read_text(encoding="utf-8"), source))
    return sorted(urls, key=lambda url: (url != f"{SITE}/", url))


def build_sitemap() -> str:
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    root = ET.Element("{http://www.sitemaps.org/schemas/sitemap/0.9}urlset")
    for canonical in sitemap_urls():
        node = ET.SubElement(root, "{http://www.sitemaps.org/schemas/sitemap/0.9}url")
        ET.SubElement(node, "{http://www.sitemaps.org/schemas/sitemap/0.9}loc").text = canonical
    ET.indent(root, space="  ")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(
        root, encoding="unicode", short_empty_elements=True
    ) + "\n"


def generated_files() -> dict[Path, str]:
    """Use clean pages as the source; legacy URLs are compatible content mirrors.

    Cached pre-migration wrappers fetch the legacy HTML and document.write it
    into the clean URL. Redirecting that response back to the clean URL creates
    a reload loop. Keep real HTML at both paths, with the clean canonical URL;
    script.js normalizes old URLs using history.replaceState without reloading.
    """
    documents = {}
    for page in PAGES:
        target = ROOT / page.source
        source = target.read_text(encoding="utf-8")
        if page.legacy and (
            "<main" not in source.lower()
            or re.search(r"document\.write\s*\(", source)
            or re.search(r"http-equiv\s*=\s*['\"]refresh['\"]", source, re.I)
        ):
            raise ValueError(f"{page.source}: expected a real clean-route source page")
        document = apply_metadata(source, page)
        documents[target] = document
        if page.legacy:
            documents[ROOT / page.legacy] = document
    documents[ROOT / "sitemap.xml"] = build_sitemap()
    return documents


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check without writing files")
    args = parser.parse_args(argv)
    documents = generated_files()
    changed = [
        path for path, document in documents.items()
        if not path.exists() or path.read_text(encoding="utf-8") != document
    ]
    if args.check:
        for path in changed:
            print(f"Out of date: {path.relative_to(ROOT)}")
        return int(bool(changed))
    for path in changed:
        path.write_text(documents[path], encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
