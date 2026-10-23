#!/usr/bin/env python3
"""Assemble the johnmaibwe.com home pages, French and English (Applications John Maibwe).

    python3 tools/nouveau/build.py                       # build both pages + bundles
    python3 tools/nouveau/build.py --sample /tmp/ajm-ds  # also write the design-system sample
                                                         # (never inside public/), see DESIGN.md

Inputs (all under tools/nouveau/, see DESIGN.md § 14 « Production & languages »):
    page.fr.html, page.en.html   page shells (<head>, header, footer) with one
                                 <!-- @section ID --> marker per section
    sections/ID.html             French section fragments
    sections/en/ID.html          English section fragments (same structure, translated text)
    css/base.css + css/ID.css    design system + one file per section (page order)
    js/core.js + js/i18n.js      micro-framework + the strings written by JavaScript (FR/EN)
    js/ID.js                     one file per section (page order)

Outputs (never edit them by hand, they are overwritten):
    public/index.html            French home page   https://johnmaibwe.com/
    public/en/index.html         English home page  https://johnmaibwe.com/en/
    public/assets/nouveau/nouveau.css, nouveau.js   shared by both pages (?v=<content hash>)

Pure Python 3 standard library. Idempotent: same inputs -> byte-identical outputs.
Fails loudly (exit code 1) on a missing/duplicated marker, a missing fragment, an inline
<script> (JSON-LD excepted, and it must parse), an on* event attribute, a javascript: URL, an
external image/script, a duplicated id, an in-page link pointing nowhere, a missing legacy
anchor of the previous home page, a prototype leftover (noindex, « prototype », /nouveau/ links),
a wrong lang/canonical, or a French and an English page that drifted apart (different ids or
in-page links). Prints the page weight of each page against the 700 KB budget and the number of
TODO-EN markers left in the English sources.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
PUBLIC = REPO / "public"

# Page order. Never reorder or rename without updating DESIGN.md.
SECTIONS = ["hero", "pile", "services", "apps", "donnees", "chiffres", "methode", "ponts", "contact"]


@dataclass(frozen=True)
class Locale:
    code: str          # dictionary key in js/i18n.js
    lang: str          # <html lang>
    url: str           # canonical URL
    shell: Path
    sections: Path
    out: Path


LOCALES = (
    Locale("fr", "fr-CA", "https://johnmaibwe.com/", HERE / "page.fr.html", HERE / "sections", PUBLIC / "index.html"),
    Locale("en", "en-CA", "https://johnmaibwe.com/en/", HERE / "page.en.html", HERE / "sections" / "en", PUBLIC / "en" / "index.html"),
)

OUT_CSS = PUBLIC / "assets" / "nouveau" / "nouveau.css"
OUT_JS = PUBLIC / "assets" / "nouveau" / "nouveau.js"
JS_HEAD = ["core.js", "i18n.js"]   # before the section files, in this order

# Ids of the previous home page (until October 2026), still used by links in the wild
# (/#produits, /en/#faq…). Each must exist on both new pages.
LEGACY_IDS = ("accueil", "solutions", "apropos", "services", "approche", "pour-qui",
              "produits", "vedette", "pourquoi", "realisations", "faq", "contact")
# Those that land at the top of a section get a zero-size <span class="anchor-alias" id="…">
# injected right after the section's opening tag (styled in base.css § 14). The others are
# ids carried by the fragments themselves: faq (methode FAQ), pour-qui and pourquoi (ponts).
ANCHOR_ALIASES = {
    "hero": ("accueil",),
    "services": ("solutions",),
    "apps": ("produits", "vedette", "realisations"),
    "methode": ("approche",),
    "ponts": ("apropos",),
}

BUDGET_BYTES = 700 * 1024  # excluding Google Fonts

MARKER_RE = re.compile(r"<!--\s*@section\s+([a-z0-9_-]+)\s*-->")
TODO_EN_LINE_RE = re.compile(r"^[ \t]*<!--(?:(?!-->).)*?TODO-EN(?:(?!-->).)*?-->[ \t]*\n", re.S | re.M)
TODO_EN_RE = re.compile(r"<!--(?:(?!-->).)*?TODO-EN(?:(?!-->).)*?-->", re.S)


class BuildError(Exception):
    pass


def read(path: Path) -> str:
    if not path.is_file():
        raise BuildError(f"missing file: {path.relative_to(REPO)}")
    return path.read_text(encoding="utf-8")


def rel(path: Path) -> str:
    return str(path.relative_to(REPO))


def short_hash(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()[:10]


def strip_comments(html: str) -> str:
    return re.sub(r"<!--.*?-->", "", html, flags=re.S)


def check_fragment(name: str, html: str, shell: bool = False) -> list[str]:
    """Return a list of CSP / safety violations found in an HTML shell or fragment."""
    errors = []
    code = strip_comments(html)
    for m in re.finditer(r"<script\b([^>]*)>(.*?)</script>", code, flags=re.I | re.S):
        attrs, body = m.group(1), m.group(2)
        tag = f"<script{attrs}>"
        if re.search(r"""\btype\s*=\s*["']application/ld\+json["']""", attrs, flags=re.I):
            if not shell:
                errors.append(f"{name}: JSON-LD belongs in the page shell's <head>")
            try:
                json.loads(body)
            except json.JSONDecodeError as exc:
                errors.append(f"{name}: invalid JSON-LD ({exc})")
        elif "src=" not in attrs.lower():
            errors.append(f"{name}: inline <script> is forbidden by the CSP: {tag}")
        elif not shell:
            errors.append(f"{name}: <script> tags belong in the page shell only (use js/<id>.js): {tag}")
    for m in re.finditer(r"<[a-zA-Z][^>]*?\s(on[a-z]+)\s*=", code):
        errors.append(f"{name}: event-handler attribute '{m.group(1)}=' is forbidden by the CSP")
    if re.search(r"""(href|src|action)\s*=\s*["']\s*javascript:""", code, flags=re.I):
        errors.append(f"{name}: javascript: URLs are forbidden")
    for m in re.finditer(r"""<(img|source|script|iframe|video|audio)\b[^>]*?\s(src|srcset)\s*=\s*["']\s*(https?:)?//""", code, flags=re.I):
        errors.append(f"{name}: external {m.group(1)} source is forbidden (self-host it): {m.group(0)[:90]}")
    if re.search(r"<iframe\b", code, flags=re.I):
        errors.append(f"{name}: <iframe> is not allowed")
    return errors


def build_bundles() -> tuple[str, str]:
    css_parts = [
        "/* GENERATED by tools/nouveau/build.py — edit tools/nouveau/css/*.css, not this file. */\n",
        "/* ===== base.css ===== */\n" + read(HERE / "css" / "base.css").strip() + "\n",
    ]
    for sid in SECTIONS:
        css_parts.append(f"\n/* ===== {sid}.css ===== */\n" + read(HERE / "css" / f"{sid}.css").strip() + "\n")
    css = "".join(css_parts)

    js_parts = ["/* GENERATED by tools/nouveau/build.py — edit tools/nouveau/js/*.js, not this file. */\n"]
    for name in JS_HEAD:
        body = read(HERE / "js" / name).strip()
        if name == "core.js":            # core.js is its own IIFE
            js_parts.append(f"/* ===== {name} ===== */\n{body}\n")
        else:
            js_parts.append(f"\n/* ===== {name} ===== */\n;(function () {{\n'use strict';\n{body}\n}}());\n")
    for sid in SECTIONS:
        body = read(HERE / "js" / f"{sid}.js").strip()
        # Each section file gets its own scope so builders cannot collide on globals.
        js_parts.append(f"\n/* ===== {sid}.js ===== */\n;(function () {{\n'use strict';\n{body}\n}}());\n")
    return css, "".join(js_parts)


def inject_aliases(sid: str, frag: str) -> str:
    aliases = ANCHOR_ALIASES.get(sid, ())
    if not aliases:
        return frag
    spans = "".join(f'\n  <span class="anchor-alias" id="{a}"></span>' for a in aliases)
    note = "\n  <!-- old deep links of the previous home page (build.py ANCHOR_ALIASES) -->"
    pattern = re.compile(rf"""(<section\b[^>]*\bid\s*=\s*["']{re.escape(sid)}["'][^>]*>)""")
    return pattern.sub(lambda m: m.group(1) + note + spans, frag, count=1)


def assemble(loc: Locale, css: str, js: str) -> tuple[str, list[str]]:
    shell_name = rel(loc.shell)
    page = read(loc.shell)

    # 1. markers: each section exactly once, in the declared order, nothing unknown.
    found = MARKER_RE.findall(page)
    unknown = [m for m in found if m not in SECTIONS]
    if unknown:
        raise BuildError(f"{shell_name} has unknown section marker(s): {unknown}")
    for sid in SECTIONS:
        n = found.count(sid)
        if n != 1:
            raise BuildError(f"{shell_name} must contain the marker <!-- @section {sid} --> exactly once (found {n})")
    if found != SECTIONS:
        raise BuildError(f"{shell_name} markers are out of order: {found} (expected {SECTIONS})")

    errors = check_fragment(shell_name, page, shell=True)

    # 2. fragments
    blocks = {}
    for sid in SECTIONS:
        path = loc.sections / f"{sid}.html"
        name = rel(path)
        frag = read(path).strip("\n")
        errors += check_fragment(name, frag)
        if not re.search(rf"""<section\b[^>]*\bid\s*=\s*["']{re.escape(sid)}["']""", frag):
            errors.append(f"{name}: must contain <section id=\"{sid}\" ...>")
        if not re.search(r"""\bdata-theme\s*=\s*["'](dark|ink|navy|cream|gold)["']""", frag):
            errors.append(f"{name}: the <section> needs data-theme=\"dark|ink|navy|cream|gold\"")
        blocks[sid] = f"<!-- ===== section: {sid} (tools/nouveau/{loc.sections.relative_to(HERE)}/{sid}.html) ===== -->\n" \
                      + inject_aliases(sid, frag)

    # 3. assemble the page
    html = MARKER_RE.sub(lambda m: blocks[m.group(1)], page)
    html = html.replace("{{CSS_VERSION}}", short_hash(css)).replace("{{JS_VERSION}}", short_hash(js))
    if "{{" in html:
        raise BuildError(f"{shell_name} still contains an unreplaced {{{{placeholder}}}}")
    if not html.lstrip().lower().startswith("<!doctype html>"):
        raise BuildError(f"{shell_name} must start with <!doctype html>")
    html = html.replace(
        "<!doctype html>",
        "<!doctype html>\n<!-- GENERATED by tools/nouveau/build.py — edit tools/nouveau/*, not this file. -->",
        1,
    )
    # Translator markers stay in the sources only.
    html = TODO_EN_RE.sub("", TODO_EN_LINE_RE.sub("", html))
    code = strip_comments(html)

    # 4. duplicate ids, in-page anchors, legacy anchors
    ids = re.findall(r"""\sid\s*=\s*["']([^"']+)["']""", code)
    seen, dups = set(), set()
    for i in ids:
        (dups if i in seen else seen).add(i)
    if dups:
        errors.append(f"{rel(loc.out)}: duplicate id attribute(s): {sorted(dups)}")
    for target in sorted(set(re.findall(r"""href\s*=\s*["']#([^"']+)["']""", code))):
        if target not in seen:
            errors.append(f"{rel(loc.out)}: anchor href=\"#{target}\" points to no element id")
    missing = [i for i in LEGACY_IDS if i not in seen]
    if missing:
        errors.append(f"{rel(loc.out)}: old deep link id(s) missing: {missing} (see LEGACY_IDS)")

    # 5. production guards: language, canonical, no prototype leftovers
    m = re.search(r"<html\b[^>]*\blang\s*=\s*[\"']([^\"']+)[\"']", code, flags=re.I)
    if not m or m.group(1) != loc.lang:
        errors.append(f"{shell_name}: <html lang> must be \"{loc.lang}\" (found {m.group(1) if m else 'none'})")
    if f'<link rel="canonical" href="{loc.url}">' not in code:
        errors.append(f"{shell_name}: missing <link rel=\"canonical\" href=\"{loc.url}\">")
    for hl in ("fr-CA", "en-CA", "x-default"):
        if not re.search(rf"""<link rel="alternate" hreflang="{hl}" href="https://johnmaibwe\.com/""", code):
            errors.append(f"{shell_name}: missing <link rel=\"alternate\" hreflang=\"{hl}\" …>")
    if re.search(r"noindex", code, flags=re.I):
        errors.append(f"{rel(loc.out)}: « noindex » found — the home page must be indexable")
    if re.search(r"prototype", code, flags=re.I):
        errors.append(f"{rel(loc.out)}: the word « prototype » is still on the page")
    if re.search(r"""(href|src|action)\s*=\s*["'](https://johnmaibwe\.com)?/nouveau\b""", code):
        errors.append(f"{rel(loc.out)}: link to /nouveau/ (no longer published)")

    return html, errors


def anchor_signature(html: str) -> tuple[set[str], set[str]]:
    code = strip_comments(html)
    ids = set(re.findall(r"""\sid\s*=\s*["']([^"']+)["']""", code))
    anchors = set(re.findall(r"""href\s*=\s*["']#([^"']+)["']""", code))
    return ids, anchors


def write_if_changed(path: Path, data: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists() or path.read_text(encoding="utf-8") != data:
        path.write_text(data, encoding="utf-8")


def build() -> str:
    css, js = build_bundles()

    pages: dict[str, str] = {}
    errors: list[str] = []
    for loc in LOCALES:
        html, errs = assemble(loc, css, js)
        pages[loc.code] = html
        errors += errs

    # 6. the French and English pages must keep the same structure
    base = LOCALES[0]
    base_ids, base_anchors = anchor_signature(pages[base.code])
    for loc in LOCALES[1:]:
        ids, anchors = anchor_signature(pages[loc.code])
        for label, a, b in (("ids", base_ids, ids), ("in-page links", base_anchors, anchors)):
            if a != b:
                errors.append(f"{rel(loc.out)} and {rel(base.out)} differ in {label}: "
                              f"only {base.code}: {sorted(a - b)}; only {loc.code}: {sorted(b - a)}")

    if errors:
        raise BuildError("\n  - " + "\n  - ".join(errors))

    # 7. write (only when content changed, so mtimes stay stable)
    write_if_changed(OUT_CSS, css)
    write_if_changed(OUT_JS, js)
    for loc in LOCALES:
        write_if_changed(loc.out, pages[loc.code])

    for loc in LOCALES:
        report(loc, pages[loc.code], css)
    report_todo_en()
    stale = PUBLIC / "nouveau"
    if stale.exists():
        print(f"WARNING: {rel(stale)}/ still exists — the prototype is no longer published, delete it.",
              file=sys.stderr)
    return css


def write_sample(out_dir: Path, css: str) -> None:
    """Design-system sample (tools/nouveau/composants.html), for development only.
    Written to OUT_DIR/composants.html next to an `assets` symlink to public/assets, so
    `python3 -m http.server -d OUT_DIR` serves it. Never inside public/."""
    out_dir = out_dir.resolve()
    if out_dir == PUBLIC or PUBLIC in out_dir.parents:
        raise BuildError("--sample: the sample page must not be written inside public/")
    sample = read(HERE / "composants.html").replace("{{CSS_VERSION}}", short_hash(css))
    errors = check_fragment("composants.html", sample, shell=True)
    if errors:
        raise BuildError("\n  - " + "\n  - ".join(errors))
    out_dir.mkdir(parents=True, exist_ok=True)
    link = out_dir / "assets"
    if not link.exists():
        os.symlink(PUBLIC / "assets", link)
    write_if_changed(out_dir / "composants.html", sample)
    print(f"sample: {out_dir / 'composants.html'}  (serve with: python3 -m http.server -d {out_dir})")


def local_path(url: str) -> Path | None:
    url = url.split("#", 1)[0].split("?", 1)[0].strip()
    if not url.startswith("/") or url.startswith("//"):
        return None
    p = PUBLIC / url.lstrip("/")
    return p if p.is_file() else None


def report(loc: Locale, html: str, css: str) -> None:
    code = strip_comments(html)
    urls = set()
    for m in re.finditer(r"""\s(?:src|href)\s*=\s*["']([^"']+)["']""", code):
        urls.add(m.group(1))
    for m in re.finditer(r"""srcset\s*=\s*["']([^"']+)["']""", code):
        for part in m.group(1).split(","):
            if part.strip():
                urls.add(part.strip().split()[0])
    for m in re.finditer(r"""url\(\s*["']?([^"')]+)["']?\s*\)""", css):
        urls.add(m.group(1))

    files = {}
    for u in urls:
        p = local_path(u)
        if p is not None and p.suffix.lower() != ".html" and p.name != "favicon.ico" and "apple-touch-icon" not in p.name:
            files[p] = p.stat().st_size

    html_size = len(html.encode("utf-8"))
    total = html_size + sum(files.values())
    print(f"built {rel(loc.out)}  [{loc.lang}]  ({html_size/1024:.1f} KB)")
    rows = sorted(files.items(), key=lambda kv: -kv[1])
    for p, size in rows:
        print(f"  {size/1024:7.1f} KB  {p.relative_to(PUBLIC)}")
    status = "OK" if total <= BUDGET_BYTES else "OVER BUDGET"
    print(f"page weight (HTML + every local file it references, excl. Google Fonts): "
          f"{total/1024:.1f} KB / {BUDGET_BYTES/1024:.0f} KB  [{status}]")
    if total > BUDGET_BYTES:
        print("WARNING: over the 700 KB budget — compress or drop images.", file=sys.stderr)


def report_todo_en() -> None:
    sources = [HERE / "page.en.html", HERE / "js" / "i18n.js"] + sorted((HERE / "sections" / "en").glob("*.html"))
    counts = [(p, read(p).count("TODO-EN")) for p in sources if p.is_file()]
    left = [(p, n) for p, n in counts if n]
    if not left:
        print("English: no TODO-EN marker left.")
        return
    total = sum(n for _, n in left)
    print(f"English: {total} TODO-EN marker(s) left in {len(left)} file(s): "
          + ", ".join(f"{p.relative_to(HERE)} ({n})" for p, n in left))


def main(argv: list[str]) -> None:
    sample_dir = None
    if argv[:1] == ["--sample"] and len(argv) == 2:
        sample_dir = Path(argv[1])
    elif argv:
        raise BuildError("usage: build.py [--sample OUT_DIR]")
    css = build()
    if sample_dir is not None:
        write_sample(sample_dir, css)


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except BuildError as exc:
        print(f"BUILD FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
