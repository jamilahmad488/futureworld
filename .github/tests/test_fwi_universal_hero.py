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
                errors.extend(hero.validate_text(path.relative_to(ROOT), text))
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


if __name__ == "__main__":
    unittest.main()
