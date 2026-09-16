#!/usr/bin/env python3
import json
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(root, ".wiring", "ledger.json"), encoding="utf-8") as f:
    ledger = json.load(f)

files = ledger["files"]
concepts = ledger.get("concepts", [])

lookup = {}
for c in concepts:
    title = c.get("title") or c["id"].replace("-", " ").title()
    aliases = ", ".join(c.get("aliases") or [])
    owner = c["owner"]
    anchor = c.get("anchor", "")
    link = f"[{title}]({owner}{anchor})"
    lookup[c["id"]] = (title, aliases, link)

for f in files:
    for cid in f.get("owns", []):
        if cid in lookup:
            continue
        title = cid.replace("-", " ").title()
        owner = f["path"]
        lookup[cid] = (title, "", f"[{title}]({owner})")

sorted_lookup = sorted(lookup.values(), key=lambda x: x[0].lower())

folders = {
    "01-internals": (
        "01 · Internals",
        "How the runtime, OS, and build work underneath your code.",
    ),
    "02-implementations": (
        "02 · Implementations",
        "Specific APIs and libraries you call to build features.",
    ),
    "03-patterns": (
        "03 · Patterns",
        "Reusable solution shapes that survive swapping the API underneath.",
    ),
    "04-style-patterns": (
        "04 · Style patterns",
        "Layout, spacing, and visual system — StyleSheet patterns.",
    ),
}


def fmt_prereqs(prereqs):
    if not prereqs:
        return "—"
    parts = [
        f"[{os.path.basename(p).replace('.md', '')}]({p})" for p in prereqs[:2]
    ]
    if len(prereqs) > 2:
        parts.append("…")
    return ", ".join(parts)


lines = [
    "# Wiring Knowledge — Foodie",
    "",
    "> Every concept from this repo, explained once, in dependency order.",
    "> 51 notes across four tracks. Start at the reading path below.",
    "",
    "---",
    "",
    "## How to read this",
    "",
    "- **Read in order the first time.** The numbering is a dependency order.",
    "- **Each concept lives in exactly one note.** Use [concept lookup](concept-lookup.md).",
    "- **Every note is shaped the same way:** terms → master diagram → sub-diagrams → repo → wiring.",
    "",
    "---",
    "",
    "## The reading path",
    "",
    "```text",
    "  01 INTERNALS                02 IMPLEMENTATIONS           03 PATTERNS",
    "  how the machine works  ──►  what you call to build  ──►  how to shape a solution",
    "         │                            │                           │",
    "         └────────────────────────────┴───────────────► 04 STYLE PATTERNS",
    "                                                        how it is laid out",
    "```",
    "",
    "**Spine (limited time):** "
    "[Three build loops](01-internals/05-three-build-loops.md) → "
    "[Fabric render pipeline](01-internals/11-fabric-render-pipeline.md) → "
    "[UI as function of state](03-patterns/01-ui-as-function-of-state.md) → "
    "[React Navigation wiring](02-implementations/04-react-navigation-wiring.md) → "
    "[Hydration gating](03-patterns/04-hydration-gating-pattern.md) → "
    "[Deep linking](02-implementations/13-deep-linking-linking-api.md).",
    "",
    "---",
    "",
]

for prefix, (heading, blurb) in folders.items():
    folder_files = [f for f in files if f["path"].startswith(prefix)]
    lines.extend([f"## {heading}", "", f"> {blurb}", ""])
    lines.append("| # | Note | What it answers | Assumes |")
    lines.append("|---|------|-----------------|---------|")
    for f in folder_files:
        num = f["path"].split("/")[1].split("-")[0]
        title = f["title"]
        path = f["path"]
        prereqs = fmt_prereqs(f.get("prereqs", []))
        lines.append(f"| {num} | [{title}]({path}) | {title} | {prereqs} |")
    lines.extend(["", "---", ""])

lines.extend(
    [
        "## Concept lookup",
        "",
        "Alphabetical index of every owned concept: [concept-lookup.md](concept-lookup.md).",
        "",
        "---",
        "",
        "## Source map",
        "",
        "| Source | Distilled into |",
        "|--------|----------------|",
    ]
)

source_map = [
    ("`README.md` §1–2", "02-implementations/01–02, 04-style-patterns/01–02"),
    ("`README.md` §3–13", "02-implementations/04, 07, 11–13; 03-patterns; 01-internals/12–14"),
    ("`navigation.md`", "02-implementations/04-react-navigation-wiring.md"),
    ("`learning-docs/foundation/1–6`", "01-internals/01–07"),
    ("`learning-docs/foundation/7–12`", "03-patterns/03, 08, 10–13; 02-implementations/14"),
    ("`learning-docs/foundation/14–16`", "01-internals/08–11, 15"),
    ("`src/**` implementations", "Cited in every note's repo table"),
]
for src, dest in source_map:
    lines.append(f"| {src} | {dest} |")

with open(os.path.join(root, "index.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

cl = [
    "# Concept lookup",
    "",
    "| Concept | Also called | Owner |",
    "|---------|-------------|-------|",
]
for title, aliases, link in sorted_lookup:
    cl.append(f"| {title} | {aliases or '—'} | {link} |")

with open(os.path.join(root, "concept-lookup.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(cl) + "\n")

print(f"index.md: {len(lines)} lines")
print(f"concept-lookup.md: {len(cl)} rows")
