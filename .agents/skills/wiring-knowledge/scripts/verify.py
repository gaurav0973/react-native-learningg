#!/usr/bin/env python3
"""Check a generated wiring-knowledge folder against the contract.

    python3 verify.py <path-to-wiring-knowledge> [--inventory inventory.json]

Checks, in order of how badly each one breaks the deliverable:

  ERROR   broken relative link (file or anchor does not exist)
  ERROR   note on disk but absent from index.md
  ERROR   note missing a required section (terminology / master diagram / wiring)
  ERROR   note with no master diagram before its first sub-section
  ERROR   ledger concept whose owner file does not exist
  WARN    diagram line wider than the 90-column limit
  WARN    same H2 heading text in several notes (duplication smell)
  WARN    note with no outbound links (unwired)
  WARN    code fence not tagged with a language
  WARN    source doc from the inventory that no note cites

Exit code 1 if any ERROR. Stdlib only.
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict

MAX_DIAGRAM_WIDTH = 90
FOLDER_PREFIXES = ("01-", "02-", "03-", "04-")

LINK = re.compile(r"\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
FENCE = re.compile(r"^\s*(```|~~~)\s*([A-Za-z0-9_+-]*)")
EXPLICIT_ANCHOR = re.compile(r"""<a\s+(?:id|name)\s*=\s*['"]([^'"]+)['"]""", re.I)


def slug(text):
    """GitHub-style anchor slug."""
    s = text.strip().lower()
    s = re.sub(r"[`*_~]", "", s)
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    return s.strip("-")


def parse(path):
    """Split a note into headings, fenced blocks, links and body lines."""
    with open(path, encoding="utf-8", errors="replace") as fh:
        lines = fh.read().splitlines()

    headings, blocks, links, explicit = [], [], [], []
    in_fence, tok, lang, buf, start = False, None, "", [], 0

    for i, line in enumerate(lines, 1):
        m = FENCE.match(line)
        if m:
            if not in_fence:
                in_fence, tok, lang, buf, start = True, m.group(1), m.group(2), [], i
            elif m.group(1) == tok:
                blocks.append({"lang": lang, "lines": buf, "start": start, "end": i})
                in_fence, tok, lang, buf = False, None, "", []
            continue
        if in_fence:
            buf.append(line)
            continue
        h = HEADING.match(line)
        if h:
            headings.append({"level": len(h.group(1)), "text": h.group(2), "line": i})
        explicit += EXPLICIT_ANCHOR.findall(line)
        for text, href in LINK.findall(line):
            links.append({"text": text, "href": href, "line": i})

    return {
        "lines": lines,
        "headings": headings,
        "blocks": blocks,
        "links": links,
        "explicit_anchors": explicit,
    }


def notes_in(base):
    out = []
    for folder in sorted(os.listdir(base)):
        full = os.path.join(base, folder)
        if not os.path.isdir(full) or not folder.startswith(FOLDER_PREFIXES):
            continue
        for name in sorted(os.listdir(full)):
            if name.endswith(".md"):
                out.append(os.path.join(folder, name))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("--inventory", default=None)
    args = ap.parse_args()

    base = os.path.abspath(args.base)
    errors, warns = [], []

    def err(where, msg):
        errors.append(f"{where}: {msg}")

    def warn(where, msg):
        warns.append(f"{where}: {msg}")

    index_path = os.path.join(base, "index.md")
    if not os.path.isfile(index_path):
        err("index.md", "missing")
        print("\n".join(errors))
        sys.exit(1)

    notes = notes_in(base)
    if not notes:
        err(base, "no notes found in 01-/02-/03-/04- folders")

    parsed = {rel: parse(os.path.join(base, rel)) for rel in notes}
    parsed["index.md"] = parse(index_path)

    # anchor sets per file, for link checking
    anchors = {
        rel: {slug(h["text"]) for h in doc["headings"]} | set(doc["explicit_anchors"])
        for rel, doc in parsed.items()
    }

    # --- links resolve -----------------------------------------------------
    for rel, doc in parsed.items():
        here = os.path.dirname(os.path.join(base, rel))
        for link in doc["links"]:
            href = link["href"]
            if href.startswith(("http://", "https://", "mailto:")):
                continue
            target, _, frag = href.partition("#")
            where = f"{rel}:{link['line']}"
            if not target:  # same-file anchor
                if frag and frag not in anchors[rel]:
                    err(where, f"anchor #{frag} not found in this file")
                continue
            resolved = os.path.normpath(os.path.join(here, target))
            if not os.path.exists(resolved):
                err(where, f"link target does not exist: {href}")
                continue
            trel = os.path.relpath(resolved, base)
            if frag and trel in anchors and frag not in anchors[trel]:
                err(where, f"anchor #{frag} not found in {trel}")

    # --- index covers every note -------------------------------------------
    indexed = set()
    for link in parsed["index.md"]["links"]:
        target = link["href"].split("#")[0]
        if not target or target.startswith(("http", "mailto:")):
            continue
        indexed.add(os.path.normpath(target))
    for rel in notes:
        if os.path.normpath(rel) not in indexed:
            err("index.md", f"note not linked from the index: {rel}")

    # --- required structure -------------------------------------------------
    for rel in notes:
        doc = parsed[rel]
        h1 = [h for h in doc["headings"] if h["level"] == 1]
        h2 = [h for h in doc["headings"] if h["level"] == 2]
        if not h1:
            err(rel, "no H1 title")
        if len(h2) < 3:
            err(rel, f"only {len(h2)} H2 sections; the format needs terms, master diagram, "
                     "sub-sections and wiring")

        joined = " ".join(h["text"].lower() for h in h2)
        for needle, label in (("term", "terminology section"),
                              ("master", "master diagram section"),
                              ("wiring", "wiring section")):
            if needle not in joined:
                err(rel, f"missing a {label}")

        diagrams = [b for b in doc["blocks"] if b["lang"] in ("text", "ascii", "")]
        if not diagrams:
            err(rel, "no ASCII diagram at all")
        else:
            third_h2 = h2[2]["line"] if len(h2) > 2 else 10**9
            if not any(d["start"] < third_h2 for d in diagrams):
                err(rel, "master diagram must appear before the first sub-section")

        for b in doc["blocks"]:
            if not b["lang"]:
                warn(f"{rel}:{b['start']}", "code fence has no language tag (use ```text "
                                            "for diagrams)")
            for n, line in enumerate(b["lines"], b["start"] + 1):
                if len(line) > MAX_DIAGRAM_WIDTH and b["lang"] in ("text", "ascii", ""):
                    warn(f"{rel}:{n}", f"diagram line is {len(line)} cols (limit "
                                       f"{MAX_DIAGRAM_WIDTH})")

        outbound = [
            l for l in doc["links"]
            if not l["href"].startswith(("http", "mailto:", "#"))
        ]
        if not outbound:
            warn(rel, "no outbound links — note is unwired")

    # --- duplication smell --------------------------------------------------
    by_heading = defaultdict(list)
    generic = {"terms and terminology", "the master diagram", "wiring",
               "where this shows up in the repo", "common mistakes"}
    for rel in notes:
        for h in parsed[rel]["headings"]:
            if h["level"] != 2:
                continue
            key = re.sub(r"^\s*\d+\s*[·.\-]\s*", "", h["text"]).strip().lower()
            if key in generic:
                continue
            by_heading[key].append(rel)
    for key, files in sorted(by_heading.items()):
        if len(files) > 1:
            warn("duplication", f'"{key}" appears as a section in: {", ".join(files)}')

    # --- ledger -------------------------------------------------------------
    ledger_path = os.path.join(base, ".wiring", "ledger.json")
    if os.path.isfile(ledger_path):
        with open(ledger_path, encoding="utf-8") as fh:
            try:
                ledger = json.load(fh)
            except json.JSONDecodeError as e:
                ledger = None
                err(".wiring/ledger.json", f"invalid JSON: {e}")
        if ledger:
            for c in ledger.get("concepts", []):
                owner = c.get("owner")
                cid = c.get("id", "?")
                if not owner:
                    err("ledger", f"concept '{cid}' has no owner")
                elif not os.path.exists(os.path.join(base, owner)):
                    err("ledger", f"concept '{cid}' owned by missing file {owner}")
                elif c.get("anchor"):
                    frag = c["anchor"].lstrip("#")
                    orel = os.path.normpath(owner)
                    if orel in anchors and frag not in anchors[orel]:
                        warn("ledger", f"concept '{cid}' anchor #{frag} not in {owner}")
            owners = defaultdict(list)
            for c in ledger.get("concepts", []):
                owners[c.get("id")].append(c.get("owner"))
            for cid, owns in owners.items():
                if len(owns) > 1:
                    err("ledger", f"concept '{cid}' claims {len(owns)} owners")
    else:
        warn(".wiring/ledger.json", "missing — single-ownership cannot be verified")

    # --- coverage against the inventory -------------------------------------
    if args.inventory and os.path.isfile(args.inventory):
        with open(args.inventory, encoding="utf-8") as fh:
            inv = json.load(fh)
        cited = " ".join(
            " ".join(l["href"] for l in doc["links"]) + " " + "\n".join(doc["lines"])
            for doc in parsed.values()
        )
        for d in inv.get("docs", []):
            p = d["path"]
            if p.startswith("wiring-knowledge") or d["lines"] < 40:
                continue
            if os.path.basename(p) not in cited and p not in cited:
                warn("coverage", f"source doc never cited by any note: {p} ({d['lines']}L)")

    # --- report -------------------------------------------------------------
    for e in errors:
        print(f"ERROR  {e}")
    for w in warns:
        print(f"WARN   {w}")
    print(f"\n{len(notes)} notes checked · {len(errors)} errors · {len(warns)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
