# Skeleton cards and shimmer construction

> How Foodie builds loading placeholders from static grey blocks, an absolute shimmer strip, and
> overflow clipping — without a third-party skeleton library.

**Folder:** 04-style-patterns · **Prerequisites:**
[Animated API](../02-implementations/10-animated-api-and-skeleton.md),
[Four screen states](../03-patterns/03-four-screen-states.md) ·
**Next:** —

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Skeleton UI | Placeholder layout mimicking real content while data loads |
| Shimmer | Moving highlight that suggests activity — not frozen grey boxes |
| Placeholder block | Static `View` with fixed height and percentage width |
| Shimmer layer | Absolutely positioned strip animated across the card |
| `Animated.Value` | Driver for shimmer progress — stored in `useRef`, not `useState` |
| Interpolation | Maps animation progress 0→1 to pixel translateX range |
| `useNativeDriver` | Runs transform/opacity on UI thread — required for smooth shimmer |
| `overflow: 'hidden'` | Clips shimmer at card rounded corners |
| Four screen states | Loading shows skeleton; loaded replaces it → [Four screen states](../03-patterns/03-four-screen-states.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  SkeletonCard layers (bottom → top)

  ┌─ card (overflow: hidden, borderRadius: 18) ─────────────┐
  │  ┌ title block ──── 60% width ─┐                         │
  │  ┌ line block ───── 80% width ─┐                         │
  │  ┌ smallLine ────── 45% width ─┐  ← static placeholders │
  │                                                               │
  │     ┌ shimmer strip ──►                                  │  ← Animated.View
  │     translateX -250 → 250, skewX -20deg                  │
  └──────────────────────────────────────────────────────────┘

  (1) Grey blocks suggest text lines — no Text component needed
  (2) Shimmer is absolute, full height, narrow width
  (3) Loop + timing drives infinite sweep
  (4) overflow hidden + borderRadius clip the effect
```

**Reading the diagram.** Skeleton loading belongs to the **loading** branch of the four screen
states pattern. Foodie currently shows a text spinner on `HomeScreen` loading; `SkeletonCard` is
the reusable building block for list-shaped placeholders.

The construction is pure layout + Animated API — no Lottie, no SVG mask. Static blocks establish
shape; one moving semi-transparent white strip sells the illusion.

Style numbers are logical dp → [Density](../01-internals/07-density-dp-and-pixel-ratio.md).
Animation mechanics (loop, native driver, interpolation) live in the Animated implementation note →
[Animated API](../02-implementations/10-animated-api-and-skeleton.md).

The insight: **skeleton is layout; shimmer is one absolutely positioned child with transform.**

---

<a id="placeholder-blocks"></a>

## 3 · Placeholder blocks — fake text without Text

```text
  Real RestaurantCard          SkeletonCard

  ┌─────────────────┐          ┌─────────────────┐
  │ [photo 180px]   │          │ (no image slot  │
  │ Name            │          │  title 60%      │
  │ Cuisine         │          │  line 80%       │
  │ ₹ price         │          │  small 45%      │
  └─────────────────┘          └─────────────────┘
```

`src/components/SkeletonCard.js`

```javascript
return (
  <View style={styles.card}>
    <View style={styles.title} />
    <View style={styles.line} />
    <View style={styles.smallLine} />
    <Animated.View style={[styles.shimmer, animatedStyle]} />
  </View>
);
```

```javascript
card: {
  backgroundColor: '#F3F4F6',
  borderRadius: 18,
  padding: 18,
  marginBottom: 14,
  overflow: 'hidden',
},
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
  borderRadius: 6,
  backgroundColor: '#E5E7EB',
},
smallLine: {
  marginTop: 10,
  height: 16,
  width: '45%',
  borderRadius: 6,
  backgroundColor: '#E5E7EB',
},
```

Two grey tones — `#F3F4F6` card base, `#E5E7EB` blocks — mimic photo card + text hierarchy from
`RestaurantCard`. Percentage widths vary line length so the placeholder doesn't look symmetrically
fake → [Responsive dimensions](04-responsive-dimensions-and-assets.md#percentage-width).

`marginBottom: 14` on the card vs `28` on real cards — tighten when composing skeleton lists to
match feed rhythm.

---

<a id="shimmer-layer"></a>

## 4 · Shimmer layer — loop, interpolate, transform

```text
  shimmerValue: 0 ──────────────── 1  (1200ms loop)
  translateX:  -250 ────────────── 250
  skewX: -20deg  → diagonal streak

  strip starts off-screen left, exits off-screen right
```

Animation setup:

`src/components/SkeletonCard.js`

```javascript
const shimmerValue = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.timing(shimmerValue, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }),
  ).start();
}, [shimmerValue]);

const translateX = shimmerValue.interpolate({
  inputRange: [0, 1],
  outputRange: [-250, 250],
});

const animatedStyle = {
  transform: [{ skewX: '-20deg' }, { translateX }],
};
```

Why `useRef` for `Animated.Value`: updating animation each frame via `useState` would re-render the
component 60 times per second — `useRef` holds the value without render churn →
[Animated API](../02-implementations/10-animated-api-and-skeleton.md).

Why `-250` to `250`: strip must start and finish **outside** the card so the sweep reads as passing
through, not bouncing inside.

Shimmer strip styling:

```javascript
shimmer: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 90,
  backgroundColor: 'rgba(255,255,255,0.35)',
},
```

`top: 0` + `bottom: 0` stretches full card height without explicit height — same absolute fill
pattern as `BackgroundImage` →
[Margin and positioning](02-margin-padding-and-positioning.md#absolute-positioning).

Merge static + animated styles with array syntax →
[StyleSheet composition](05-stylesheet-composition-no-cascade.md#conditional-styles).

---

<a id="overflow-clips-shimmer"></a>

## 5 · Overflow clips shimmer at rounded corners

```text
  borderRadius: 18 + overflow: 'hidden'

  ┌╮ card ╭┐
  │ shimmer sweeps inside │  ← edges clipped to curve
  └╯     ╰┘

  without overflow: shimmer rectangle sticks out square corners
```

`overflow: 'hidden'` on `card` is non-optional. Without it, the skewed white strip draws past the
rounded rect — the card looks broken on the edges.

Same rule applies to `RestaurantCard` images and `MenuItem` action boxes →
[Margin and positioning](02-margin-padding-and-positioning.md#overflow-hidden).

No CSS `box-shadow` shimmer shortcuts — native views don't cascade decorative effects from parents →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md).

**Wiring skeleton into loading state:** map `SkeletonCard` in place of `RestaurantCard` while
`loading === true` on `HomeScreen` — swap the branch in the four-state tree without changing fetch
logic → [Four screen states](../03-patterns/03-four-screen-states.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Full skeleton component | `src/components/SkeletonCard.js` | blocks + shimmer + styles |
| Animated loop | `src/components/SkeletonCard.js` | `Animated.loop` + `timing` |
| Interpolation | `src/components/SkeletonCard.js` | `outputRange: [-250, 250]` |
| useRef for value | `src/components/SkeletonCard.js` | avoids per-frame re-render |
| Percent widths | `src/components/SkeletonCard.js` | `'60%'`, `'80%'`, `'45%'` |
| Loading state (text) | `src/screens/HomeScreen.js` | `loading` branch — candidate for skeleton list |
| Real card shape | `src/components/RestaurantCard.js` | target layout skeleton mimics |
| Pagination dots | `src/components/OfferCarousel.js` | smaller loading indicator pattern |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Animated API](../02-implementations/10-animated-api-and-skeleton.md),
  [Four screen states](../03-patterns/03-four-screen-states.md),
  [StyleSheet composition](05-stylesheet-composition-no-cascade.md),
  [Density](../01-internals/07-density-dp-and-pixel-ratio.md)
- **Used by:** [Optimistic updates](../03-patterns/08-optimistic-updates-and-prefetch.md) —
  skeleton is the honest loading face before stale-while-revalidate
- **Contrast with:** Lottie loading animations — shimmer is lightweight layout + transform; Lottie
  is JSON-driven vector animation → [Lottie](../02-implementations/09-lottie-animations.md)
- **Common mistake:** Forgetting `overflow: 'hidden'` on the card — shimmer bleeds past rounded
  corners → [Margin and positioning](02-margin-padding-and-positioning.md#overflow-hidden)
