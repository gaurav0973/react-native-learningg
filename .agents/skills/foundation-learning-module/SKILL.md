---
name: foundation-learning-module
description: >-
  Create or update React Native Foundation learning modules in learning-docs/foundation-2/
  (or learning-docs/foundation/ for the first track). Formats raw notes into read.md
  (summary) and readme.md (deep dive), updates the track index, and keeps consistent
  architecture across modules. Use when adding a new foundation module, converting rough
  notes to learning docs, or updating learning-docs/foundation-2/readme.md.
---

# Foundation Learning Module

Turn raw React Native foundation notes into a paired **summary + deep dive** module and update the track index.

## When to Use

- User adds a new folder under `learning-docs/foundation-2/N/` (current track)
- User adds a folder under `learning-docs/foundation/N/` (first track — modules 1–10)
- User has rough notes and wants `read.md` + `readme.md` formatted
- User asks to update the track index (`foundation-2/readme.md` or `learning-docs/readme.md`)
- User wants foundation docs to match existing module architecture

## Folder Structure

**Current track (Foundation 2 — app-building concepts):**

```
learning-docs/
├── readme.md                         ← index of Foundation track 1 (modules 1–10)
└── foundation-2/
    ├── readme.md                     ← index of Foundation 2 modules
    └── N/
        ├── read.md                   ← quick summary (badges, tables, diagrams)
        ├── readme.md                 ← deep dive (numbered sections, code, flows)
        └── *.excalidraw              ← optional diagrams
```

**First track (Foundation 1 — platform fundamentals):**

```
learning-docs/
└── foundation/
    └── N/
        ├── read.md
        └── readme.md
```

**Default:** use `foundation-2/` unless the user explicitly refers to `foundation/` (track 1).

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read raw notes in foundation/N/
- [ ] Step 2: Identify the module question (one sentence)
- [ ] Step 3: Write readme.md (deep dive first — source of truth)
- [ ] Step 4: Write read.md (summary linking to readme.md sections)
- [ ] Step 5: Update track index (foundation-2/readme.md or learning-docs/readme.md)
- [ ] Step 6: Verify links — remove any anchor with no matching section
```

### Step 1 — Gather content

Read both files in `foundation/N/` if they exist. Extract:

- The **question** (one line — what the learner was asked to understand)
- **Topics / flows** (pipeline diagrams, comparisons, APIs)
- **Short notes / glossary** (term → one-liner)
- **Interview Q&A** (if present)
- **Code snippets** worth keeping

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

### Step 4 — Update the track index

**Foundation 2 (default):** update `learning-docs/foundation-2/readme.md`:

```markdown
| N | [Question text] | [read.md](N/read.md) | [readme.md](N/readme.md) |

### Module N — [Short Title]

> **Question:** [Question text]

- 📋 [Summary → read.md](N/read.md)
- 📖 [Deep Dive → readme.md](N/readme.md)
```

**Foundation 1:** update `learning-docs/readme.md` with paths under `foundation/N/`.

Also add a cross-link in `learning-docs/readme.md` to `foundation-2/readme.md` when Foundation 2 exists.

## Architecture Consistency Checklist

Before finishing, verify against modules 1–5:

- [ ] Both files have centered header + badge links to the sibling file
- [ ] Question appears in readme.md blockquote and index
- [ ] readme.md has numbered `## N · emoji Title` sections
- [ ] read.md has `📌 Flows to Remember` table with valid anchors
- [ ] read.md has at least one architecture ASCII diagram
- [ ] read.md ends with "Ready to go deeper?" footer
- [ ] readme.md ends with "Back to Summary" footer
- [ ] No broken `#anchor` links (section must exist)
- [ ] No duplicate paragraphs or repeated code blocks
- [ ] Track index updated (`foundation-2/readme.md` or `learning-docs/readme.md`)

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

## Example Trigger

User says: *"Format foundation/7 from my rough notes, update the index, same style as other modules"*

→ Read `foundation/7/*`, write readme.md then read.md, update index, run consistency checklist.
