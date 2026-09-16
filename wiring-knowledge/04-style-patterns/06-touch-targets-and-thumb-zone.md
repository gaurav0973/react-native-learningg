# Touch targets, thumb zone, and reachability

> Why Foodie puts navigation and checkout at the bottom, and how big a Pressable must be before
> fingers stop missing it.

**Folder:** 04-style-patterns · **Prerequisites:**
[Flexbox defaults](01-flexbox-and-layout-defaults.md) ·
**Next:** [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Touch target | The tappable region the OS registers — not always the visible icon |
| 44pt / 48dp rule | iOS minimum 44×44 pt; Android Material minimum 48×48 dp |
| Thumb zone | Bottom third of screen — comfortable one-handed reach |
| Hard zone | Top of screen — requires grip shift or second hand |
| Reachability | Placing primary actions where the thumb naturally lands |
| `hitSlop` | Invisible expansion of a Pressable's tap area without layout change |
| Visual size vs touch size | Icon can be 20dp; target should still be 44–48dp |
| Logical units | Target sizes are dp/pt → [Density](../01-internals/07-density-dp-and-pixel-ratio.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  ONE-HANDED GRIP (right hand)

  ┌─────────────────────────┐
  │  HARD ZONE              │  ← Header profile, back on hero (stretch)
  ├─────────────────────────┤
  │  STRETCH ZONE           │  ← Search, category chips, menu text
  ├─────────────────────────┤
  │  EASY ZONE              │  ← Bottom tabs, FloatingCartBar, checkout
  │  [Home][Fruits][Cart]   │
  └─────────────────────────┘

  (1) Primary nav → bottom tabs (always in easy zone)
  (2) Primary CTA → sticky / floating bottom bars
  (3) Every Pressable → target ≥ 44–48dp (visual can be smaller)
```

**Reading the diagram.** Mobile has no hover and no cursor precision →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-hover).
Fingers are blunt; the OS hit-tests a rectangle, not the glyph shape.

Foodie's architecture follows box (1) and (2): bottom tab navigator for main sections, checkout
and cart actions anchored low. Header actions sit in the hard zone — acceptable for secondary
tasks like profile.

The insight: **design for thumbs, not pixels.** Conversion actions belong in the easy zone; touch
targets must exceed what looks good visually.

---

<a id="thumb-zone"></a>

## 3 · Thumb zone — why bottom tabs and cart bars exist

```text
  Content scrolls in stretch zone     Action stays in easy zone

  RestaurantScreen                  FloatingCartBar
  ┌─────────────────────┐            ┌─────────────────────┐
  │ menu items scroll   │            │ 3 Items  ₹450       │
  │                     │            │      View Cart →    │
  └─────────────────────┘            └─────────────────────┘
                                     bottom: 30 (absolute)
```

Bottom tab navigator (Home / Fruits / Cart / Profile) lives in the system tab bar region — the
most thumb-reachable real estate on the phone.

`FloatingCartBar` keeps cart totals visible while scrolling the menu:

`src/components/FloatingCartBar.js`

```javascript
return (
  <Pressable
    style={styles.container}
    onPress={() => navigation.navigate('Cart')}
  >
    <View>
      <Text style={styles.itemCount}>{totalItems} Items</Text>
      <Text style={styles.price}>₹{totalPrice}</Text>
    </View>
    <Text style={styles.viewCart}>View Cart →</Text>
  </Pressable>
);
```

`CartScreen` places checkout at the list footer — still low on screen after scrolling items:

`src/screens/CartScreen.js`

```javascript
checkoutButton: {
  backgroundColor: '#16A34A',
  paddingVertical: 18,
  borderRadius: 16,
  alignItems: 'center',
  marginTop: 30,
},
```

Destructive actions deliberately stay out of the easy zone — no "clear cart" floating button at
the bottom.

---

<a id="touch-target-size"></a>

## 4 · Touch target size — visual vs tappable

```text
  Profile avatar (GOOD)              MenuItem ADD box (SMALL)

  ┌──────── 48 × 48 ────────┐         ┌── 104 × 40 ──┐
  │         GM              │         │     ADD      │
  └─────────────────────────┘         └──────────────┘
  meets 48dp guideline                below 48dp height
```

`Header` profile button hits the cross-platform target:

`src/components/Header.js`

```javascript
profile: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#FF6B35',
  justifyContent: 'center',
  alignItems: 'center',
},
```

Restaurant hero back/favorite buttons are 42×42 — close to 44pt but slightly under Android's 48dp
recommendation:

`src/screens/RestaurantScreen.js`

```javascript
backButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  justifyContent: 'center',
  alignItems: 'center',
},
```

`MenuItem` action box is 104×40 — wide enough, but 40dp tall misses the 48dp Android guideline:

`src/components/MenuItem.js`

```javascript
actionBox: {
  width: 104,
  height: 40,
  alignSelf: 'center',
},
```

Fix options: increase height to 48, or keep visual size and add `hitSlop` on the `Pressable`.

`FloatingCartBar` uses generous `paddingVertical: 16` plus text — the full bar exceeds minimum
height even though no explicit `minHeight` is set.

---

<a id="hitslop-pattern"></a>

## 5 · hitSlop — expand tap area without layout shift

```text
  Without hitSlop                    With hitSlop on Pressable

       ← 22px text                         ┌─────────────┐
       tiny zone                           │      ←      │  +12 each side
                                           └─────────────┘
```

`hitSlop` adds invisible padding to the touch rect without changing flex layout — ideal for
compact icons in nav bars and list rows.

Foodie's back button is a candidate:

```javascript
<Pressable
  style={styles.backButton}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  onPress={() => navigation.goBack()}
>
  <Text style={styles.icon}>←</Text>
</Pressable>
```

Not yet applied in the repo — documented here as the standard fix for 42dp circular buttons and
small text icons.

Alternative: wrap icon in a 48×48 `Pressable` with `justifyContent: 'center'` — same outcome,
different layout footprint. Choose `hitSlop` when surrounding flex layout cannot absorb extra size.

There is no `:hover` expand — touch feedback is `onPressIn` / opacity on `Pressable`, not pointer
enter events.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| 48×48 profile target | `src/components/Header.js` | `profile` dimensions |
| Hero circle buttons | `src/screens/RestaurantScreen.js` | 42×42 back/favorite — add hitSlop |
| ADD button height | `src/components/MenuItem.js` | 40dp — below Android 48dp |
| Full-width cart bar | `src/components/FloatingCartBar.js` | large Pressable with padding |
| Checkout CTA | `src/screens/CartScreen.js` | `paddingVertical: 18` footer button |
| Empty state CTA | `src/screens/CartScreen.js` | `browseButton` with padding |
| Bottom tabs | `src/navigation/BottomTabs.js` | primary nav in easy zone |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Flexbox defaults](01-flexbox-and-layout-defaults.md),
  [Density](../01-internals/07-density-dp-and-pixel-ratio.md),
  [Core UI primitives](../02-implementations/01-core-ui-primitives.md)
- **Used by:** [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md),
  [Safe area and insets](03-safe-area-and-insets.md),
  [Platform back button](../03-patterns/12-platform-back-button-flow.md)
- **Contrast with:** Web click targets — mouse precision allows smaller buttons; mobile needs
  larger rects and bottom-weighted placement
- **Common mistake:** Shrinking a Pressable to match icon size — expand the target, not just the
  glyph → [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md)
