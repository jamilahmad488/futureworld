import contextlib
import io
import json
import re
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import patch
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]

import sys

sys.path.insert(0, str(ROOT / "tools"))
import fwi_seo_upgrade as seo  # noqa: E402


class ResourceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []
        self.body_classes = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "body":
            self.body_classes = attrs.get("class", "").split()
        if tag in ("script", "img") and attrs.get("src"):
            self.resources.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.resources.append(attrs["href"])


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

    def test_clean_and_legacy_routes_are_real_pages_without_reload_loops(self):
        for page in (item for item in seo.PAGES if item.legacy):
            with self.subTest(page=page.source):
                clean = (ROOT / page.source).read_text(encoding="utf-8")
                legacy = (ROOT / page.legacy).read_text(encoding="utf-8")
                self.assertEqual(clean, legacy)
                self.assertNotRegex(clean, r"document\.write\s*\(")
                self.assertNotRegex(clean, r"fetch\s*\(")
                self.assertIn("<main", clean.lower())
                self.assertNotRegex(legacy.lower(), r"http-equiv\s*=\s*['\"]refresh")
                self.assertNotRegex(
                    legacy, r"location\s*(?:\.\s*(?:replace|assign)\s*\(|(?:\.href)?\s*=)"
                )
                self.assertNotIn('content="noindex,follow"', legacy.lower())
                self.assertEqual(seo.canonical_from(legacy, page.legacy), page.url)

    def test_migrated_pages_do_not_depend_on_scripts_to_hide_the_loader(self):
        for page in (item for item in seo.PAGES if item.legacy):
            for source in (page.source, page.legacy):
                with self.subTest(page=source):
                    parser = ResourceParser()
                    parser.feed((ROOT / source).read_text(encoding="utf-8"))
                    self.assertIn("loaded", parser.body_classes)

    def test_resources_resolve_from_clean_legacy_and_cached_wrapper_urls(self):
        for page in (item for item in seo.PAGES if item.legacy):
            parser = ResourceParser()
            parser.feed((ROOT / page.source).read_text(encoding="utf-8"))
            # Old wrappers inserted <base href="../"> before document.write.
            for base in (page.url, f"{seo.SITE}/{page.legacy}", f"{seo.SITE}/pages/"):
                for resource in parser.resources:
                    resolved = urlparse(urljoin(base, resource))
                    if resolved.netloc != urlparse(seo.SITE).netloc:
                        continue
                    with self.subTest(page=page.source, base=base, resource=resource):
                        self.assertTrue((ROOT / resolved.path.lstrip("/")).is_file())

    def test_generator_preserves_clean_source_and_replaces_stale_alias(self):
        page = next(item for item in seo.PAGES if item.legacy)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target, legacy = root / page.source, root / page.legacy
            target.parent.mkdir(parents=True)
            target.write_text(
                "<html><head></head><body><main><h1>Current content</h1></main></body></html>",
                encoding="utf-8",
            )
            legacy.write_text("Outdated legacy content", encoding="utf-8")
            with patch.object(seo, "ROOT", root), patch.object(seo, "PAGES", (page,)), patch.object(
                seo, "build_sitemap", return_value="sitemap"
            ):
                documents = seo.generated_files()
            self.assertIn("Current content", documents[target])
            self.assertEqual(documents[target], documents[legacy])
            self.assertNotIn("Outdated legacy content", documents[target])

    def test_check_mode_reports_drift_without_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "page.html"
            target.write_text("original", encoding="utf-8")
            with patch.object(seo, "ROOT", root), patch.object(
                seo, "generated_files", return_value={target: "updated"}
            ), contextlib.redirect_stdout(io.StringIO()) as output:
                self.assertEqual(seo.main(["--check"]), 1)
                self.assertEqual(target.read_text(encoding="utf-8"), "original")
                self.assertIn("Out of date: page.html", output.getvalue())
                self.assertEqual(seo.main([]), 0)
                self.assertEqual(target.read_text(encoding="utf-8"), "updated")
                self.assertEqual(seo.main(["--check"]), 0)

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
