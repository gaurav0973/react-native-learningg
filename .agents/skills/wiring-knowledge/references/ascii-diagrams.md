# ASCII diagrams

Diagrams are the load-bearing element of this format. They survive being pasted anywhere, they
diff cleanly in git, and drawing one forces you to decide what the actual structure is — which is
why the master diagram comes before any prose.

## Hard rules

- Wrap every diagram in a fenced block tagged `text`. Untagged fences get syntax-highlighted into
  nonsense; `text` renders as monospace everywhere.
- **Maximum width 90 characters.** Wider diagrams wrap on GitHub's mobile view and on split
  editors, and a wrapped ASCII diagram is unreadable. `verify.py` fails builds that exceed this.
- Box-drawing characters (`─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝`) plus arrows (`▼ ▲ ◄ ► → ↓`).
  Mixing single and double lines is useful: double for boundaries the reader must not miss
  (process, thread, or language boundaries), single for everything else.
- Every box carries a label using the exact term from the terminology table. No synonyms inside
  diagrams — same thing, same word, every time.
- Align columns. Misaligned boxes read as sloppiness and cost the reader real time.

## Picking a diagram type

| The topic is about… | Draw |
|---|---|
| what sits on top of what | layer stack |
| something crossing a boundary in order | sequence / pipeline |
| a thing that can be in one of several conditions | state machine |
| who contains whom | tree |
| two things that must be told apart | side-by-side comparison |
| what happens over time on a timeline | swimlane |

The master diagram is usually a **layer stack or a pipeline** — those are the two shapes that can
hold an entire topic at once. Sub-diagrams are usually sequences, state machines, or comparisons.

## Templates

### Layer stack — good default for a master diagram

```text
┌──────────────────────────────────────────────────────────────┐
│  LAYER 3 · your code                                         │
│  what you write                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │  calls
╔══════════════════════════════▼═══════════════════════════════╗
║  LAYER 2 · the boundary            ← the thing this note is   ║
║  what translates one side into the other                      ║
╚══════════════════════════════╤═══════════════════════════════╝
                               │  becomes
┌──────────────────────────────▼───────────────────────────────┐
│  LAYER 1 · the platform                                      │
│  what actually does the work                                 │
└──────────────────────────────────────────────────────────────┘
```

### Pipeline with a boundary crossing

```text
   JS SIDE                        ║                 NATIVE SIDE
                                  ║
  ┌──────────┐    ┌──────────┐    ║    ┌──────────┐    ┌──────────┐
  │  step 1  │───►│  step 2  │────╫───►│  step 3  │───►│  step 4  │
  └──────────┘    └──────────┘    ║    └──────────┘    └──────────┘
       ▲                          ║                          │
       └──────────────────────────╫──────────────────────────┘
                 result comes back║
```

### Sequence with an explicit timeline

```text
  user            component          hook             service
    │                 │                │                 │
    │   types "app"   │                │                 │
    ├────────────────►│                │                 │
    │                 │  setQuery()    │                 │
    │                 ├───────────────►│                 │
    │                 │                │  (waits 400ms)  │
    │                 │                ├────────────────►│
    │                 │                │◄────────────────┤
    │                 │◄───────────────┤    results      │
    │◄────────────────┤   re-render    │                 │
```

### State machine

```text
                  ┌───────────┐
            ┌────►│  LOADING  │────┐
            │     └───────────┘    │
      retry │                      │ resolved
            │     ┌───────────┐    │
            └─────┤   ERROR   │◄───┘ rejected
                  └───────────┘
                        │
                  ┌─────▼─────┐        ┌───────────┐
                  │  LOADED   │───────►│   EMPTY   │
                  └───────────┘  n = 0 └───────────┘
```

### Side-by-side comparison

```text
        BEFORE                    │              AFTER
────────────────────────────────  │  ────────────────────────────────
  every keystroke → request       │    pause detected → 1 request
  12 requests for "margherita"    │    1 request for "margherita"
  last response may lose the race │    only one response in flight
```

### Tree

```text
  NavigationContainer
   └── BottomTabs
        ├── HomeStack
        │    ├── HomeScreen
        │    └── RestaurantScreen
        └── CartStack
             └── CartScreen
```

## Annotating

Point at the one thing that matters. A master diagram with a single `←` callout on the crucial box
teaches faster than one with six.

```text
  ┌──────────────┐
  │  the box     │  ← this is the only synchronous hop in the diagram
  └──────────────┘
```

Number the steps when the prose walks them: `(1)`, `(2)` inside the boxes, then explain in order.
When a sub-diagram zooms into the master, say so in one line under it — "this is box (3) of the
master diagram, opened up" — so the reader never loses the thread.

## Common failures

- **Too big.** If the master diagram exceeds roughly 40 lines, the note is two notes.
- **Decorative.** A diagram that only repeats the prose in boxes is noise. Every diagram should
  show something the sentences cannot: order, containment, a boundary, a cycle.
- **Un-walked.** A diagram with no explanation under it leaves the reader guessing which arrow
  mattered. The walkthrough is part of the diagram.
- **Drifting labels.** The master says "shadow tree", the sub-diagram says "layout tree". The
  reader now believes there are two things. Fix by using the terminology table as the vocabulary.
