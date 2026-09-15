<div align="center">

# 📋 Module 6 — Summary
### React Native Foundation: Density, PixelRatio & Safe Areas

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-dp%20·%20pt%20·%20PixelRatio%20·%20@2x%20·%20Safe%20Area-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 📐 **dp / pt vs px** | Layout units are logical — not physical pixels | [→ readme.md](readme.md#why-react-native-doesnt-use-px) |
| 🔬 **DPI** | Physical pixel density per inch of screen | [→ readme.md](readme.md#dpi-dots-per-inch) |
| 🤖🍎 **Platform Units** | Android = `dp`, iOS = `pt`, RN = plain numbers | [→ readme.md](readme.md#android-dp-vs-ios-pt) |
| 🔢 **PixelRatio** | `PixelRatio.get()` → density multiplier for the device | [→ readme.md](readme.md#pixelratio-api) |
| 🖼️ **Retina Assets** | `@1x`, `@2x`, `@3x` — same layout size, more physical pixels | [→ readme.md](readme.md#retina-images) |
| 🌫️ **Blurry Images** | Single low-res asset scaled up on high-density screens | [→ readme.md](readme.md#why-images-become-blurry) |
| 📱 **Safe Area** | Region safe from notch, status bar, home indicator | [→ readme.md](readme.md#safe-areas-notches-insets) |
| 🛡️ **SafeAreaView** | Runtime insets — never hardcode `paddingTop: 44` | [→ readme.md](readme.md#react-native-safe-area-context) |
| 🎨 **Design Pipeline** | Figma → RN Styles → Yoga → PixelRatio → Safe Area → GPU | [→ readme.md](readme.md#figma-to-screen-pipeline) |

---

## ⚡ Short Notes

> Core one-liners — know these by heart.

| Term | Short Note |
|------|-----------|
| **dp** | Density-independent pixel (Android layout unit) |
| **pt** | Point (iOS layout unit) |
| **DPI** | Dots per inch — physical pixel density |
| **PixelRatio** | Device density multiplier exposed by React Native |
| **@2x / @3x** | Higher-resolution image assets for Retina displays |
| **Safe Area** | Screen region safe from notches and system UI |
| **Insets** | Padding values for top, bottom, left, and right safe areas |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| Why doesn't React Native use pixels? | Pixels vary with screen density — RN uses density-independent units for consistent **physical** sizing |
| What's the difference between **dp** and **px**? | `dp` is a logical layout unit; `px` is a physical screen pixel |
| When do you use **PixelRatio**? | Density-specific calculations, image scaling, pixel-perfect borders, accessibility font scaling |
| Why do **@2x** and **@3x** images exist? | To provide enough physical pixels for high-density screens while keeping the same layout size |
| Why use **react-native-safe-area-context** instead of hardcoded padding? | Every device has different notch, status bar, and home indicator insets |

---

## 🗺️ Responsive Screen Architecture

> From Figma design token to final rendered screen.

```
                FIGMA DESIGN SYSTEM
           Spacing · Typography · Icons · Images
                        │
                        ▼
           React Native Styles (dp / pt)
                        │
                        ▼
               Yoga Layout Engine
                        │
                        ▼
              Logical Dimensions
                        │
                        ▼
               PixelRatio Applied
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

---

## 🧮 Asset Size Cheat Sheet

| UI size | @1x | @2x | @3x |
|---------|-----|-----|-----|
| 24dp icon | 24px | 48px | 72px |
| 32dp icon | 32px | 64px | 96px |
| 48dp icon | 48px | 96px | 144px |

> Multiply layout size × pixel ratio. See [Correct Asset Strategy →](readme.md#correct-asset-strategy)

---

## 🧠 Things You Should Remember Forever

- 📐 Numbers in React Native `StyleSheet` are **dp/pt** — never raw pixels
- 🔢 `PixelRatio.get()` tells you how many physical pixels fit in one layout unit
- 🖼️ Always export **@1x, @2x, @3x** — one low-res asset = blurry UI on modern phones
- 📱 **Safe Area** is not optional on notched devices — use `react-native-safe-area-context`
- 🧘 **Yoga** computes layout in logical units; density conversion happens **after**

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 6*

</div>
