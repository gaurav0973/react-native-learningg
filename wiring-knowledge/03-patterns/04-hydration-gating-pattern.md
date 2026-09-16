# Hydration gating — restore then save

> How to load persisted state from disk without overwriting it with empty defaults, using
> the two-effect + `isHydrated` guard pattern.

**Folder:** 03-patterns · **Prerequisites:**
[AsyncStorage and storageService](../02-implementations/06-asyncstorage-and-storage-service.md),
[Context and providers](../02-implementations/05-context-and-providers.md) ·
**Next:** [State management evolution](14-state-management-evolution.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Hydration | On launch — read saved data from disk into React state |
| Dehydration | Persisting current state to disk before it is lost |
| `isHydrated` | Boolean flag — true only after restore completes |
| Hydration gating | Blocking save effects until restore finishes |
| Restore effect | `useEffect([], …)` — runs once on mount, reads storage |
| Save effect | `useEffect([state], …)` — writes whenever state changes |
| Render null gate | Provider returns `null` until hydrated — children wait |
| RAM vs disk | State in memory dies on process death; disk survives → see [Process death](../01-internals/04-process-death-and-ram.md) |
| Overwrite race | Save effect runs with `[]` before restore completes, wiping disk |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  APP LAUNCH
      │
      ▼
  Provider mounts, state = [] (empty default)
      │
      ├──────────────────────────────────────────────┐
      │                                              │
      ▼                                              ▼
  Effect A (restore)                          Effect B (save)
  deps: []                                    deps: [cartItems, isHydrated]
      │                                              │
      │  async read disk                             │  if (!isHydrated) return
      │                                              │  else saveData(...)
      ▼                                              ▼
  setCartItems(saved)                         (blocked until hydrated)
  setIsHydrated(true)
      │
      ▼
  re-render → isHydrated=true → Effect B now allowed
      │
      ▼
  return <Provider>{children}</Provider>
  (was null while isHydrated=false)
```

**Reading the diagram.** On mount, React state starts empty — that is correct for a fresh
install but wrong for a returning user whose cart lives on disk. Effect A reads storage and
fills state. Effect B watches state and saves — but only after the `isHydrated` guard passes.

Without the guard, Effect B fires on mount with `cartItems=[]` and **overwrites the saved
cart with an empty array** before Effect A finishes. That is the overwrite race — the single
bug this pattern exists to prevent.

The render-null gate ensures no screen reads an empty cart during the async restore window.

---

<a id="restore-on-mount"></a>

## 3 · Effect A — restore on mount

```text
  mount
    │
    ▼
  getData(STORAGE_KEYS.CART)
    │
    ├─ Array? ──► setCartItems(saved)
    ├─ corrupt? ─► keep [] (guard with Array.isArray)
    └─ error? ───► log, keep []
    │
    ▼
  finally: setIsHydrated(true)   ← always, success or failure
```

`CartContext` restore:

`src/context/CartContext.js`

```javascript
useEffect(() => {
  const restoreCart = async () => {
    try {
      const savedCart = await getData(STORAGE_KEYS.CART);
      if (Array.isArray(savedCart)) {
        setCartItems(savedCart);
      }
    } catch {
      console.log('Error while hydration');
    } finally {
      setIsHydrated(true);
    }
  };
  restoreCart();
}, []);
```

The `Array.isArray` check prevents corrupt storage (e.g. `{foo: 1}`) from breaking `.map()`
downstream. `finally` ensures hydration completes even on read failure — the app must not
stay blank forever.

Storage mechanics → [AsyncStorage](../02-implementations/06-asyncstorage-and-storage-service.md).

---

<a id="save-with-guard"></a>

## 4 · Effect B — save with hydration guard

```text
  cartItems changes
        │
        ▼
  isHydrated === false? ──Yes──► return (do nothing)
        │
        No
        ▼
  saveData(STORAGE_KEYS.CART, cartItems)
```

`src/context/CartContext.js`

```javascript
useEffect(() => {
  if (!isHydrated) return;
  saveData(STORAGE_KEYS.CART, cartItems);
}, [cartItems, isHydrated]);
```

`AddressContext` follows the identical shape — same restore/save split, same guard:

`src/context/AddressContext.js`

```javascript
useEffect(() => {
  if (!isHydrated) {
    return;
  }
  saveData(STORAGE_KEYS.ADDRESSES, addresses);
}, [addresses, isHydrated]);
```

When adding a new persisted global store, copy this two-effect template rather than inventing
a single effect that tries to do both.

---

<a id="render-null-until-ready"></a>

## 5 · Render null until ready

```text
  isHydrated=false          isHydrated=true
  ┌──────────────┐          ┌──────────────┐
  │ return null  │   ──►    │ <Provider>   │
  │ (blank flash)│          │  {children}  │
  └──────────────┘          └──────────────┘
```

`src/context/CartContext.js`

```javascript
if (!isHydrated) return null;

return (
  <CartContext.Provider value={{ cartItems, addItem, increaseItem, decreaseItem }}>
    {children}
  </CartContext.Provider>
);
```

The brief blank frame is preferable to flashing an empty cart that jumps to saved items.
For a production app, swap `null` for a splash or skeleton — the gating logic stays the same.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Cart restore + save | `src/context/CartContext.js` | Effect A/B, `isHydrated` guard |
| Address restore + save | `src/context/AddressContext.js` | identical pattern |
| Storage wrapper | `src/services/storageService.js` | `getData` / `saveData` with JSON |
| Provider order | `App.jsx` | `CartProvider` → `AddressProvider` wrapping navigator |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [AsyncStorage](../02-implementations/06-asyncstorage-and-storage-service.md),
  [Context and providers](../02-implementations/05-context-and-providers.md),
  [Process death](../01-internals/04-process-death-and-ram.md)
- **Used by:** [State management evolution](14-state-management-evolution.md),
  [Optimistic updates](08-optimistic-updates-and-prefetch.md)
- **Contrast with:** [Four screen states](03-four-screen-states.md) — hydration is
  provider-level persistence, not per-screen fetch loading
- **Common mistake:** single save effect without guard — wipes disk on every cold start →
  [#save-with-guard](#save-with-guard)
