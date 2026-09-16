# Debouncing and throttling

> How to stop a cheap user action from causing an expensive reaction, and how to choose
> between waiting for quiet vs capping the rate.

**Folder:** 03-patterns · **Prerequisites:**
[Controlled components](05-controlled-components.md),
[useEffect and cleanup](../02-implementations/07-useeffect-and-side-effects.md) ·
**Next:** [Custom hook extraction](07-custom-hook-extraction.md),
[Pagination loops](09-pagination-loops.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Rate limiting | Any technique that reduces how often a reaction runs relative to its trigger |
| Debounce | Wait for the trigger to go quiet for N ms, then run once |
| Throttle | Run at most once per N ms window, ignoring triggers in between |
| Quiet period | The gap in triggers that a debounce is waiting for |
| Trailing edge | Running after the burst — what debounce does |
| Leading edge | Running at the start of the burst — what throttle usually does |
| In-flight request | A network call sent but not yet resolved |
| Race condition | Two responses arriving out of order — stale one wins |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  TRIGGER STREAM (keystrokes)
  t ──►  k   k   k   k   k                 k   k             k
         │   │   │   │   │                 │   │             │
         └───┴───┴───┴───┘                 └───┘             │
            burst A                        burst B         single
  ═══════════════════════════════════════════════════════════════════
  (1) NO LIMIT              every k → one reaction        11 reactions
         ▼   ▼   ▼   ▼   ▼                 ▼   ▼             ▼
  ═══════════════════════════════════════════════════════════════════
  (2) DEBOUNCE (trailing)   reaction after quiet            3 reactions
                       └─300ms─►▼                   └─300ms─►▼      ...──►▼
  ═══════════════════════════════════════════════════════════════════
  (3) THROTTLE (leading)    at most 1 per window              4 reactions
         ▼ ──── window ──── ▼ ──── window ────  ▼ ──── window ────  ▼
                                  ▲
                                  │ debounce = LAST value
                                  │ throttle = STEADY RATE
```

**Reading the diagram.** Row (1) is naive search — eleven API calls for one word. Row (2)
debounces: each keystroke resets a timer; only the last value fires after 300 ms quiet.
During a long burst, nothing happens — fine for search, bad for scroll position.

Row (3) throttles: first trigger fires immediately, then a lock swallows triggers until the
window closes. Rate is capped but never drops to zero mid-burst.

**Choose by asking:** do you need the final value (debounce) or a steady stream (throttle)?

---

<a id="the-timer-reset"></a>

## 3 · Debounce — the timer reset

```text
  keystroke   keystroke   keystroke              (quiet)
      │           │           │
      ▼           ▼           ▼
  ┌────────┐  ┌────────┐  ┌────────┐
  │ set    │  │ CLEAR  │  │ CLEAR  │
  │ timer  │  │ + set  │  │ + set  │ ──── 300ms quiet ────►  fire
  │  T1    │  │  T2    │  │  T3    │                        (T3 only)
  └────────┘  └────────┘  └────────┘
       ✗           ✗                            ✓
```

Box (2) of the master diagram, opened up. Set a timer; clear the previous one before
setting the next.

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

The hook returns a second value that lags the first. The input stays on immediate `value`
→ [Controlled components](05-controlled-components.md#the-two-values).

Call site:

`src/screens/HomeScreen.js`

```javascript
const debouncedSearch = useDebounce(searchText, 300);
```

---

<a id="why-the-cleanup-function-is-the-debounce"></a>

## 4 · Why cleanup *is* the debounce

```text
  value changes  ──►  effect re-runs
                        │
                        ├─(a) cleanup of PREVIOUS run  ──►  clearTimeout(old)
                        │
                        └─(b) body of NEW run          ──►  setTimeout(new)
                                 order: (a) always before (b)
```

React runs the previous effect's cleanup before the next body → see
[useEffect cleanup](../02-implementations/07-useeffect-and-side-effects.md). That ordering
destroys every timer except the last. No separate debounce library needed — timer in effect,
clear in cleanup.

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

State is a timestamp of the last run, not a pending timer:

```javascript
// naive version — not in repo, for contrast
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

README documents a `useThrottle` hook with a ref-based lock — same leading-edge idea.
This repo implements debounce (`useDebounce`) but not throttle yet; choose throttle for
scroll-position checks and `onEndReached` guards → [Pagination](09-pagination-loops.md).

---

<a id="choosing-between-them"></a>

## 6 · Choosing between them

| Feature | Want | Use |
|---------|------|-----|
| Search-as-you-type | final query only | debounce |
| Autosave draft | final text only | debounce |
| Validate on change | final value only | debounce |
| Scroll / sticky header | steady stream | throttle |
| Infinite scroll proximity | capped steady checks | throttle |
| Double-tap submit | first press only | throttle (leading) |

Debouncing a submit button would feel broken — the action waits for the user to stop pressing.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| The hook | `src/hooks/useDebounce.js` | timer + cleanup |
| Call site | `src/screens/HomeScreen.js` | `useDebounce(searchText, 300)` |
| Controlled split | `src/screens/HomeScreen.js` | immediate `searchText`, delayed filter |
| Placeholder | `src/screens/SearchScreen.js` | not wired — search lives in HomeScreen |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Controlled components](05-controlled-components.md),
  [useEffect cleanup](../02-implementations/07-useeffect-and-side-effects.md)
- **Used by:** [Custom hook extraction](07-custom-hook-extraction.md),
  [Pagination loops](09-pagination-loops.md),
  [Optimistic updates](08-optimistic-updates-and-prefetch.md)
- **Contrast with:** [Optimistic updates](08-optimistic-updates-and-prefetch.md) — debounce
  delays the reaction; optimistic fakes it early
- **Common mistake:** debouncing the input's own `value` →
  [Controlled components](05-controlled-components.md#never-debounce-the-field)
