# UI as a function of state

> How React Native turns JavaScript state into native pixels, and why every screen change
> starts with a state change — not a direct UI edit.

**Folder:** 03-patterns · **Prerequisites:** — ·
**Next:** [Derived state](02-derived-state.md), [Four screen states](03-four-screen-states.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| State | JavaScript values that, when changed, trigger a re-render |
| UI as a function of state | The screen is always computed from current state — never edited directly |
| Re-render | React runs the component function again with new state |
| Reconciliation | React compares the new element tree to the previous one |
| Commit | The diff is sent to the native layer → only changed views update |
| Conditional rendering | Showing different UI branches based on state values |
| Local state | `useState` inside one component — invisible to siblings |
| Props | Values passed down from a parent — read-only to the child |
| State-driven UI | The architectural rule: change state first, UI follows |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  USER ACTION (tap, type, navigate)
           │
           ▼
  ┌────────────────────┐
  │  (1) Event handler │  setState / setSearchText / addItem
  └─────────┬──────────┘
            │  state changes
            ▼
  ┌────────────────────┐
  │  (2) Re-render     │  component function runs again
  │      f(state) → UI │
  └─────────┬──────────┘
            │  new element tree
            ▼
  ┌────────────────────┐
  │  (3) Reconcile     │  diff old tree vs new tree
  └─────────┬──────────┘
            │  minimal changes only
            ▼
  ┌────────────────────┐
  │  (4) Commit        │  native views update on device
  └────────────────────┘
            ▲
            │  you never touch this layer directly
            │  ← insight: there is no "change the Text color"
            │    API — only "change state, let React diff"
```

**Reading the diagram.** Box (1) is every handler in your app — `onPress`, `onChangeText`,
`addItem`. They all do the same thing: update state. Box (2) is the core React contract:
`UI = f(state)`. The component is a pure function of its inputs; run it again and you get a
fresh description of what should be on screen.

Box (3) is reconciliation — React does not tear down and rebuild the whole tree on every
keystroke. It diffs and finds the smallest set of changes. Box (4) is the commit step where
those changes reach native views → see
[Fabric render pipeline](../01-internals/11-fabric-render-pipeline.md).

The load-bearing insight: **you never manipulate the UI directly.** There is no imperative
"set this Text to red" in React. Change state; the function re-runs; the diff propagates.
Every bug that looks like "the UI didn't update" is really "the state didn't change" or
"the component didn't re-render when it should have."

---

<a id="state-changes-ui"></a>

## 3 · State change drives the UI

```text
  CartContext                    RestaurantScreen
  ┌──────────────┐               ┌──────────────────┐
  │ cartItems=[] │──addItem()──► │ reads cartItems  │
  └──────────────┘               │ via useContext   │
        │                        └────────┬─────────┘
        │ setCartItems([...])           │
        ▼                                 ▼
  cartItems=[{pizza}]            FloatingCartBar appears
                                 (was returning null)
```

When `addItem` runs in `CartContext`, it calls `setCartItems`. Every component that reads
`cartItems` re-renders — including `FloatingCartBar`, which was returning `null` while the
cart was empty and now renders the green bar.

`src/context/CartContext.js`

```javascript
const addItem = item => {
  setCartItems(previousCart => [
    ...previousCart,
    { ...item, quantity: 1 },
  ]);
  showCartNotification(item.name);
};
```

The notification is a side effect triggered by the same user action, but the visible cart bar
change is purely state-driven: empty array → non-empty array → different return value from
the component function.

---

<a id="conditional-rendering"></a>

## 4 · Conditional rendering — the if/else of UI

```text
  state value          branch rendered
  ─────────────────────────────────────
  loading === true  →  <LoadingView />
  error !== null    →  <ErrorView />
  data.length === 0 →  <EmptyView />   (inside loaded)
  else              →  <LoadedView />
```

Conditional rendering is how state becomes visible structure. Three common patterns in this
repo:

**Early return** — one branch owns the whole screen:

`src/screens/HomeScreen.js`

```javascript
if (loading) {
  return (
    <SafeAreaView style={styles.center}>
      <Text style={styles.loadingText}>Loading Restaurants...</Text>
    </SafeAreaView>
  );
}

if (error) {
  return (
    <SafeAreaView style={styles.center}>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>{error}</Text>
    </SafeAreaView>
  );
}
```

**Inline ternary** — small toggles inside a loaded screen:

`src/screens/AddressScreen.js`

```javascript
{error ? <Text style={styles.error}>{error}</Text> : null}
```

**Return null** — hide a component entirely:

`src/components/FloatingCartBar.js`

```javascript
if (cartItems.length === 0) {
  return null;
}
```

Each pattern answers the same question: "given this state, what should exist on screen?"

---

<a id="re-render-pipeline"></a>

## 5 · What actually re-renders

```text
  Parent re-renders
        │
        ├──► Child A (props unchanged) ──► may still re-render*
        ├──► Child B (props changed)   ──► re-renders
        └──► Context consumer          ──► re-renders when context value changes

  * default React behaviour — memoization is an opt-in optimization
```

When `searchText` changes in `HomeScreen`, the entire `HomeScreen` function re-runs. That
includes `useMemo` recalculations, child component calls, and list re-renders. This is
correct behaviour — the question is whether it is *expensive*, which is what
[Derived state](02-derived-state.md) and later profiling address.

Local state stays local. `searchText` in `HomeScreen` does not automatically reach
`CartScreen` — that requires props, context, or navigation params → see
[Context and providers](../02-implementations/05-context-and-providers.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| State → UI branch | `src/screens/HomeScreen.js` | `loading` / `error` early returns before the list |
| Hide when empty | `src/components/FloatingCartBar.js` | `return null` when `cartItems.length === 0` |
| State mutation | `src/context/CartContext.js` | `setCartItems` in `addItem`, `increaseItem`, `decreaseItem` |
| Controlled field | `src/components/SearchBar.js` | `value={searchText}` bound to parent state |
| Entry chain | `App.jsx` | Providers wrap `AppNavigator` — global state above screens |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** —
- **Used by:** [Derived state](02-derived-state.md), [Four screen states](03-four-screen-states.md),
  [Controlled components](05-controlled-components.md),
  [Context and providers](../02-implementations/05-context-and-providers.md),
  [useEffect and side effects](../02-implementations/07-useeffect-and-side-effects.md)
- **Contrast with:** imperative UI kits (UIKit storyboards, Android XML) — you declare what
  should exist given state, not step through mutations
- **Common mistake:** trying to "force update" the UI without changing state — if it looks
  stale, trace the state that should have changed →
  [Derived state](02-derived-state.md#one-source-of-truth)
