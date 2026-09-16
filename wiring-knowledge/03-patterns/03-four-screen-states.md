# The four states of every screen

> The loading / empty / error / loaded pattern every API-driven screen needs, and why
> showing two at once is the most common production bug.

**Folder:** 03-patterns · **Prerequisites:**
[UI as a function of state](01-ui-as-function-of-state.md) ·
**Next:** [Optimistic updates](08-optimistic-updates-and-prefetch.md),
[Skeleton construction](../04-style-patterns/08-skeleton-shimmer-construction.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Loading state | Data is being fetched — show skeleton or spinner immediately |
| Empty state | Request succeeded but returned no items — not an error |
| Error state | Request failed — show message and a retry path |
| Loaded state | Data arrived and renders — the happy path |
| State machine | Only one screen state visible at a time; transitions are deterministic |
| Early return | `if (loading) return <Loading />` — one branch owns the screen |
| `ListEmptyComponent` | FlatList/FlashList prop for empty data inside an already-loaded list |
| `finally` block | Runs after success or failure — always clears loading flags |
| Skeleton | Placeholder UI matching real content shape — not a generic spinner |
| Search-empty | Filter returned zero results while data exists — lives inside loaded |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
                    USER OPENS SCREEN
                           │
                           ▼
                    ┌─────────────┐
                    │  LOADING    │  skeleton / spinner / loading text
                    └──────┬──────┘
                           │  fetch completes (finally: loading=false)
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  ERROR   │ │  EMPTY   │ │  LOADED  │
        │  retry   │ │  CTA msg │ │  content │
        └──────────┘ └──────────┘ └────┬─────┘
                                       │
                                       ▼
                              search/filter → 0 results
                                       │
                                       ▼
                              ListEmptyComponent
                              (still LOADED, not EMPTY)
```

**Reading the diagram.** Every API screen starts at LOADING. The fetch result routes to
exactly one terminal state — never two at once. ERROR means the network or server failed.
EMPTY means success with zero items (no saved addresses yet). LOADED is the happy path.

The nested branch at the bottom is critical: when the user searches and nothing matches, the
screen is still LOADED — the API data exists, the filter just returned zero. That empty
belongs in `ListEmptyComponent`, not a full-screen empty state → see
[Empty inside loaded](#empty-inside-loaded).

The insight: **users judge what they see, not your API.** Missing loading feels broken.
Missing empty feels confusing. Missing error feels like a crash. Missing `finally` means
infinite spinners.

---

<a id="state-machine"></a>

## 3 · State machine — one state at a time

```text
        BEFORE (broken)                 AFTER (correct)
  ┌─────────────────────┐         ┌─────────────────────┐
  │ {loading && spinner}│         │ if (loading) return │
  │ <FlatList data=..> │         │ if (error)   return │
  │                     │         │ return <FlatList /> │
  │ spinner AND list    │         │ exactly one branch  │
  │ visible together    │         │                     │
  └─────────────────────┘         └─────────────────────┘
```

Mutually exclusive flags prevent overlap:

| Rule | Why |
|------|-----|
| `loading` and `loaded` cannot both be true | User sees spinner over data |
| Set `loading=false` in `finally` | Success and failure both exit loading |
| Empty full-screen ≠ search-empty | Different user messages, different fixes |

`FruitExplorerScreen` follows the machine strictly:

`src/screens/FruitExplorerScreen.js`

```javascript
const loadFruits = async () => {
  try {
    setLoading(true);
    const fruits = await getAllFruits();
    setAllFruits(fruits);
    setVisibleFruits(fruits.slice(0, PAGE_SIZE));
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

<a id="early-return-pattern"></a>

## 4 · Early return — the implementation pattern

```text
  component function
        │
        ├─ if (loading) ──► return <SkeletonScreen />
        ├─ if (error)   ──► return <ErrorScreen />
        └─ return <LoadedScreen />   ← only reachable when ready
```

`HomeScreen` uses text loading; `FruitExplorerScreen` uses skeleton cards — both are valid
LOADING states:

`src/screens/FruitExplorerScreen.js`

```javascript
if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    </SafeAreaView>
  );
}
```

Skeleton preserves layout shape → see
[Skeleton construction](../04-style-patterns/08-skeleton-shimmer-construction.md) and
[Animated API](../02-implementations/10-animated-api-and-skeleton.md).

For small inline actions (a location button), a spinner inside the button is enough — the
whole screen does not need a skeleton → `AddressScreen`'s `ActivityIndicator` on the
location button.

---

<a id="empty-inside-loaded"></a>

## 5 · Empty inside loaded — search vs no data

```text
  FULL-SCREEN EMPTY              IN-LIST EMPTY (search)
  API returned []                  API returned data, filter returned []
  ─────────────────              ─────────────────────────
  AddressScreen                  HomeScreen
  ListEmptyComponent             ListEmptyComponent
  "No Saved Address"               "No restaurants found"
  + add form below                 header/search still visible
```

`HomeScreen` only reaches the FlashList after loading and error checks pass — that is
LOADED. When `filteredRestaurants` is empty because of search:

`src/screens/HomeScreen.js`

```javascript
ListEmptyComponent={
  <View style={styles.emptySearchContainer}>
    <Text style={styles.emptySearchTitle}>No restaurants found</Text>
    <Text style={styles.emptySearchSubtitle}>
      Try searching with another keyword.
    </Text>
  </View>
}
```

`CartScreen` uses a full-screen empty when the cart array is genuinely empty — different
message, different CTA ("Browse restaurants").

---

<a id="finally-guard"></a>

## 6 · The `finally` guard

```text
  try ──► success ──► setData(...)
    │
  catch ──► failure ──► setError(...)
    │
  finally ──► setLoading(false)   ← ALWAYS runs
```

Without `finally`, a caught error leaves `loading=true` forever. The user stares at a
spinner with no way out. Every fetch in this repo that sets `loading=true` clears it in
`finally` — `FruitExplorerScreen`, `useCurrentLocation`, `LoginScreen` submit.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Text loading + error | `src/screens/HomeScreen.js` | early returns before FlashList |
| Skeleton loading | `src/screens/FruitExplorerScreen.js` | six `SkeletonCard` placeholders |
| Search-empty | `src/screens/HomeScreen.js` | `ListEmptyComponent` for zero filter results |
| Full empty | `src/screens/CartScreen.js` | empty cart message |
| Address empty | `src/screens/AddressScreen.js` | `ListEmptyComponent` + add form in footer |
| Inline loading | `src/hooks/useCurrentLocation.js` | button spinner, not full screen |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [UI as a function of state](01-ui-as-function-of-state.md),
  [useEffect and side effects](../02-implementations/07-useeffect-and-side-effects.md)
- **Used by:** [Optimistic updates](08-optimistic-updates-and-prefetch.md),
  [Pagination loops](09-pagination-loops.md),
  [Skeleton construction](../04-style-patterns/08-skeleton-shimmer-construction.md)
- **Contrast with:** [Hydration gating](04-hydration-gating-pattern.md) — hydration is a
  fifth transient state before the provider renders children, not a screen fetch state
- **Common mistake:** showing spinner and list simultaneously — use early returns →
  [#state-machine](#state-machine)
