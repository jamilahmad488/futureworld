#!/usr/bin/env python3
"""Apply and validate the FWI-HERO-1.1 heading and publication-spacing contract."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path


STYLE_LINK = (
    '<link rel="stylesheet" href="/assets/fwi-universal-hero.css?v=1.1" '
    'data-fwi-hero-style="1" />'
)
TITLE_CLASS = "fwi-universal-hero-title"
MEDIA_CLASS = "fwi-universal-hero-title--multimedia"
PUBLICATION_HERO_CLASS = "fwi-standard-hero--publication"
ROOT_TARGETS = ("index.html", "pages", "content", "courses", "copyright")


def html_files(repo: Path) -> list[Path]:
    files: set[Path] = set()
    for name in ROOT_TARGETS:
        target = repo / name
        if target.is_file():
            files.add(target)
        elif target.is_dir():
            files.update(target.rglob("*.html"))
    return sorted(files)


def strip_tags(value: str) -> str:
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", value)).split())


def h1_matches(text: str) -> list[re.Match[str]]:
    return list(re.finditer(r"<h1\b[^>]*>.*?</h1\s*>", text, flags=re.I | re.S))


def is_redirect_page(text: str) -> bool:
    matches = h1_matches(text)
    if not matches:
        return False
    opening_end = matches[0].group(0).find(">") + 1
    closing_start = matches[0].group(0).lower().rfind("</h1")
    title = strip_tags(matches[0].group(0)[opening_end:closing_start]).lower()
    return title.startswith("redirecting")


def is_multimedia(text: str) -> bool:
    body = re.search(r"<body\b([^>]*)>", text, flags=re.I | re.S)
    body_attrs = body.group(1).lower() if body else ""
    return any(
        marker in text or marker in body_attrs
        for marker in (
            "fwi-publication-multimedia",
            'class="video-frame"',
            'class="video"',
            'class="slide active"',
        )
    )


def active_page(text: str) -> bool:
    return bool(h1_matches(text)) and not is_redirect_page(text)


def add_title_class(tag: str, multimedia: bool) -> str:
    required = [TITLE_CLASS]
    if multimedia:
        required.append(MEDIA_CLASS)
    class_match = re.search(r"\bclass\s*=\s*([\"'])(.*?)\1", tag, flags=re.I | re.S)
    if class_match:
        classes = class_match.group(2).split()
        for value in required:
            if value not in classes:
                classes.append(value)
        replacement = f'class={class_match.group(1)}{" ".join(classes)}{class_match.group(1)}'
        return tag[: class_match.start()] + replacement + tag[class_match.end() :]
    return tag.replace("<h1", f'<h1 class="{" ".join(required)}"', 1)


def add_class(tag: str, value: str) -> str:
    """Add a class to one opening tag without disturbing its other attributes."""
    class_match = re.search(r"\bclass\s*=\s*([\"'])(.*?)\1", tag, flags=re.I | re.S)
    if class_match:
        classes = class_match.group(2).split()
        if value not in classes:
            classes.append(value)
        replacement = f'class={class_match.group(1)}{" ".join(classes)}{class_match.group(1)}'
        return tag[: class_match.start()] + replacement + tag[class_match.end() :]
    return tag[:-1].rstrip() + f' class="{value}">'


def publication_hero_match(text: str) -> re.Match[str] | None:
    """Return the nearest open section/header containing the first H1."""
    headings = h1_matches(text)
    if not headings:
        return None
    stack: list[re.Match[str]] = []
    tag_pattern = re.compile(r"<(/?)(section|header)\b[^>]*>", flags=re.I | re.S)
    for match in tag_pattern.finditer(text, 0, headings[0].start()):
        closing = match.group(1)
        tag_name = match.group(2).lower()
        if not closing:
            stack.append(match)
            continue
        for index in range(len(stack) - 1, -1, -1):
            if stack[index].group(2).lower() == tag_name:
                stack = stack[:index]
                break
    return stack[-1] if stack else None


def add_publication_hero_class(text: str) -> str:
    match = publication_hero_match(text)
    if not match:
        raise ValueError("H1 has no section/header hero container")
    opening = add_class(match.group(0), PUBLICATION_HERO_CLASS)
    return text[: match.start()] + opening + text[match.end() :]


def apply_text(text: str, publication: bool = False) -> str:
    multimedia = is_multimedia(text)
    text = re.sub(
        r"<link\b[^>]*(?:data-fwi-hero-style=[\"']1[\"']|"
        r"href=[\"']/assets/fwi-universal-hero\.css\?v=[^\"']+[\"'])[^>]*>\s*",
        "",
        text,
        flags=re.I | re.S,
    )
    head_ends = list(re.finditer(r"</head\s*>", text, flags=re.I))
    if not head_ends:
        raise ValueError("missing </head>")
    end = head_ends[-1]
    text = text[: end.start()].rstrip() + "\n" + STYLE_LINK + "\n" + text[end.start() :]

    def heading_replacement(match: re.Match[str]) -> str:
        whole = match.group(0)
        opening_end = whole.find(">") + 1
        opening = add_title_class(whole[:opening_end], multimedia)
        return opening + whole[opening_end:]

    text = re.sub(r"<h1\b[^>]*>.*?</h1\s*>", heading_replacement, text, flags=re.I | re.S)
    if publication and not multimedia:
        text = add_publication_hero_class(text)
    return text


def validate_text(path: Path, text: str, publication: bool = False) -> list[str]:
    errors: list[str] = []
    if text.count('data-fwi-hero-style="1"') != 1:
        errors.append(f"{path}: expected exactly one universal hero stylesheet link")
    media = is_multimedia(text)
    for match in h1_matches(text):
        opening = match.group(0).split(">", 1)[0]
        if TITLE_CLASS not in opening:
            errors.append(f"{path}: H1 missing {TITLE_CLASS}")
        if media and MEDIA_CLASS not in opening:
            errors.append(f"{path}: multimedia H1 missing {MEDIA_CLASS}")
    if publication and not media:
        hero = publication_hero_match(text)
        if not hero or PUBLICATION_HERO_CLASS not in hero.group(0):
            errors.append(f"{path}: publication hero missing {PUBLICATION_HERO_CLASS}")
    if (not publication or media) and PUBLICATION_HERO_CLASS in text:
        errors.append(f"{path}: publication spacing modifier is outside its intended scope")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    repo = args.repo.resolve()
    targets: list[Path] = []
    for path in html_files(repo):
        text = path.read_text(encoding="utf-8", errors="replace")
        if active_page(text):
            targets.append(path)

    if args.apply:
        changed = 0
        for path in targets:
            original = path.read_text(encoding="utf-8")
            publication = path.relative_to(repo).parts[0] == "content"
            updated = apply_text(original, publication=publication)
            if updated != original:
                path.write_text(updated, encoding="utf-8")
                changed += 1
        print(f"Applied FWI-HERO-1.1 to {changed}/{len(targets)} active HTML pages")

    if args.check or not args.apply:
        errors: list[str] = []
        heading_count = 0
        for path in targets:
            text = path.read_text(encoding="utf-8", errors="replace")
            heading_count += len(h1_matches(text))
            relative = path.relative_to(repo)
            errors.extend(validate_text(relative, text, publication=relative.parts[0] == "content"))
        if errors:
            print("\n".join(errors))
            return 1
        print(f"Validated FWI-HERO-1.1 on {len(targets)} pages and {heading_count} H1 headings")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
