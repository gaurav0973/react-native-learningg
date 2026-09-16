# AsyncStorage and storageService

> How Foodie persists cart and addresses to disk so they survive app restarts — through a thin JSON wrapper.

**Folder:** 02-implementations · **Prerequisites:** [Process death and RAM](../01-internals/04-process-death-and-ram.md) · **Next:** [Hydration gating](../03-patterns/04-hydration-gating-pattern.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| AsyncStorage | React Native key-value store — async, persisted on device |
| storageService | This repo's wrapper: stringify on write, parse on read |
| STORAGE_KEYS | Named constants for cart, token, user, addresses |
| JSON serialization | Objects must become strings before `setItem` |
| Hydration | Reading disk into React state on launch |
| Dehydration | Writing React state back to disk on change |
| createAsyncStorage | Factory creating a named storage instance (this project's import) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  React state (RAM)                    Disk (AsyncStorage)
  ┌─────────────────┐                 ┌─────────────────┐
  │ cartItems[]     │  saveData()     │ key: cart_items │
  │ addresses[]     │ ───────────────►│ JSON string     │
  └────────▲────────┘                 └────────┬────────┘
           │                                   │
           │         getData() on mount        │
           └───────────────────────────────────┘
                    restore → setCartItems(saved)
```

**Reading the diagram.** RAM clears on process death → see [Process death](../01-internals/04-process-death-and-ram.md). Providers call `getData` once on mount, then `saveData` whenever state changes — but only after hydration completes (owned by the gating pattern note).

`storageService` centralizes error logging and JSON handling so providers never touch raw AsyncStorage APIs.

The insight: **AsyncStorage is string-only.** Forgetting `JSON.stringify` stores `"[object Object]"`; forgetting `JSON.parse` leaves you comparing strings.

---

<a id="storage-service-api"></a>

## 3 · storageService — four operations

```text
  saveData(key, value)     ──► JSON.stringify ──► setItem
  getData(key)             ──► getItem ──► JSON.parse ──► object | null
  removeData(key)          ──► removeItem
  clearStorage()           ──► clear (debug)
```

`src/services/storageService.js`

```javascript
export const STORAGE_KEYS = {
  CART: 'cart_items',
  TOKEN: 'auth_token',
  USER: 'user_details',
  ADDRESSES: 'saved_addresses',
};

export const saveData = async (key, value) => {
  try {
    await cartStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log('Storage Save Error', error);
  }
};

export const getData = async (key) => {
  try {
    const value = await cartStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.log('Storage Read Error', error);
    return null;
  }
};
```

Store large blobs (images, video) elsewhere — README §8 lists what not to persist.

---

<a id="provider-restore-and-save"></a>

## 4 · How providers use storage

```text
  Effect A (mount, [])          Effect B ([cartItems, isHydrated])
  restoreCart()                 if (!isHydrated) return;
  getData(CART)                 saveData(CART, cartItems)
  setIsHydrated(true)
```

`CartContext` restore with array guard:

`src/context/CartContext.js`

```javascript
useEffect(() => {
  const restoreCart = async () => {
    try {
      const savedCart = await getData(STORAGE_KEYS.CART);
      if (Array.isArray(savedCart)) {
        setCartItems(savedCart);
      }
    } catch { /* … */ }
    finally {
      setIsHydrated(true);
    }
  };
  restoreCart();
}, []);

useEffect(() => {
  if (!isHydrated) return;
  saveData(STORAGE_KEYS.CART, cartItems);
}, [cartItems, isHydrated]);
```

The `Array.isArray` check prevents corrupted storage from breaking `.map` on the cart screen.

Full gating explanation → [Hydration gating](../03-patterns/04-hydration-gating-pattern.md#restore-on-mount).

---

<a id="what-to-store"></a>

## 5 · What this repo stores

| STORAGE_KEYS | Used by | Payload shape |
|---|---|---|
| `CART` | CartProvider | `[{ id, name, price, quantity, … }]` |
| `ADDRESSES` | AddressProvider | `[{ id, label, isSelected, … }]` |
| `TOKEN` | Reserved | Auth token (login not wired yet) |
| `USER` | Reserved | User profile object |

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Wrapper API | `src/services/storageService.js` | All four methods + keys |
| Cart persistence | `src/context/CartContext.js` | Restore/save effects |
| Address persistence | `src/context/AddressContext.js` | Same two-effect pattern |
| README rationale | `README.md` §8 | RAM vs disk diagram |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Process death and RAM](../01-internals/04-process-death-and-ram.md)
- **Used by:** [Context providers](05-context-and-providers.md), [Hydration gating](../03-patterns/04-hydration-gating-pattern.md)
- **Contrast with:** In-memory-only `useState` — fine until the user kills the app
- **Common mistake:** Saving before restore finishes — overwrites disk with empty initial state
