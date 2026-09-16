# Note format

Every file in the four folders uses this exact skeleton. The order is fixed: name the topic, hand
the reader the vocabulary, show the whole thing at once, then decompose it. A reader who has seen
one note knows how to read all of them, which is most of what "structured" means.

`example-note.md` in this directory is a full worked instance. When in doubt, match it.

## Skeleton

```markdown
# <Topic>

> One sentence: what this note lets you understand or do.

**Folder:** 01-internals · **Prerequisites:** [X](link), [Y](link) · **Next:** [Z](link)

---

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| ...  | ...                 |

## 2 · The master diagram

```text
<one ASCII diagram covering the entire topic>
```

**Reading the diagram:** <2–5 short paragraphs walking the diagram, naming each labelled
box/arrow, and stating the one insight the whole note exists to deliver.>

## 3 · <First sub-concept>

```text
<focused ASCII diagram — a zoom into one region of the master diagram>
```

<Explanation. Code from the repo where it helps.>

## 4 · <Second sub-concept>

...

## N · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|

## N+1 · Wiring

- **Builds on:** links
- **Used by:** links
- **Contrast with:** links
- **Common mistake:** one line, with a link to the note that prevents it
```

## Section rules

**Title and one-liner.** State the topic as a thing, not a question. The one-liner is what the
index quotes, so write it to stand alone.

**Prerequisites / Next line.** Real links, drawn from `depends_on` in the ledger. This line is the
thread that turns files into a path. A note with an empty prerequisites *and* an empty next is
almost certainly misplaced or too isolated.

**Terminology table.** Every term the note uses that the reader might not own yet, defined in one
line each. If a term is owned by another note, define it in one line here *and link it* — the
one-liner is orientation, not a second explanation. Five to fifteen rows is typical.

**Master diagram.** The defining requirement of this format. One diagram that contains the entire
topic end to end, before any decomposition. The reader should be able to point at any later
sub-diagram and say "that is the box in the top-left of the master".

- It shows the whole pipeline, not a fragment.
- It labels its parts with the terms from the terminology table — same words, no synonyms.
- Its walkthrough ends by stating the load-bearing insight of the note.
- Number the boxes or steps if the note refers back to them.

**Sub-sections.** Each one opens with its own diagram, then explains. Diagram first is the rule:
the picture sets the frame the prose fills. Each sub-diagram should visibly be a zoom into the
master — reuse its labels and arrow directions so the reader keeps their bearings.

**Code.** Quote from the repo, with the path above the block. Trim to the lines that carry the
idea and mark cuts with `// …`. Invented code is allowed only for contrast ("the naive version"),
and must be labelled as such.

**Where this shows up in the repo.** The bridge from theory to the user's own work, and the
strongest wiring in the note. Cite real paths.

**Wiring.** Four short lists of links, no prose. "Contrast with" is the one people skip and the one
that does the most work — knowing what a thing is *not* is half of knowing what it is.

## The non-repetition rule in practice

Before explaining anything, check the ledger. If another file owns it, write one sentence naming
the idea and its role here, then link. Then stop.

**Do this:**

> The debounced value only changes after the user pauses, which is what keeps this effect from
> firing per keystroke → [Debouncing](../03-patterns/04-debounce-and-throttle.md#the-timer-reset).

**Not this:**

> Debouncing means waiting until input stops before acting. Internally you set a timer on each
> keystroke and clear the previous one, so only the last… *(this is the other note, retyped)*

The test: delete the linked note and this paragraph should become incomplete. If it still reads
fine on its own, you duplicated.

Repeating a **term** is fine and necessary — "the JS thread" can appear in twelve notes. Repeating
an **explanation** is the defect.

## Style

- Write to a reader who knows how to code but has not seen this system.
- Prefer causal sentences: "X happens *because* Y", not "X and Y happen".
- Short paragraphs. Tables for enumerable facts, prose for mechanisms.
- Headings numbered `## 1 ·`, `## 2 ·` so cross-references can say "section 3 of that note".
- **Declare anchors explicitly.** Numbered headings generate awkward, brittle slugs
  (`## 3 · Debounce — the timer reset` → `#3--debounce--the-timer-reset`, which breaks the moment
  you renumber). Put a stable anchor above any heading that other notes or the ledger link to:

  ```markdown
  <a id="the-timer-reset"></a>

  ## 3 · Debounce — the timer reset
  ```

  Then link `…/04-debounce-and-throttle.md#the-timer-reset`. Record the same anchor in the ledger.
  `verify.py` resolves both explicit anchors and generated heading slugs, so it will catch any
  link you get wrong.
- No decorative badges, no emoji headers. The structure carries the signal.
