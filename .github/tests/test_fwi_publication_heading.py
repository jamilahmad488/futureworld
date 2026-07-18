import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "governance" / "fwi-publication-manifest.json"
SHARED_STYLE = ROOT / "style.css"
HERO_STYLE = ROOT / "assets" / "fwi-universal-hero.css"
ARCHIVED_STYLE = ROOT / "archive" / "legacy-hero-heading-styles" / "fwi-publication-heading-v3.2.css"
STYLE_VERSION = "3.2"
HERO_VERSION = "1.1"


class PublicationHeadingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_all_72_publications_load_current_shared_styles(self):
        publications = self.manifest["publications"]
        self.assertEqual(len(publications), 72)
        for item in publications:
            source = (ROOT / item["source_path"]).read_text(encoding="utf-8")
            with self.subTest(path=item["source_path"]):
                self.assertIn(f"/style.css?v={STYLE_VERSION}", source)
                self.assertIn(f"/assets/fwi-universal-hero.css?v={HERO_VERSION}", source)
                self.assertEqual(source.count('data-fwi-hero-style="1"'), 1)
                self.assertIn("fwi-universal-hero-title", source)
                self.assertNotRegex(source, r"/style\.css\?v=(?:2\.6|2\.7|3\.1)(?:[\"'])")

    def test_multimedia_publications_use_controlled_variant(self):
        for item in self.manifest["publications"]:
            multimedia = item["family"] == "Multimedia Publications" or item["publication_type"] == "FWI Field/GIS Assessment Presentation"
            if multimedia:
                source = (ROOT / item["source_path"]).read_text(encoding="utf-8")
                with self.subTest(path=item["source_path"]):
                    self.assertIn("fwi-universal-hero-title--multimedia", source)

    def test_temporary_publication_override_is_archived(self):
        css = SHARED_STYLE.read_text(encoding="utf-8")
        self.assertNotIn("FWI-PUBLICATION-HERO-TYPOGRAPHY", css)
        self.assertTrue(ARCHIVED_STYLE.is_file())
        self.assertIn("ARCHIVED", ARCHIVED_STYLE.read_text(encoding="utf-8"))

    def test_desktop_scale_matches_domain_page_heading_scale(self):
        css = HERO_STYLE.read_text(encoding="utf-8")
        self.assertIn("--fwi-hero-title-size: clamp(3rem, 3.7vw, 4.65rem)", css)
        self.assertIn("--fwi-hero-title-size: clamp(3.2rem, 3.6vw, 4.9rem)", css)
        self.assertIn(".fwi-universal-hero-title", css)


if __name__ == "__main__":
    unittest.main()
