# Animated API — Value, timing, loop

> How Foodie fades in restaurant rows and runs infinite skeleton shimmer using React Native's Animated module.

**Folder:** 02-implementations · **Prerequisites:** [Core UI primitives](01-core-ui-primitives.md) · **Next:** [Skeleton shimmer construction](../04-style-patterns/08-skeleton-shimmer-construction.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Animated.Value | Mutable number the animation system drives over time |
| Animated.timing | Animate a value toward `toValue` over `duration` ms |
| Animated.loop | Repeat an animation composition forever |
| Animated.View | View subclass that accepts animated styles |
| useNativeDriver | Run transform/opacity on UI thread — not layout props |
| interpolate | Map input range (0–1) to output range (e.g. translateX) |
| useRef for animation | Hold Animated.Value without re-rendering every frame |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  useRef(Animated.Value(0))
         │
         ▼
  useEffect ──► Animated.timing / Animated.loop
         │              │
         │              └── useNativeDriver: true (opacity, transform)
         ▼
  animatedStyle { opacity } or { transform: [{ translateX }] }
         │
         ▼
  <Animated.View style={animatedStyle}>  ← only this subtree repaints natively
```

**Reading the diagram.** The JS thread kicks off animation once; with `useNativeDriver: true`, the UI thread interpolates frames for opacity and transform. That keeps scroll and typing smooth while shimmer runs.

`HomeScreen` fades cards in; `SkeletonCard` loops a sliding highlight. Layout skeleton construction (gray boxes, overflow) pairs with [Skeleton shimmer](../04-style-patterns/08-skeleton-shimmer-construction.md).

The insight: **never put Animated.Value in useState** — updating it 60×/sec would re-render the whole screen.

---

<a id="animated-value-and-useref"></a>

## 3 · Animated.Value in useRef

```text
  useState(animated)     ✗ re-render every frame
  useRef(Animated.Value) ✓ stable reference, no React re-renders
```

`SkeletonCard`:

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
```

---

<a id="timing-fade-in"></a>

## 4 · Animated.timing — fade-in on HomeScreen

```text
  opacity: 0 ──(600ms)──► opacity: 1
  wrapped around each RestaurantCard row
```

`src/screens/HomeScreen.js`

```javascript
const opacity = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(opacity, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }).start();
}, [opacity]);

const renderRestaurant = ({ item }) => (
  <Animated.View style={{ opacity }}>
    <RestaurantCard restaurant={item} navigation={navigation} />
  </Animated.View>
);
```

One shared opacity value fades all visible rows together — acceptable for a learning demo; per-row stagger would need separate values.

---

<a id="interpolate-shimmer"></a>

## 5 · interpolate — shimmer translateX

```text
  shimmerValue  0 ──────────────── 1
  translateX   -250 ────────────── 250
       │
       └── light strip moves across gray placeholder
```

`src/components/SkeletonCard.js`

```javascript
const translateX = shimmerValue.interpolate({
  inputRange: [0, 1],
  outputRange: [-250, 250],
});

const animatedStyle = {
  transform: [{ skewX: '-20deg' }, { translateX }],
};

<Animated.View style={[styles.shimmer, animatedStyle]} />
```

Parent `View` uses `overflow: 'hidden'` so the strip clips at card edges.

`FruitExplorerScreen` mounts six `SkeletonCard` components while loading — skeleton as loading UI → [Four screen states](../03-patterns/03-four-screen-states.md#early-return-pattern).

---

<a id="native-driver-limits"></a>

## 6 · useNativeDriver — what you can animate

| Property | Native driver |
|---|---|
| `opacity` | yes |
| `transform` (translate, scale, rotate) | yes |
| `width`, `height`, `top` | no — layout on JS thread |

README §10 and inline comments in `SkeletonCard` document the interview-friendly explanation: JS-thread layout animation stutters when JS is busy.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Shimmer loop | `src/components/SkeletonCard.js` | `loop`, `interpolate`, `useNativeDriver` |
| Fade-in list | `src/screens/HomeScreen.js` | `Animated.timing` on opacity |
| Loading placeholders | `src/screens/FruitExplorerScreen.js` | Six skeleton cards while fetching |
| README theory | `README.md` §10 | Three-piece Animated model |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Core UI primitives](01-core-ui-primitives.md), [useEffect](07-useeffect-and-side-effects.md)
- **Used by:** [Skeleton shimmer construction](../04-style-patterns/08-skeleton-shimmer-construction.md)
- **Contrast with:** [Lottie](09-lottie-animations.md) — designer assets vs code-driven motion
- **Common mistake:** Animating `height` with `useNativeDriver: true` — silently ignored or warns in dev
