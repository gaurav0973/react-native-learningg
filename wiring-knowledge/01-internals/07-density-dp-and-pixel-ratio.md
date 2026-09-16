# Density, dp/pt, and PixelRatio

> Why React Native style numbers are logical units, not screen pixels, and how density conversion keeps UI consistent across devices.

**Folder:** 01-internals · **Prerequisites:** — · **Next:** [Safe area and insets](../04-style-patterns/03-safe-area-and-insets.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| dp | Android density-independent pixel — logical layout unit |
| pt | iOS point — logical layout unit equivalent to dp |
| Physical pixel | Actual hardware dot on the screen |
| PixelRatio | RN API returning device density scale (`get()` → 2, 2.75, 3, …) |
| DPI | Dots per inch — hardware measure of pixel density |
| Logical unit | What you write in `StyleSheet` — converted by OS at render time |
| @2x / @3x asset | Image file at 2× or 3× physical pixels for same layout size |
| Yoga | Flexbox layout engine — works in logical units before pixel conversion |
| hairlineWidth | StyleSheet helper using `1 / PixelRatio.get()` for crisp borders |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  YOUR StyleSheet                    LAYOUT                    RENDER
  ┌─────────────────┐               ┌─────────────┐           ┌─────────────┐
  │ width: 100      │──────────────►│ Yoga engine │──────────►│ PixelRatio  │
  │ (logical unit)  │               │ flex layout │           │ × density   │
  └─────────────────┘               │ in dp/pt    │           └──────┬──────┘
                                    └─────────────┘                  │
                                                                     ▼
                                                            Physical pixels on GPU
                                                            (100 × 3 = 300px on 3×)
```

**Reading the diagram.** When you write `width: 100`, you are not requesting 100 hardware pixels. You request 100 **logical** units — dp on Android, pt on iOS. Yoga computes frames in those units first.

PixelRatio is applied at render time: a 3× phone converts `100` logical units into 300 physical pixels so the box appears the same **physical size** as on a 1× device. Images need separate @2x/@3x files because the bitmap must supply enough physical pixels or the OS upscales and blurs.

The insight: **layout numbers describe intent; density converts intent to hardware.**

---

<a id="why-not-px"></a>

## 3 · Why React Native does not use px

```text
  Same "100px" width on different DPI screens

  Low DPI (320)     Medium (460)      High DPI (560)
  ┌────────────┐    ┌──────────┐      ┌────┐
  │            │    │          │      │    │  ← looks different sizes
  └────────────┘    └──────────┘      └────┘

  Same 100 dp/pt → consistent physical size on all devices
```

```jsx
<View style={{ width: 100, height: 100 }} />
```

The bare number `100` is always a logical unit — never write `dp` or `pt` in styles; the platform converts automatically.

---

<a id="pixelratio-api"></a>

## 4 · PixelRatio API

```text
  layoutSize (dp)  ×  PixelRatio.get()  =  physical pixels needed

  Example: 24 × 3 = 72 physical pixels for a 24dp icon on 3× device
```

```javascript
import { PixelRatio } from 'react-native';

const ratio = PixelRatio.get();
// Pixel 5 → ~2.75, Galaxy S24 → 3, iPhone → 3

const physicalPixels = 24 * PixelRatio.get();
```

| Use case | Why PixelRatio |
|---|---|
| Crisp 1px borders | `StyleSheet.hairlineWidth` |
| Custom drawing | Match native pixel grid |
| Image export sizes | Multiply layout size by scale |

Safe area insets and responsive layout build on these units → [Safe area and insets](../04-style-patterns/03-safe-area-and-insets.md), [Responsive dimensions](../04-style-patterns/04-responsive-dimensions-and-assets.md).

---

<a id="retina-assets"></a>

## 5 · @1x, @2x, @3x images

```text
  UI layout size: 24dp icon

  @1x logo.png   → 24×24 px
  @2x logo@2x.png → 48×48 px
  @3x logo@3x.png → 72×72 px

  RN picks best match at runtime — wrong tier → upscale → blur
```

```
assets/
├── logo.png
├── logo@2x.png
└── logo@3x.png
```

| Problem | Fix |
|---|---|
| Blurry icon on 3× phone | Provide @3x asset |
| Only @1x exists | OS stretches 24px to 72px |

---

<a id="dimensions-in-repo"></a>

## 6 · Dimensions API in this repo

Responsive width without CSS media queries — read window size in JS:

`src/components/OfferCarousel.js`

```javascript
import { Dimensions, StyleSheet, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
```

`src/screens/RestaurantScreen.js` uses the same pattern for carousel sizing. This replaces web `@media` queries → [What the platform lacks](08-what-the-platform-lacks.md#no-media-queries).

Root safe area handling uses logical units inside `SafeAreaProvider`:

`index.js`

```javascript
<SafeAreaProvider>
  <App />
</SafeAreaProvider>
```

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Window width for layout | `src/components/OfferCarousel.js` | `Dimensions.get('window').width` |
| Banner carousel width | `src/components/BannerCarousel.js` | `Dimensions.get("window").width` |
| Restaurant carousel | `src/screens/RestaurantScreen.js` | `windowWidth` constant |
| Safe area at root | `index.js` | `SafeAreaProvider` wrapper |
| Flex defaults (column) | All screen layouts | Vertical stacking — see style patterns |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** —
- **Used by:** [Safe area and insets](../04-style-patterns/03-safe-area-and-insets.md), [Responsive dimensions](../04-style-patterns/04-responsive-dimensions-and-assets.md), [Flexbox defaults](../04-style-patterns/01-flexbox-and-layout-defaults.md)
- **Contrast with:** Web CSS px — tied to hardware unless you use rem/em with care
- **Common mistake:** exporting one low-res PNG for all devices — provide @2x/@3x → [Retina assets](#retina-assets)
