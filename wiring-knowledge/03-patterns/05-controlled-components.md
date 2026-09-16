# Controlled vs uncontrolled inputs

> Why React state must own every TextInput value, and how to keep typing responsive while
> expensive consumers read a delayed copy.

**Folder:** 03-patterns · **Prerequisites:**
[UI as a function of state](01-ui-as-function-of-state.md) ·
**Next:** [Debouncing](06-debounce-and-throttle.md),
[Mobile forms](11-mobile-forms-and-validation.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Controlled input | TextInput whose `value` comes entirely from React state |
| Uncontrolled input | TextInput manages its own text internally — no `value` prop |
| Source of truth | State variable that owns the current text |
| `onChangeText` | Callback that updates state on every keystroke |
| Two-value pattern | Immediate value for the field, delayed value for expensive consumers |
| Lifted state | Input state lives in the parent so siblings can read it |
| Stale closure | Handler captures an old state value — avoided by functional updates |
| Read-only binding | `value` without `onChangeText` — field appears frozen |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  USER TYPES "pizza"
        │
        ▼
  ┌─────────────┐     onChangeText      ┌──────────────┐
  │  TextInput  │ ────────────────────► │ searchText   │  ← immediate (controlled)
  │ value={...} │ ◄──────────────────── │ useState('') │
  └─────────────┘     value prop        └──────┬───────┘
                                               │
                                               │  optional delay
                                               ▼
                                        ┌──────────────┐
                                        │ debouncedSearch│ ← consumer reads this
                                        └──────┬───────┘
                                               │
                                               ▼
                                        filter / API / effect
```

**Reading the diagram.** The TextInput is a display surface, not a storage layer. Every
keystroke flows up through `onChangeText`, updates state, flows back down through `value`.
React always knows the current text — that is what "controlled" means.

The optional second value (`debouncedSearch`) is how you keep the field responsive while
slowing down the expensive reaction → [Debouncing](06-debounce-and-throttle.md#the-timer-reset).
The field reads the immediate value; the filter reads the delayed one.

The insight: **never debounce the field itself.** Debounce the consumer.

---

<a id="the-two-values"></a>

## 3 · The two-value pattern

```text
  searchText (immediate)          debouncedSearch (delayed)
  ─────────────────────           ──────────────────────────
  bound to TextInput value        bound to useMemo filter
  updates every keystroke         updates after quiet period
  user sees letters instantly     filter runs once per pause
```

`HomeScreen` lifts search state and passes it down:

`src/screens/HomeScreen.js`

```javascript
const [searchText, setSearchText] = useState('');
const debouncedSearch = useDebounce(searchText, 300);

// SearchBar gets immediate value
<SearchBar searchText={searchText} setSearchText={setSearchText} />

// Filter reads delayed value
const filteredRestaurants = useMemo(() => {
  const query = debouncedSearch.toLowerCase();
  return restaurants.filter(r => r.name.toLowerCase().includes(query));
}, [restaurants, debouncedSearch]);
```

If you debounced `searchText` itself before binding to `TextInput`, typing would feel laggy
— the displayed text would update 300 ms after each keystroke.

---

<a id="never-debounce-the-field"></a>

## 4 · Never debounce the field

```text
  WRONG                           RIGHT
  ─────                           ─────
  value={debouncedText}           value={searchText}
  onChange → debounce → set       onChange → setSearchText
  user waits to see letters       user sees letters instantly
                                  debounce only the filter input
```

Controlled means the `value` prop and what the user sees are the same object. Inserting
delay between keystroke and `value` breaks the contract.

Login fields follow the same rule — immediate binding, validation on blur:

`src/screens/LoginScreen.js`

```javascript
<AppInput
  value={email}
  onChangeText={setEmail}
  onBlur={validateEmail}
  // ...
/>
```

Validation timing → [Mobile forms](11-mobile-forms-and-validation.md#validation-timing).

---

<a id="search-bar-pattern"></a>

## 5 · Lifted state — SearchBar pattern

```text
  HomeScreen (owns state)
      │
      ├── searchText, setSearchText
      │
      └──► SearchBar (dumb display)
              value={searchText}
              onChangeText={setSearchText}
```

`SearchBar` has no internal state — it is a presentational component:

`src/components/SearchBar.js`

```javascript
export function SearchBar({ searchText, setSearchText }) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for restaurants or food"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.input}
      />
    </View>
  );
}
```

Lifting state to `HomeScreen` lets the same `searchText` feed both the input and the
`useMemo` filter without prop-drilling through intermediate components.

Address form fields in `AddressScreen` keep state local in a `form` object — appropriate
when no sibling needs the half-typed value.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Lifted search | `src/components/SearchBar.js` | `value` + `onChangeText` from props |
| Two-value filter | `src/screens/HomeScreen.js` | `searchText` vs `debouncedSearch` |
| Login fields | `src/screens/LoginScreen.js` | `AppInput` with `value` / `onChangeText` |
| Address form | `src/screens/AddressScreen.js` | local `form` state with `updateField` |
| Hook extraction | `src/hooks/useLoginForm.js` | email/password state owned by hook |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [UI as a function of state](01-ui-as-function-of-state.md),
  [Core UI primitives](../02-implementations/01-core-ui-primitives.md)
- **Used by:** [Debouncing](06-debounce-and-throttle.md),
  [Mobile forms](11-mobile-forms-and-validation.md),
  [Custom hook extraction](07-custom-hook-extraction.md)
- **Contrast with:** uncontrolled inputs (`defaultValue` only) — rare in this repo; controlled
  is the default for anything that triggers search, validation, or submit
- **Common mistake:** debouncing the `value` prop — debounce the consumer →
  [#never-debounce-the-field](#never-debounce-the-field)
