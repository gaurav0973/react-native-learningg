# Extracting custom hooks

> When to pull logic out of a component into a reusable hook, and how to tell a hook
> from a utility function.

**Folder:** 03-patterns · **Prerequisites:**
[useEffect and side effects](../02-implementations/07-useeffect-and-side-effects.md) ·
**Next:** [Geolocation](../02-implementations/11-geolocation-and-permissions-android.md),
[Mobile forms](11-mobile-forms-and-validation.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Custom hook | A function named `use*` that composes built-in hooks |
| Hook rules | Only call hooks at top level, only from React functions |
| Reusable logic | State + effects + handlers extracted from a component |
| Reusable UI | A component — returns JSX, not a hook |
| Call site | The component that invokes the hook and reads its return value |
| Extraction threshold | Enough complexity or reuse to justify a separate module |
| Side-effect hook | Hook that owns `useEffect` — debounce, fetch, permission |
| Form hook | Hook that owns field state, validation, and submit helpers |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  COMPONENT (UI layer)                 CUSTOM HOOK (logic layer)
  ┌─────────────────────┐           ┌─────────────────────┐
  │ LoginScreen         │  calls    │ useLoginForm()      │
  │  - layout           │ ────────► │  - useState fields  │
  │  - KeyboardAvoiding │           │  - validators       │
  │  - AppInput x2      │ ◄──────── │  - validateForm()   │
  │  - Button           │  returns  │                     │
  └─────────────────────┘  values   └─────────────────────┘

  ┌─────────────────────┐           ┌─────────────────────┐
  │ HomeScreen          │  calls    │ useDebounce(text)   │
  │  - SearchBar        │ ────────► │  - useState lagged  │
  │  - FlashList        │ ◄──────── │  - useEffect timer  │
  └─────────────────────┘  debounced└─────────────────────┘

  Rule: component = what to show · hook = how it behaves
```

**Reading the diagram.** Components answer "what appears on screen." Hooks answer "what
state and effects does this feature need?" The split keeps screens readable and lets two
screens share the same behaviour without copy-paste.

The insight: **extract when the logic has a name independent of the layout.** "Login form
behaviour" and "debounced value" are hook-sized ideas. "Green button with padding 16" is not.

---

<a id="component-vs-hook"></a>

## 3 · Component vs hook — the split

```text
  Returns JSX?  ──Yes──►  Component (AppInput, SearchBar)
       │
       No
       │
       Uses useState/useEffect?  ──Yes──►  Custom hook (useLoginForm)
       │
       No
       │
       Pure function, no React?  ──Yes──►  Utility (validators.js)
```

| Layer | Example in repo | Returns |
|-------|-----------------|---------|
| Component | `AppInput` | JSX |
| Hook | `useDebounce` | `{ debouncedValue }` or primitives |
| Hook | `useLoginForm` | state + setters + validators |
| Hook | `useCurrentLocation` | `{ location, loading, error, fetchLocation }` |
| Utility | `isValidEmail` in `validators.js` | boolean / error string |

Hooks may call utilities; components call hooks.

---

<a id="extract-when"></a>

## 4 · When to extract

```text
  STAY INLINE                         EXTRACT TO HOOK
  ───────────                         ───────────────
  one-off useEffect                   used in 2+ screens
  3 lines of useState                 effect + cleanup + state
  tightly bound to this JSX layout    testable behaviour unit
```

**`useDebounce`** — timer logic with cleanup belongs in a hook because the effect lifecycle
is the whole mechanism → [Debouncing](06-debounce-and-throttle.md).

`src/hooks/useDebounce.js`

```javascript
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

**`useLoginForm`** — field state + validation + loading flag, no JSX:

`src/hooks/useLoginForm.js`

```javascript
export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validateEmail = () => { /* ... */ };
  const validatePassword = () => { /* ... */ };
  const validateForm = () => { /* ... */ };

  return {
    email, password, errors, loading,
    setEmail, setPassword, setLoading,
    validateEmail, validatePassword, validateForm,
  };
}
```

**`useCurrentLocation`** — permission request + geolocation + three state flags in one
callable unit → [Permission flow](13-permission-request-flow.md).

The screen stays thin:

`src/screens/LoginScreen.js`

```javascript
const { email, password, errors, loading, setEmail, setPassword, validateForm } =
  useLoginForm();
```

---

<a id="hook-composition"></a>

## 5 · Hooks compose hooks

```text
  useCurrentLocation
        │
        ├── useState (location, loading, error)
        ├── PermissionsAndroid (platform branch)
        └── Geolocation.getCurrentPosition
```

A custom hook is just a function — it can call other hooks and other hooks can call it.
`HomeScreen` composes `useDebounce` inside its own logic without wrapping it again.

Naming must start with `use` so React's rules apply and lint plugins can enforce them.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Debounce hook | `src/hooks/useDebounce.js` | effect + cleanup pattern |
| Form hook | `src/hooks/useLoginForm.js` | state + validation, no JSX |
| Location hook | `src/hooks/useCurrentLocation.js` | permission + fetch bundled |
| Thin screen | `src/screens/LoginScreen.js` | destructures hook, renders layout |
| Context hook | `src/context/AddressContext.js` | `useAddress()` wrapper around `useContext` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [useEffect](../02-implementations/07-useeffect-and-side-effects.md),
  [UI as a function of state](01-ui-as-function-of-state.md)
- **Used by:** [Debouncing](06-debounce-and-throttle.md),
  [Mobile forms](11-mobile-forms-and-validation.md),
  [Geolocation](../02-implementations/11-geolocation-and-permissions-android.md),
  [Permission flow](13-permission-request-flow.md)
- **Contrast with:** HOCs and render props — hooks replaced both for sharing logic
- **Common mistake:** hook that returns JSX — that is a component with extra steps;
  return data and handlers instead
