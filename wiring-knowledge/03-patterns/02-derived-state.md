# Derived state — one source of truth

> How to compute values from existing state instead of storing duplicates, and when
> `useMemo` is worth the ceremony.

**Folder:** 03-patterns · **Prerequisites:**
[UI as a function of state](01-ui-as-function-of-state.md) ·
**Next:** [Four screen states](03-four-screen-states.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Derived state | A value calculated from other state — not stored separately |
| Source of truth | The one state variable that owns a fact; everything else reads it |
| Duplicated state | Two variables holding the same fact — they will drift apart |
| `useMemo` | Hook that caches a computed value until dependencies change |
| Dependency array | The list of values that, when changed, invalidate the cache |
| Stale derived value | A computed value based on outdated source state |
| Pure computation | A function with no side effects — safe to run on every render |
| Expensive computation | Filtering/sorting a large list — candidate for memoization |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  SOURCE OF TRUTH (store once)              DERIVED (compute, don't store)
  ┌─────────────────────────┐             ┌─────────────────────────┐
  │ restaurants[]           │────────────►│ filteredRestaurants     │
  │ searchText (immediate)  │   filter    │ (useMemo)               │
  └─────────────────────────┘             └─────────────────────────┘
  ┌─────────────────────────┐             ┌─────────────────────────┐
  │ addresses[]             │────────────►│ selectedAddress         │
  │ (each has isSelected)   │   .find()   │ (useMemo in provider)   │
  └─────────────────────────┘             └─────────────────────────┘
  ┌─────────────────────────┐             ┌─────────────────────────┐
  │ cartItems[]             │────────────►│ totalItems, totalPrice  │
  │                         │   .reduce() │ (inline in component)   │
  └─────────────────────────┘             └─────────────────────────┘

  ✗ ANTI-PATTERN: also storing filteredRestaurants in useState
    → two sources of truth → will desync when only one updates
```

**Reading the diagram.** The left column is what you store — arrays, strings, flags. The right
column is what you derive — filtered lists, selected items, totals. The arrow is always
one direction: source → derived. Never write back from derived to source without going through
the source variable.

The insight this note delivers: **if you can compute it, don't store it.** Every extra
`useState` for something that is logically a function of existing state is a future bug —
the two copies will disagree after one update path forgets to sync.

---

<a id="one-source-of-truth"></a>

## 3 · One source of truth — the rule

```text
  BAD (duplicated)                    GOOD (derived)
  ─────────────────                   ─────────────────
  restaurants + filteredRestaurants   restaurants only
  both in useState                    filter on read

  User types "pizza"
       │                                    │
       ▼                                    ▼
  Must update BOTH                     searchText changes
  or they drift                        filter re-runs automatically
```

`HomeScreen` keeps `restaurants` (the full list from the API) and `searchText` (what the user
typed). It does **not** store `filteredRestaurants` in state — that would mean every search
keystroke needs two updates: one for the query, one for the filtered copy.

Instead, `filteredRestaurants` is computed:

`src/screens/HomeScreen.js`

```javascript
const filteredRestaurants = useMemo(() => {
  const query = debouncedSearch.toLowerCase();
  return restaurants.filter(restaurant => {
    return restaurant.name.toLowerCase().includes(query);
  });
}, [restaurants, debouncedSearch]);
```

The debounced search value comes from [Debouncing](06-debounce-and-throttle.md) — the filter
runs on the quiet-period value, not every keystroke.

---

<a id="usememo-as-cache"></a>

## 4 · `useMemo` — when the computation costs

```text
  render triggered (any state change)
        │
        ▼
  useMemo: deps changed?
        │
   ┌────┴────┐
  Yes        No
   │          │
   ▼          ▼
 recompute   return cached value
  filter      (skip .filter())
```

`useMemo` is not magic — it is a performance cache. The comment in `HomeScreen` explains why
it is there: without it, `restaurants.filter(...)` runs on every render, including when
unrelated state like `refreshing` toggles.

**When to use `useMemo`:**

| Situation | Use `useMemo`? |
|-----------|----------------|
| Simple `a + b` or `.length` | No — cheaper than the hook overhead |
| `.filter()` / `.sort()` on a list | Yes, if the list is large or render is frequent |
| Object/array passed as prop to memoized child | Yes — stabilizes reference |
| "I want derived state" | No — derive inline; memo is optional optimization |

**When not to bother:** `FloatingCartBar` computes totals inline with `.reduce()` on a small
cart — no `useMemo` needed because the cart rarely has more than a handful of items.

---

<a id="derived-in-context"></a>

## 5 · Derived state in a provider

```text
  AddressProvider
  ┌──────────────────────────────────┐
  │ addresses[]  ← source of truth   │
  │                                  │
  │ selectedAddress = useMemo(       │
  │   () => addresses.find(isSelected)│
  │ )                                │
  └──────────────────────────────────┘
           │
           ▼
  Consumers read selectedAddress
  without re-deriving or storing a copy
```

`AddressContext` stores `addresses` and derives `selectedAddress`:

`src/context/AddressContext.js`

```javascript
const selectedAddress = useMemo(() => {
  return addresses.find(address => address.isSelected);
}, [addresses]);
```

When a consumer calls `selectAddress(id)`, only `addresses` updates. `selectedAddress`
recomputes automatically because `addresses` is in the dependency array. No second state
variable for "currently selected" that could disagree with the array.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Filtered list | `src/screens/HomeScreen.js` | `useMemo` on `filteredRestaurants` |
| Selected item | `src/context/AddressContext.js` | `selectedAddress` derived from `addresses` |
| Inline totals | `src/components/FloatingCartBar.js` | `.reduce()` without `useMemo` — small data |
| Debounced input to filter | `src/screens/HomeScreen.js` | `debouncedSearch` as memo dependency |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [UI as a function of state](01-ui-as-function-of-state.md)
- **Used by:** [Debouncing](06-debounce-and-throttle.md),
  [Optimistic updates](08-optimistic-updates-and-prefetch.md),
  [Context and providers](../02-implementations/05-context-and-providers.md)
- **Contrast with:** storing computed values in `useState` + syncing with `useEffect` — that
  is duplicated state with extra steps
- **Common mistake:** wrapping every expression in `useMemo` "just in case" — profile first,
  memo second → [Optimistic updates](08-optimistic-updates-and-prefetch.md#never-blank)
