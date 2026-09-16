# Context API — CartProvider and AddressProvider

> How Foodie shares cart and address state across screens without passing props through every intermediate component.

**Folder:** 02-implementations · **Prerequisites:** [UI as a function of state](../03-patterns/01-ui-as-function-of-state.md) · **Next:** [Hydration gating](../03-patterns/04-hydration-gating-pattern.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Context | React mechanism to broadcast a value to any descendant |
| createContext | Factory returning a context object with Provider and Consumer |
| Provider | Component that supplies the current context value to its subtree |
| useContext | Hook that reads the nearest Provider's value |
| CartProvider | This app's cart state owner — items, add, increase, decrease |
| AddressProvider | Saved addresses, selection, CRUD operations |
| Prop drilling | Passing props through layers that do not use them |
| isHydrated | Flag gating render until AsyncStorage restore completes |
| Custom hook wrapper | `useAddress()` — thin `useContext(AddressContext)` export |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  App.jsx
  └── CartProvider ────────────────┐
        └── AddressProvider        │
              └── AppNavigator     │
                    ├── MenuItem ──┼── useContext(CartContext)
                    ├── CartScreen ┤
                    ├── FloatingCartBar
                    └── AddressScreen ── useAddress()
                           ▲
                           │
              value={{ cartItems, addItem, … }}
              value={{ addresses, selectedAddress, … }}
```

**Reading the diagram.** Providers wrap the entire navigator in `App.jsx`, so any screen or deep component can read cart or address state. `MenuItem` calls `addItem` without receiving cart props from `RestaurantScreen`.

Both providers follow the same persistence pattern: restore on mount, save on change, render `null` until hydrated → [Hydration gating](../03-patterns/04-hydration-gating-pattern.md#render-null-until-ready).

The insight: **Context solves prop drilling, not every state problem.** This repo uses two focused providers rather than one mega-store → contrast [State management evolution](../03-patterns/14-state-management-evolution.md).

---

<a id="createcontext-and-provider"></a>

## 3 · createContext and Provider value

```text
  createContext()  ──►  empty container
         │
         ▼
  <CartContext.Provider value={{ cartItems, addItem, … }}>
         │
         └── descendants call useContext(CartContext)
```

`CartContext.js`:

`src/context/CartContext.js`

```javascript
export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const addItem = item => {
    setCartItems(previousCart => [...previousCart, { ...item, quantity: 1 }]);
    showCartNotification(item.name);
  };
  // increaseItem, decreaseItem …

  if (!isHydrated) return null;

  return (
    <CartContext.Provider value={{ cartItems, addItem, increaseItem, decreaseItem }}>
      {children}
    </CartContext.Provider>
  );
}
```

`App.jsx` nesting order — cart outside address:

`App.jsx`

```javascript
<CartProvider>
  <AddressProvider>
    <AppNavigator />
  </AddressProvider>
</CartProvider>
```

---

<a id="usecontext-at-call-sites"></a>

## 4 · useContext at call sites

```text
  MenuItem                CartScreen              FloatingCartBar
  useContext(CartContext) useContext(CartContext) useContext(CartContext)
         │                       │                       │
         └── addItem(item)       └── cartItems map       └── totalItems, navigate Cart
```

`MenuItem`:

`src/components/MenuItem.js`

```javascript
const { cartItems, addItem, increaseItem, decreaseItem } = useContext(CartContext);
```

`AddressContext` exports a named hook:

`src/context/AddressContext.js`

```javascript
export const useAddress = () => useContext(AddressContext);
```

`AddressScreen` destructures `{ addresses, addAddress, selectAddress, deleteAddress }`.

---

<a id="derived-value-in-provider"></a>

## 5 · Derived value inside the provider

```text
  addresses[] ──► useMemo ──► selectedAddress
                     ▲
                     └── one source of truth, not separate state
```

`AddressProvider` computes `selectedAddress` from the array rather than storing it separately → [Derived state](../03-patterns/02-derived-state.md#one-source-of-truth):

`src/context/AddressContext.js`

```javascript
const selectedAddress = useMemo(() => {
  return addresses.find(address => address.isSelected);
}, [addresses]);
```

Provider `value` includes both raw `addresses` and derived `selectedAddress`.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Cart provider | `src/context/CartContext.js` | CRUD + notification side effect |
| Address provider | `src/context/AddressContext.js` | Selection logic, `useAddress` |
| Provider tree | `App.jsx` | Wrap order around navigator |
| Cart consumer | `src/components/MenuItem.js` | Add / quantity controls |
| Cart screen | `src/screens/CartScreen.js` | Read-only list + checkout |
| Floating bar | `src/components/FloatingCartBar.js` | Derived totals from context |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [UI as a function of state](../03-patterns/01-ui-as-function-of-state.md)
- **Used by:** [Hydration gating](../03-patterns/04-hydration-gating-pattern.md), [AsyncStorage](06-asyncstorage-and-storage-service.md), [State management evolution](../03-patterns/14-state-management-evolution.md)
- **Contrast with:** Redux/Zustand — this repo stays on Context until scale demands more
- **Common mistake:** Creating one Provider for theme + cart + user — any cart change re-renders all consumers
