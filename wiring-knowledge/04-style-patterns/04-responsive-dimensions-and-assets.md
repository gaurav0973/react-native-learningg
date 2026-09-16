# Dimensions API and @2x/@3x assets

> How Foodie sizes carousels to the device width and why blurry images mean missing density assets.

**Folder:** 04-style-patterns · **Prerequisites:**
[Density, dp, and PixelRatio](../01-internals/07-density-dp-and-pixel-ratio.md) ·
**Next:** [StyleSheet composition](05-stylesheet-composition-no-cascade.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| `Dimensions` API | Reads screen/window size in logical dp/pt at JS runtime |
| Window vs screen | Window excludes system bars; screen is full physical display |
| Percentage width | `'100%'` resolves against the parent's computed width |
| Layout size | The dp/pt size you write in StyleSheet — what Yoga uses |
| Physical pixels | Layout size × pixel ratio — what the GPU actually draws |
| `@2x` / `@3x` asset | Image file with 2× or 3× the pixel count for its layout slot |
| `require()` | Bundler picks the best asset scale for the device automatically |
| `resizeMode` | How an image fills its layout box — `cover`, `contain`, etc. |
| No media queries | Breakpoints are JavaScript conditionals, not CSS → [What the platform lacks](../01-internals/08-what-the-platform-lacks.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  Dimensions.get('window').width  ──►  logical width (dp/pt)
           │
           ├─► BANNER_WIDTH = width - 40   (horizontal padding budget)
           │
           ▼
  ┌─────────────────────────────────────────────────────────┐
  │  YOGA assigns frames in logical units                 │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  PixelRatio × layout size = physical pixels needed    │
  │  Asset must supply enough pixels or OS upscales → blur  │
  └─────────────────────────────────────────────────────────┘

  (1) Read width once or subscribe to changes
  (2) Derive component widths from width minus margins
  (3) Match image assets to layout size × density
```

**Reading the diagram.** Responsive layout in Foodie is not `@media` queries — it is JavaScript
reading width and arithmetic on margins →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-media-queries).

`OfferCarousel` reads window width at module load, subtracts horizontal padding, and sizes each
banner. That is box (2).

Images loaded with `require()` resolve to `@2x`/`@3x` variants when present. A 24dp icon needs
72 physical pixels on a 3× device — supply the file or accept blur. Full conversion pipeline →
[Density](../01-internals/07-density-dp-and-pixel-ratio.md).

The insight: **layout numbers and asset pixels are two different units linked by pixel ratio.**

---

<a id="dimensions-api"></a>

## 3 · Dimensions API — carousel width math

```text
  SCREEN_WIDTH = Dimensions.get('window').width
  ┌──────────────────────────────────────────────┐
  │← 20 →│      BANNER_WIDTH = W - 40      │← 20 →│
  └──────────────────────────────────────────────┘
         │← ITEM_SPACING: 12 between banners →│
         SNAP_INTERVAL = BANNER_WIDTH + 12
```

`src/components/OfferCarousel.js`

```javascript
const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - 40;
const ITEM_SPACING = 12;
const SNAP_INTERVAL = BANNER_WIDTH + ITEM_SPACING;
```

The 40 subtracted matches the home screen's `paddingHorizontal: 20` on each side — carousel items
align with the restaurant list below.

FlashList snap props depend on exact item width:

```javascript
bannerContainer: {
  width: BANNER_WIDTH,
  marginRight: ITEM_SPACING,
},
// …
snapToInterval={SNAP_INTERVAL}
snapToAlignment="start"
decelerationRate="fast"
```

`RestaurantScreen` uses the same API for hero banner width:

`src/screens/RestaurantScreen.js`

```javascript
const windowWidth = Dimensions.get('window').width;

banner: {
  height: 200,
  width: windowWidth - 20,
  alignSelf: 'center',
},
```

`Dimensions.get` is a one-time read at module load — it won't update on rotation unless you
re-read or switch to `useWindowDimensions()`. For a portrait-only food app, module-level read is
acceptable; tablet or rotation support needs the hook.

---

<a id="percentage-width"></a>

## 4 · Percentage width — skeleton and cards

```text
  Parent card (padding: 18)
  ┌────────────────────────────────────┐
  │  title   width: '60%'              │
  │  line    width: '80%'              │
  │  small   width: '45%'              │
  └────────────────────────────────────┘
```

Percentages resolve against the parent's **content box** after padding — useful for placeholder
blocks that should look like variable-length text.

`src/components/SkeletonCard.js`

```javascript
title: {
  height: 22,
  width: '60%',
  borderRadius: 6,
  backgroundColor: '#E5E7EB',
},
line: {
  marginTop: 14,
  height: 16,
  width: '80%',
  // …
},
```

`RestaurantCard` uses `width: '100%'` on the hero image so it spans the card regardless of list
padding:

`src/components/RestaurantCard.js`

```javascript
image: {
  height: 180,
  width: '100%',
  borderRadius: 18,
},
```

Percentage height is less reliable in React Native than percentage width — prefer explicit heights
or flex for vertical sizing.

---

<a id="asset-scales"></a>

## 5 · @2x/@3x assets and resizeMode

```text
  Layout slot: 180dp tall image area
  ┌─────────────────────────┐
  │   cover / contain       │
  │   remote uri OR require │
  └─────────────────────────┘

  require('./logo.png')     → bundler picks logo@2x / @3x if present
  source={{ uri: 'https' }} → no automatic scale; server must serve enough px
```

Local restaurant images use `require()` through `BackgroundImage`:

`src/components/BackgroundImage.js`

```javascript
<Image
  source={source}
  style={[styles.image, imageStyle]}
  resizeMode={resizeMode}
/>
```

Default `resizeMode` is `'cover'` — image fills the 180×full-width frame, cropping overflow.
Hero banner on `RestaurantScreen` overrides to `'contain'` for a different crop behavior.

Remote images have no `@2x` sibling — the URL must point to a high-enough resolution or the OS
scales up and softens edges. Local assets should follow:

```
assets/
  icon.png       ← base (@1x)
  icon@2x.png
  icon@3x.png
```

Export rule: multiply layout dp by pixel ratio for each tier →
[Density](../01-internals/07-density-dp-and-pixel-ratio.md#retina-assets).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Window width read | `src/components/OfferCarousel.js` | `SCREEN_WIDTH`, `BANNER_WIDTH`, snap math |
| Banner sizing | `src/screens/RestaurantScreen.js` | `windowWidth - 20` on hero |
| Percent placeholders | `src/components/SkeletonCard.js` | `width: '60%'`, `'80%'`, `'45%'` |
| Full-width image | `src/components/RestaurantCard.js` | `width: '100%'` on card image |
| Image fill | `src/components/BackgroundImage.js` | `absoluteFillObject`, `resizeMode` |
| List horizontal padding | `src/screens/HomeScreen.js` | `paddingHorizontal: 20` — pairs with carousel `- 40` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Density](../01-internals/07-density-dp-and-pixel-ratio.md),
  [What the platform lacks](../01-internals/08-what-the-platform-lacks.md),
  [ScrollView and FlatList](../02-implementations/02-scrollview-flatlist-image.md)
- **Used by:** [Offer carousel wiring](../02-implementations/03-flashlist-and-pull-to-refresh.md),
  [Skeleton shimmer](08-skeleton-shimmer-construction.md)
- **Contrast with:** CSS `vw`/`vh` and `@media` — RN uses JS reads + Flexbox, not viewport units
- **Common mistake:** Using `Dimensions.get` once and expecting rotation updates — use
  `useWindowDimensions()` when orientation changes matter →
  [What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-media-queries)
