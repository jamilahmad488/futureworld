import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / ".github" / "scripts" / "fwi_universal_hero.py"
spec = importlib.util.spec_from_file_location("fwi_universal_hero", SCRIPT)
hero = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(hero)


class UniversalHeroTests(unittest.TestCase):
    def test_every_active_page_conforms(self):
        pages = []
        headings = 0
        errors = []
        for path in hero.html_files(ROOT):
            text = path.read_text(encoding="utf-8", errors="replace")
            if hero.active_page(text):
                pages.append(path)
                headings += len(hero.h1_matches(text))
                relative = path.relative_to(ROOT)
                errors.extend(
                    hero.validate_text(
                        relative,
                        text,
                        publication=relative.parts[0] == "content",
                    )
                )
        self.assertEqual(len(pages), 107)
        self.assertEqual(headings, 108)
        self.assertEqual(errors, [])

    def test_redirect_pages_remain_outside_contract(self):
        redirects = []
        for path in hero.html_files(ROOT):
            text = path.read_text(encoding="utf-8", errors="replace")
            if hero.is_redirect_page(text):
                redirects.append(path)
                self.assertNotIn('data-fwi-hero-style="1"', text)
        self.assertEqual(len(redirects), 8)

    def test_archived_styles_are_not_linked(self):
        for path in hero.html_files(ROOT):
            source = path.read_text(encoding="utf-8", errors="replace")
            with self.subTest(path=path.relative_to(ROOT)):
                self.assertNotIn("archive/legacy-hero-heading-styles", source)

    def test_publication_spacing_is_scoped_to_conventional_content(self):
        conventional_publications = 0
        for path in hero.html_files(ROOT):
            text = path.read_text(encoding="utf-8", errors="replace")
            relative = path.relative_to(ROOT)
            if not hero.active_page(text):
                continue
            should_have_modifier = relative.parts[0] == "content" and not hero.is_multimedia(text)
            if should_have_modifier:
                conventional_publications += 1
                container = hero.publication_hero_match(text)
                self.assertIsNotNone(container, relative)
                self.assertIn(hero.PUBLICATION_HERO_CLASS, container.group(0), relative)
            else:
                self.assertNotIn(hero.PUBLICATION_HERO_CLASS, text, relative)
        self.assertEqual(conventional_publications, 67)


if __name__ == "__main__":
    unittest.main()
