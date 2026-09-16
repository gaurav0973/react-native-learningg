# useEffect, dependency arrays, and cleanup

> How Foodie runs code outside the render path — fetching data, timers, notifications, and animations — without corrupting UI state.

**Folder:** 02-implementations · **Prerequisites:** [UI as a function of state](../03-patterns/01-ui-as-function-of-state.md) · **Next:** [axios and apiClient](08-axios-and-api-client.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Side effect | Anything that is not "return JSX from props/state" |
| useEffect | Hook scheduling work after paint, keyed by dependencies |
| Dependency array | List of values that trigger re-run when changed |
| Mount-only effect | `[]` deps — runs once after first render |
| Cleanup function | Return value from effect — runs before re-run and on unmount |
| Effect ordering | React runs previous cleanup before next effect body |
| Stale closure | Effect capturing old state because deps were omitted |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  RENDER (pure: state → JSX)
       │
       ▼
  COMMIT to native
       │
       ▼
  useEffect callbacks (ordered by declaration)
       │
       ├── []        mount: fetch restaurants, init notifications
       ├── [value]   re-run when value changes: debounce timer reset
       └── cleanup   clearTimeout / clearInterval before next run
```

**Reading the diagram.** Components should compute UI synchronously. Network calls, storage writes, timers, and Notifee setup belong in effects so they do not block render.

When dependencies change, React runs the **previous** effect's cleanup first — that ordering powers debouncing → [Debouncing](../03-patterns/06-debounce-and-throttle.md#why-the-cleanup-function-is-the-debounce).

The insight: **the dependency array is a contract.** Lie about deps and you get stale data; omit them entirely and you run after every render.

---

<a id="dependency-array-patterns"></a>

## 3 · Dependency array — three patterns in this repo

```text
  []              mount once        HomeScreen initial fetch
  [value, delay]  when value moves  useDebounce timer
  [cartItems,     when cart OR      CartContext save
   isHydrated]    hydration flips
```

Mount-only fetch in `HomeScreen`:

`src/screens/HomeScreen.js`

```javascript
useEffect(() => {
  const fetchRestaurants = () => {
    setLoading(true);
    setTimeout(() => {
      setRestaurants(restaurantData);
      setLoading(false);
    }, 2000);
  };
  fetchRestaurants();
}, []);
```

App-level notification init:

`App.jsx`

```javascript
useEffect(() => {
  async function initializeNotifications() {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;
    await createNotificationChannels();
    await showWelcomeNotification();
    await scheduleLunchReminder();
  }
  initializeNotifications();
}, []);
```

---

<a id="cleanup-order"></a>

## 4 · Cleanup order — the debounce mechanism

```text
  value changes
       │
       ├─(a) cleanup: clearTimeout(oldTimer)
       │
       └─(b) body: setTimeout(newTimer)
```

`useDebounce`:

`src/hooks/useDebounce.js`

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(value);
  }, delay);

  return () => {
    clearTimeout(timer);
  };
}, [value, delay]);
```

`OfferCarousel` clears its auto-scroll interval on unmount:

`src/components/OfferCarousel.js`

```javascript
useEffect(() => {
  const interval = setInterval(() => { /* scrollToIndex */ }, 4000);
  return () => clearInterval(interval);
}, []);
```

---

<a id="multiple-effects-in-one-provider"></a>

## 5 · Two effects in CartProvider — restore vs save

```text
  Effect A (restore)          Effect B (save)
  runs once on mount          runs on every cartItems change
  sets isHydrated=true        gated: if (!isHydrated) return
```

These must stay **separate effects** with different dependency arrays — merging them would re-fetch from disk on every cart mutation.

See [Hydration gating](../03-patterns/04-hydration-gating-pattern.md) for why the guard exists.

---

<a id="animation-effect"></a>

## 6 · useEffect driving Animated API

`HomeScreen` fades in list rows; `SkeletonCard` starts shimmer loop — both use mount effects with `Animated.timing` / `Animated.loop` → [Animated API](10-animated-api-and-skeleton.md#interpolate-shimmer).

Pattern: create `Animated.Value` in `useRef`, start animation in `useEffect`, depend on the ref's `.current` value.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Mount fetch | `src/screens/HomeScreen.js` | `[]` deps, simulated API |
| Debounce + cleanup | `src/hooks/useDebounce.js` | `clearTimeout` return |
| Restore/save pair | `src/context/CartContext.js` | Two effects, hydration guard |
| App init | `App.jsx` | Async notification setup |
| Carousel interval | `src/components/OfferCarousel.js` | Interval cleanup |
| Fruit load | `src/screens/FruitExplorerScreen.js` | `loadFruits()` on mount |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [UI as a function of state](../03-patterns/01-ui-as-function-of-state.md)
- **Used by:** [Debouncing](../03-patterns/06-debounce-and-throttle.md), [axios client](08-axios-and-api-client.md), [Custom hooks](../03-patterns/07-custom-hook-extraction.md)
- **Contrast with:** Running fetch directly in render body — triggers every render, infinite loops
- **Common mistake:** Empty deps on an effect that reads `searchText` — never sees updated search
