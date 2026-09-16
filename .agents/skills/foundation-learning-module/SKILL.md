---
name: foundation-learning-module
description: >-
  Create or update React Native Foundation learning modules in learning-docs/foundation/N/.
  Formats raw notes into read.md (summary) and readme.md (deep dive), updates both track
  indexes (foundation/readme.md and learning-docs/readme.md), and keeps consistent
  architecture across modules. Use when adding a new foundation module, converting rough
  notes to learning docs, or updating the foundation track index.
---

# Foundation Learning Module

Turn raw React Native foundation notes into a paired **summary + deep dive** module and update the track indexes.

## When to Use

- User adds a new folder under `learning-docs/foundation/N/`
- User has rough notes and wants `read.md` + `readme.md` formatted
- User asks to update the track index (`foundation/readme.md` or `learning-docs/readme.md`)
- User wants foundation docs to match existing module architecture
- User asks to audit the index for missing modules (e.g. module exists on disk but not in readme)

## Folder Structure

All modules live in a **single unified track** under `foundation/`:

```
learning-docs/
├── readme.md                         ← main index (all modules 1–N)
├── public/                           ← shared images (e.g. 12.1.png)
└── foundation/
    ├── readme.md                     ← track index (table + module details)
    └── N/
        ├── read.md                   ← quick summary (badges, tables, diagrams)
        ├── readme.md                 ← deep dive (numbered sections, code, flows)
        └── *.excalidraw              ← optional diagrams
```

**There is no `foundation-2/` folder.** Modules 1–10 (platform fundamentals) and 11+ (app-building concepts) all use `foundation/N/` with continuous numbering.

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read raw notes in foundation/N/
- [ ] Step 2: Identify the module question (one sentence)
- [ ] Step 3: Write readme.md (deep dive first — source of truth)
- [ ] Step 4: Write read.md (summary linking to readme.md sections)
- [ ] Step 5: Update foundation/readme.md (track index)
- [ ] Step 6: Update learning-docs/readme.md (main index)
- [ ] Step 7: Verify links — remove any anchor with no matching section
```

### Step 1 — Gather content

Read both files in `foundation/N/` if they exist. Extract:

- The **question** (one line — what the learner was asked to understand)
- **Topics / flows** (pipeline diagrams, comparisons, APIs)
- **Short notes / glossary** (term → one-liner)
- **Interview Q&A** (if present)
- **Code snippets** worth keeping
- **App implementation** references (file paths in `src/` if the module maps to Foodie code)

### Step 2 — Write `readme.md` (deep dive)

Use this template structure:

```markdown
<div align="center">

# 📖 Module N — Deep Dive Notes
### React Native: [Topic Title]

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-[keywords]-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** [One-sentence question]
>
> [1–2 sentence context — why this matters]

---

<a id="section-slug"></a>

## 1 · [emoji] [Section Title]

[Content: diagrams, tables, code blocks]

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module N*

</div>
```

**Rules for readme.md:**

- Number sections: `## 1 ·`, `## 2 ·`, … with one emoji each
- Add an explicit HTML anchor **before each section**: `<a id="section-slug"></a>`
- Prefer ASCII diagrams and markdown tables over prose walls
- Include code only when it teaches (API usage, patterns)
- Remove duplicate content (merge repeated blocks)
- Expand thin sections if the question promises them (e.g. safe areas if question mentions notches)
- Footer always links back to `read.md`
- Footer label: `*React Native Foundation · Module N*` (not "Foundation 2")

### Step 3 — Write `read.md` (summary)

Use this template structure:

```markdown
<div align="center">

# 📋 Module N — Summary
### React Native Foundation: [Short Title]

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-[keywords]-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| ... | one-line mnemonic | [→ readme.md](readme.md#anchor) |

---

## ⚡ Short Notes  (or ## ❓ Quick Q&A if interview notes exist)

---

## 🗺️ [Topic] Architecture

[One ASCII diagram — the most important pipeline]

---

## 🧠 Things You Should Remember Forever

- [3–5 bullet mental models]

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module N*

</div>
```

**Rules for read.md:**

- Keep it scannable — tables and one diagram, not long prose
- Every `Read More` link must point to a **real section** in readme.md
- Link format: `readme.md#section-slug` — must match the `<a id="section-slug">` in readme.md
- If a section doesn't exist in readme.md, **don't link to it**
- Include Quick Q&A table when interview notes are available
- Shared images use `../../public/N.M.png` from `foundation/N/`

### Step 4 — Update the track indexes

Update **both** index files when adding or completing a module.

**1. Track index:** `learning-docs/foundation/readme.md`

Add to the completed-modules table:

```markdown
| N | [Question text] | [read.md](N/read.md) | [readme.md](N/readme.md) |
```

Add module details section (for modules with extra context — app files, diagrams, test flows):

```markdown
### Module N — [Short Title]

> **Question:** [Question text]

- 📋 [Summary → read.md](N/read.md)
- 📖 [Deep Dive → readme.md](N/readme.md)

**Implemented in app:** `src/...`   ← only when applicable
```

**2. Main index:** `learning-docs/readme.md`

Add the same row to the completed-questions table:

```markdown
| N | [Question text] | [read.md](foundation/N/read.md) | [readme.md](foundation/N/readme.md) |
```

Add a matching `### Module N` details block with paths under `foundation/N/`.

Keep the cross-link at the top of `learning-docs/readme.md`:

```markdown
> All modules live under **[foundation/](foundation/readme.md)**.
```

### Step 5 — Audit for missing modules

When updating indexes, scan `learning-docs/foundation/` for numbered folders that exist on disk but are **not listed** in either readme. Common gap: module folder exists with raw notes but was never added to the index (e.g. module 11).

```
For each folder in foundation/*/ :
  if folder number not in foundation/readme.md table → add it
  if folder number not in learning-docs/readme.md table → add it
```

## Architecture Consistency Checklist

Before finishing, verify against a recent module (e.g. 10–13):

- [ ] Both files have centered header + badge links to the sibling file
- [ ] Question appears in readme.md blockquote and both indexes
- [ ] readme.md has numbered `## N · emoji Title` sections
- [ ] read.md has `📌 Flows to Remember` table with valid anchors
- [ ] read.md has at least one architecture ASCII diagram
- [ ] read.md ends with "Ready to go deeper?" footer
- [ ] readme.md ends with "Back to Summary" footer
- [ ] Footer says `React Native Foundation · Module N` (not "Foundation 2")
- [ ] No broken `#anchor` links (section must exist)
- [ ] No duplicate paragraphs or repeated code blocks
- [ ] `foundation/readme.md` updated with new module row + details
- [ ] `learning-docs/readme.md` updated with new module row + details
- [ ] Module folder is under `foundation/N/` — not `foundation-2/`

## Anchor Reference

**Do not rely on auto-generated heading anchors** — they break in VS Code/Cursor because of emojis and the `·` character.

Always use explicit HTML IDs:

```markdown
<a id="pixelratio-api"></a>

## 4 · 🔢 PixelRatio API
```

Link from read.md as: `[→ readme.md](readme.md#pixelratio-api)`

Slug rules: lowercase, hyphens, no emoji. Examples:

| Section title | `<a id="...">` |
|---------------|----------------|
| `## 8 · 📱 Safe Areas, Notches & Insets` | `safe-areas-notches-insets` |
| `## 5 · 🖼️ @1x, @2x, @3x Images` | `retina-images` |
| `## 3 · 🤖 Android Activity Lifecycle → React Native AppState` | `android-activity-lifecycle-appstate` |

## Quality Bar

- **Beautiful** = consistent badges, emoji section markers, clean tables, one strong diagram per file
- **Minimal** = no filler prose; every paragraph teaches something
- **Honest links** = if content isn't written yet, don't link to it

## Example Triggers

User says: *"Format foundation/14 from my rough notes, update the index, same style as other modules"*

→ Read `foundation/14/*`, write readme.md then read.md, update both indexes, run consistency checklist.

User says: *"Module 11 is missing from the index"*

→ Read `foundation/11/*`, format if raw, add row to `foundation/readme.md` and `learning-docs/readme.md`.

User says: *"Complete foundation-2 module 13"*

→ Treat as `foundation/13/` — the old `foundation-2/` path is deprecated; use unified `foundation/` only.
