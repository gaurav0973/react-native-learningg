# StyleSheet composition without cascade

> How Foodie merges, overrides, and conditionally applies styles when there is no CSS inheritance.

**Folder:** 04-style-patterns · **Prerequisites:**
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md),
[Flexbox defaults](01-flexbox-and-layout-defaults.md) ·
**Next:** [Touch targets and thumb zone](06-touch-targets-and-thumb-zone.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Style object | Plain JS `{ key: value }` map passed to the `style` prop |
| `StyleSheet.create` | Registers styles once; returns opaque IDs for faster native bridge |
| Style array | `[base, override]` — later entries win on conflicting keys |
| Conditional style | Expression like `error && styles.inputError` in an array |
| No cascade | Parent color/font does not flow to children automatically |
| Prop override | Parent passes `containerStyle` to merge at the call site |
| Platform branch | `Platform.select` or `Platform.OS === 'ios'` for per-OS styles |
| Logical units | Style values are dp/pt — not raw px → [Density](../01-internals/07-density-dp-and-pixel-ratio.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  NO CASCADE                         COMPOSITION YOU WRITE

  <View style={parent}>              style={[styles.base, condition && styles.active]}
    <Text>  ← does NOT inherit         rightmost matching key wins
      color from parent
    </Text>
  </View>

  StyleSheet.create({ ... })  ──►  registered once at module load
           │
           ▼
  Applied per-component only — each Text needs its own color
```

**Reading the diagram.** Web CSS inherits `color`, `font-size`, and dozens of other properties from
ancestors. React Native does not →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-css-cascade).

Every `Text` in Foodie sets its own `color`. Every badge sets its own background. If a child should
look different, you pass a style to that child — not to a distant ancestor selector.

Composition replaces cascade: arrays merge objects left to right; conditional entries add or skip
overrides. That manual merging is the entire styling system.

The insight: **StyleSheet.create is for registration; arrays are for overrides.** Neither replaces
the need to style each component explicitly.

---

<a id="style-arrays"></a>

## 3 · Style arrays — later wins

```text
  style={[styles.container, containerStyle]}
           base from component          override from parent

  keys:   backgroundColor  borderRadius  marginVertical
  base:   #FEF3C7           24            20
  prop:   —                  —             0        ← OfferCarousel passes marginVertical: 0
  result: #FEF3C7           24            0
```

`OfferBanner` accepts an optional override from `OfferCarousel`:

`src/components/OfferBanner.js`

```javascript
export function OfferBanner({ title, subtitle, animation, containerStyle }) {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* … */}
    </View>
  );
}
```

`src/components/OfferCarousel.js`

```javascript
banner: {
  marginVertical: 0,
},
// …
<OfferBanner containerStyle={styles.banner} />
```

The carousel zeroes vertical margin because the wrapper already owns `marginVertical: 20` — array
merge avoids duplicating the entire banner style object.

`BackgroundImage` merges three layers — container, passed `style`, and internal layout:

`src/components/BackgroundImage.js`

```javascript
<View style={[styles.container, style]}>
  <Image style={[styles.image, imageStyle]} />
  <View style={[styles.content, contentStyle]}>{children}</View>
</View>
```

`RestaurantCard` passes `contentStyle` to position badges inside the image overlay without
forking `BackgroundImage`.

---

<a id="conditional-styles"></a>

## 4 · Conditional styles — error state without duplication

```text
  style={[styles.input, error && styles.inputError]}
         ─── base ───   ─── only when error truthy ───

  borderColor: #D1D5DB  →  #EF4444 when error
```

`AppInput` toggles border color from validation state:

`src/components/AppInput.js`

```javascript
<TextInput
  ref={ref}
  style={[styles.input, error && styles.inputError]}
  {...props}
/>
```

```javascript
input: {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
},
inputError: {
  borderColor: '#EF4444',
},
```

The same array pattern appears in `OfferCarousel` pagination dots:

`src/components/OfferCarousel.js`

```javascript
style={[styles.dot, currentIndex === index && styles.activeDot]}
```

```javascript
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#D1D5DB',
  marginHorizontal: 4,
},
activeDot: {
  width: 20,
  backgroundColor: '#16A34A',
},
```

Falsy entries in arrays (`false`, `null`, `undefined`) are ignored — no need for ternary objects.

Animated styles merge the same way. `SkeletonCard` combines static and animated layers:

`src/components/SkeletonCard.js`

```javascript
<Animated.View style={[styles.shimmer, animatedStyle]} />
```

Static position/size live in `StyleSheet.create`; transform lives in the animated object because
it changes every frame → [Animated API](../02-implementations/10-animated-api-and-skeleton.md).

---

<a id="stylesheet-create"></a>

## 5 · StyleSheet.create — register once, apply many

```text
  module load
      │
      ▼
  StyleSheet.create({ card, title, line, … })
      │
      ▼
  styles.card  ──► native ID (faster than inline object each render)
```

Foodie keeps styles at the bottom of each component file — co-located with the JSX they dress.

`src/components/FloatingCartBar.js`

```javascript
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // …
});
```

Inline objects in the `style` prop still work but allocate a new object every render. Reserve
inline for truly dynamic values (computed widths, animated transforms). Static appearance belongs
in `StyleSheet.create`.

There is no global stylesheet, no class names, no `:hover` — press feedback uses `Pressable`'s
function form or separate pressed styles, not pseudo-selectors →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-hover).

Platform-specific tweaks would use `Platform.select({ ios: {...}, android: {...} })` — Foodie
does not branch styles by OS yet, but the pattern belongs here when shadow/elevation diverge.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Prop override merge | `src/components/OfferBanner.js` | `[styles.container, containerStyle]` |
| Parent zeroes margin | `src/components/OfferCarousel.js` | `banner: { marginVertical: 0 }` |
| Conditional border | `src/components/AppInput.js` | `error && styles.inputError` |
| Active dot merge | `src/components/OfferCarousel.js` | `activeDot` width override |
| Layered BackgroundImage | `src/components/BackgroundImage.js` | three style array merge points |
| Animated + static | `src/components/SkeletonCard.js` | `[styles.shimmer, animatedStyle]` |
| Badge contentStyle | `src/components/RestaurantCard.js` | `contentStyle={styles.imageContent}` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [What the platform lacks](../01-internals/08-what-the-platform-lacks.md),
  [Core UI primitives](../02-implementations/01-core-ui-primitives.md),
  [Density](../01-internals/07-density-dp-and-pixel-ratio.md)
- **Used by:** [Skeleton shimmer](08-skeleton-shimmer-construction.md),
  [Mobile forms](../03-patterns/11-mobile-forms-and-validation.md)
- **Contrast with:** CSS modules / Tailwind — RN has no build-time class extraction; composition
  is runtime array merge on each component
- **Common mistake:** Setting `color` on a `View` expecting child `Text` to inherit — wrap text in
  `Text` and set color there →
  [What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-css-cascade)
