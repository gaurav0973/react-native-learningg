# ScrollView, FlatList, Image, ImageBackground

> How Foodie scrolls content, renders long lists, and places images — including the overlay pattern for badges on photos.

**Folder:** 02-implementations · **Prerequisites:** [Core UI primitives](01-core-ui-primitives.md) · **Next:** [FlashList and pull-to-refresh](03-flashlist-and-pull-to-refresh.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| ScrollView | Scroll container that mounts **all** children at once |
| FlatList | List component that virtualizes rows — only visible items mount |
| Virtualization | Rendering a window of items plus a small buffer, not the full array |
| renderItem | Function FlatList/FlashList calls per row: `({ item }) => <Row />` |
| keyExtractor | Stable string key per row for reconciliation |
| Image | Displays local (`require`) or remote (`uri`) bitmaps |
| ImageBackground | Deprecated RN component; this repo uses a custom overlay instead |
| resizeMode | How image fills its box: `cover`, `contain`, `stretch`, `center` |
| Dimensions | API returning screen width/height for responsive layouts |
| pagingEnabled | Snap scroll to one page width per gesture — carousel building block |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  SMALL / STATIC                         LARGE / DYNAMIC
  ┌─────────────────┐                   ┌─────────────────┐
  │   ScrollView    │                   │    FlatList     │
  │  map() all rows │                   │  virtualization │
  │  CategoriesRow  │                   │  (legacy path)  │
  │  BannerCarousel │                   └────────┬────────┘
  └────────┬────────┘                            │
           │                                      ▼
           │                              FlashList (current)
           │                              HomeScreen, CartScreen
           ▼
  ┌─────────────────┐
  │  Image / overlay │
  │  BackgroundImage │──► badges on restaurant photos
  └─────────────────┘
```

**Reading the diagram.** The repo uses **ScrollView for short, fixed content** — horizontal category chips and the image banner carousel. When the list can grow (restaurants, cart lines, addresses), the project moved to **FlashList** (covered in the next note); `RestaurantFeed.js` still shows a plain FlashList wired like FlatList.

Images load from `require()` for bundled assets or `{ uri }` for remote URLs. For text on top of a photo, `BackgroundImage` stacks an `Image` with `absoluteFillObject` and a content `View` — functionally the ImageBackground pattern without using that component.

The insight: **choose the scroll primitive by item count.** ScrollView is correct for ~20 static nodes; virtualization is mandatory once the array scales or updates frequently.

---

<a id="scrollview"></a>

## 3 · ScrollView — mount everything, scroll it

```text
  ScrollView (horizontal)
  ┌──── chip ──── chip ──── chip ──── chip ────┐
  └─────────────────────────────────────────────┘
         ▲
         │ all children exist in memory
```

`CategoriesRow` maps data inside a horizontal `ScrollView`:

`src/components/CategoriesRow.js`

```javascript
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.row}
>
  {categories.map(category => (
    <CategoryChip key={category.id} title={category.title} />
  ))}
</ScrollView>
```

`BannerCarousel` combines horizontal scroll with `Dimensions` for full-bleed cards:

`src/components/BannerCarousel.js`

```javascript
const screenWidth = Dimensions.get("window").width;
// …
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {bannerData.map((banner) => (
    <View key={banner.id} style={styles.bannerCard}>
      <Image source={banner.image} style={styles.bannerImage} resizeMode="cover" />
    </View>
  ))}
</ScrollView>
```

`RestaurantScreen` uses vertical `ScrollView` for menu content that is small and static — acceptable because `menuData` is a fixed array.

---

<a id="flatlist-basics"></a>

## 4 · FlatList — virtualization contract

```text
  data[] ──► FlatList
                │
                ├── keyExtractor(item) → stable id
                └── renderItem({ item }) → row component
                         │
                         ▼
              only ~visible rows + buffer mounted
```

README documents the canonical API (the live app prefers FlashList):

```jsx
<FlatList
  data={restaurants}
  renderItem={…}
  keyExtractor={…}
  showsVerticalScrollIndicator={false}
/>
```

`RestaurantFeed.js` shows the same three props on FlashList — the row contract is identical:

`src/components/RestaurantFeed.js`

```javascript
<FlashList
  data={restaurantData}
  renderItem={({ item }) => <RestaurantCard restaurant={item} />}
  keyExtractor={item => item.id}
  showsVerticalScrollIndicator={false}
/>
```

List performance tuning moves to [FlashList](03-flashlist-and-pull-to-refresh.md#flashlist-recycling).

---

<a id="image-and-resizemode"></a>

## 5 · Image — local require vs remote uri

```text
  source={require('./img.png')}     bundled at build time
  source={{ uri: 'https://…' }}     fetched at runtime
           │
           └── resizeMode controls crop vs letterbox
```

Banner images use local `require` via `bannerData`. Restaurant cards pass `restaurant.image` into `BackgroundImage`, which renders:

`src/components/BackgroundImage.js`

```javascript
<Image
  source={source}
  style={[styles.image, imageStyle]}
  resizeMode={resizeMode}
/>
```

Default `resizeMode` is `'cover'` — fills the box, may crop edges. Hero banners on `RestaurantScreen` use `Dimensions.get('window').width` to size the card width responsively → [Responsive dimensions](../04-style-patterns/04-responsive-dimensions-and-assets.md).

---

<a id="background-image-overlay"></a>

## 6 · BackgroundImage — image as container

```text
  View (overflow: hidden)
  ├── Image (absoluteFillObject)  ← full bleed photo
  └── View (absoluteFillObject)   ← children: badges, back button
        ├── ratingBadge
        └── deliveryBadge
```

This is box (6) of the master diagram. `RestaurantCard` places badges inside the overlay:

`src/components/RestaurantCard.js`

```javascript
<BackgroundImage source={restaurant.image} style={styles.image} contentStyle={styles.imageContent}>
  <View style={styles.ratingBadge}>
    <Text style={styles.badgeText}>⭐ {restaurant.rating}</Text>
  </View>
  <View style={styles.deliveryBadge}>
    <Text style={styles.badgeText}>{restaurant.deliveryTime}</Text>
  </View>
</BackgroundImage>
```

`overflow: 'hidden'` on the container clips rounded corners — pairing with [margin, padding, absolute](../04-style-patterns/02-margin-padding-and-positioning.md#overflow-hidden).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Horizontal ScrollView | `src/components/CategoriesRow.js` | `map` inside scroll |
| Image carousel | `src/components/BannerCarousel.js` | `Dimensions`, horizontal scroll |
| Vertical ScrollView | `src/screens/RestaurantScreen.js` | Menu + hero banner |
| List row contract | `src/components/RestaurantFeed.js` | `data`, `renderItem`, `keyExtractor` |
| Image overlay | `src/components/BackgroundImage.js` | Absolute fill layering |
| Responsive width | `src/screens/RestaurantScreen.js` | `windowWidth` for banner |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Core UI primitives](01-core-ui-primitives.md)
- **Used by:** [FlashList and pull-to-refresh](03-flashlist-and-pull-to-refresh.md), [Pagination loops](../03-patterns/09-pagination-loops.md)
- **Contrast with:** ScrollView for 500 restaurant rows — mounts all 500, scroll jank guaranteed
- **Common mistake:** Nesting a vertical FlatList inside a vertical ScrollView — breaks virtualization and scroll gestures
