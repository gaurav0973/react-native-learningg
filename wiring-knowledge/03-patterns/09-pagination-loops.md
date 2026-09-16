# Server-side vs client-side pagination

> How to load large lists in chunks — from the server one page at a time, or from a
> local cache with slice math and scroll triggers.

**Folder:** 03-patterns · **Prerequisites:**
[FlashList and pull-to-refresh](../02-implementations/03-flashlist-and-pull-to-refresh.md),
[Four screen states](03-four-screen-states.md) ·
**Next:** [Feedback selection](10-feedback-selection.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Pagination | Loading data in fixed-size chunks instead of all at once |
| Page size | Number of items per chunk — `PAGE_SIZE = 10` in Foodie |
| Server-side pagination | Each scroll requests the next page from the API |
| Client-side pagination | Download all once, reveal slices locally |
| `onEndReached` | FlashList/FlatList callback when user scrolls near the bottom |
| `onEndReachedThreshold` | How far from the bottom (0–1) triggers `onEndReached` |
| Loading more | Secondary loading flag — footer spinner, not full-screen |
| Slice math | `start = page * PAGE_SIZE`, `end = start + PAGE_SIZE` |
| Virtualization | List renders only visible rows — FlashList recycles cells |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  WITHOUT PAGINATION                 WITH PAGINATION
  ┌──────────────────┐              ┌──────────────────┐
  │ fetch ALL 20,000 │              │ fetch page 1 (10)│
  │ download + RAM   │              │ render visible   │
  │ slow launch      │              └────────┬─────────┘
  └──────────────────┘                       │ scroll near end
                                             ▼
                                    ┌──────────────────┐
                                    │ fetch/slice next │
                                    │ append to list   │
                                    └──────────────────┘

  SERVER-SIDE                        CLIENT-SIDE (Foodie fruits)
  GET /items?page=2&limit=10         GET /fruit/all once → allFruits[]
                                     visibleFruits = slice(0, page*SIZE)
                                     scroll → append next slice locally
```

**Reading the diagram.** Pagination trades one big download for many small ones (server) or
one download plus lazy reveal (client). Both keep memory and render work bounded.

Foodie uses **client-side** pagination in `FruitExplorerScreen` — the fruityvice API returns
everything, and the screen slices locally. Server-side would hit `?page=N&limit=10` per scroll.

The insight: **`onEndReached` is a loop trigger, not a fetch by itself.** You still need
guards against double-fires and empty next pages.

---

<a id="client-side-slicing"></a>

## 3 · Client-side — download once, slice on scroll

```text
  allFruits[100]          visibleFruits          page
  ─────────────           ──────────────         ────
  (full cache)     ──►    [0..10)                1
                   ──►    [0..20)                2
                   ──►    [0..30)                3
```

`FruitExplorerScreen` loads everything, then reveals ten at a time:

`src/screens/FruitExplorerScreen.js`

```javascript
const PAGE_SIZE = 10;

const loadFruits = async () => {
  try {
    setLoading(true);
    const fruits = await getAllFruits();
    setAllFruits(fruits);
    setVisibleFruits(fruits.slice(0, PAGE_SIZE));
    setPage(1);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

Initial load uses full-screen skeleton → [Four screen states](03-four-screen-states.md).
Append uses a separate `loadingMore` flag and footer spinner — the list stays visible.

---

<a id="on-end-reached-loop"></a>

## 4 · The `onEndReached` loop

```text
  user scrolls near bottom
        │
        ▼
  onEndReached fires
        │
        ├─ loadingMore? ──Yes──► return (guard)
        ├─ no more items? ──Yes──► return
        │
        ▼
  setLoadingMore(true)
  slice next chunk from allFruits
  append to visibleFruits
  setLoadingMore(false)
```

`src/screens/FruitExplorerScreen.js`

```javascript
const loadMoreFruits = () => {
  if (loadingMore) return;

  const nextPage = page + 1;
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const nextItems = allFruits.slice(start, end);
  if (nextItems.length === 0) return;

  setLoadingMore(true);
  setTimeout(() => {
    setVisibleFruits(previous => [...previous, ...nextItems]);
    setPage(nextPage);
    setLoadingMore(false);
  }, 1000);
};

// FlashList props
onEndReached={loadMoreFruits}
onEndReachedThreshold={0.4}
ListFooterComponent={<FooterLoader loadingMore={loadingMore} />}
```

The `setTimeout` simulates network latency — replace with a real API call for server-side.
`onEndReachedThreshold={0.4}` fires when the user is 40% of a viewport from the bottom.

Throttle rapid scroll events → [Debouncing](06-debounce-and-throttle.md) (leading-edge
guard on `loadingMore` serves a similar purpose here).

---

<a id="server-side-pages"></a>

## 5 · Server-side — when the list is too big to cache

```text
  page=1  GET /restaurants?limit=10  →  [r1..r10]  render
  scroll
  page=2  GET /restaurants?limit=10  →  [r11..r20] append
  scroll
  page=3  GET ...                     →  []         stop (guard)
```

Server-side pattern (not yet in repo — documented in README):

```http
GET /restaurants?page=2&limit=10
```

State shape differs: no `allFruits` cache — only `items[]` and `page` increment. Same
`onEndReached` trigger, but the append calls the API instead of slicing.

| | Client-side | Server-side |
|---|-------------|-------------|
| First fetch | All data | Page 1 only |
| Memory | Holds full cache | Holds loaded pages only |
| Offline | Possible after first fetch | Needs network per page |
| Best when | Small/medium total set | Huge or unbounded sets |

FlashList virtualization →
[FlashList](../02-implementations/03-flashlist-and-pull-to-refresh.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Client pagination | `src/screens/FruitExplorerScreen.js` | `PAGE_SIZE`, slice, append |
| Footer loader | `src/screens/FruitExplorerScreen.js` | `FooterLoader`, `loadingMore` |
| Fruit API | `src/services/fruitService.js` | `getAllFruits()` — full download |
| Carousel dots | `src/components/OfferCarousel.js` | UI pagination dots (different concept) |
| Home list | `src/screens/HomeScreen.js` | no pagination — small static data |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [FlashList](../02-implementations/03-flashlist-and-pull-to-refresh.md),
  [Four screen states](03-four-screen-states.md),
  [axios](../02-implementations/08-axios-and-api-client.md)
- **Used by:** [Optimistic updates](08-optimistic-updates-and-prefetch.md)
- **Contrast with:** [Debouncing](06-debounce-and-throttle.md) — pagination limits data
  volume; debounce limits reaction frequency
- **Common mistake:** no `loadingMore` guard — `onEndReached` fires multiple times and
  duplicates pages → [#on-end-reached-loop](#on-end-reached-loop)
