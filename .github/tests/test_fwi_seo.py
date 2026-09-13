import json
import re
import unittest
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]

import sys

sys.path.insert(0, str(ROOT / "tools"))
import fwi_seo_upgrade as seo  # noqa: E402


class FwiSeoContractTests(unittest.TestCase):
    def test_public_hubs_have_complete_unique_metadata(self):
        required = (
            r'<link rel="canonical" href="([^"]+)"',
            r'<meta property="og:title" content="[^"]+"',
            r'<meta property="og:description" content="[^"]+"',
            r'<meta property="og:url" content="[^"]+"',
            r'<meta property="og:image" content="[^"]+"',
            r'<meta name="twitter:card" content="summary_large_image"',
        )
        for page in seo.PAGES:
            with self.subTest(page=page.source):
                document = (ROOT / page.source).read_text(encoding="utf-8")
                self.assertEqual(document.count(seo.SEO_START), 1)
                self.assertEqual(document.count(seo.SEO_END), 1)
                for pattern in required:
                    self.assertEqual(len(re.findall(pattern, document, re.I)), 1)
                self.assertIn(f'href="{page.url}"', document)
                self.assertIn(f'content="{page.url}"', document)
                payloads = re.findall(
                    r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
                    document,
                    re.I | re.S,
                )
                self.assertEqual(len(payloads), 1)
                parsed = json.loads(payloads[0])
                self.assertEqual(parsed["@context"], "https://schema.org")

    def test_clean_routes_are_real_pages_and_legacy_routes_redirect(self):
        for page in (item for item in seo.PAGES if item.legacy):
            with self.subTest(page=page.source):
                clean = (ROOT / page.source).read_text(encoding="utf-8")
                legacy = (ROOT / page.legacy).read_text(encoding="utf-8")
                self.assertNotRegex(clean, r"document\.write\s*\(")
                self.assertNotRegex(clean, r"fetch\s*\(")
                self.assertIn("<main", clean.lower())
                self.assertIn('http-equiv="refresh"', legacy.lower())
                self.assertIn('content="noindex,follow"', legacy.lower())
                self.assertIn(page.url, legacy)

    def test_sitemap_is_canonical_complete_and_clean(self):
        tree = ET.parse(ROOT / "sitemap.xml")
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [node.text for node in tree.findall("sm:url/sm:loc", namespace)]
        self.assertEqual(len(urls), len(set(urls)))
        self.assertEqual(set(urls), set(seo.sitemap_urls()))
        self.assertTrue(seo.publication_urls().issubset(urls))
        for page in seo.PAGES:
            self.assertIn(page.url, urls)
        forbidden = ("/admin/", "/command-center", "/intelligence-hub", "gateway.html")
        self.assertFalse(any(token in url for url in urls for token in forbidden))
        self.assertFalse(
            any(
                url.endswith(f"/pages/{name}.html")
                for url in urls
                for name in (
                    "climate",
                    "geopolitics",
                    "energy",
                    "futures",
                    "intelligence-index",
                    "privacy",
                )
            )
        )

    def test_robots_points_to_authoritative_sitemap(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        self.assertIn(f"Sitemap: {seo.SITE}/sitemap.xml", robots)

    def test_climate_service_has_visible_and_machine_readable_answers(self):
        page = next(
            item
            for item in seo.PAGES
            if item.route == "/services/community-climate-services/"
        )
        document = (ROOT / page.source).read_text(encoding="utf-8")
        payload = re.search(
            r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
            document,
            re.I | re.S,
        )
        self.assertIsNotNone(payload)
        graph = json.loads(payload.group(1))["@graph"]
        schema_types = {item["@type"] for item in graph}
        self.assertTrue({"WebPage", "Service", "FAQPage"}.issubset(schema_types))
        service = next(item for item in graph if item["@type"] == "Service")
        offers = service["hasOfferCatalog"]["itemListElement"]
        self.assertEqual(len(offers), 5)
        self.assertTrue(all(item["priceCurrency"] == "PKR" for item in offers))
        faq = next(item for item in graph if item["@type"] == "FAQPage")
        for item in faq["mainEntity"]:
            self.assertIn(item["name"], document)
            self.assertIn(item["acceptedAnswer"]["text"], document)
        self.assertGreaterEqual(document.count("mailto:"), 3)


if __name__ == "__main__":
    unittest.main()
