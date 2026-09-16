# Lottie — JSON-driven animations

> How Foodie renders lightweight offer-banner animations from JSON instead of GIFs or frame sequences.

**Folder:** 02-implementations · **Prerequisites:** [Core UI primitives](01-core-ui-primitives.md) · **Next:** [FlashList and pull-to-refresh](03-flashlist-and-pull-to-refresh.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Lottie | Renderer that plays After Effects exports stored as JSON |
| LottieView | React Native component from `lottie-react-native` |
| JSON animation | Vector instructions (paths, timing) — not a bitmap sequence |
| autoPlay | Start animation when the component mounts |
| loop | Repeat animation indefinitely |
| source | Local `require('./file.json')` or remote URI |
| lottie-react-native | Native module bridging Lottie player to RN views |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  offers.js
  animation: require('../assets/lottie/….json')
       │
       ▼
  OfferCarousel (FlashList horizontal)
       │
       └── OfferBanner
             ├── Text (title, subtitle)
             └── LottieView source={animation} autoPlay loop
                       │
                       ▼
              native Lottie player renders vectors each frame
```

**Reading the diagram.** Offer data carries both copy and an animation asset reference. `OfferBanner` lays out text on the left and `LottieView` on the right inside a styled `View` — no GIF, no video file.

README §9 contrasts GIF (heavy, raster) vs Lottie (small JSON, infinite scale). The carousel auto-advances every 4s via `setInterval` in `OfferCarousel`, independent of Lottie loop.

The insight: **Lottie is instructions, not pixels.** One JSON file scales to any DPI; a GIF would need multiple sizes.

---

<a id="lottie-vs-gif"></a>

## 3 · Lottie vs GIF — why this repo chose Lottie

```text
        GIF                         Lottie
  frame bitmap sequence         vector + timing JSON
  large file                    kilobytes typical
  fixed resolution              scales cleanly
  jagged on @3x                 sharp everywhere
```

This comparison is conceptual — the repo does not ship GIF banners. Banner imagery in `BannerCarousel` uses static `Image` components; motion promos use Lottie in `OfferCarousel`.

---

<a id="data-and-require"></a>

## 4 · Bundling JSON with require

```text
  src/data/offers.js
  animation: require('../assets/lottie/lottie_banner_testing.json')
       │
       └── Metro bundles JSON; LottieView reads at runtime
```

`src/data/offers.js`

```javascript
export const OFFERS = [
  {
    id: 'offer-1',
    title: '50% OFF',
    subtitle: 'On your first order',
    animation: require('../assets/lottie/lottie_banner_testing.json'),
  },
  {
    id: 'offer-2',
    title: 'FREE DELIVERY',
    subtitle: 'Above ₹199',
    animation: require('../assets/lottie/splash_json.json'),
  },
];
```

Adding a new banner: drop JSON in `src/assets/lottie/`, add an entry to `OFFERS`.

---

<a id="lottieview-component"></a>

## 5 · OfferBanner — LottieView props

```text
  View (row)
  ├── textContainer (flex:1) ── title, subtitle
  └── LottieView 120×120 autoPlay loop
```

`src/components/OfferBanner.js`

```javascript
import LottieView from 'lottie-react-native';

export function OfferBanner({ title, subtitle, animation, containerStyle }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <LottieView source={animation} autoPlay loop style={styles.animation} />
    </View>
  );
}
```

`lottie-react-native` includes native code — install triggers a full rebuild → [Three build loops](../01-internals/05-three-build-loops.md#which-loop).

---

<a id="carousel-context"></a>

## 6 · Lottie inside horizontal FlashList

`OfferCarousel` renders one `OfferBanner` per `OFFERS` item inside horizontal FlashList with snap intervals — see [FlashList](03-flashlist-and-pull-to-refresh.md#flashlist-recycling). Each visible banner's Lottie autoplays independently.

Pause animation when off-screen is an optimization not yet implemented; for two banners the cost is negligible.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| LottieView usage | `src/components/OfferBanner.js` | `source`, `autoPlay`, `loop` |
| Asset references | `src/data/offers.js` | `require` paths |
| JSON assets | `src/assets/lottie/*.json` | Raw animation files |
| Carousel host | `src/components/OfferCarousel.js` | Horizontal list of banners |
| README comparison | `README.md` §9 | GIF vs Lottie table |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Core UI primitives](01-core-ui-primitives.md)
- **Used by:** [OfferCarousel](../02-implementations/03-flashlist-and-pull-to-refresh.md) via `HomeScreen` header
- **Contrast with:** [Animated API](10-animated-api-and-skeleton.md) — hand-rolled motion vs designer-exported JSON
- **Common mistake:** Expecting Metro hot reload for new native Lottie version — rebuild after native dep changes
