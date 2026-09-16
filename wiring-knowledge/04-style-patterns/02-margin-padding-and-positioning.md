# Margin, padding, absolute, and overflow

> How Foodie separates sibling spacing from inner breathing room, lifts UI out of the scroll flow,
> and clips content at rounded corners.

**Folder:** 04-style-patterns · **Prerequisites:**
[Flexbox defaults](01-flexbox-and-layout-defaults.md) ·
**Next:** [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Margin | Space **outside** a view — pushes siblings apart |
| Padding | Space **inside** a view — pushes content away from its border |
| Normal flow | Default Yoga layout — siblings stack or sit in a row |
| `position: 'absolute'` | Removes a view from flow; positions relative to its parent |
| Containing block | The nearest positioned ancestor that absolute children anchor to |
| `top` / `left` / `right` / `bottom` | Insets from the containing block edges when absolute |
| `overflow: 'hidden'` | Clips children that draw outside the parent's bounds |
| `StyleSheet.absoluteFillObject` | Shorthand for top/left/right/bottom all zero |
| Logical units | Margin and padding numbers are dp/pt, not px → [Density](../01-internals/07-density-dp-and-pixel-ratio.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  NORMAL FLOW (margin between siblings)
  ┌────────── card ──────────┐  marginBottom: 28
  └──────────────────────────┘
  ┌────────── card ──────────┐
  └──────────────────────────┘

  PADDING (inside one box)
  ┌─ padding ─────────────────────────┐
  │  ┌──── content ────┐              │
  │  └─────────────────┘              │
  └───────────────────────────────────┘

  ABSOLUTE (lifted out of flow)          OVERFLOW HIDDEN
  ┌─ parent (relative) ─────────┐      ┌─ rounded card ─────┐
  │  ┌ backButton (absolute)    │      │  shimmer sweeps ──►  │ clips
  │  scroll content continues   │      └──────────────────────┘
  └─────────────────────────────┘
```

**Reading the diagram.** Margin affects **siblings** — `RestaurantCard` uses `marginBottom: 28`
between cards. Padding affects **children inside one box** — `SearchBar` pads the text inside its
grey background.

Absolute positioning is box (3): the element no longer participates in flex layout. Siblings act as
if it isn't there. Foodie uses this for back buttons on hero images and for the floating cart bar.

Overflow hidden is box (4): without it, absolutely positioned shimmer or image bleed would draw
past rounded corners. Layout numbers still pass through Yoga in logical units →
[Density](../01-internals/07-density-dp-and-pixel-ratio.md).

The insight: **margin is for rhythm between components; padding is for internal spacing; absolute
is for overlays; overflow hidden is what makes rounded corners real.**

---

<a id="margin-vs-padding"></a>

## 3 · Margin vs padding

```text
  marginTop on SearchBar.container     padding inside TextInput
  ┌─ screen ─────────────────────┐     ┌─ input background ──────┐
  │       ↕ marginTop: 20        │     │ ↔ padH: 18  text  pad ↔ │
  │  ┌────────────────────────┐  │     └─────────────────────────┘
  │  │ Search field           │  │
  │  └────────────────────────┘  │
  │       ↕ marginBottom: 24     │
  └──────────────────────────────┘
```

`src/components/SearchBar.js`

```javascript
container: {
  marginTop: 20,
  marginBottom: 24,
},
input: {
  backgroundColor: '#F4F4F4',
  borderRadius: 14,
  paddingHorizontal: 18,
  paddingVertical: 14,
  fontSize: 16,
},
```

Margin creates vertical rhythm between the header block and the categories row. Padding makes the
tappable text area feel larger without changing the outer layout footprint.

Card spacing uses margin between list items, not padding on the list:

`src/components/RestaurantCard.js`

```javascript
card: {
  marginBottom: 28,
},
content: {
  marginTop: 12,
},
```

`marginTop` on `content` separates the text block from the image above — still sibling spacing,
just between internal sections rather than between cards.

---

<a id="absolute-positioning"></a>

## 4 · Absolute positioning — overlays on hero images

```text
  BackgroundImage container
  ┌─────────────────────────────────────────┐
  │  Image (absoluteFill)                   │
  │  ┌ backButton ─┐          ┌ favorite ─┐ │
  │  │ top:20      │          │ top:20    │ │
  │  │ left:20     │          │ right:20  │ │
  │  └─────────────┘          └───────────┘ │
  └─────────────────────────────────────────┘
```

`BackgroundImage` stacks an absolutely filled `Image` under an absolutely filled content layer:

`src/components/BackgroundImage.js`

```javascript
image: {
  ...StyleSheet.absoluteFillObject,
  width: '100%',
  height: '100%',
},
content: {
  ...StyleSheet.absoluteFillObject,
},
```

Children placed in `contentStyle` can use absolute coordinates. `RestaurantScreen` pins circular
buttons to the hero banner corners:

`src/screens/RestaurantScreen.js`

```javascript
backButton: {
  position: 'absolute',
  top: 20,
  left: 20,
  backgroundColor: '#FFFFFF',
  width: 42,
  height: 42,
  borderRadius: 21,
  justifyContent: 'center',
  alignItems: 'center',
},
```

Badges on `RestaurantCard` use `alignSelf: 'flex-start'` and `'flex-end'` inside a flex column
with `justifyContent: 'space-between'` — a flex-based alternative to absolute positioning when
the overlay lives inside a flex container rather than on a photo.

There is no CSS `position: fixed` — absolute inside a scrolling parent scrolls with it. For UI
that stays on screen, place it **outside** the scroll view →
[Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md#outside-scrollview).

---

<a id="overflow-hidden"></a>

## 5 · Overflow hidden — clipping rounded corners

```text
  WITHOUT overflow: hidden          WITH overflow: 'hidden'
  ┌╮ rounded card ╭┐                ┌──────────────┐
  │ shimmer bar ───────────────►    │ shimmer ►    │  clipped at edge
  └╯              ╰┘                └──────────────┘
```

React Native does not paint outside a parent's bounds unless you allow it. Rounded corners on a
parent require `overflow: 'hidden'` (or `borderRadius` on the clipping view) so children respect
the curve.

`src/components/BackgroundImage.js`

```javascript
container: {
  overflow: 'hidden',
},
```

`src/components/MenuItem.js` — counter buttons clip to the bordered action box:

```javascript
actionBox: {
  width: 104,
  height: 40,
  borderWidth: 1,
  borderColor: '#16A34A',
  borderRadius: 10,
  overflow: 'hidden',
},
```

`SkeletonCard` combines `borderRadius: 18` with `overflow: 'hidden'` so the shimmer bar cannot
bleed past the card edge → [Skeleton shimmer](08-skeleton-shimmer-construction.md#overflow-clips-shimmer).

No CSS cascade means overflow is never inherited from a parent — each clipping boundary must be
declared on the view that owns the rounded rect →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Margin rhythm | `src/components/SearchBar.js` | `marginTop` / `marginBottom` on container |
| Inner padding | `src/components/SearchBar.js` | `paddingHorizontal` / `paddingVertical` on input |
| Card spacing | `src/components/RestaurantCard.js` | `marginBottom: 28`, `marginTop: 12` |
| Absolute overlay | `src/screens/RestaurantScreen.js` | `backButton`, `favoriteButton` |
| absoluteFill pattern | `src/components/BackgroundImage.js` | `image` and `content` layers |
| Overflow clip | `src/components/MenuItem.js` | `actionBox` with `overflow: 'hidden'` |
| List content inset | `src/screens/HomeScreen.js` | `contentContainer.paddingHorizontal: 20` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Flexbox defaults](01-flexbox-and-layout-defaults.md),
  [Density](../01-internals/07-density-dp-and-pixel-ratio.md)
- **Used by:** [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md),
  [Skeleton shimmer](08-skeleton-shimmer-construction.md),
  [Safe area and insets](03-safe-area-and-insets.md)
- **Contrast with:** Web `position: fixed` — RN has no fixed; absolute overlays scroll unless
  placed outside the scroller
- **Common mistake:** Applying `margin` expecting it to inset content inside a colored box — that
  is `padding`. Margin pushes **away** neighboring views, not inward →
  [Flexbox defaults](01-flexbox-and-layout-defaults.md#justify-and-align)
