---
name: wiring-knowledge
description: >-
  Turn a scattered learning repo (README notes, learning-docs, module folders,
  source code) into a single wired knowledge base at wiring-knowledge/ — four
  graded folders (internals, implementations, patterns, style patterns) plus
  an index.md, where every note follows a fixed format of topic → terminology
  → master ASCII diagram → sub-diagrams with explanations, every concept is
  explained in exactly one place and cross-linked everywhere else, and nothing
  from the source material is dropped. Use this whenever someone says their
  notes are scattered/cluttered/unstructured, asks to "wire up", consolidate,
  restructure, connect or systematize what they've learned, asks for a
  structured learning path or second-brain out of a repo, mentions a
  wiring-knowledge folder, or wants ASCII-diagram study notes generated from
  their own code and docs — even if they only say "organize my learning repo"
  without naming this skill.
---

# Wiring Knowledge

Scattered notes fail for one reason: they are a **list**, not a **graph**. The same idea gets
re-explained in five places at five depths, related ideas never touch, and there is no single
place that answers "where does this concept live?"

This skill rebuilds a learning repo as a graph. Each concept gets exactly one home. Every other
mention becomes a link. The reader can walk the material once, in order, and never meet the same
explanation twice.

## The contract

Four rules decide whether the output is correct. Everything below serves them.

1. **Single ownership.** Every concept is explained in exactly one file. Everywhere else it is a
   one-line mention plus a link. Re-teaching a concept is the one defect that makes the whole
   output worthless — it recreates the clutter the user is escaping.
2. **Total coverage.** Every concept present in the source material appears in the ledger and is
   owned by some file. Nothing is silently dropped because it was inconvenient to place.
3. **Wired.** Each note names what it assumes (prerequisites), what builds on it (next), and links
   to the real code in the repo that demonstrates it. A note with no outbound links is a red flag.
4. **Fixed shape.** Every note follows the format in `references/note-format.md`: topic →
   terminology → master ASCII diagram covering the whole concept → sub-diagrams, each followed by
   its explanation and code.

## Output layout

Created at the repo root unless the user says otherwise:

```text
wiring-knowledge/
├── index.md              ← the map: reading order, per-folder tables, concept → file lookup
├── 01-internals/         ← how the machine works underneath your code
├── 02-implementations/   ← how you actually build a feature with the framework's APIs
├── 03-patterns/          ← reusable solution shapes, independent of any single API
├── 04-style-patterns/    ← layout and visual system (StyleSheet / "CSS" patterns)
└── .wiring/ledger.json   ← build metadata: concept → owner file. Not user-facing.
```

Numbered prefixes are deliberate — they encode the reading order, so the folder listing itself
teaches. Inside each folder, files are numbered the same way (`01-…md`, `02-…md`) in dependency
order: a file may only assume concepts owned by lower-numbered files or by earlier folders.

## Workflow

Work through these phases in order. Phases 1 and 2 are where the quality is decided — do not start
writing notes before the ledger is complete, or you will discover collisions halfway through and
end up with duplicates.

### Phase 1 — Inventory the source material

Run the crawler to get a fast structural map:

```bash
python3 scripts/inventory.py <repo-root> --out <repo-root>/wiring-knowledge/.wiring/inventory.json
```

It reports every Markdown heading (with file and line), every source file with its exports, and
every framework/library API actually imported in the code. That is your candidate concept list.

Then **read the source material yourself** — the crawler finds headings, not ideas. Prioritize:

- the root `README.md` and any other root-level topic docs (e.g. `navigation.md`)
- the docs tree (`learning-docs/**`, `docs/**`) — both summary and deep-dive files per module
- `src/**` — the implementations are a source of truth that the prose often lags behind
- native/build config (`android/gradle.properties`, `metro.config.js`, `app.json`, manifests) —
  these carry internals evidence such as which architecture flags are enabled
- diagram files (`*.excalidraw`) — the filenames alone reveal flows worth a note

If the corpus is large (roughly >3000 lines of prose), read it in batches by folder and append to
the ledger after each batch rather than holding it all in context at once.

### Phase 2 — Build the ledger: route, dedupe, assign one owner

Read `references/routing.md`. It gives the four-step routing ladder that decides which folder a
concept belongs to, the tiebreakers for concepts that seem to fit two folders, and the ledger
schema.

The output of this phase is `wiring-knowledge/.wiring/ledger.json` containing, for every concept:
its id, aliases (so later phases can detect the same idea under a different name), the single file
that owns it, the anchor within that file, where it came from in the source, and what it depends
on.

Collapse aggressively here. "useEffect cleanup", "clearing a timer on unmount" and "cancel the
subscription in the return function" are one concept with three names, not three concepts. Every
alias you record now is a duplicate you will not write later.

### Phase 3 — Show the plan

Present the file list — folder by folder, one line each — and the reading order. Ask whether the
split looks right before writing. This is cheap to change now and expensive later, since the
numbering encodes dependency order.

Keep it to the list plus a sentence or two. Do not paste the ledger JSON at the user.

### Phase 4 — Write the notes, one file at a time

Read `references/note-format.md` for the required structure and `references/ascii-diagrams.md` for
the diagram vocabulary. `references/example-note.md` is a complete worked note — match its shape.

For each file, in numbered order:

1. Look up in the ledger every concept this note touches.
2. For concepts this file **owns** → explain them fully, with diagrams and code.
3. For concepts owned **elsewhere** → one sentence of context, then a link. The sentence names the
   idea and its role here; the link carries the explanation:

   > Rendering happens on the shadow thread, not the JS thread → see
   > [Fabric and the render pipeline](../01-internals/04-fabric-render-pipeline.md#three-threads).

   Never restate the mechanism after the link. If the note genuinely cannot be understood without
   re-explaining, the routing is wrong — move ownership instead of duplicating.
4. Pull code from the repo rather than inventing it, and cite the path (`src/hooks/useDebounce.js`).
   Trim to the lines that carry the idea; the reader can open the file for the rest.
5. Mark the file and its concepts `"status": "written"` in the ledger before moving on. This
   checkpoint is what lets the work survive being interrupted and resumed.

Aim for 150–400 lines per note. Much shorter means the concept probably belongs inside a
neighbouring note; much longer means it is two concepts wearing one title.

### Phase 5 — Write index.md

Read `references/index-format.md`. The index carries the reading path, a table per folder, and an
alphabetical concept → file lookup built from the ledger. That lookup table is what operationally
enforces single ownership: any concept the reader searches for resolves to exactly one destination.

### Phase 6 — Verify

```bash
python3 scripts/verify.py <repo-root>/wiring-knowledge --inventory <repo-root>/wiring-knowledge/.wiring/inventory.json
```

It checks broken relative links, files missing from the index, missing required sections, missing
master diagrams, over-wide diagram blocks, concepts in the ledger with no owner file, and headings
repeated across files (the duplication smell).

Fix every finding and re-run until clean. A warning about a repeated heading is sometimes a false
positive (two notes can both have a "Common mistakes" section) — check it, then either fix it or
say why it is fine.

### Phase 7 — Report

Tell the user: how many notes per folder, the suggested reading order, which concepts were merged
(and under what name), and anything from the source you deliberately left out with the reason.
Keep it short — the index is the real deliverable.

## Judgement calls

**The source contradicts itself.** Notes written early in a learning journey often disagree with
notes written later, or with the code. Trust the code first, the most recent doc second. Note the
correction in the file rather than silently picking a side — "the earlier notes describe the bridge;
the project actually runs the new architecture, so…" is itself a valuable piece of wiring.

**A concept is half-learned.** If the source mentions something without ever explaining it, still
give it a home, explain it properly, and mark it in the report as a gap that was filled rather than
summarized. Do not invent claims about the user's own code that the code does not support.

**The repo isn't the expected shape.** The four folders are a good default for app-framework
learning repos. If the material is, say, a backend repo, keep the four-fold spirit — mechanism,
API usage, reusable shapes, presentation-layer conventions — and rename the fourth folder to
whatever plays that role. Say what you renamed and why.

**Re-running on an updated repo.** If `.wiring/ledger.json` already exists, load it, diff the new
inventory against it, and only write notes for new or changed concepts. Do not regenerate files
whose concepts are unchanged — the user may have edited them.

## Reference files

- `references/routing.md` — the four-folder routing ladder, tiebreakers, ledger schema
- `references/note-format.md` — required note structure, section by section
- `references/ascii-diagrams.md` — diagram types, box-drawing vocabulary, width rules
- `references/index-format.md` — index.md template
- `references/example-note.md` — a complete note to match
- `scripts/inventory.py` — crawl a repo into a structural inventory
- `scripts/verify.py` — check links, coverage, format, duplication
