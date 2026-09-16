#!/usr/bin/env python3
"""Crawl a learning repo into a structural inventory.

Finds the raw material a knowledge base has to cover: every Markdown heading (the prose
concepts), every source file with its exports (the implementations), and every external API
actually imported by the code (concepts the prose may never have named).

    python3 inventory.py <repo-root> [--out inventory.json] [--quiet]

Writes JSON and prints a human summary. Stdlib only.
"""

import argparse
import json
import os
import re
import sys
from collections import Counter

SKIP_DIRS = {
    ".git", "node_modules", "build", "dist", "vendor", "Pods", ".gradle",
    "__pycache__", ".next", "coverage", ".idea", ".venv", "venv",
    "wiring-knowledge",  # never inventory our own output
}

DOC_EXT = {".md", ".mdx", ".markdown"}
CODE_EXT = {".js", ".jsx", ".ts", ".tsx", ".kt", ".java", ".swift", ".m", ".mm", ".py"}
CONFIG_NAMES = {
    "package.json", "app.json", "metro.config.js", "babel.config.js",
    "gradle.properties", "AndroidManifest.xml", "Info.plist", "Podfile",
    "tsconfig.json", "jest.config.js",
}

HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
FENCE = re.compile(r"^\s*(```|~~~)")
IMPORT_FROM = re.compile(r"""^\s*import\s+(?:(.+?)\s+from\s+)?['"]([^'"]+)['"]""")
REQUIRE = re.compile(r"""require\(\s*['"]([^'"]+)['"]\s*\)""")
EXPORT_NAMED = re.compile(
    r"^\s*export\s+(?:default\s+)?(?:async\s+)?"
    r"(?:function|const|let|var|class)\s+([A-Za-z0-9_$]+)"
)
EXPORT_BRACE = re.compile(r"^\s*export\s*\{([^}]*)\}")
NAMED_IMPORTS = re.compile(r"\{([^}]*)\}")


def walk(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS and not d.startswith("."))
        for name in sorted(filenames):
            yield os.path.join(dirpath, name)


def read(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def scan_doc(path, rel):
    """Headings outside fenced code blocks, with line numbers and word counts."""
    text = read(path)
    lines = text.splitlines()
    headings, in_fence, fence_tok = [], False, None
    for i, line in enumerate(lines, 1):
        m_fence = FENCE.match(line)
        if m_fence:
            tok = m_fence.group(1)
            if not in_fence:
                in_fence, fence_tok = True, tok
            elif tok == fence_tok:
                in_fence, fence_tok = False, None
            continue
        if in_fence:
            continue
        m = HEADING.match(line)
        if m:
            headings.append({"level": len(m.group(1)), "text": m.group(2), "line": i})
    return {
        "path": rel,
        "lines": len(lines),
        "words": len(text.split()),
        "headings": headings,
    }


def scan_code(path, rel):
    text = read(path)
    lines = text.splitlines()
    exports, imports = [], []
    for line in lines:
        m = EXPORT_NAMED.match(line)
        if m:
            exports.append(m.group(1))
            continue
        m = EXPORT_BRACE.match(line)
        if m:
            exports += [
                part.strip().split(" as ")[0].strip()
                for part in m.group(1).split(",")
                if part.strip()
            ]
        m = IMPORT_FROM.match(line)
        if m:
            clause, module = m.group(1) or "", m.group(2)
            names = []
            brace = NAMED_IMPORTS.search(clause)
            if brace:
                names = [
                    p.strip().split(" as ")[0].strip()
                    for p in brace.group(1).split(",")
                    if p.strip()
                ]
            imports.append({"module": module, "names": names})
        for mod in REQUIRE.findall(line):
            imports.append({"module": mod, "names": []})
    return {
        "path": rel,
        "lines": len(lines),
        "exports": sorted(set(exports)),
        "imports": imports,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    ap.add_argument("--out", default=None)
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        sys.exit(f"not a directory: {root}")

    docs, code, configs, others = [], [], [], []
    for path in walk(root):
        rel = os.path.relpath(path, root)
        ext = os.path.splitext(path)[1].lower()
        base = os.path.basename(path)
        if ext in DOC_EXT:
            docs.append(scan_doc(path, rel))
        elif base in CONFIG_NAMES:
            configs.append(rel)
        elif ext in CODE_EXT:
            code.append(scan_code(path, rel))
        elif ext in {".excalidraw", ".drawio", ".puml"}:
            others.append(rel)

    # External APIs: modules imported from packages, not relative paths.
    api_names = Counter()
    api_modules = Counter()
    for f in code:
        for imp in f["imports"]:
            mod = imp["module"]
            if mod.startswith("."):
                continue
            api_modules[mod] += 1
            for n in imp["names"]:
                api_names[f"{mod}:{n}"] += 1

    inventory = {
        "root": root,
        "docs": docs,
        "code": code,
        "configs": sorted(configs),
        "diagram_files": sorted(others),
        "external_modules": api_modules.most_common(),
        "external_symbols": api_names.most_common(),
        "totals": {
            "doc_files": len(docs),
            "doc_lines": sum(d["lines"] for d in docs),
            "headings": sum(len(d["headings"]) for d in docs),
            "code_files": len(code),
            "code_lines": sum(c["lines"] for c in code),
        },
    }

    if args.out:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as fh:
            json.dump(inventory, fh, indent=2)

    if args.quiet:
        return

    t = inventory["totals"]
    print(f"root: {root}")
    print(
        f"docs: {t['doc_files']} files, {t['doc_lines']} lines, "
        f"{t['headings']} headings   |   code: {t['code_files']} files, {t['code_lines']} lines"
    )

    print("\n-- prose sources, largest first (read these) --")
    for d in sorted(docs, key=lambda d: -d["lines"])[:25]:
        tops = [h["text"] for h in d["headings"] if h["level"] <= 2][:6]
        print(f"  {d['lines']:>5}L  {d['path']}")
        if tops:
            print(f"         {' | '.join(tops)}")

    print("\n-- external modules used in code (candidate concepts) --")
    for mod, n in inventory["external_modules"][:30]:
        print(f"  {n:>3}x  {mod}")

    print("\n-- most-imported symbols --")
    for sym, n in inventory["external_symbols"][:30]:
        print(f"  {n:>3}x  {sym}")

    if inventory["configs"]:
        print("\n-- config (internals evidence) --")
        for c in inventory["configs"]:
            print(f"  {c}")
    if inventory["diagram_files"]:
        print("\n-- existing diagrams --")
        for c in inventory["diagram_files"]:
            print(f"  {c}")
    if args.out:
        print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
