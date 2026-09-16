# Optimistic updates, prefetch, stale-while-revalidate

> How to make the app feel instant when the network is not — show something immediately,
> update early, and refresh silently in the background.

**Folder:** 03-patterns · **Prerequisites:**
[Four screen states](03-four-screen-states.md) ·
**Next:** [Pagination loops](09-pagination-loops.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology
| Term | Meaning in one line |
|------|---------------------|
| Perceived speed | How fast the app *feels*, not how fast the API responds |
| Never blank | Always show skeleton, cache, or placeholder within ~200 ms |
| Optimistic update | Change UI immediately; confirm or rollback when server responds |
| Prefetch | Start loading the next screen's data before navigation |
| Stale-while-revalidate | Show cached data now; fetch fresh data silently in background |
| Skeleton UI | Placeholder matching final layout — not a generic spinner |
| TTI | Time to Interactive — boot until the app is usable |
| JS thread block | Logic taking > 16 ms drops frames → jank |
| Rollback | Revert optimistic UI if the server rejects the change |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  USER ACTION (tap, open screen, add to cart)
           │
           ▼
  ┌─────────────────┐
  │ NEVER BLANK     │  skeleton / cached / splash
  └────────┬────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  PREFETCH    OPTIMISTIC
  load early   update UI now
     │           │
     │           ├──► server OK ──► keep UI
     │           └──► server fail ─► rollback + error
     │
     ▼
  STALE-WHILE-REVALIDATE
  show cache → silent refresh → swap if changed
           │
           ▼
  App feels instant (even when network is slow)
```

**Reading the diagram.** The top gate is non-negotiable: never show a white screen while
waiting → [Four screen states](03-four-screen-states.md). Prefetch and SWR reduce wait
time before the user asks. Optimistic updates eliminate wait time after the user acts.

The insight: **perceived speed beats real speed.** A 2-second API with a skeleton feels
faster than a 1-second API with a blank screen.

Thread model for jank → [Fabric](../01-internals/11-fabric-render-pipeline.md).

---

<a id="never-blank"></a>

## 3 · Never blank — skeleton first

```text
  BAD                          GOOD
  ───                          ────
  white screen 2s              6 skeleton cards instantly
  content pops in              content replaces placeholders
  layout jumps                 shape already reserved
```

`FruitExplorerScreen` renders skeleton cards during LOADING:

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

Shimmer construction → [Skeleton cards](../04-style-patterns/08-skeleton-shimmer-construction.md).

`HomeScreen` uses text loading — acceptable for a first pass; skeleton would match the
card layout better. Pull-to-refresh keeps content visible while re-fetching:

`src/screens/HomeScreen.js`

```javascript
refreshControl={
  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
}
```

That is stale-while-revalidate in miniature: old list stays, new data swaps in.

---

<a id="optimistic-update"></a>

## 4 · Optimistic update — act now, confirm later

```text
  User taps "Add to Cart"
        │
        ├─(1) setCartItems immediately     ← optimistic
        ├─(2) FloatingCartBar appears
        ├─(3) showCartNotification
        └─(4) (future) API confirm/rollback
```

Foodie's cart is local-first — `addItem` updates state instantly with no waiting:

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

There is no server round-trip yet, so rollback is not implemented — but the *shape* is
optimistic: UI and notification fire on tap, not after a response. When an API arrives,
the pattern becomes: update UI → send request → rollback + toast on failure.

Contrast with [Debouncing](06-debounce-and-throttle.md) — debounce *delays*; optimistic
*pretends success early*.

---

<a id="prefetch-and-swr"></a>

## 5 · Prefetch and stale-while-revalidate

```text
  NAVIGATION                    PREFETCH
  ──────────                    ────────
  tap restaurant                (ideal) fetch menu before tap completes
  mount RestaurantScreen        data already in cache/state
  show loading…                 show content immediately

  HYDRATION = disk SWR on cold start
  ────────────────────────────────────
  show null/splash → read AsyncStorage → render with saved cart
```

**Prefetch** — start `fetchRestaurant(id)` on `onPressIn` or when the item scrolls near
viewport. Not wired in Foodie yet; `RestaurantScreen` loads on mount.

**Stale-while-revalidate** — [Hydration gating](04-hydration-gating-pattern.md) is the
cold-start version: read disk cache, render saved cart, optionally refresh from API in
background.

**HomeScreen fade-in** uses `Animated.timing` with `useNativeDriver: true` so the entrance
animation does not block the JS thread →
[Animated API](../02-implementations/10-animated-api-and-skeleton.md).

---

<a id="playbook"></a>

## 6 · Perceived-speed playbook

| Technique | When | Repo example |
|-----------|------|--------------|
| Skeleton | List first load | `FruitExplorerScreen` |
| Pull-to-refresh SWR | Re-fetch with content visible | `HomeScreen` RefreshControl |
| Optimistic UI | User expects instant feedback | `CartContext.addItem` |
| Debounce | Reduce work during typing | `useDebounce` in HomeScreen |
| Hydration | Instant cart on relaunch | `CartContext` restore |
| Native driver | Animations without jank | HomeScreen fade-in |

Profile before adding `React.memo` — measure re-renders first.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Skeleton loading | `src/screens/FruitExplorerScreen.js` | six `SkeletonCard` |
| Optimistic cart | `src/context/CartContext.js` | immediate `setCartItems` |
| Toast feedback | `src/services/notificationService.js` | `showCartNotification` |
| SWR refresh | `src/screens/HomeScreen.js` | `RefreshControl` + `handleRefresh` |
| Fade-in | `src/screens/HomeScreen.js` | `Animated.timing`, `useNativeDriver` |
| Disk cache | `src/context/CartContext.js` | hydration restore |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Four screen states](03-four-screen-states.md),
  [Hydration gating](04-hydration-gating-pattern.md)
- **Used by:** [Pagination loops](09-pagination-loops.md),
  [Feedback selection](10-feedback-selection.md)
- **Contrast with:** [Debouncing](06-debounce-and-throttle.md) — opposite strategy for
  "network is slow" (delay vs fake early)
- **Common mistake:** optimistic update without rollback path — user sees success that
  silently failed → always surface failure via [Feedback](10-feedback-selection.md)
