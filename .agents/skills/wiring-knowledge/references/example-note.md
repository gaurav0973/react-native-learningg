# Example note

A complete note in the required format, written against a real repo. Use it as the shape to match:
terminology table, master diagram covering the whole topic, sub-diagrams that zoom into it, repo
code, and wiring links instead of repeated explanations.

Note the explicit `<a id="...">` anchors above each heading — numbered headings generate brittle
slugs, so stable anchors are declared by hand and recorded in the ledger.

Note also how §4 handles a concept owned elsewhere (`useEffect` cleanup) — one sentence
plus a link, then it moves on. That is the rule that keeps the knowledge base from re-clustering.

Everything below the line is the note itself, as it would appear at
`wiring-knowledge/03-patterns/04-debounce-and-throttle.md`.

---

# Debouncing and throttling

> How to stop a cheap user action from causing an expensive reaction, and how to choose between
> the two ways of doing it.

**Folder:** 03-patterns · **Prerequisites:**
[Controlled components](03-controlled-components.md),
[useEffect and cleanup](../02-implementations/05-useeffect-and-side-effects.md) ·
**Next:** [Pagination loops](05-pagination-loops.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Rate limiting | Any technique that reduces how often a reaction runs relative to its trigger |
| Debounce | Wait for the trigger to go quiet for N ms, then run once |
| Throttle | Run at most once per N ms window, ignoring triggers in between |
| Quiet period | The gap in triggers that a debounce is waiting for |
| Trailing edge | Running *after* the burst — what a debounce does |
| Leading edge | Running *at the start* of the burst — what a throttle usually does |
| In-flight request | A network call that has been sent but not yet resolved |
| Race condition | Two in-flight responses arriving out of order, so the stale one wins |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  TRIGGER STREAM (what the user does)
  t ──►  k   k   k   k   k                 k   k             k
         │   │   │   │   │                 │   │             │
         └───┴───┴───┴───┘                 └───┘             │
            burst A                        burst B         single
  ═══════════════════════════════════════════════════════════════════════
  (1) NO RATE LIMITING          every k → one reaction        11 reactions
         ▼   ▼   ▼   ▼   ▼                 ▼   ▼             ▼
  ═══════════════════════════════════════════════════════════════════════
  (2) DEBOUNCE (trailing)       reaction only after quiet      3 reactions
                       └─400ms─►▼                   └─400ms─►▼      ...──►▼
  ═══════════════════════════════════════════════════════════════════════
  (3) THROTTLE (leading)        reaction at most 1 per window  4 reactions
         ▼ ──── window ──── ▼ ──── window ────  ▼ ──── window ────  ▼
  ═══════════════════════════════════════════════════════════════════════
                                  ▲
                                  │ the question this note answers:
                                  │ do you want the LAST value, or a
                                  │ STEADY RATE of values?
```

**Reading the diagram.** The top row is the trigger stream — keystrokes, scroll events, taps. Row
(1) is the default behaviour: one reaction per trigger, which is what makes a search box fire
eleven requests for one word.

Row (2) debounces. Each trigger cancels the pending reaction and restarts a 400 ms timer, so the
reaction only happens once the stream goes quiet. Notice what this costs: during a long burst,
*nothing happens at all*. That is fine for search, and disastrous for a scroll position indicator.

Row (3) throttles. The first trigger fires immediately, then further triggers are swallowed until
the window closes. The reaction rate is capped but never drops to zero during a burst.

The insight the whole note rests on: **debounce optimises for the final value, throttle optimises
for a steady rate.** Choose by asking which of those the feature needs — not by which one you
implemented last time.

---

<a id="the-timer-reset"></a>

## 3 · Debounce — the timer reset

```text
  keystroke   keystroke   keystroke              (quiet)
      │           │           │
      ▼           ▼           ▼
  ┌────────┐  ┌────────┐  ┌────────┐
  │ set    │  │ CLEAR  │  │ CLEAR  │
  │ timer  │  │ + set  │  │ + set  │ ──── 400ms with no new keystroke ────►  fire
  │  T1    │  │  T2    │  │  T3    │                                        (T3 only)
  └────────┘  └────────┘  └────────┘
       ✗ T1 never fires    ✗ T2 never fires             ✓ T3 fires
```

This is box (2) of the master diagram, opened up. The whole mechanism is: *set a timer, and clear
the previous one before setting the next.* Every timer except the last is destroyed before it can
run.

In this repo the pattern is extracted into a hook rather than inlined at the call site:

`src/hooks/useDebounce.js`

```javascript
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

The hook returns a *second* value that lags the first. The input stays fully responsive because it
is still bound to the immediate `value` → see
[Controlled components](03-controlled-components.md#the-two-values); only the expensive consumer
reads the debounced one.

---

<a id="why-the-cleanup-function-is-the-debounce"></a>

## 4 · Why the cleanup function *is* the debounce

```text
  value changes  ──►  effect re-runs
                        │
                        ├─(a) cleanup of the PREVIOUS run  ──►  clearTimeout(old)
                        │
                        └─(b) body of the NEW run          ──►  setTimeout(new)
                                 order matters: (a) always before (b)
```

React runs the previous effect's cleanup before the next effect body → see
[useEffect and cleanup](../02-implementations/05-useeffect-and-side-effects.md#cleanup-order).
That ordering is doing the entire job here: without it, every keystroke would leave a live timer
and all of them would fire.

So there is no separate "debounce library" in this repo. Debouncing is what you get for free when
you put a timer in an effect and clear it in the cleanup.

---

<a id="throttle-the-closed-window"></a>

## 5 · Throttle — the closed window

```text
  ┌─ window open ──────────────┐┌─ window open ──────────────┐
  │                            ││                            │
  ▼ fire                       ▼▼ fire                       ▼
  t ──── t ── t ─ t ─── t ──────── t ── t ─────── t ──────────── t
         ✗    ✗   ✗     ✗           ✗    ✗         ✗
              swallowed                 swallowed
```

The state is a timestamp of the last run, not a timer. Each trigger asks "has `limit` ms passed
since the last run?" and either runs or returns.

```javascript
function throttle(fn, limit = 300) {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      fn(...args);
    }
  };
}
```

Because there is no timer to clear, a throttle has no cleanup, and therefore no unmount hazard —
which is the practical reason it is usually written as a plain function while debounce is written
as a hook.

---

<a id="choosing-between-them"></a>

## 6 · Choosing between them

| Feature | Want | Use |
|---------|------|-----|
| Search-as-you-type | the final query only | debounce |
| Autosave a draft | the final text only | debounce |
| Validate a field on change | the final value only | debounce |
| Scroll position / sticky header | a steady stream | throttle |
| Infinite-scroll "near the end?" check | a steady stream, capped | throttle |
| Button that fires a mutation | the *first* press, nothing after | throttle (leading) |

The double-tap-submit case is worth calling out: debouncing it would make the button feel broken,
because the action would wait for the user to stop pressing. It needs a leading-edge throttle —
act now, ignore the rest.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| The hook | `src/hooks/useDebounce.js` | timer in the effect, `clearTimeout` in the cleanup |
| The call site | `src/screens/HomeScreen.js` | `useDebounce(searchText, 300)`, and which value each consumer reads |
| Custom hook extraction | `src/hooks/useDebounce.js` | why this is a hook rather than a util → [Custom hook extraction](06-custom-hook-extraction.md) |

**A drift worth knowing about:** `src/screens/SearchScreen.js` is still a placeholder — the
debounced search actually lives in `HomeScreen`. The original notes describe it as "the search
screen", so trust the code here.

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Controlled components](03-controlled-components.md),
  [useEffect and cleanup](../02-implementations/05-useeffect-and-side-effects.md)
- **Used by:** [Custom hook extraction](06-custom-hook-extraction.md),
  [Pagination loops](05-pagination-loops.md),
  [Perceived speed](07-perceived-speed.md)
- **Contrast with:** [Optimistic updates](08-optimistic-updates.md) — debouncing delays the
  reaction, optimistic updates fake it early; they solve opposite halves of "the network is slow"
- **Common mistake:** debouncing the input's own `value`, which makes typing feel laggy. Debounce
  the *consumer*, never the controlled field →
  [Controlled components](03-controlled-components.md#never-debounce-the-field)
