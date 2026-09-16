# SafeAreaView and notch handling

> How Foodie keeps content out of the status bar, notch, and home indicator without hardcoding
> padding that breaks on the next device.

**Folder:** 04-style-patterns · **Prerequisites:**
[Density, dp, and PixelRatio](../01-internals/07-density-dp-and-pixel-ratio.md) ·
**Next:** [Responsive dimensions and assets](04-responsive-dimensions-and-assets.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Safe area | The rectangle of screen that is fully visible and tappable |
| Unsafe zone | Status bar, notch, Dynamic Island, home indicator, gesture bar |
| Inset | Padding value for one edge — top, bottom, left, or right |
| `SafeAreaProvider` | Context wrapper that measures device insets once at app root |
| `SafeAreaView` | View that applies insets as padding on chosen edges |
| `edges` prop | Which sides receive inset padding — e.g. `['top', 'bottom']` |
| `useSafeAreaInsets` | Hook returning `{ top, bottom, left, right }` for manual layouts |
| Logical units | Insets are measured in dp/pt like any other style number → [Density](../01-internals/07-density-dp-and-pixel-ratio.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  index.js
  ┌─────────────────────────────────────────┐
  │  SafeAreaProvider  ← measures insets    │
  │  ┌───────────────────────────────────┐  │
  │  │  App → screens                  │  │
  │  │  ┌─ SafeAreaView (flex: 1) ─────┐ │  │
  │  │  │ ▓▓▓ inset.top (notch) ▓▓▓   │ │  │
  │  │  │  scrollable content         │ │  │
  │  │  │ ▓▓▓ inset.bottom (home) ▓▓▓ │ │  │
  │  │  └─────────────────────────────┘ │  │
  │  └───────────────────────────────────┘  │
  └─────────────────────────────────────────┘

  (1) Provider at root — required before any SafeAreaView works
  (2) SafeAreaView on screens — default Foodie pattern
  (3) Manual insets — for absolute footers (FloatingCartBar gap)
```

**Reading the diagram.** Modern phones draw system UI over your pixels. Content at `top: 0` sits
under the status bar; content at `bottom: 0` sits under the home indicator.

Foodie wraps the entire app in `SafeAreaProvider` at registration time, then wraps each screen in
`SafeAreaView`. That two-layer pattern is box (1) and (2).

Hardcoded `paddingTop: 44` fails across devices because inset sizes vary by model and orientation.
Insets are logical dp/pt values the OS reports at runtime →
[Density](../01-internals/07-density-dp-and-pixel-ratio.md).

The insight: **safe area is not a component choice — it is a measurement pipeline.** Provider
measures; SafeAreaView or the hook applies.

---

<a id="safe-area-provider"></a>

## 3 · SafeAreaProvider at the app root

```text
  AppRegistry.registerComponent
           │
           ▼
  ┌─────────────────┐
  │ SafeAreaProvider│  ← must wrap App before any screen reads insets
  └────────┬────────┘
           ▼
         App.jsx
```

`index.js`

```javascript
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Root() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent(appName, () => Root);
```

Without the provider, `SafeAreaView` renders but insets stay zero — content draws under the notch
with no error. This is a silent misconfiguration worth checking first when safe area "doesn't work."

React Native's built-in `SafeAreaView` from `react-native` is deprecated for cross-platform use.
Foodie uses `react-native-safe-area-context` everywhere, which reads real device insets on both
Android and iOS.

---

<a id="safe-area-view"></a>

## 4 · SafeAreaView on every screen

```text
  HomeScreen / CartScreen / RestaurantScreen — same shape

  SafeAreaView (flex: 1)
  ├── FlashList or ScrollView
  │   └── content
  └── (optional) FloatingCartBar outside scroll
```

Every primary screen follows the same root:

`src/screens/HomeScreen.js`

```javascript
return (
  <SafeAreaView style={styles.safeArea}>
    <FlashList
      // …
    />
  </SafeAreaView>
);
```

`src/screens/CartScreen.js`

```javascript
safeArea: {
  flex: 1,
  backgroundColor: '#FFFFFF',
},
```

Loading and error states also use `SafeAreaView` so centered text is not hidden under the notch:

`src/screens/HomeScreen.js`

```javascript
if (loading) {
  return (
    <SafeAreaView style={styles.center}>
      <Text style={styles.loadingText}>Loading Restaurants...</Text>
    </SafeAreaView>
  );
}
```

`flex: 1` on the safe area root still matters — insets add padding, but the view must expand to
fill the screen for lists and centering to work →
[Flexbox defaults](01-flexbox-and-layout-defaults.md#flex-one).

---

<a id="floating-ui-insets"></a>

## 5 · Floating UI still needs bottom inset

```text
  SafeAreaView
  ├── ScrollView (menu)
  └── FloatingCartBar
        position: absolute
        bottom: 30   ← hardcoded today; should add insets.bottom
```

`SafeAreaView` pads its **direct** children. A sibling placed with `position: 'absolute'` and
`bottom: 30` ignores that padding — it anchors to the SafeAreaView's inner edge, which may still
overlap the home indicator on iPhones with a gesture bar.

`src/components/FloatingCartBar.js`

```javascript
container: {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 30,
  // …
},
```

The fix pattern (not yet applied in this repo) is `useSafeAreaInsets()`:

```javascript
const insets = useSafeAreaInsets();
// bottom: insets.bottom + 16
```

That combines safe area with thumb-zone placement →
[Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md#floating-cart-bar).

Full-bleed hero images on `RestaurantScreen` intentionally draw edge to edge inside the scroll view;
only the back button needs to clear the top inset — another case where the hook beats SafeAreaView
on the whole screen.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Provider at root | `index.js` | `SafeAreaProvider` wrapping `App` |
| Screen wrapper | `src/screens/HomeScreen.js` | `SafeAreaView` on loaded, loading, error |
| Cart screen | `src/screens/CartScreen.js` | `safeArea` with `flex: 1` |
| Restaurant screen | `src/screens/RestaurantScreen.js` | SafeAreaView + scroll + floating bar sibling |
| Inset gap | `src/components/FloatingCartBar.js` | hardcoded `bottom: 30` — candidate for hook |
| Empty state | `src/screens/CartScreen.js` | SafeAreaView + centered `emptyContainer` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Density](../01-internals/07-density-dp-and-pixel-ratio.md),
  [Flexbox defaults](01-flexbox-and-layout-defaults.md)
- **Used by:** [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md),
  [Touch targets](06-touch-targets-and-thumb-zone.md)
- **Contrast with:** Web viewport units — no `100vh`; safe area is device-specific inset data, not
  a CSS env variable (though conceptually similar to `env(safe-area-inset-top)`)
- **Common mistake:** Nesting multiple `SafeAreaView` components and double-applying top padding —
  one safe wrapper per screen is enough →
  [Margin and positioning](02-margin-padding-and-positioning.md)
