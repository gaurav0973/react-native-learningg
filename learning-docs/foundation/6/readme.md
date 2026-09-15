<div align="center">

# 📖 Module 6 — Deep Dive Notes
### React Native: Density, PixelRatio, Retina Assets & Safe Areas

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-dp%20·%20pt%20·%20PixelRatio%20·%20@2x%20·%20Safe%20Area-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Density (dp/pt not px), PixelRatio, @2x/@3x, safe areas and notches.
>
> This chapter explains why React Native doesn't use pixels (`px`), and how the same UI looks consistent across hundreds of Android and iPhone devices.

---

<a id="why-react-native-doesnt-use-px"></a>

## 1 · 📐 Why React Native Doesn't Use px

Pixels measure **screen hardware**, not visual size. React Native wants **visual consistency** — so it uses density-independent units instead.

You write:

```jsx
<View style={{ width: 100, height: 100 }} />
```

What does `100` mean?

| Developer assumption | React Native reality |
|---------------------|---------------------|
| 100 pixels | 100 **dp** on Android, 100 **pt** on iOS |

Because pixels are **not** a physical measurement — the same pixel count looks different on every screen density.

```
Same 100px square on different devices

Device          DPI     100 Pixels Looks Like
─────────────────────────────────────────────
Low density     320     Large on screen
Medium density  460     Smaller physically
High density    560     Tiny on screen

Same pixel count → Different physical size
```

> **Key insight:** React Native numbers in `StyleSheet` are **logical layout units**. The OS converts them to physical pixels at render time.

---

<a id="dpi-dots-per-inch"></a>

## 2 · 🔬 DPI — Dots Per Inch

**DPI** = how many physical pixels exist in one inch of screen.

| Higher DPI means | Effect |
|-----------------|--------|
| More pixels per inch | Sharper display |
| Smaller individual pixels | Same layout unit covers more physical pixels |

```
One inch of screen
──────────────────────────────────────
Low DPI (160):   |● ● ● ● ● ● ● ●|        ← fewer, larger pixels
High DPI (480):  |●●●●●●●●●●●●●●●●●●●●●●|  ← many tiny pixels
```

---

<a id="android-dp-vs-ios-pt"></a>

## 3 · 🤖 Android dp vs 🍎 iOS pt

These are **equivalent ideas** on different platforms.

| Platform | Layout unit | Meaning |
|----------|--------------|---------|
| **Android** | `dp` (density-independent pixel) | Logical size independent of screen density |
| **iOS** | `pt` (point) | Logical size independent of Retina scale |
| **React Native** | Plain numbers in styles | Converted automatically per platform |

```
React Native Style:  width: 100

         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    Android OS                  iOS OS
    100 dp                      100 pt
         │                         │
         ▼                         ▼
  Physical pixels            Physical pixels
  (density × 100)            (scale × 100)
```

You never write `dp` or `pt` in React Native styles — the bridge handles conversion.

---

<a id="pixelratio-api"></a>

## 4 · 🔢 PixelRatio API

React Native exposes screen density through `PixelRatio`.

```js
import { PixelRatio } from 'react-native';

const ratio = PixelRatio.get();
console.log(ratio);
```

| Device | `PixelRatio.get()` |
|--------|-------------------|
| Older Android | `1` |
| Pixel 5 | `2.75` |
| Galaxy S24 | `3` |
| iPhone 16 Pro | `3` |

**Common uses:**

| Use case | Why PixelRatio |
|----------|---------------|
| Pixel-perfect borders | `StyleSheet.hairlineWidth` uses `1 / PixelRatio.get()` |
| Image scaling | Calculate physical pixel size from layout size |
| Font scaling | Respect accessibility / system font scale |
| Custom canvas drawing | Match native pixel density |

```js
// Convert 24dp layout size → physical pixels needed
const layoutSize = 24;
const physicalPixels = layoutSize * PixelRatio.get();
// On a 3x device: 24 × 3 = 72 physical pixels
```

---

<a id="retina-images"></a>

## 5 · 🖼️ @1x, @2x, @3x Images

React Native (and iOS/Android) use **multiple resolution assets** for the same layout size.

Suppose your icon appears as **24dp** in the UI:

```
Layout size (what you design):  24dp

Physical pixels needed:
  @1x device  →  24 × 1 = 24px  image
  @2x device  →  24 × 2 = 48px  image
  @3x device  →  24 × 3 = 72px  image
```

**Folder structure (React Native):**

```
assets/
├── logo.png          ← @1x (base)
├── logo@2x.png       ← 2× resolution
└── logo@3x.png       ← 3× resolution
```

React Native picks the correct file automatically based on device density.

---

<a id="why-images-become-blurry"></a>

## 6 · 🌫️ Why Images Become Blurry

```
Only logo.png exists (24px image)
Device PixelRatio = 3
Needs 72 physical pixels
Only has 24 pixels
        │
        ▼
OS scales image up 3×
        │
        ▼
    BLURRY 🔴
```

| Problem | Cause | Fix |
|---------|-------|-----|
| Blurry icon | Single low-res asset on high-density screen | Provide @2x and @3x variants |
| Oversized bundle | Including only @3x for all devices | Use density-specific asset folders |
| Wrong aspect | Asset not square / wrong dimensions | Match exact pixel multiples |

---

<a id="correct-asset-strategy"></a>

## 7 · ✅ Correct Asset Strategy

Multiply your **layout size** by the pixel ratio for each asset tier.

| UI size (dp/pt) | @1x | @2x | @3x |
|-----------------|-----|-----|-----|
| 24dp icon | 24px | 48px | 72px |
| 32dp icon | 32px | 64px | 96px |
| 48dp icon | 48px | 96px | 144px |

```
Design in Figma at 1× layout size
        │
        ▼
Export @1x, @2x, @3x variants
        │
        ▼
Name: icon.png, icon@2x.png, icon@3x.png
        │
        ▼
React Native picks best match at runtime
```

> **Rule:** Always design at **layout size**, export at **physical pixel multiples**.

---

<a id="safe-areas-notches-insets"></a>

## 8 · 📱 Safe Areas, Notches & Insets

Modern phones have notches, Dynamic Island, punch-hole cameras, and gesture navigation bars. Content placed at `top: 0` or `bottom: 0` can be **hidden behind system UI**.

```
┌─────────────────────────┐
│ ▓▓▓ Status Bar / Notch ▓│  ← unsafe (system UI)
├─────────────────────────┤
│                         │
│     SAFE AREA           │  ← your content belongs here
│     (visible + tappable)│
│                         │
├─────────────────────────┤
│ ▓▓ Home Indicator ▓▓▓▓▓ │  ← unsafe (gesture bar)
└─────────────────────────┘
```

**Insets** = padding values for each edge:

| Inset | Protects against |
|-------|-----------------|
| `top` | Status bar, notch, Dynamic Island |
| `bottom` | Home indicator, navigation bar |
| `left` / `right` | Curved edges, landscape notch |

---

<a id="react-native-safe-area-context"></a>

## 9 · 🛡️ react-native-safe-area-context

Hardcoded padding (`paddingTop: 44`) breaks on every new device. Use the safe area provider instead.

```jsx
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// App root (index.js or App.jsx)
<SafeAreaProvider>
  <App />
</SafeAreaProvider>

// Screen level
<SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
  <HomeScreen />
</SafeAreaView>
```

| Approach | Problem |
|----------|---------|
| `paddingTop: 44` | Wrong on Android, wrong on new iPhones |
| `StatusBar.currentHeight` | Android only, doesn't handle notch sides |
| **`SafeAreaView`** | Reads actual device insets at runtime ✅ |

**Hook for custom layouts:**

```js
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
// insets.top, insets.bottom, insets.left, insets.right
```

Use the hook when you need fine-grained control (floating buttons, full-bleed backgrounds with padded content).

---

<a id="figma-to-screen-pipeline"></a>

## 10 · 🎨 Figma to Screen — Responsive Pipeline

> The complete journey from design file to rendered pixels on device.

```
              FIGMA DESIGN SYSTEM
         (Spacing 8/16/24 · Typography · Icons)
                        │
                        ▼
           React Native Styles (dp / pt numbers)
                        │
                        ▼
              Yoga Layout Engine
           (Flexbox → positions & sizes)
                        │
                        ▼
              Logical Dimensions
           (width/height in dp or pt)
                        │
                        ▼
               PixelRatio Applied
        (logical × density = physical px)
                        │
                        ▼
            Safe Area Insets Applied
              top · bottom · left · right
                        │
                        ▼
           Android / iOS GPU Rendering
                        │
                        ▼
              Final Responsive Screen ✅
```

| Stage | Responsibility |
|-------|---------------|
| **Figma** | Design tokens, spacing scale, component sizes |
| **RN Styles** | Translate tokens to `StyleSheet` numbers (dp/pt) |
| **Yoga** | Calculate layout tree (flex, padding, margin) |
| **PixelRatio** | Convert logical sizes → physical pixels |
| **Safe Area** | Push content away from system UI |
| **GPU** | Rasterize and display on screen |

---

<a id="yoga-layout-engine"></a>

## 11 · 🧘 Yoga Layout Engine's Role

React Native uses **Yoga** (a Flexbox engine) to compute layout **before** pixels are calculated.

```
<View style={{ flex: 1, flexDirection: 'row' }}>
  <View style={{ width: 100 }} />   ← Yoga resolves 100dp
  <View style={{ flex: 1 }} />      ← Yoga fills remaining space
</View>
        │
        ▼
Yoga outputs logical frame (x, y, width, height)
        │
        ▼
PixelRatio converts to physical pixels
        │
        ▼
Native views render at correct density
```

> Yoga knows nothing about pixels — it works entirely in **logical units**. Density conversion happens **after** layout.

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 6*

</div>
