# State management evolution — useState to Zustand

> How global state needs grow from one component to Context to Redux to Zustand, and
> why Foodie stops at Context for now.

**Folder:** 03-patterns · **Prerequisites:**
[Context and providers](../02-implementations/05-context-and-providers.md),
[Hydration gating](04-hydration-gating-pattern.md) ·
**Next:** —

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Local state | `useState` inside one component |
| Props | Parent passes data down — works for shallow trees |
| Prop drilling | Passing data through intermediaries that do not use it |
| Context API | Provider supplies shared values; consumers read via `useContext` |
| Provider hell | Many nested providers as app features multiply |
| Redux | Centralized store with actions and reducers — verbose but debuggable |
| Zustand | Lightweight global store — simpler API than Redux |
| Application state | Data many screens read and write — cart, auth, orders |
| Shared values | Theme, locale — changes infrequently, many readers |
| Re-render scope | Who re-renders when one context value changes |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  COMPLEXITY GROWS ─────────────────────────────────────────────►

  useState          props           Context          Redux/Zustand
  one component     parent→child    skip drilling    centralized store
       │                │                │                  │
       ▼                ▼                ▼                  ▼
  searchText         navigation      cartItems[]        single store
  in HomeScreen      params          auth token         time-travel debug
                                     theme              middleware

  Foodie today: ─── useState + Context (Cart + Address)
  Foodie later: ─── add Zustand/Redux when cross-cutting writes multiply
```

**Reading the diagram.** Each step solves the failure mode of the previous one. Local state
cannot cross screens. Props become drilling at depth. Context removes drilling but couples
all consumers to one provider's re-renders. Redux/Zustand centralize writes and enable
devtools at the cost of ceremony.

Foodie uses Context for cart and addresses with hydration →
[Context implementation](../02-implementations/05-context-and-providers.md),
[Hydration gating](04-hydration-gating-pattern.md).

The insight: **start simple, migrate when pain is measurable** — not when a blog post says to.

---

<a id="evolution-ladder"></a>

## 3 · The evolution ladder

```text
  useState       →  one component owns it
  props          →  parent shares with direct children
  Context API    →  many consumers, infrequent writes
  Redux          →  many writers, complex transitions, team debugging
  Zustand        →  global store without Redux boilerplate
```

From README §5:

| Stage | Good for |
|-------|----------|
| `useState` | UI toggles, form fields, single-screen fetch state |
| Props | Passing restaurant id into `RestaurantScreen` |
| Context | Cart, auth token, theme — shared across tabs |
| Redux | Large teams, action logs, middleware, time-travel |
| Zustand | Medium apps wanting global store with less code |

---

<a id="prop-drilling"></a>

## 4 · Prop drilling — the problem Context solves

```text
  App
   └── HomeScreen
        └── RestaurantList
             └── RestaurantCard
                  └── needs cartItems ❌
                       (HomeScreen doesn't use cart)
```

Without Context, `cartItems` passes through every intermediate component as props those
components never read — brittle and tedious.

Context flattens the path:

```text
  CartProvider (stores cartItems)
       │
       ├── HomeScreen
       ├── RestaurantScreen ── useContext(CartContext)
       └── FloatingCartBar    ── useContext(CartContext)
```

`App.jsx` wraps the tree:

```javascript
<CartProvider>
  <AddressProvider>
    <AppNavigator />
  </AddressProvider>
</CartProvider>
```

---

<a id="provider-hell"></a>

## 5 · Provider hell — Context's scaling limit

```text
  <AuthProvider>
    <ThemeProvider>
      <CartProvider>
        <LocationProvider>
          <NotificationProvider>
            <App />
```

Each new global concern adds a nesting layer. Still manageable in Foodie (two providers).
Pain points at scale:

| Context issue | Symptom |
|---------------|---------|
| Broad re-renders | Cart badge changes → all context consumers re-render |
| No selectors | Cannot subscribe to `cartItems.length` only |
| Testing | Must wrap every test in all providers |
| DevTools | No action log — hard to replay state changes |

Mitigations before leaving Context: split contexts by update frequency (cart separate from
theme), memoize provider `value`, `React.memo` on heavy consumers.

---

<a id="redux-vs-zustand"></a>

## 6 · Redux vs Zustand — when Context is not enough

```text
  REDUX change one value          ZUSTAND change one value
  ──────────────────────          ────────────────────────
  action.js                       store.set(state => …)
  reducer.js
  constants.js
  dispatch in component
```

Redux excels when many teams write to shared state and need predictable action logs.
The cost is boilerplate — four files to toggle a flag.

Zustand offers a single store with hooks:

```javascript
// illustrative — not in Foodie repo
import { create } from 'zustand';

const useCartStore = create(set => ({
  items: [],
  addItem: item => set(state => ({ items: [...state.items, item] })),
}));
```

**When to migrate from Foodie's Context:**

- Middleware needs (logging every cart mutation to analytics)
- Selectors (subscribe to derived slices without re-render)
- Persist outside the hand-rolled hydration pattern
- State logic too complex for `useState` reducers inside providers

Until then, `CartContext` + `AddressContext` + hydration guard is the right weight.

`src/context/CartContext.js` — createContext, Provider, restore/save effects.
`src/context/AddressContext.js` — same pattern plus `useMemo` for `selectedAddress`.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Cart global state | `src/context/CartContext.js` | Provider, addItem, hydration |
| Address global state | `src/context/AddressContext.js` | Provider, selectAddress, useAddress |
| Local screen state | `src/screens/HomeScreen.js` | loading, search — stays local |
| Consumer | `src/components/FloatingCartBar.js` | `useContext(CartContext)` |
| Provider tree | `App.jsx` | nesting order |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Context and providers](../02-implementations/05-context-and-providers.md),
  [Hydration gating](04-hydration-gating-pattern.md),
  [UI as a function of state](01-ui-as-function-of-state.md)
- **Used by:** future features (auth, orders) — evaluate Zustand before adding a third
  Context provider
- **Contrast with:** [Derived state](02-derived-state.md) — evolution is about *scope*
  (who can read/write), not about computing values
- **Common mistake:** jumping to Redux on day one — Context + good local state covers most
  learning apps → [#evolution-ladder](#evolution-ladder)
