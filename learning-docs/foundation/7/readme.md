<div align="center">

# 📖 Module 7 — Deep Dive Notes
### React Native: The Four States of Every Screen

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Loading%20·%20Empty%20·%20Error%20·%20Loaded%20·%20Skeleton-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** The four states of every screen: loading (skeleton), empty, error, loaded.
>
> This is one of the most important UI architecture lessons in React Native. Every production screen — Instagram, Swiggy, Uber, Notion, Spotify, WhatsApp — implements these four states.

---

<a id="why-every-screen-has-four-states"></a>

## 1 · 🎯 Why Every Screen Has Four States

Any screen that fetches data from an API (or local storage) will **always** pass through one of four moments:

| State | User sees | Without it |
|-------|-----------|------------|
| **Loading** | Skeleton / spinner | Blank white screen — feels broken |
| **Empty** | Friendly "nothing here" message | Confusing blank list |
| **Error** | Retry button + message | App silently fails |
| **Loaded** | Actual content | — |

```
What the user experiences without proper states

No Loading  →  White flash, then content pops in (jarring)
No Empty    →  "Is the app broken? Where is my data?"
No Error    →  Infinite spinner or frozen screen
No Loaded   →  Nothing to show even when data arrives
```

> **Key insight:** Users don't judge your API — they judge what they **see on screen**. The four states are how you translate backend reality into a trustworthy UI.

---

<a id="state-machine-thinking"></a>

## 2 · 🔄 State Machine Thinking

Every API-driven screen starts in **loading**. At any given moment, **only one state is visible**. This is called **state machine thinking**.

```
                  USER OPENS SCREEN
                         │
                         ▼
                  START API REQUEST
                         │
                         ▼
                 STATUS = "loading"
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   API SUCCESS      API SUCCESS      API FAILURE
    WITH DATA         NO DATA
        │                │                │
        ▼                ▼                ▼
 STATUS="loaded"   STATUS="empty"   STATUS="error"
```

| Rule | Why |
|------|-----|
| **One state at a time** | Never show skeleton + error + data simultaneously |
| **Mutually exclusive** | `loading` and `loaded` cannot both be true |
| **Deterministic transitions** | API result decides the next state — not random UI logic |
| **Explicit, not implicit** | Use a named status (`'loading'`) instead of inferring from `data.length` alone |

**Bad — implicit, overlapping states:**

```jsx
// ❌ Can show spinner AND list at the same time
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

return (
  <View>
    {loading && <ActivityIndicator />}
    <FlatList data={data} />
  </View>
);
```

**Good — explicit, one state visible:**

```jsx
// ✅ Early return — only one branch renders
if (loading) return <SkeletonScreen />;
if (error) return <ErrorScreen onRetry={refetch} />;
if (data.length === 0) return <EmptyScreen />;
return <LoadedScreen data={data} />;
```

---

<a id="loading-state-skeleton"></a>

## 3 · ⏳ Loading State — Skeleton & Spinners

**Loading** = data is being fetched. The user should see **immediate feedback** that something is happening.

| Pattern | When to use | Example |
|---------|-------------|---------|
| **Skeleton** | List / card layouts — preserves layout shape | Swiggy restaurant cards, Instagram feed |
| **Spinner** | Simple screens, buttons, small areas | "Fetching location…" button |
| **Pull-to-refresh indicator** | Re-fetching while content is already visible | HomeScreen `RefreshControl` |

```
Skeleton vs Spinner

Skeleton                          Spinner
┌─────────────────────┐          ┌─────────────┐
│ ░░░░░░░░░░░░░░░░░░░ │          │             │
│ ░░░░░░░░░░          │          │   ◌ ◌ ◌     │
│ ░░░░░░░░░░░░░░      │          │  Loading…   │
│ ░░░░░░░░░░          │          │             │
└─────────────────────┘          └─────────────┘
  Feels like content               Feels like waiting
  is almost ready                  with no shape hint
```

**Skeleton in Foodie — `FruitExplorerScreen`:**

```jsx
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

The `SkeletonCard` component uses an animated shimmer (`Animated.loop` + `useNativeDriver: true`) to mimic the shape of a real `FruitCard` — so the screen doesn't jump when data arrives.

> **Rule:** Match skeleton shape to real content. A list skeleton for a list screen, a card skeleton for a card grid.

---

<a id="empty-state"></a>

## 4 · 📭 Empty State

**Empty** = API succeeded, but returned **no data** (or filtered results are zero).

| Empty type | Cause | What to show |
|------------|-------|-------------|
| **True empty** | User has no saved addresses, no orders yet | Illustration + CTA ("Add your first address") |
| **Search empty** | Filter returned `[]` but data exists | "No results for 'pizza'" + suggestion |
| **Permission empty** | Location denied, no contacts access | Explain why + link to settings |

```
API Response Evaluation

response.ok && data.length > 0  →  LOADED
response.ok && data.length === 0  →  EMPTY
response.failed  →  ERROR
```

**Two empty patterns in Foodie:**

| Screen | Pattern | Component |
|--------|---------|-----------|
| `AddressScreen` | No saved addresses | `ListEmptyComponent` on `FlashList` |
| `HomeScreen` | Search returns zero matches | `ListEmptyComponent` inside loaded list |

```jsx
// AddressScreen — true empty (no addresses saved)
ListEmptyComponent={
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No Saved Address</Text>
    <Text style={styles.emptyText}>
      Add your first delivery address below.
    </Text>
  </View>
}

// HomeScreen — search empty (data exists, filter returns [])
ListEmptyComponent={
  <View style={styles.emptySearchContainer}>
    <Text style={styles.emptySearchTitle}>No restaurants found</Text>
    <Text style={styles.emptySearchSubtitle}>
      Try searching with another keyword.
    </Text>
  </View>
}
```

> **Key difference:** Search empty happens **inside** the loaded state (header + search bar stay visible). True empty can be a full-screen state or a list placeholder.

---

<a id="error-state"></a>

## 5 · 🔴 Error State

**Error** = API failed, network down, timeout, or unexpected exception.

| What to include | Why |
|----------------|-----|
| **Human-readable message** | "Something went wrong" beats a raw status code |
| **Retry action** | User can recover without killing the app |
| **No data mixed in** | Don't show stale data alongside an error banner (unless intentional) |

```
Error Flow

fetchData()
     │
     ├── try → success → evaluate data → loaded / empty
     │
     └── catch → setError(message) → setLoading(false) → ERROR screen
```

**Pattern in Foodie — `HomeScreen` & `FruitExplorerScreen`:**

```jsx
const [error, setError] = useState(null);

try {
  const fruits = await getAllFruits();
  setAllFruits(fruits);
  setError(null);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
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

**Production upgrade — add retry:**

```jsx
if (error) {
  return (
    <SafeAreaView style={styles.center}>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable onPress={fetchRestaurants}>
        <Text style={styles.retryButton}>Try Again</Text>
      </Pressable>
    </SafeAreaView>
  );
}
```

---

<a id="loaded-state"></a>

## 6 · ✅ Loaded State

**Loaded** = data arrived successfully and there is content to show.

This is the "happy path" — but it only renders **after** loading, error, and empty checks pass.

```
Loaded State Checklist

✅ Data is in state (useState / context / query cache)
✅ Loading flag is false
✅ Error flag is null
✅ List has items (or empty is handled separately)
✅ User can interact — scroll, tap, search, refresh
```

**Foodie — `HomeScreen` loaded state:**

```jsx
return (
  <SafeAreaView style={styles.safeArea}>
    <FlashList
      data={filteredRestaurants}
      renderItem={renderRestaurant}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={/* Header, Search, Categories, Offers */}
      ListEmptyComponent={/* search-empty fallback */}
    />
  </SafeAreaView>
);
```

| Sub-state within Loaded | Trigger | UI |
|------------------------|---------|-----|
| **Refreshing** | Pull-to-refresh | Spinner at top, list stays visible |
| **Loading more** | Scroll to end (`onEndReached`) | Footer spinner (`FooterLoader` in FruitExplorer) |
| **Search filtering** | User types in search bar | Same list, filtered via `useMemo` |

> Loaded is not static — it can have **nested loading indicators** (refresh, pagination) without leaving the loaded state.

---

<a id="complete-screen-lifecycle"></a>

## 7 · 🔁 Complete Screen Lifecycle

This is what actually happens from tap to rendered UI:

```
User Taps "Restaurants"
        │
        ▼
Component Mounts
        │
        ▼
useEffect Runs
        │
        ▼
fetchRestaurants()
        │
        ▼
STATUS = Loading          ← skeleton / spinner shown
        │
        ▼
──────── Waiting for API ────────
        │
        ▼
API Response Arrives
        │
        ▼
Evaluate Response
        │
        ├──────── Success + Data ───────► Loaded
        │
        ├──────── Success + [] ─────────► Empty
        │
        └──────── Failure ──────────────► Error
```

| Phase | State vars | UI branch |
|-------|-----------|-----------|
| Mount | `loading=true`, `error=null`, `data=[]` | Loading |
| Fetching | `loading=true` | Loading (unchanged) |
| Success with data | `loading=false`, `data=[...]` | Loaded |
| Success, no data | `loading=false`, `data=[]` | Empty |
| Failure | `loading=false`, `error="..."` | Error |

**Critical detail — always stop loading in `finally`:**

```jsx
try {
  const data = await fetchRestaurants();
  setRestaurants(data);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);  // ← prevents infinite loading on error
}
```

---

<a id="implementation-pattern-in-react-native"></a>

## 8 · 🛠️ Implementation Pattern in React Native

The standard pattern uses **three state variables** and **early returns**:

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData();
}, []);

// 1. Loading — full screen
if (loading) return <SkeletonScreen />;

// 2. Error — full screen
if (error) return <ErrorScreen message={error} onRetry={fetchData} />;

// 3. Empty — full screen OR ListEmptyComponent
if (data.length === 0) return <EmptyScreen />;

// 4. Loaded — main content
return <ContentScreen data={data} />;
```

**Alternative — single status string (cleaner for complex screens):**

```jsx
const [status, setStatus] = useState('loading'); // 'loading' | 'empty' | 'error' | 'loaded'
const [data, setData] = useState([]);
const [error, setError] = useState(null);

// In fetch:
setStatus('loading');
try {
  const result = await api.getItems();
  if (result.length === 0) setStatus('empty');
  else { setData(result); setStatus('loaded'); }
} catch (e) {
  setError(e.message);
  setStatus('error');
}
```

| Approach | Pros | Cons |
|----------|------|------|
| **Separate booleans** (`loading`, `error`) | Simple, familiar | Easy to create overlapping states |
| **Single `status` string** | Impossible to be loading AND error | Slightly more boilerplate |
| **React Query / TanStack Query** | Handles all four states automatically | Extra dependency |

```
Decision Tree — Which UI to Render?

              status / flags
                    │
         ┌──────────┼──────────┐
         │          │          │
         ▼          ▼          ▼
     loading?     error?    data.length?
         │          │          │
         ▼          ▼          ▼
     SKELETON    ERROR UI    EMPTY UI
                              │
                              ▼ (has data)
                           LOADED UI
```

---

<a id="foodie-app-examples"></a>

## 9 · 🍔 Foodie App — Real Examples

Your Foodie app already implements all four states across multiple screens:

| Screen | Loading | Empty | Error | Loaded |
|--------|---------|-------|-------|--------|
| **HomeScreen** | "Loading Restaurants…" text | Search `ListEmptyComponent` | "Oops!" + message | `FlashList` with cards |
| **FruitExplorerScreen** | 6× `SkeletonCard` shimmer | — (always has fruits) | "Oops!" + message | `FlashList` + pagination |
| **AddressScreen** | Location button spinner | "No Saved Address" | Location error text | Address list + form |

```
Foodie Screen State Map

HomeScreen
├── loading  →  centered "Loading Restaurants..."
├── error    →  centered "Oops!" + error message
└── loaded   →  FlashList
                ├── ListHeaderComponent (search, categories)
                ├── items (restaurant cards)
                └── ListEmptyComponent (search no-match)

FruitExplorerScreen
├── loading  →  6 SkeletonCards (shimmer animation)
├── error    →  centered "Oops!" + error message
└── loaded   →  FlashList + FooterLoader (pagination)

AddressScreen
├── loading  →  location button ActivityIndicator
├── empty    →  ListEmptyComponent ("No Saved Address")
├── error    →  inline location error text
└── loaded   →  address list + add form
```

**What to improve next (production polish):**

| Current | Production upgrade |
|---------|-------------------|
| Text-only loading on HomeScreen | Replace with skeleton cards matching `RestaurantCard` shape |
| No retry button on error | Add `Pressable` "Try Again" calling the fetch function |
| Search empty inside loaded | ✅ Already correct — header stays visible |

---

<a id="interview-questions"></a>

## 10 · 💼 Interview Questions

| Question | Answer |
|----------|--------|
| What are the four states of a screen? | **Loading**, **Empty**, **Error**, **Loaded** |
| Why use skeleton instead of spinner? | Skeleton preserves layout shape — reduces perceived wait time and prevents layout jump |
| What's state machine thinking? | Only one UI state visible at a time; transitions are deterministic based on API result |
| What's the difference between empty and error? | Empty = API succeeded but no data. Error = API failed |
| How do you prevent infinite loading? | Always set `loading=false` in a `finally` block or after both success and catch |
| What's `ListEmptyComponent`? | A FlatList/FlashList prop that renders when `data=[]` — used for empty/search-empty inside loaded state |
| Early return vs nested ternary? | Early return is cleaner — each state gets its own full-screen branch |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 7*

</div>
