# FlashList, recycling, and RefreshControl

> How Foodie renders long scrolling lists efficiently and lets the user pull down to reload restaurant data.

**Folder:** 02-implementations · **Prerequisites:** [ScrollView, FlatList, Image](02-scrollview-flatlist-image.md) · **Next:** [Pagination loops](../03-patterns/09-pagination-loops.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| FlashList | Shopify's drop-in list with stricter sizing rules and cell recycling |
| Recycling | Rebinding an existing native cell to new data instead of creating one |
| estimatedItemSize | Average row height FlashList uses before layout measurement |
| ListHeaderComponent | JSX rendered above the scrollable rows — search, carousels |
| ListEmptyComponent | Placeholder when `data` is an empty array |
| RefreshControl | Native pull-down spinner wired to a JS `onRefresh` callback |
| refreshing | Boolean prop — spinner visible while true |
| onEndReached | Callback fired when user scrolls near the list bottom |
| onEndReachedThreshold | How far from the bottom (0–1) triggers `onEndReached` |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  Pull down ──► RefreshControl ──► onRefresh() ──► setRefreshing(true)
                                                        │
                                                        ▼
                                              fetch / fake delay
                                                        │
                                                        ▼
                                              setRestaurants(newData)
                                              setRefreshing(false)

  FlashList
  ┌──────────────────────────────────────────────┐
  │ ListHeaderComponent (Header, Search, Offers) │
  ├──────────────────────────────────────────────┤
  │ row ◄── recycled cell ──► row ◄── recycle    │
  │ row                                          │
  ├──────────────────────────────────────────────┤
  │ ListFooterComponent (loader)                 │
  └──────────────────────────────────────────────┘
         ▲
         │ onEndReached ──► loadMoreFruits (pagination)
```

**Reading the diagram.** `HomeScreen` is the primary FlashList screen: header content stays outside the virtualized rows via `ListHeaderComponent`, while restaurant cards are the recycled rows.

Pull-to-refresh is three independent steps — pull gesture, async work, UI update — not one magic prop. `FruitExplorerScreen` adds `onEndReached` for client-side pagination.

The insight: **FlashList demands honest row sizing.** Without `estimatedItemSize` on variable-height screens, you get warnings and janky scroll; with it, recycling stays smooth.

---

<a id="flashlist-recycling"></a>

## 3 · FlashList — recycling vs FlatList

```text
  scroll down
     │
     ▼
  row A leaves viewport ──► native view kept ──► rebind to row D data
                                     ▲
                                     └── fewer allocations than FlatList
```

`HomeScreen` wires the main feed:

`src/screens/HomeScreen.js`

```javascript
<FlashList
  data={filteredRestaurants}
  renderItem={renderRestaurant}
  keyExtractor={item => item.id}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  }
  ListHeaderComponent={ /* Header, SearchBar, Categories, Offers */ }
  ListEmptyComponent={ /* empty search state */ }
  contentContainerStyle={styles.contentContainer}
/>
```

`FruitExplorerScreen` adds sizing and infinite scroll:

`src/screens/FruitExplorerScreen.js`

```javascript
<FlashList
  data={visibleFruits}
  renderItem={({ item }) => <FruitCard fruit={item} />}
  keyExtractor={item => item.id.toString()}
  estimatedItemSize={120}
  onEndReached={loadMoreFruits}
  onEndReachedThreshold={0.4}
  ListFooterComponent={<FooterLoader loadingMore={loadingMore} />}
/>
```

`OfferCarousel` uses horizontal FlashList with `snapToInterval` for banner paging — same component, different axis.

---

<a id="pull-to-refresh"></a>

## 4 · RefreshControl — pull, work, hide

```text
  (1) user pulls     refreshing=false → true     spinner appears
  (2) async work     handleRefresh runs
  (3) data updates   setRestaurants(...)
  (4) finish         refreshing=true → false     spinner hides
```

`HomeScreen` simulates a network delay then swaps data:

`src/screens/HomeScreen.js`

```javascript
const handleRefresh = async () => {
  setRefreshing(true);
  await new Promise(resolve => setTimeout(resolve, 2000));
  setRestaurants([...refreshRestaurantData]);
  setRefreshing(false);
};
```

README §9 separates these as three events. The `refreshing` flag must return to `false` even on error — otherwise the spinner sticks forever.

---

<a id="header-and-empty-states"></a>

## 5 · ListHeaderComponent and ListEmptyComponent

```text
  FlashList
  ┌─ ListHeaderComponent ─────────────────────┐
  │  NOT virtualized — always mounted         │
  │  SearchBar, OfferCarousel, section title  │
  ├─ virtualized rows ────────────────────────┤
  │  RestaurantCard × N                       │
  ├─ if data.length === 0 ──────────────────┤
  │  ListEmptyComponent: "No restaurants"     │
  └───────────────────────────────────────────┘
```

Header content scrolls away with the list — unlike a fixed toolbar outside the list. Empty search uses `ListEmptyComponent` while `filteredRestaurants` is `[]` → [Four screen states](../03-patterns/03-four-screen-states.md#empty-inside-loaded).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Main feed + refresh | `src/screens/HomeScreen.js` | `RefreshControl`, `ListHeaderComponent` |
| Pagination footer | `src/screens/FruitExplorerScreen.js` | `onEndReached`, `estimatedItemSize` |
| Horizontal carousel | `src/components/OfferCarousel.js` | `snapToInterval`, horizontal FlashList |
| Cart list | `src/screens/CartScreen.js` | `ListHeaderComponent`, `ListFooterComponent` |
| Address list | `src/screens/AddressScreen.js` | Form in `ListFooterComponent` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [ScrollView, FlatList, Image](02-scrollview-flatlist-image.md)
- **Used by:** [Pagination loops](../03-patterns/09-pagination-loops.md), [Perceived speed](../03-patterns/08-optimistic-updates-and-prefetch.md)
- **Contrast with:** ScrollView + `map` — no recycling, memory grows with array length
- **Common mistake:** Forgetting `estimatedItemSize` on FlashList — scroll jumps and dev warnings
