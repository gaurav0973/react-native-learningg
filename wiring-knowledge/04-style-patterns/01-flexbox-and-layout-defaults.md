# Flexbox defaults in React Native

> How Yoga lays out every screen in this app, and why the defaults feel backwards if you come from the web.

**Folder:** 04-style-patterns · **Prerequisites:**
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md) ·
**Next:** [Margin, padding, and positioning](02-margin-padding-and-positioning.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Flexbox | The only layout system React Native exposes — no block/inline/grid |
| Yoga | The native Flexbox engine that turns style objects into frames |
| Main axis | The direction children stack along — controlled by `flexDirection` |
| Cross axis | The perpendicular direction — controlled by `alignItems` |
| `flexDirection` | Which way children flow; default is `column` (top to bottom) |
| `justifyContent` | Distributes space along the **main axis** |
| `alignItems` | Aligns children along the **cross axis** |
| `flex: 1` | Grow to fill remaining space on the main axis |
| `flexShrink` | Whether a child can shrink when space is tight |
| `alignSelf` | Override cross-axis alignment for one child |
| Logical units | Style numbers in dp/pt — converted to physical pixels after layout → [Density](../01-internals/07-density-dp-and-pixel-ratio.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  YOUR StyleSheet (JS objects, no cascade)
  flexDirection · justifyContent · alignItems · flex
           │
           ▼
  ┌────────────────────────────────────────────────────────┐
  │  YOGA LAYOUT ENGINE                                    │
  │  default flexDirection = column  ← opposite of web CSS │
  │  outputs logical frames (x, y, width, height)          │
  └──────────────────────────┬─────────────────────────────┘
                             │  logical units → physical px
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │  NATIVE VIEWS on screen                                │
  └────────────────────────────────────────────────────────┘

  (1) SCREEN ROOT          flex: 1  → fills device height
  (2) COLUMN STACK         children top-to-bottom by default
  (3) ROW WHEN NEEDED      flexDirection: 'row' for side-by-side
  (4) SPACE DISTRIBUTION   justifyContent / alignItems finish layout
```

**Reading the diagram.** Every layout in Foodie passes through Yoga before anything is drawn. Your
style object is the input; Yoga returns frames in logical dp/pt, and the platform converts those to
physical pixels → [Density](../01-internals/07-density-dp-and-pixel-ratio.md).

The load-bearing default is box (2): **React Native stacks vertically by default**. Web CSS stacks
horizontally. That single difference explains most "why are my items in a column?" bugs →
[What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-css-cascade).

The insight this note exists to deliver: **think in columns first, opt into rows.** Mobile screens
are tall; vertical stacking is the natural default. Rows are explicit choices for toolbars, list
rows, and carousels.

---

<a id="default-column"></a>

## 3 · Default column — the web trap

```text
  Web CSS default                React Native default
  flexDirection: row             flexDirection: column

  ┌──── A ──── B ──── C ┐        ┌──────── A ────────┐
  └─────────────────────┘        ├──────── B ────────┤
                                 └──────── C ────────┘
```

This is box (2) of the master diagram. A bare `<View>` with no direction set lays out children
top to bottom — exactly what `HomeScreen` relies on when it nests header, search, categories, and
the restaurant list inside a single scrollable column.

`RestaurantCard` uses the same default for its text block: name, cuisine, price, and offer badge
stack vertically without any `flexDirection` declaration.

`src/components/RestaurantCard.js`

```javascript
content: {
  marginTop: 12,
},
name: {
  fontSize: 20,
  fontWeight: '700',
},
cuisine: {
  color: '#666666',
  marginTop: 4,
},
// … price and offerBadge follow the same column stack
```

If items appear side by side when you expected a stack, you imported a web mental model. Add
`flexDirection: 'column'` explicitly only when debugging — the fix is usually removing an
accidental `row` from a parent.

---

<a id="flex-one"></a>

## 4 · `flex: 1` — owning the screen height

```text
  SafeAreaView (flex: 1)  ← box (1) of master
  ┌──────────────────────────────────────┐
  │  FlashList / ScrollView (flex: 1)    │  fills remaining height
  │  ┌────────────────────────────────┐  │
  │  │  scrollable content            │  │
  │  └────────────────────────────────┘  │
  └──────────────────────────────────────┘
```

`flex: 1` means "take all available space along the main axis." On a screen root whose main axis
is vertical (column), that means full device height.

Every primary screen in Foodie starts this way:

`src/screens/HomeScreen.js`

```javascript
safeArea: {
  flex: 1,
},
```

`src/screens/CartScreen.js`

```javascript
safeArea: {
  flex: 1,
  backgroundColor: '#FFFFFF',
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
```

Without `flex: 1` on the root, the screen may only be as tall as its content — lists won't
scroll correctly and centering layouts collapse to the top.

---

<a id="justify-and-align"></a>

## 5 · `justifyContent` and `alignItems`

```text
  flexDirection: 'row'  →  main axis is horizontal
  ┌──────────────────────────────────────────────┐
  │  justifyContent: space-between               │
  │  ┌──────── leftSection ────────┐  actionBox │
  │  │  flex: 1                     │  104×40   │
  │  └──────────────────────────────┘            │
  │  alignItems: 'center' on cross (vertical)    │
  └──────────────────────────────────────────────┘
```

`justifyContent` distributes along the main axis; `alignItems` aligns on the cross axis. When
`flexDirection` is `row`, main is horizontal and cross is vertical — the pattern used everywhere
a label sits beside an action.

`src/components/MenuItem.js`

```javascript
container: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#EEEEEE',
},
leftSection: {
  flex: 1,
  paddingRight: 20,
},
actionBox: {
  width: 104,
  height: 40,
  alignSelf: 'center',
},
```

`leftSection` gets `flex: 1` so text consumes available width; `actionBox` keeps a fixed width on
the right. `alignSelf: 'center'` vertically centers the action box when description text wraps to
multiple lines.

The same row + space-between pattern appears in `Header` (location left, profile avatar right) and
`FloatingCartBar` (totals left, "View Cart" right).

---

<a id="row-when-needed"></a>

## 6 · Opting into row — toolbars and carousels

```text
  HORIZONTAL SCROLL (CategoriesRow)     OFFER CAROUSEL (OfferCarousel)
  flexDirection implicit in ScrollView   FlashList horizontal + row items
  ┌── chip ── chip ── chip ──►           ┌── banner ── banner ──►
```

Not every side-by-side layout needs `flexDirection: 'row'` on a `View`. Horizontal `ScrollView` and
`FlashList` create their own row flow.

`src/components/OfferBanner.js` — banner content is an explicit row:

```javascript
container: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 18,
},
textContainer: {
  flex: 1,
  marginRight: 12,
},
```

Text takes remaining width; the Lottie animation keeps a fixed 120×120 box on the right. This is
the standard "text + trailing widget" row recipe.

`CategoriesRow` uses `flexGrow: 0` and `flexShrink: 0` on the horizontal scroll container so the
chip row does not expand vertically and steal space from the list below — a flex-shrink guard
worth copying when embedding horizontal strips inside vertical lists.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Screen root `flex: 1` | `src/screens/HomeScreen.js` | `safeArea`, `center` for loading/error |
| Row + space-between | `src/components/Header.js` | `header` style — location vs profile |
| Row list item | `src/components/MenuItem.js` | `container`, `leftSection`, `actionBox` |
| Row banner | `src/components/OfferBanner.js` | `container`, `textContainer`, `animation` |
| Floating bar row | `src/components/FloatingCartBar.js` | `container` with `space-between` |
| Center empty state | `src/screens/CartScreen.js` | `emptyContainer` with `justifyContent: 'center'` |
| Horizontal strip | `src/components/CategoriesRow.js` | `flexGrow: 0` on nested horizontal scroll |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [What the platform lacks](../01-internals/08-what-the-platform-lacks.md),
  [Density](../01-internals/07-density-dp-and-pixel-ratio.md),
  [Core UI primitives](../02-implementations/01-core-ui-primitives.md)
- **Used by:** [Margin and positioning](02-margin-padding-and-positioning.md),
  [Touch targets](06-touch-targets-and-thumb-zone.md),
  [Sticky footer and floating UI](07-sticky-footer-and-floating-ui.md)
- **Contrast with:** Web CSS default `flexDirection: row` — RN defaults to column; always verify
  direction before debugging alignment
- **Common mistake:** Setting `alignItems: 'center'` on a column parent and wondering why a child
  with `width: '100%'` no longer spans the screen — cross-axis centering shrinks children to content
  width → [Margin and positioning](02-margin-padding-and-positioning.md#margin-vs-padding)
