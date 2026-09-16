# index.md format

The index is the deliverable people actually use. It answers three questions: *where do I start*,
*what exists*, and *where does concept X live*. That third one is what makes single ownership real
— a reader who can always resolve a concept to one file never needs a second explanation.

## Template

```markdown
# Wiring Knowledge — <Project name>

> Every concept from this repo, explained once, in dependency order.
> <N> notes across four tracks. Start at the reading path below.

---

## How to read this

- **Read in order the first time.** The numbering is a dependency order: nothing assumes
  something you have not met yet.
- **Each concept lives in exactly one note.** Everywhere else it is a link. Use the
  [concept lookup](#concept-lookup) to jump straight to the owner.
- **Every note is shaped the same way:** terms → master diagram → sub-diagrams with explanation →
  where it shows up in this repo → wiring.

---

## The reading path

```text
  01 INTERNALS                02 IMPLEMENTATIONS           03 PATTERNS
  how the machine works  ──►  what you call to build  ──►  how to shape a solution
         │                            │                           │
         └────────────────────────────┴───────────────► 04 STYLE PATTERNS
                                                        how it is laid out
```

<3–5 lines: the spine. Which handful of notes carry the most weight, and the order to take
them in for someone with limited time.>

---

## 01 · Internals

> <one line: what this track is for>

| # | Note | What it answers | Assumes |
|---|------|-----------------|---------|
| 01 | [Title](01-internals/01-....md) | one line | — |

## 02 · Implementations
... same table shape ...

## 03 · Patterns
... same table shape ...

## 04 · Style patterns
... same table shape ...

---

## Concept lookup

Alphabetical. Every concept in this knowledge base and the single note that owns it.

| Concept | Also called | Owner |
|---------|-------------|-------|
| Fabric | render pipeline, new renderer | [JSI and the render pipeline](01-internals/04-....md#fabric) |

---

## Source map

Which original file each track was distilled from, so the notes stay auditable.

| Source | Distilled into |
|--------|----------------|
| `README.md` §5 | [Context and state containers](02-implementations/06-....md) |
| `learning-docs/foundation/15/` | [Internals 02–05] |
```

## Rules

- **Tables, not prose lists.** The index is scanned, not read.
- **Every note appears exactly once** in its folder table. `verify.py` fails if a note exists on
  disk but is missing here.
- **The concept lookup is generated from the ledger**, not written by hand — that is what keeps it
  in sync and complete. Include aliases in the "also called" column so searching any name works.
- **The reading path diagram** follows the same ASCII rules as everywhere else (≤ 90 columns,
  `text` fence).
- **The source map** earns trust: it lets the user confirm nothing they wrote was dropped, and it
  makes the old scattered files safe to archive.
- Keep the whole index under roughly 200 lines. If the lookup table alone is enormous, split it to
  `concept-lookup.md` and link it — but keep the folder tables in the index itself.
