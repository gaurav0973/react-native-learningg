# Sticky footer CTA and floating components

> How Foodie keeps the cart bar on screen while menus scroll, and why floating UI must sit outside
> the ScrollView.

**Folder:** 04-style-patterns · **Prerequisites:**
[Margin, padding, and positioning](02-margin-padding-and-positioning.md) ·
**Next:** [Skeleton shimmer construction](08-skeleton-shimmer-construction.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Sticky footer | Primary CTA fixed at bottom while content above scrolls |
| Floating component | Overlay UI anchored with absolute positioning |
| Outside scroll | Sibling of ScrollView/FlashList — not a child of it |
| Scroll padding | Extra `paddingBottom` so last items clear the footer |
| Normal flow sibling | Floating bar participates in parent layout as second child |
| Derived totals | Item count and price computed from cart state — not duplicated |
| Side effect placement | README §6 — floating UI uses absolute + outside scroll |
| Logical units | `bottom: 30` is 30dp → [Density](../01-internals/07-density-dp-and-pixel-ratio.md) |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  RestaurantScreen layout

  SafeAreaView (flex: 1)
  ├── ScrollView                    ← scrolls
  │   ├── hero banner
  │   ├── restaurant info
  │   └── menu items
  └── FloatingCartBar (absolute)    ← fixed on screen

  (1) Scroll child holds all scrollable content
  (2) Floating sibling uses position: 'absolute'
  (3) Returns null when cart empty — no ghost bar
  (4) CartScreen variant: CTA inside ListFooterComponent (scrolls to end)
```

**Reading the diagram.** README §6 documents the rule: place floating components **outside**
ScrollView and use `position: 'absolute'`. `RestaurantScreen` is the reference implementation —
menu scrolls; cart bar stays.

Absolute positioning removes the bar from flex flow →
[Margin and positioning](02-margin-padding-and-positioning.md#absolute-positioning). Siblings inside
ScrollView would scroll away; siblings of ScrollView stay pinned to the screen root.

The insight: **sticky UI is a tree-structure decision, not a style trick.** Parent must be the
screen root; floating element must not be nested inside the scroller.

---

<a id="outside-scrollview"></a>

## 3 · Outside ScrollView — tree structure

```text
  WRONG (bar scrolls away)              RIGHT (bar stays)

  ScrollView                            SafeAreaView
  └── menu                              ├── ScrollView → menu
      └── FloatingBar ✗                 └── FloatingBar ✓
```

`src/screens/RestaurantScreen.js`

```javascript
return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <BackgroundImage /* hero */ />
      <RestaurantInfo restaurant={restaurant} />
      <View style={styles.menuSection}>
        {menuData.map(item => (
          <MenuItem key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>

    <FloatingCartBar navigation={navigation} />
  </SafeAreaView>
);
```

`FloatingCartBar` is the **second child** of `SafeAreaView`, not nested in `ScrollView`. That one
indent level is what makes it float.

If the menu section needs bottom clearance so the last item isn't hidden behind the bar, add
`paddingBottom` on `menuSection` or `ScrollView`'s `contentContainerStyle` — Foodie currently
uses `paddingBottom: 30` on `menuSection` only partially; a value matching bar height + inset is
safer.

---

<a id="floating-cart-bar"></a>

## 4 · FloatingCartBar — absolute anchor and conditional render

```text
  cartItems.length === 0  ──►  return null (no bar)
  cartItems.length > 0    ──►  Pressable absolute bottom strip

  ┌────────────────────────────────────────┐
  │ 3 Items          View Cart →           │
  │ ₹450                                   │
  └────────────────────────────────────────┘
    left:20  right:20  bottom:30
```

`src/components/FloatingCartBar.js`

```javascript
if (cartItems.length === 0) {
  return null;
}

return (
  <Pressable
    style={styles.container}
    onPress={() => navigation.navigate('Cart')}
  >
    {/* totals derived from cartItems */}
  </Pressable>
);
```

```javascript
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
```

Totals are derived with `reduce` — not stored separately → aligns with README §6 derived state
principle; same pattern as `CartScreen` bill math.

Combine with safe area: `bottom` should be `insets.bottom + 16`, not bare `30` →
[Safe area and insets](03-safe-area-and-insets.md#floating-ui-insets).

Thumb-zone placement is intentional — bar sits in the easy reach band →
[Touch targets](06-touch-targets-and-thumb-zone.md#thumb-zone).

---

<a id="scroll-padding"></a>

## 5 · Scroll padding — CartScreen footer pattern

```text
  FlashList (CartScreen)
  ├── ListHeaderComponent
  ├── CartItem rows
  └── ListFooterComponent
        ├── BillSummary
        └── checkoutButton  ← scrolls into view at list end

  contentContainerStyle.paddingBottom: 40
```

Not every CTA must float. `CartScreen` embeds checkout in `ListFooterComponent` — user scrolls
through items and lands on the button naturally.

`src/screens/CartScreen.js`

```javascript
ListFooterComponent={
  <>
    <BillSummary /* … */ />
    <Pressable style={styles.checkoutButton} onPress={/* … */}>
      <Text style={styles.checkoutText}>Proceed to Checkout</Text>
    </Pressable>
  </>
}
contentContainerStyle={styles.content}
```

```javascript
content: {
  padding: 20,
  paddingBottom: 40,
},
checkoutButton: {
  paddingVertical: 18,
  borderRadius: 16,
  alignItems: 'center',
  marginTop: 30,
},
```

| Pattern | When to use |
|---------|-------------|
| Floating absolute bar | Persistent summary while browsing long content (menu) |
| List footer CTA | User should review items before checkout (cart) |
| Sticky footer sibling | Full-width bar outside scroll with reserved padding |

Choose floating when the user needs the action **while** scrolling; choose footer when the action
**follows** the content.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Outside scroll pattern | `src/screens/RestaurantScreen.js` | `FloatingCartBar` sibling of `ScrollView` |
| Absolute bar styles | `src/components/FloatingCartBar.js` | `position`, `bottom`, `left`, `right` |
| Empty cart guard | `src/components/FloatingCartBar.js` | `return null` when no items |
| Footer checkout | `src/screens/CartScreen.js` | `ListFooterComponent`, `checkoutButton` |
| Scroll bottom pad | `src/screens/CartScreen.js` | `paddingBottom: 40` on content |
| Menu section pad | `src/screens/RestaurantScreen.js` | `menuSection.paddingBottom: 30` |
| README rule | `README.md` §6 | floating components outside ScrollView |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Margin and positioning](02-margin-padding-and-positioning.md),
  [Safe area and insets](03-safe-area-and-insets.md),
  [Touch targets](06-touch-targets-and-thumb-zone.md),
  [Derived state](../03-patterns/02-derived-state.md)
- **Used by:** [Context and providers](../02-implementations/05-context-and-providers.md) — cart
  state drives bar visibility
- **Contrast with:** FAB (small circular create button) — Foodie uses full-width summary bar for
  cart, not a FAB
- **Common mistake:** Nesting absolute bar inside ScrollView — it scrolls away with content →
  [Margin and positioning](02-margin-padding-and-positioning.md#absolute-positioning)
