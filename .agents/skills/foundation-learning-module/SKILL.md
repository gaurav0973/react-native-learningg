---
name: foundation-learning-module
description: >-
  Create or update React Native Foundation learning modules in learning-docs/foundation/.
  Formats raw notes into read.md (summary) and readme.md (deep dive), updates the index,
  and keeps consistent architecture across modules. Use when adding a new foundation module,
  converting rough notes to learning docs, or updating learning-docs/readme.md.
---

# Foundation Learning Module

Turn raw React Native foundation notes into a paired **summary + deep dive** module and update the index.

## When to Use

- User adds a new folder under `learning-docs/foundation/N/`
- User has rough notes and wants `read.md` + `readme.md` formatted
- User asks to update `learning-docs/readme.md` with a new question
- User wants foundation docs to match existing module architecture

## Folder Structure

```
learning-docs/
├── readme.md                    ← index of all completed questions
└── foundation/
    └── N/
        ├── read.md              ← quick summary (badges, tables, diagrams)
        └── readme.md            ← deep dive (numbered sections, code, flows)
```

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read raw notes in foundation/N/
- [ ] Step 2: Identify the module question (one sentence)
- [ ] Step 3: Write readme.md (deep dive first — source of truth)
- [ ] Step 4: Write read.md (summary linking to readme.md sections)
- [ ] Step 5: Update learning-docs/readme.md index
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
- Anchor format: lowercase, hyphens, no emoji/numbers (e.g. `#pixelratio-api`)
- If a section doesn't exist in readme.md, **don't link to it**
- Include Quick Q&A table when interview notes are available

### Step 4 — Update `learning-docs/readme.md`

Add one row to the completed-questions table and one block under Module Details:

```markdown
| N | [Question text] | [read.md](foundation/N/read.md) | [readme.md](foundation/N/readme.md) |

### Module N — [Short Title]

> **Question:** [Question text]

- 📋 [Summary → read.md](foundation/N/read.md)
- 📖 [Deep Dive → readme.md](foundation/N/readme.md)
```

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
- [ ] Index updated in `learning-docs/readme.md`

## Anchor Reference

GitHub-style anchors from `## 1 · 🔢 PixelRatio API`:

- Strip number, emoji, punctuation → `pixelratio-api`
- Example: `## 8 · 📱 Safe Areas, Notches & Insets` → `#safe-areas-notches--insets`

## Quality Bar

- **Beautiful** = consistent badges, emoji section markers, clean tables, one strong diagram per file
- **Minimal** = no filler prose; every paragraph teaches something
- **Honest links** = if content isn't written yet, don't link to it

## Example Trigger

User says: *"Format foundation/7 from my rough notes, update the index, same style as other modules"*

→ Read `foundation/7/*`, write readme.md then read.md, update index, run consistency checklist.
