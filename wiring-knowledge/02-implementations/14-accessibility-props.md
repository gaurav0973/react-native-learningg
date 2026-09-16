# Accessibility props and the accessibility tree

> How React Native exposes screen-reader labels and roles on primitives — and where Foodie should wire them next.

**Folder:** 02-implementations · **Prerequisites:** [Core UI primitives](01-core-ui-primitives.md) · **Next:** [Touch targets](../04-style-patterns/06-touch-targets-and-thumb-zone.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Accessibility tree | Parallel hierarchy VoiceOver/TalkBack traverse |
| accessibilityLabel | Spoken name when the element has no visible text |
| accessibilityHint | Short phrase describing what happens on activate |
| accessibilityRole | Semantic type: button, header, image, searchbox |
| accessible | When true, groups children into one screen-reader focus |
| accessibilityState | `{ disabled, selected, checked }` announced to user |
| Screen reader | TalkBack (Android) / VoiceOver (iOS) — not visual UI |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  Visual tree (View/Text/Pressable)     Accessibility tree
  ┌─────────────────────────┐          ┌─────────────────────────┐
  │ Pressable               │   ──►    │ role: button            │
  │   Text "ADD"            │          │ label: "Add Margherita" │
  └─────────────────────────┘          │ hint: "Adds to cart"    │
                                         └─────────────────────────┘
                                                    │
                                                    ▼
                                         TalkBack / VoiceOver speech
```

**Reading the diagram.** React Native mirrors your component tree into an accessibility tree consumed by OS screen readers. Props on `Pressable`, `Text`, and `TextInput` annotate that mirror — they do not change visual layout.

**This repo has not yet added accessibility props in `src/`** — buttons like `MenuItem`'s ADD and icon-only back arrows are invisible to TalkBack without labels. This note defines the API and maps each prop to existing components that need it.

The insight: **if a sighted user sees icon-only UI, a blind user hears silence** unless you set `accessibilityLabel`.

---

<a id="pressable-and-buttons"></a>

## 3 · Pressable — label, role, state

```text
  Pressable (no visible text, only "←")
       │
       └── accessibilityLabel="Go back"
           accessibilityRole="button"
```

`RestaurantScreen` back control is icon-only today:

`src/screens/RestaurantScreen.js`

```javascript
<Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
  <Text style={styles.icon}>←</Text>
</Pressable>
```

Recommended wiring (not yet in repo):

```javascript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Go back"
  onPress={() => navigation.goBack()}
>
```

`MenuItem` quantity steppers should expose labels like `"Decrease quantity"` / `"Increase quantity"` and `accessibilityState={{ disabled: false }}` when at minimum.

---

<a id="textinput-and-forms"></a>

## 4 · TextInput and AppInput — searchbox and fields

```text
  SearchBar TextInput
       │
       ├── accessibilityLabel="Search restaurants"
       └── accessibilityRole="search"   (maps to searchbox semantics)
```

`SearchBar` has placeholder text but no explicit label:

`src/components/SearchBar.js`

```javascript
<TextInput
  placeholder="Search for restaurants or food"
  value={searchText}
  onChangeText={setSearchText}
  // accessibilityLabel="Search restaurants"
/>
```

`AppInput` already renders a visible `<Text>{label}</Text>` — link it to the field:

`src/components/AppInput.js`

```javascript
<TextInput
  ref={ref}
  accessibilityLabel={label}
  accessibilityHint={helperText}
  // …
/>
```

Form patterns → [Mobile forms](../03-patterns/11-mobile-forms-and-validation.md).

---

<a id="grouping-and-headers"></a>

## 5 · Grouping — accessible and headers

```text
  RestaurantCard Pressable
       accessible={true}
       accessibilityLabel={`${name}, ${cuisine}, rating ${rating}`}
       accessibilityRole="button"
```

`RestaurantCard` wraps image + multiple text nodes — without grouping, TalkBack reads each `Text` separately. Set `accessible={true}` on the outer `Pressable` and a single composite `accessibilityLabel`.

Section titles like `HomeScreen`'s "Top Restaurants Near You" can use:

```javascript
<Text accessibilityRole="header">Top Restaurants Near You</Text>
```

FlashList rows inherit labels from `renderItem` — list semantics are handled by the OS when rows are focusable.

---

<a id="testing-accessibility"></a>

## 6 · Verifying on device

| Platform | How |
|---|---|
| Android | Settings → Accessibility → TalkBack on; navigate app |
| Android dev | `adb shell settings put secure enabled_accessibility_services …` |
| iOS | Settings → Accessibility → VoiceOver |

Enable TalkBack and tab through `HomeScreen` — profile avatar, search, and restaurant cards should each announce a meaningful name before shipping accessibility work as done.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Icon-only buttons | `src/screens/RestaurantScreen.js` | Back, favorite — need labels |
| Cart actions | `src/components/MenuItem.js` | ADD / +/- steppers |
| Search field | `src/components/SearchBar.js` | Placeholder ≠ label for TalkBack |
| Labeled input wrapper | `src/components/AppInput.js` | Wire `label` → `accessibilityLabel` |
| Profile tap target | `src/components/Header.js` | "GM" avatar — needs label |
| Floating cart | `src/components/FloatingCartBar.js` | Composite cart summary button |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Core UI primitives](01-core-ui-primitives.md)
- **Used by:** [Touch targets](../04-style-patterns/06-touch-targets-and-thumb-zone.md) — 48dp helps sighted and motor users; labels help screen reader users
- **Contrast with:** Web ARIA attributes — RN uses `accessibility*` props on core components only
- **Common mistake:** Relying on placeholder text — TalkBack often skips placeholders as labels
