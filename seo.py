#!/usr/bin/env python3
"""
seo.py - declarative SEO layer for the static S.Sense Salon & Spa site.

The site is 76 hand-edited HTML files with no build step and no template
partials, so every <head> is a manual duplicate. This tool puts the metadata
under a single manifest and rewrites one sentinel-delimited block per page.

Subcommands
    adopt    One-time migration. Reads the SEO values already present in each
             page, writes them into seo.pages.json, then replaces the scattered
             tags in <head> with a generated block. Existing values are
             preserved verbatim; nothing is invented.
    sync     Re-render the managed block in every page from the manifest.
             Deterministic and idempotent.
    check    Read-only validation. Never writes.
    sitemap  Regenerate sitemap.xml from the manifest.

Invariants this script will not break:
    * 403.html, 404.html and 500.html are never touched.
    * No visible content is edited. Only <head> metadata, JSON-LD values the
      manifest owns, and sitemap.xml.
    * If any existing JSON-LD block fails to parse, nothing is written.
    * Existing valid JSON-LD is preserved. Only owned fields are normalised.

Usage
    python seo.py adopt [--dry-run]
    python seo.py sync  [--dry-run]
    python seo.py check
    python seo.py sitemap [--dry-run]
"""

import argparse
import datetime
import html
import io
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(BASE, "public_html")
CONFIG_PATH = os.path.join(BASE, "seo.config.json")
MANIFEST_PATH = os.path.join(BASE, "seo.pages.json")
BLOG_DATA = os.path.join(ROOT, "js", "blog-data.js")

BEGIN = "<!-- seo:begin -->"
END = "<!-- seo:end -->"
BC_BEGIN = "<!-- seo:breadcrumb:begin -->"
BC_END = "<!-- seo:breadcrumb:end -->"

MANAGED_NAMES = ("description", "robots", "keywords", "author")
BLOG_INDEX = "blog.html"


# --------------------------------------------------------------------------
# io helpers
# --------------------------------------------------------------------------

def read(path):
    with io.open(path, encoding="utf-8", newline="") as f:
        return f.read()


def write(path, text, dry=False):
    if not dry:
        with io.open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with io.open(path, encoding="utf-8") as f:
        return json.load(f)


def dump_json(path, obj):
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False, sort_keys=False)
        f.write("\n")


def site_files():
    """Every deployed HTML file, as forward-slash paths relative to public_html."""
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in (".vercel",)]
        for name in filenames:
            if name.endswith(".html"):
                full = os.path.join(dirpath, name)
                out.append(os.path.relpath(full, ROOT).replace("\\", "/"))
    return sorted(out)


def url_for(path):
    if path == "index.html":
        return "/"
    return "/" + path


# --------------------------------------------------------------------------
# HTML head surgery
# --------------------------------------------------------------------------

COMMENT_RE = re.compile(r"<!--.*?-->", re.S)


def strip_html_comments(text):
    """Blank out HTML comments, preserving offsets, so scanners see live markup only."""
    return COMMENT_RE.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), text)


def split_head(text):
    """Return (head_inner, full_prefix, suffix) or None when there is no head."""
    m = re.search(r"<head[^>]*>", text, re.I)
    if not m:
        return None
    end = text.find("</head>", m.end())
    if end < 0:
        return None
    return text[m.end():end], text[:m.end()], text[end:]


TAG_RE = re.compile(r"<[^>]*>", re.S)

# <title> has a text body, so it cannot be matched with the bare tag regex.
# Match title, self-closing tags and comments as single "elements".
ELEMENT_RE = re.compile(
    r"<title\b[^>]*>.*?</title\s*>"
    r"|<!--.*?-->"
    r"|<[a-zA-Z][^>]*/?>"
    r"|</[a-zA-Z][^>]*>",
    re.S,
)


def _iter_tags(chunk):
    """Yield (start, end, text) for every HTML element, treating <title> as one unit."""
    for m in ELEMENT_RE.finditer(chunk):
        yield m.start(), m.end(), m.group(0)


def attr(tag, name):
    m = re.search(r"\b%s\s*=\s*(\"([^\"]*)\"|'([^']*)'|([^\s\"'>]+))" % re.escape(name), tag, re.I)
    if not m:
        return None
    return m.group(2) or m.group(3) or m.group(4) or ""


def is_tag(tag, *, meta_name=None, prop=None, rel=None, link_rel=None):
    if not tag.lower().startswith("<meta") and not tag.lower().startswith("<link"):
        return False
    if meta_name is not None:
        v = attr(tag, "name")
        if v is None or v.strip().lower() != meta_name.lower():
            return False
    if prop is not None:
        v = attr(tag, "property")
        if v is None or v.strip().lower() != prop.lower():
            return False
    if link_rel is not None:
        v = attr(tag, "hreflang")
        if v is None:
            return False
    if rel is not None:
        v = attr(tag, "rel")
        if v is None or rel.lower() not in v.lower().split():
            return False
    return True


def tag_is_managed(tag):
    """True for any head tag that seo.py owns and will rewrite or drop."""
    low = tag.lower()
    if low.startswith("<title"):
        return True
    if low.startswith("<meta"):
        name = attr(tag, "name")
        prop = attr(tag, "property")
        if name and name.strip().lower() in MANAGED_NAMES:
            return True
        for key in (name, prop):
            if key and key.strip().lower().startswith(("og:", "twitter:")):
                return True
        return False
    if low.startswith("<link"):
        if attr(tag, "hreflang") is not None:
            return True
        rel = attr(tag, "rel")
        if rel and "canonical" in rel.lower().split():
            return True
        return False
    return False


def tw_attr(tag, suffix):
    """Twitter tags appear as both name="twitter:x" and property="twitter:x"."""
    key = "twitter:" + suffix
    return is_tag(tag, meta_name=key) or is_tag(tag, prop=key)


SEO_COMMENT_RE = re.compile(
    r"<!--[^>]*(?:SEO META TAGS|OPEN GRAPH TAGS|TWITTER CARD TAGS|"
    r"LOCAL BUSINESS STRUCTURED DATA|CHANGE #\d)[^>]*-->",
    re.I,
)


def extract_head_values(head):
    """Pull the SEO values already present, so adopt can preserve them."""
    found = {}
    og_images = []
    for _, _, tag in _iter_tags(head):
        if tag.lower().startswith("<title"):
            found.setdefault("title", html.unescape(TAG_RE.sub("", tag)).strip())
        elif is_tag(tag, meta_name="description"):
            found.setdefault("description", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, meta_name="robots"):
            found.setdefault("robots", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, meta_name="author"):
            found.setdefault("author", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, rel="canonical"):
            found.setdefault("canonical", html.unescape(attr(tag, "href") or ""))
        elif is_tag(tag, prop="og:title"):
            found.setdefault("og:title", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, prop="og:description"):
            found.setdefault("og:description", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, prop="og:type"):
            found.setdefault("og:type", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, prop="og:url"):
            found.setdefault("og:url", html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, prop="og:image"):
            og_images.append(html.unescape(attr(tag, "content") or ""))
        elif is_tag(tag, prop="og:image:width"):
            found.setdefault("og:image:width", attr(tag, "content"))
        elif is_tag(tag, prop="og:image:height"):
            found.setdefault("og:image:height", attr(tag, "content"))
        elif is_tag(tag, prop="og:image:alt"):
            found.setdefault("og:image:alt", html.unescape(attr(tag, "content") or ""))
        elif tw_attr(tag, "card"):
            found.setdefault("twitter:card", html.unescape(attr(tag, "content") or ""))
        elif tw_attr(tag, "title"):
            found.setdefault("twitter:title", html.unescape(attr(tag, "content") or ""))
        elif tw_attr(tag, "description"):
            found.setdefault("twitter:description", html.unescape(attr(tag, "content") or ""))
        elif tw_attr(tag, "image"):
            found.setdefault("twitter:image", html.unescape(attr(tag, "content") or ""))
        elif tw_attr(tag, "image:alt"):
            found.setdefault("twitter:image:alt", html.unescape(attr(tag, "content") or ""))
    found["og:image:all"] = og_images
    return found


BLOCK_RES = [
    re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S),
    re.compile(re.escape(BC_BEGIN) + r".*?" + re.escape(BC_END), re.S),
]

# A standalone <script type="application/ld+json"> block holding a
# BreadcrumbList. Only matched outside the generated sentinel.
LD_SCRIPT_RE = re.compile(
    r"[ \t]*<script[^>]*type=[\"']application/ld\+json[\"'][^>]*>.*?</script>[ \t]*\n?",
    re.S,
)
LD_BODY_RE = re.compile(
    r"<script[^>]*type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>", re.S
)


def drop_legacy_breadcrumbs(head):
    """Remove hand-written BreadcrumbList blocks the sentinel now supersedes.

    Returns (head, removed_count). Any other schema block is left untouched.
    """
    removed = 0

    def kill(m):
        nonlocal removed
        block = m.group(0)
        body = LD_BODY_RE.search(block)
        if not body:
            return block
        try:
            parsed = json.loads(body.group(1).strip())
        except ValueError:
            return block
        if find_nodes(parsed, "BreadcrumbList"):
            removed += 1
            return ""
        return block

    return LD_SCRIPT_RE.sub(kill, head), removed

# A stray </title> with no matching <title>, plus any orphaned body text
# immediately before it. The body may stand alone on its own line or sit inline
# after another tag in a minified head:
#   "\n    Real Page Title</title>"
#   '<meta name="viewport" ...>Real Page Title</title>'
TITLE_OPEN_RE = re.compile(r"<title\b[^>]*>", re.I)
STRAY_TITLE_CLOSE_RE = re.compile(r"</title\s*>", re.I)


def harvest_orphan_titles(head):
    """Return title bodies that have lost their <title> opening tag.

    An earlier build of this tool stripped <title> but not its body, so the
    text was left sitting in <head> followed by a dangling </title>. These are
    collected so the real title can be restored instead of being lost.
    """
    out = []
    for m in STRAY_TITLE_CLOSE_RE.finditer(head):
        # If a <title> opens earlier and does not close before this point, the
        # pairing is legitimate and there is no orphan.
        opens = len(TITLE_OPEN_RE.findall(head[:m.start()]))
        closes = len(STRAY_TITLE_CLOSE_RE.findall(head[:m.start()]))
        if opens > closes:
            continue
        # Walk back over the orphaned body text: to the previous ">" if the
        # body is inline, otherwise to the start of its line.
        end = m.start()
        if end and head[end - 1] == ">":
            gap = head.rfind(">", 0, end - 1) + 1
        else:
            gap = max(head.rfind("\n", 0, end) + 1, head.rfind(">", 0, end) + 1)
        body = head[gap:end].strip()
        if body:
            out.append(html.unescape(body))
    return out


def drop_orphan_titles(head):
    """Remove orphaned title bodies together with their dangling </title>."""
    removed = 0
    while True:
        hit = None
        for m in STRAY_TITLE_CLOSE_RE.finditer(head):
            opens = len(TITLE_OPEN_RE.findall(head[:m.start()]))
            closes = len(STRAY_TITLE_CLOSE_RE.findall(head[:m.start()]))
            if opens > closes:
                continue
            end = m.start()
            if end and head[end - 1] == ">":
                gap = head.rfind(">", 0, end - 1) + 1
            else:
                gap = max(head.rfind("\n", 0, end) + 1, head.rfind(">", 0, end) + 1)
            if head[gap:end].strip():
                hit = (gap, m.end())
                break
        if not hit:
            break
        head = head[:hit[0]] + head[hit[1]:]
        removed += 1
    return head, removed


def strip_managed(head, drop_legacy_bc=False):
    """Remove managed elements, then tidy the whitespace they leave behind.

    Returns (clean_head, recovered_title). The recovered title is only
    non-None when an orphaned </title> body had to be rescued, which happens
    when re-running over pages written by an older build of this tool.
    """
    recovered = None
    for pat in BLOCK_RES:
        head = pat.sub("\n", head)

    if drop_legacy_bc:
        head, _ = drop_legacy_breadcrumbs(head)

    rescued = harvest_orphan_titles(head)
    if rescued:
        recovered = rescued[0]
        head, _ = drop_orphan_titles(head)

    out = []
    idx = 0
    for start, end, tag in _iter_tags(head):
        if not tag_is_managed(tag):
            continue
        lead = head[idx:start]
        # Drop whitespace back to the start of this element's own line, so we
        # do not fuse "<head>" onto the following tag or leave ragged gaps.
        if "\n" in lead:
            tail = lead.rstrip()
            nl = tail.rfind("\n")
            lead = tail[:nl + 1] if tail[:nl + 1].strip() == "" else lead
        out.append(lead)
        idx = end
    out.append(head[idx:])
    head = "".join(out)

    head = SEO_COMMENT_RE.sub("", head)
    # Tidy whitespace, preserving CRLF: these files use \r\n, so the pattern has
    # to allow the \r before the newline.
    head = re.sub(r"[ \t]+\r?\n", "\r\n" if "\r\n" in head else "\n", head)
    head = re.sub(r"\r?\n(?:[ \t]*\r?\n)+", "\r\n" if "\r\n" in head else "\n", head)
    return head.strip(), recovered


# --------------------------------------------------------------------------
# rendering
# --------------------------------------------------------------------------

def esc(value):
    return html.escape(value or "", quote=True)


def meta_line(kind, key, value):
    return '<meta %s="%s" content="%s">' % (kind, key, esc(value))


def render_block(page, cfg):
    origin = cfg["origin"]
    og = page["og"]
    tw = page["twitter"]

    lines = [BEGIN, "<title>%s</title>" % esc(page["title"])]
    lines.append(meta_line("name", "description", page["description"]))
    lines.append(meta_line("name", "author", page["author"]))
    lines.append(meta_line("name", "robots", page["robots"]))
    lines.append('<link rel="canonical" href="%s">' % esc(page["canonical"]))

    lines.append(meta_line("property", "og:locale", cfg["locale"]))
    lines.append(meta_line("property", "og:type", og["type"]))
    lines.append(meta_line("property", "og:title", og["title"]))
    lines.append(meta_line("property", "og:description", og["description"]))
    lines.append(meta_line("property", "og:url", og["url"]))
    lines.append(meta_line("property", "og:site_name", cfg["site_name"]))
    lines.append(meta_line("property", "og:image", og["image"]))
    if og.get("image_width"):
        lines.append(meta_line("property", "og:image:width", og["image_width"]))
    if og.get("image_height"):
        lines.append(meta_line("property", "og:image:height", og["image_height"]))
    if og.get("image_alt"):
        lines.append(meta_line("property", "og:image:alt", og["image_alt"]))

    lines.append(meta_line("name", "twitter:card", tw["card"]))
    lines.append(meta_line("name", "twitter:title", tw["title"]))
    lines.append(meta_line("name", "twitter:description", tw["description"]))
    lines.append(meta_line("name", "twitter:image", tw["image"]))
    if tw.get("image_alt"):
        lines.append(meta_line("name", "twitter:image:alt", tw["image_alt"]))

    lines.append(END)
    return "\n".join(lines)


def render_breadcrumb(page):
    trail = page.get("breadcrumb")
    if not trail:
        return None
    payload = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": c["name"], "item": c["item"]}
            for i, c in enumerate(trail)
        ],
    }
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    return "\n".join([
        BC_BEGIN,
        '<script type="application/ld+json">',
        body,
        "</script>",
        BC_END,
    ])


def replace_block(text, block):
    """Insert or replace the managed block immediately before </head>."""
    parts = split_head(text)
    if not parts:
        return None
    head, prefix, suffix = parts

    if BEGIN in head and END in head:
        head = re.sub(
            re.escape(BEGIN) + r".*?" + re.escape(END),
            lambda _: block,
            head,
            flags=re.S,
        )
    else:
        head = head.rstrip() + "\n\n" + block + "\n\n"
    lead = "\n" if head.startswith(("<meta", "<link", "<title", "<!--")) else ""
    return prefix + lead + head.strip() + "\n\n" + suffix


def replace_breadcrumb(text, block):
    parts = split_head(text)
    if not parts:
        return None
    head, prefix, suffix = parts
    if BC_BEGIN in head and BC_END in head:
        if block is None:
            head = re.sub(
                re.escape(BC_BEGIN) + r".*?" + re.escape(BC_END) + r"\s*",
                "",
                head,
                flags=re.S,
            )
        else:
            head = re.sub(
                re.escape(BC_BEGIN) + r".*?" + re.escape(BC_END),
                lambda _: block,
                head,
                flags=re.S,
            )
    elif block is not None:
        head = head.rstrip() + "\n\n" + block + "\n\n"
    return prefix + head + suffix


# --------------------------------------------------------------------------
# JSON-LD
# --------------------------------------------------------------------------

LD_RE = re.compile(
    r"(<script[^>]*type=[\"']application/ld\+json[\"'][^>]*>)(.*?)(</script>)",
    re.S | re.I,
)


def top_level_node(parsed):
    """The page-describing entity: a bare dict, or an entry in @graph."""
    if isinstance(parsed, dict):
        graph = parsed.get("@graph")
        if isinstance(graph, list) and len(graph) == 1 and isinstance(graph[0], dict):
            return graph[0]
        return parsed
    if isinstance(parsed, list) and len(parsed) == 1 and isinstance(parsed[0], dict):
        return parsed[0]
    return None


def repair_identity(text, page, report, rule):
    """
    Repoint a top-level entity's @id/url at the page canonical, but only when
    the node is the type named in seo.config schema_identity and it currently
    holds the exact expected stale value. Nested nodes are never touched.
    """
    if not rule:
        return text, report
    want_type = rule.get("@type")
    stale = rule.get("from")
    good = rule.get("to") or page["canonical"]
    if not (want_type and stale):
        return text, report

    blocks = parse_jsonld(text)
    edits = []
    for start, end, raw, parsed in blocks:
        node = top_level_node(parsed)
        if not isinstance(node, dict):
            continue
        types = node.get("@type")
        types = types if isinstance(types, list) else [types]
        if want_type not in types:
            continue
        changed = False
        for field in ("@id", "url"):
            if node.get(field) == stale:
                node[field] = good
                changed = True
                report.append("  jsonld %s %s: %s -> %s (%s)"
                              % (want_type, field, stale, good, page["path"]))
        if changed:
            new_raw = "\n" + json.dumps(parsed, ensure_ascii=False, indent=2).replace("\n", "\n    ") + "\n    "
            if new_raw != raw:
                edits.append((start, end, new_raw))

    for start, end, new_raw in sorted(edits, reverse=True):
        text = text[:start] + new_raw + text[end:]
    return text, report


def valid_swaps(cfg):
    """Image replacements whose target actually exists on disk."""
    origin = cfg["origin"]
    out = {}
    for bad, good in (cfg.get("image_replacements") or {}).items():
        if not isinstance(good, str):
            continue
        if good.startswith(origin):
            rel = good[len(origin):].lstrip("/").replace("/", os.sep)
            if os.path.exists(os.path.join(ROOT, rel)):
                out[bad] = good
    return out


def iter_jsonld(text):
    return [(m.start(2), m.end(2), m.group(2)) for m in LD_RE.finditer(text)]


def parse_jsonld(text):
    """Return list of (start, end, raw, parsed). Raises on any malformed block."""
    out = []
    for start, end, raw in iter_jsonld(text):
        try:
            parsed = json.loads(raw.strip())
        except ValueError as exc:
            raise ValueError(str(exc))
        out.append((start, end, raw, parsed))
    return out


def collect_types(node, acc):
    if isinstance(node, dict):
        t = node.get("@type")
        if isinstance(t, str):
            acc.add(t)
        elif isinstance(t, list):
            acc.update(x for x in t if isinstance(x, str))
        for v in node.values():
            collect_types(v, acc)
    elif isinstance(node, list):
        for v in node:
            collect_types(v, acc)


IMAGE_KEYS = ("image", "logo", "contentUrl", "thumbnailUrl")


def collect_urls(node, acc=None):
    """Every image URL string in a JSON-LD tree. Only keys known to hold media."""
    if acc is None:
        acc = []
    for d in iter_dicts(node):
        for k in IMAGE_KEYS:
            v = d.get(k)
            if isinstance(v, str):
                acc.append(v)
            elif isinstance(v, list):
                acc.extend(x for x in v if isinstance(x, str))
    return acc


def collect_identity_urls(node, top_only=True):
    """@id / url on top-level entities, used to spot self-references that 404."""
    out = []
    candidates = node if isinstance(node, list) else [node]
    for item in candidates:
        if not isinstance(item, dict):
            continue
        for k in ("@id", "url"):
            v = item.get(k)
            if isinstance(v, str):
                out.append((k, v))
        if top_only:
            # also cover one level of @graph, which some pages use
            graph = item.get("@graph")
            if isinstance(graph, list):
                for sub in graph:
                    if isinstance(sub, dict):
                        for k in ("@id", "url"):
                            v = sub.get(k)
                            if isinstance(v, str):
                                out.append((k, v))
    return out


def iter_dicts(node):
    """Yield every dict in a JSON-LD tree."""
    if isinstance(node, dict):
        yield node
        for v in node.values():
            for d in iter_dicts(v):
                yield d
    elif isinstance(node, list):
        for v in node:
            for d in iter_dicts(v):
                yield d


def find_nodes(node, wanted):
    hits = []
    if isinstance(node, dict):
        t = node.get("@type")
        types = t if isinstance(t, list) else [t]
        if wanted in types:
            hits.append(node)
        for v in node.values():
            hits.extend(find_nodes(v, wanted))
    elif isinstance(node, list):
        for v in node:
            hits.extend(find_nodes(v, wanted))
    return hits





SWAP_FIELDS = ("image", "logo", "contentUrl", "thumbnailUrl", "url")


def compose_page(text, page, cfg):
    """Rebuild a page's <head> from scratch: strip everything managed, then
    emit the sentinel blocks. Used by both adopt and sync so they always
    converge on byte-identical output.
    """
    parts = split_head(text)
    if not parts:
        return text
    head, prefix, suffix = parts
    head, _ = strip_managed(head, drop_legacy_bc=True)

    lead = "\n" if head.strip().startswith(("<meta", "<link", "<title", "<!--")) else ""
    out = (prefix + lead + head.strip() + "\n\n"
           + render_block(page, cfg) + "\n\n")

    bc = render_breadcrumb(page)
    if bc:
        out += bc + "\n\n"
    return out + suffix


def repair_jsonld(text, page, report, swaps=None, cfg=None):
    """
    Only touch fields this tool owns:
      * BlogPosting.datePublished / dateModified, on blog posts.
      * priceRange, when explicitly flagged for repair.
      * image/logo/contentUrl values listed in seo.config image_replacements.
    Everything else is re-serialised only if it actually changed.
    """
    blocks = parse_jsonld(text)  # raises on malformed JSON, aborting the run
    edits = []

    for start, end, raw, parsed in blocks:
        obj = parsed
        changed = False

        dates = page.get("dates")
        if dates:
            for node in find_nodes(obj, "BlogPosting"):
                if node.get("datePublished") != dates["published"]:
                    node["datePublished"] = dates["published"]
                    changed = True
                    report.append("  datePublished %s -> %s" % (page["path"], dates["published"]))
                if node.get("dateModified") != dates["modified"]:
                    node["dateModified"] = dates["modified"]
                    changed = True

        good = page["business"]["priceRange"]
        for node in find_nodes(obj, "Offer") + find_nodes(obj, "Organization") + \
                find_nodes(obj, "BeautySalon") + find_nodes(obj, "LocalBusiness"):
            pr = node.get("priceRange")
            if pr is not None and pr != good and page.get("repair_price_range"):
                node["priceRange"] = good
                changed = True
                report.append("  priceRange %r -> %r (%s)" % (pr, good, page["path"]))

        # Repoint any image URL that no longer exists on disk. Walk the whole
        # tree rather than picking node types, so the repair cannot be evaded
        # by a schema block using an unexpected @type.
        if swaps:
            for node in iter_dicts(obj):
                for field in SWAP_FIELDS:
                    if field not in node:
                        continue
                    val = node[field]
                    if isinstance(val, list):
                        for i, item in enumerate(val):
                            if isinstance(item, str) and item in swaps:
                                val[i] = swaps[item]
                                changed = True
                                report.append("  jsonld %s: %s -> %s (%s)"
                                              % (field, item, swaps[item], page["path"]))
                    elif isinstance(val, str) and val in swaps:
                        node[field] = swaps[val]
                        changed = True
                        report.append("  jsonld %s: %s -> %s (%s)"
                                      % (field, val, swaps[val], page["path"]))

    if changed:
            indent = "\t" if "\n\t" in raw or raw.startswith("\n\t") else None
            new_raw = json.dumps(obj, ensure_ascii=False, indent=2)
            if indent == "\t":
                new_raw = "\n" + new_raw.replace("\n", "\n\t") + "\n\t"
            else:
                new_raw = "\n" + new_raw.replace("\n", "\n    ") + "\n    "
            if new_raw != raw:
                edits.append((start, end, new_raw))

    for start, end, new_raw in sorted(edits, reverse=True):
        text = text[:start] + new_raw + text[end:]

    # Identity repair runs last, on already-reserialised JSON-LD, so the byte
    # offsets above stay valid.
    ident = ((cfg.get("schema_identity") or {}).get(page["path"])
             if isinstance(cfg, dict) else None)
    text, report = repair_identity(text, page, report, ident)
    return text, report


MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
MONTH_RE = "|".join(MONTHS + [m[:3] for m in MONTHS])


def normalise_dates(raw_visible, blog_data_date):
    """Return ISO published/modified for a post, preferring the data file.

    Accepts both long ("August 3, 2023") and abbreviated ("Aug 03, 2023")
    month names, because blog-data.js and the page markup differ in style.
    """
    for text in (blog_data_date, raw_visible):
        if not text:
            continue
        m = re.search(
            r"\b(%s)\.?\s+(\d{1,2}),?\s+(\d{4})\b" % MONTH_RE,
            text,
            re.I,
        )
        if m:
            token = m.group(1).lower().rstrip(".")
            idx = next((i for i, name in enumerate(MONTHS)
                        if name.lower() == token or name[:3] == token), None)
            if idx is None:
                continue
            return "%s-%02d-%02d" % (m.group(3), idx + 1, int(m.group(2)))
    return None


def parse_blog_data():
    src = read(BLOG_DATA)
    out = {}
    for m in re.finditer(r"\{\s*slug:\s*\"([^\"]+)\"(.*?)\}", src, re.S):
        slug, blob = m.group(1), m.group(2)
        d = re.search(r"date:\s*\"([^\"]+)\"", blob)
        t = re.search(r"title:\s*\"([^\"]+)\"", blob)
        if d:
            out["blog/" + slug] = {"date": d.group(1), "title": t.group(1) if t else None}
    return out


# --------------------------------------------------------------------------
# breadcrumbs
# --------------------------------------------------------------------------

NAV_LABEL_OVERRIDES = {
    "blog.html": "Blog",
}


def breadcrumb_for(path, page_label, blog_label="Blog"):
    origin = cfg_origin_holder[0]
    home = {"name": "Home", "item": origin + "/"}
    trail = [home]

    if path == "index.html":
        return []
    if path.startswith("blog/"):
        trail.append({"name": blog_label, "item": origin + "/" + BLOG_INDEX})
    trail.append({"name": NAV_LABEL_OVERRIDES.get(path, page_label), "item": origin + "/" + path})
    return trail


FILENAME_RE = re.compile(r"^[a-z0-9][a-z0-9._/-]*\.html?$", re.I)


def first_usable_title(*candidates):
    """Return the first candidate that is a real title, not a bare filename."""
    for c in candidates:
        if not c:
            continue
        c = c.strip()
        if not c or FILENAME_RE.match(c):
            continue
        return c
    return None


def page_label(page):
    t = page["title"]
    for sep in ("|", "-", "–", "—"):
        if sep in t:
            head = t.split(sep)[0].strip()
            if len(head) >= 3:
                return html.unescape(head)
    return html.unescape(t.strip())


cfg_origin_holder = [""]


# --------------------------------------------------------------------------
# manifest building
# --------------------------------------------------------------------------

def build_manifest(cfg, existing=None):
    origin = cfg["origin"]
    cfg_origin_holder[0] = origin
    replacements = cfg.get("image_replacements", {})
    default_og = cfg["default_og"]
    noindex_pages = cfg.get("noindex", {})
    skip = set(cfg.get("exclude_from_managed_block", []))

    def fix_image(url):
        if not url:
            return url
        return replacements.get(url, url)

    blog_dates = parse_blog_data()

    pages = []
    for path in site_files():
        if path in skip:
            continue

        full = os.path.join(ROOT, path.replace("/", os.sep))
        text = read(full)
        parts = split_head(text)
        head = parts[0] if parts else ""
        got = extract_head_values(head)
        # Legacy hand-written breadcrumbs are dropped here so the manifest
        # build sees the page as it will be after this run.
        _, rescued_title = strip_managed(head, drop_legacy_bc=True)

        # On a re-run, the manifest wins: it is the reviewed source of truth.
        # On the first run it is empty, so values come from the live page.
        prev = (existing or {}).get(path, {})

        # Title precedence: manifest (reviewed) > live <title> > rescued orphan
        # body > og:title > derived label. A filename is never an acceptable
        # title, so anything path-shaped is skipped.
        title = first_usable_title(
            prev.get("title"),
            got.get("title"),
            rescued_title,
            got.get("og:title"),
        ) or page_label({"title": got.get("og:title") or path})
        description = prev.get("description") or got.get("description") or ""

        og_type = got.get("og:type", "website")
        if og_type not in ("website", "article", "product", "profile"):
            og_type = "website"
        if path.startswith("blog/"):
            og_type = "article"

        imgs = got.get("og:image:all") or []
        og_image = fix_image(prev.get("og", {}).get("image") or (imgs[0] if imgs else default_og["image"]))
        tw_image = fix_image(prev.get("twitter", {}).get("image") or got.get("twitter:image") or og_image)

        if og_image == default_og["image"]:
            og_w, og_h = default_og["width"], default_og["height"]
        else:
            og_w = prev.get("og", {}).get("image_width") or got.get("og:image:width")
            og_h = prev.get("og", {}).get("image_height") or got.get("og:image:height")

        og_title = prev.get("og", {}).get("title") or got.get("og:title") or title
        og_desc = prev.get("og", {}).get("description") or got.get("og:description") or description
        tw_title = prev.get("twitter", {}).get("title") or got.get("twitter:title") or og_title
        tw_desc = prev.get("twitter", {}).get("description") or got.get("twitter:description") or og_desc

        noindex = path in noindex_pages
        robots = cfg["robots"]["noindex"] if noindex else cfg["robots"]["index"]

        page = {
            "path": path,
            "title": html.unescape(title),
            "description": html.unescape(description),
            "author": cfg["site_name"],
            "robots": robots,
            "canonical": origin + url_for(path),
            "og": {
                "type": og_type,
                "title": html.unescape(og_title),
                "description": html.unescape(og_desc),
                "url": origin + url_for(path),
                "image": og_image,
                "image_width": og_w,
                "image_height": og_h,
                "image_alt": got.get("og:image:alt"),
            },
            "twitter": {
                "card": cfg["twitter_card"],
                "title": html.unescape(tw_title),
                "description": html.unescape(tw_desc),
                "image": tw_image,
                "image_alt": got.get("twitter:image:alt"),
            },
            "breadcrumb": [],
            "noindex": noindex,
            "business": cfg["business"],
        }

        # The homepage has no breadcrumb trail; every other page gets one.
        # Adopt always regenerates it so the manifest is the single source,
        # even where a hand-written BreadcrumbList already exists.
        page["breadcrumb"] = breadcrumb_for(path, page_label(page))

        if path.startswith("blog/"):
            visible = None
            mb = re.search(
                r"\b(%s)\.?\s+\d{1,2},?\s+\d{4}\b" % MONTH_RE,
                text[text.find("</head>"):],
                re.I,
            )
            if mb:
                visible = mb.group(0)
            bd = blog_dates.get(path)
            iso = normalise_dates(visible, bd["date"] if bd else None)
            if iso:
                page["dates"] = {"published": iso, "modified": iso}
                page["blog"] = {
                    "title": bd["title"] if bd else page_label(page),
                    "image": og_image,
                }

        page["repair_price_range"] = False
        pages.append(page)

    return {"version": 1, "pages": pages}


# --------------------------------------------------------------------------
# commands
# --------------------------------------------------------------------------

def cmd_adopt(cfg, args):
    skip = set(cfg.get("exclude_from_managed_block", []))
    swaps = valid_swaps(cfg)

    # Pre-flight: refuse to touch anything if any JSON-LD is malformed.
    broken = []
    for path in site_files():
        if path in skip:
            continue
        full = os.path.join(ROOT, path.replace("/", os.sep))
        try:
            parse_jsonld(read(full))
        except ValueError as exc:
            broken.append((path, str(exc)))
    if broken:
        print("ABORT: %d page(s) have unparseable JSON-LD. Nothing written." % len(broken))
        for path, exc in broken:
            print("  %s: %s" % (path, exc))
        return 1

    existing = load_json(MANIFEST_PATH, {})
    existing_pages = {p["path"]: p for p in existing.get("pages", [])} if existing else {}

    manifest = build_manifest(cfg, existing_pages)
    cfg_origin_holder[0] = cfg["origin"]

    changed = []
    for page in manifest["pages"]:
        path = page["path"]
        full = os.path.join(ROOT, path.replace("/", os.sep))
        text = read(full)
        original = text

        new_text = compose_page(text, page, cfg)

        report = []
        new_text, report = repair_jsonld(new_text, page, report, swaps, cfg)

        if new_text != original:
            write(full, new_text, dry=args.dry_run)
            changed.append(path)
            for line in report:
                print(line)

    dump_json(MANIFEST_PATH, manifest) if not args.dry_run else None

    print("adopt: %d page(s) rewritten, manifest has %d entries%s"
          % (len(changed), len(manifest["pages"]), " (dry run)" if args.dry_run else ""))
    print("skipped (frozen): %s" % ", ".join(sorted(skip)))
    return 0


def cmd_sync(cfg, args):
    manifest = load_json(MANIFEST_PATH)
    if not manifest:
        print("ABORT: seo.pages.json missing. Run: python seo.py adopt")
        return 1
    cfg_origin_holder[0] = cfg["origin"]
    swaps = valid_swaps(cfg)

    broken = []
    for page in manifest["pages"]:
        full = os.path.join(ROOT, page["path"].replace("/", os.sep))
        try:
            parse_jsonld(read(full))
        except ValueError as exc:
            broken.append((page["path"], str(exc)))
    if broken:
        print("ABORT: unparseable JSON-LD in %d page(s). Nothing written." % len(broken))
        for path, exc in broken:
            print("  %s: %s" % (path, exc))
        return 1

    changed = []
    for page in manifest["pages"]:
        full = os.path.join(ROOT, page["path"].replace("/", os.sep))
        text = read(full)

        new_text = compose_page(text, page, cfg)

        report = []
        new_text, report = repair_jsonld(new_text, page, report, swaps, cfg)

        if new_text != text:
            write(full, new_text, dry=args.dry_run)
            changed.append(page["path"])
            for line in report:
                print(line)

    print("sync: %d page(s) updated%s" % (len(changed), " (dry run)" if args.dry_run else ""))
    if changed and not args.dry_run:
        print("re-run to confirm idempotence; second run should report 0.")
    return 0


def cmd_check(cfg, args):
    problems = []
    warnings = []
    manifest = load_json(MANIFEST_PATH)
    if not manifest:
        problems.append("seo.pages.json missing. Run: python seo.py adopt")
        print("\n".join(problems))
        return 1

    cfg_origin_holder[0] = cfg["origin"]
    skip = set(cfg.get("exclude_from_managed_block", []))
    pages = manifest["pages"]
    by_path = {p["path"]: p for p in pages}

    titles = {}
    descs = {}
    for page in pages:
        path = page["path"]
        full = os.path.join(ROOT, path.replace("/", os.sep))
        text = read(full)

        types = set()
        try:
            for _, _, _, parsed in parse_jsonld(text):
                collect_types(parsed, types)
        except ValueError as exc:
            problems.append("%s: unparseable JSON-LD (%s)" % (path, exc))

        # managed block present and current
        block = render_block(page, cfg)
        if block not in text:
            problems.append("%s: managed block missing or stale (run sync)" % path)

        # stray managed tags outside the block
        parts = split_head(text)
        head = parts[0] if parts else ""
        outside = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), "", head, flags=re.S)
        outside = re.sub(re.escape(BC_BEGIN) + r".*?" + re.escape(BC_END), "", outside, flags=re.S)
        for _, _, stray in _iter_tags(outside):
            if tag_is_managed(stray):
                problems.append("%s: stray managed tag outside block: %s"
                                % (path, stray[:70]))
                break

        # Only live markup counts. Legacy "OLD:" notes inside HTML comments
        # are editorial history, not tags the crawler will read.
        live = strip_html_comments(text)
        live_head = strip_html_comments(head)

        # hreflang must be gone
        if re.search(r"hreflang\s*=", live, re.I):
            problems.append("%s: hreflang still present" % path)

        # meta keywords must be gone
        if re.search(r'<meta[^>]*name=["\']keywords["\']', live, re.I):
            problems.append("%s: meta keywords still present" % path)

        # Exactly one BreadcrumbList, and it must live inside the sentinel.
        # The sentinel is scanned on the raw head because it is itself a comment.
        n_sent = head.count("<!-- seo:breadcrumb:begin -->")
        if n_sent > 1:
            problems.append("%s: %d breadcrumb sentinels" % (path, n_sent))
        sentinel = re.compile(re.escape(BC_BEGIN) + r".*?" + re.escape(BC_END), re.S)
        sentinel_span = sentinel.search(head)
        n_bc = 0
        for bstart, _, _, parsed in parse_jsonld(live_head):
            if not find_nodes(parsed, "BreadcrumbList"):
                continue
            n_bc += 1
            if sentinel_span is None or not (sentinel_span.start() <= bstart <= sentinel_span.end()):
                problems.append("%s: BreadcrumbList outside the sentinel" % path)
        if path != "index.html" and n_bc != 1:
            problems.append("%s: %d BreadcrumbList blocks (want 1)" % (path, n_bc))

        # canonical correctness
        if page["canonical"] != cfg["origin"] + url_for(path):
            problems.append("%s: canonical %s != expected %s"
                            % (path, page["canonical"], cfg["origin"] + url_for(path)))

        # og:type validity
        if page["og"]["type"] not in ("website", "article", "product", "profile"):
            problems.append("%s: invalid og:type %r" % (path, page["og"]["type"]))

        # og:image must resolve on disk
        for label, url in (("og:image", page["og"]["image"]),
                           ("twitter:image", page["twitter"]["image"])):
            if url.startswith(cfg["origin"]):
                rel = url[len(cfg["origin"]):].lstrip("/")
                if not os.path.exists(os.path.join(ROOT, rel.replace("/", os.sep))):
                    problems.append("%s: %s points at missing file %s" % (path, label, rel))

        # every image URL in JSON-LD must resolve too
        for _, _, _, parsed in parse_jsonld(live_head):
            for url in collect_urls(parsed):
                if url.startswith(cfg["origin"]):
                    rel = url[len(cfg["origin"]):].lstrip("/")
                    if not os.path.exists(os.path.join(ROOT, rel.replace("/", os.sep))):
                        problems.append("%s: JSON-LD image missing %s" % (path, rel))

        # a node's own @id/url should resolve to a real page
        seen_ids = set()
        for _, _, _, parsed in parse_jsonld(live_head):
            for key, url in collect_identity_urls(parsed):
                if not url.startswith(cfg["origin"]):
                    continue
                rel = url[len(cfg["origin"]):].lstrip("/")
                # fragments like /#salon address a node on this page, not a file
                if rel.startswith("#") or rel == "":
                    continue
                if not os.path.exists(os.path.join(ROOT, rel.replace("/", os.sep))):
                    if (key, url) in seen_ids:
                        continue
                    seen_ids.add((key, url))
                    warnings.append("%s: JSON-LD %s points at a URL that does not exist (%s)"
                                    % (path, key, url))

        # exactly one og:image / twitter:image
        n_og = len(re.findall(r'<meta property="og:image"', live_head))
        n_tw = len(re.findall(r'<meta name="twitter:image"', live_head))
        if n_og != 1:
            problems.append("%s: %d og:image tags (want 1)" % (path, n_og))
        if n_tw != 1:
            problems.append("%s: %d twitter:image tags (want 1)" % (path, n_tw))

        # one h1
        n_h1 = len(re.findall(r"<h1\b", text, re.I))
        if n_h1 != 1:
            problems.append("%s: %d <h1> (want 1)" % (path, n_h1))

        # title/description hygiene
        if not page["title"].strip():
            problems.append("%s: empty title" % path)
        if not page["description"].strip():
            problems.append("%s: empty description" % path)
        n = len(page["description"])
        if not page["noindex"] and not (110 <= n <= 160):
            warnings.append("%s: description is %d chars (target 110-160)" % (path, n))
        titles.setdefault(page["title"], []).append(path)
        descs.setdefault(page["description"], []).append(path)

        # breadcrumb present where expected
        wants_bc = path != "index.html"
        has_bc = BC_BEGIN in text
        if wants_bc and not has_bc and "BreadcrumbList" not in types:
            warnings.append("%s: no BreadcrumbList" % path)
        if has_bc:
            try:
                node = None
                for _, _, _, parsed in parse_jsonld(text):
                    hits = find_nodes(parsed, "BreadcrumbList")
                    if hits:
                        node = hits[0]
                        break
                if node:
                    last = node["itemListElement"][-1]
                    if last.get("item") != page["canonical"]:
                        problems.append("%s: breadcrumb tail %s != canonical %s"
                                        % (path, last.get("item"), page["canonical"]))
            except (ValueError, KeyError, IndexError, TypeError) as exc:
                problems.append("%s: bad BreadcrumbList (%s)" % (path, exc))

        # blog date agreement
        if page.get("dates"):
            for _, _, _, parsed in parse_jsonld(text):
                for node in find_nodes(parsed, "BlogPosting"):
                    if node.get("datePublished") != page["dates"]["published"]:
                        problems.append("%s: datePublished %s != %s"
                                        % (path, node.get("datePublished"), page["dates"]["published"]))

    # duplicate titles / descriptions across indexable pages
    for t, paths in titles.items():
        if len(paths) > 1 and len({by_path[p]["canonical"] for p in paths}) > 1:
            problems.append("duplicate title across %s: %s" % (paths, t))
    for dsc, paths in descs.items():
        if len(paths) > 1 and len({by_path[p]["canonical"] for p in paths}) > 1:
            problems.append("duplicate description across %s" % paths)

    # frozen pages untouched
    for path in sorted(skip):
        full = os.path.join(ROOT, path)
        if not os.path.exists(full):
            problems.append("%s: frozen page missing" % path)
            continue
        text = read(full)
        if BEGIN in text or END in text:
            problems.append("%s: frozen page contains managed block" % path)

    # sitemap parity
    sm_path = os.path.join(ROOT, cfg["sitemap"]["path"])
    if os.path.exists(sm_path):
        sm = read(sm_path)
        locs = re.findall(r"<loc>([^<]+)</loc>", sm)
        expected = {p["canonical"] for p in pages if not p["noindex"]}
        got = set(locs)
        for missing in sorted(expected - got):
            problems.append("sitemap missing %s" % missing)
        for extra in sorted(got - expected):
            problems.append("sitemap has unexpected %s" % extra)

    print("=== %d page(s) in manifest ===" % len(pages))
    print("problems:  %d" % len(problems))
    for p in problems:
        print("  ERROR   %s" % p)
    print("warnings:  %d" % len(warnings))
    for w in warnings:
        print("  WARN    %s" % w)
    return 1 if problems else 0


def cmd_sitemap(cfg, args):
    manifest = load_json(MANIFEST_PATH)
    if not manifest:
        print("ABORT: seo.pages.json missing. Run: python seo.py adopt")
        return 1

    def sort_key(page):
        p = page["path"]
        if p == "index.html":
            return (0, "")
        if p == BLOG_INDEX:
            return (1, "")
        if p.startswith("blog/"):
            return (2, p)
        return (3, p)

    entries = []
    for page in sorted([p for p in manifest["pages"] if not p["noindex"]], key=sort_key):
        priority = "1.0" if page["path"] == "index.html" else cfg["sitemap"]["default_priority"]
        changefreq = "daily" if page["path"] == "index.html" else cfg["sitemap"]["default_changefreq"]
        lastmod = page.get("lastmod") or datetime.date.today().isoformat()
        blocks = ["  <url>", "    <loc>%s</loc>" % page["canonical"],
                  "    <lastmod>%s</lastmod>" % lastmod,
                  "    <changefreq>%s</changefreq>" % changefreq,
                  "    <priority>%s</priority>" % priority]
        if page["og"].get("image"):
            blocks += [
                "    <image:image>",
                "      <image:loc>%s</image:loc>" % page["og"]["image"],
                "    </image:image>",
            ]
        blocks.append("  </url>")
        entries.append("\n".join(blocks))

    xml = "\n".join([
        '<?xml version="1.0" encoding="UTF-8"?>',
        "<!-- Generated by seo.py. Do not edit by hand. -->",
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        "",
        "\n\n".join(entries),
        "</urlset>",
        "",
    ])

    out = os.path.join(ROOT, cfg["sitemap"]["path"])
    write(out, xml, dry=args.dry_run)
    print("sitemap: %d url(s) -> %s%s"
          % (len(entries), cfg["sitemap"]["path"], " (dry run)" if args.dry_run else ""))
    return 0


def main():
    ap = argparse.ArgumentParser(description="Declarative SEO layer for ssensesalon.com")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("adopt", "sync", "sitemap"):
        p = sub.add_parser(name)
        p.add_argument("--dry-run", action="store_true")
    sub.add_parser("check")
    args = ap.parse_args()

    cfg = load_json(CONFIG_PATH)
    if not cfg:
        print("ABORT: seo.config.json missing")
        return 1
    cfg_origin_holder[0] = cfg["origin"]

    handlers = {"adopt": cmd_adopt, "sync": cmd_sync, "check": cmd_check, "sitemap": cmd_sitemap}
    return handlers[args.cmd](cfg, args) or 0


if __name__ == "__main__":
    sys.exit(main())