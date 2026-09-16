# View, Text, StyleSheet, Pressable, TextInput

> The five building blocks every Foodie screen is assembled from — containers, text, styles, taps, and typed input.

**Folder:** 02-implementations · **Prerequisites:** [What the platform lacks](../01-internals/08-what-the-platform-lacks.md) · **Next:** [ScrollView, FlatList, Image](02-scrollview-flatlist-image.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| View | The universal layout container — React Native's `<div>` equivalent |
| Text | The only component that can render readable characters on screen |
| StyleSheet | Factory that turns JS style objects into registered, optimized styles |
| Pressable | Touch target with press-state feedback and `onPress` handler |
| TextInput | Single-line or multiline text field controlled by React state |
| StatusBar | OS-owned status strip (time, battery) styled from JS via props |
| Controlled input | TextInput whose `value` always comes from React state |
| Style array | `[baseStyle, condition && overrideStyle]` — later entries win |
| forwardRef | Passes a ref through a wrapper so parent can call `.focus()` on TextInput |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  ┌──────────────── SafeAreaView (screen shell) ─────────────────┐
  │  ┌────────────── View (flex column, flex:1) ────────────────┐ │
  │  │  Text ──► "Deliver To" / "Chandigarh"                   │ │
  │  │  Pressable ──► onPress ──► navigation.navigate(...)     │ │
  │  │  TextInput ──► value + onChangeText ◄── useState        │ │
  │  └──────────────────────────────────────────────────────────┘ │
  └───────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    StyleSheet.create    Pressable wraps      TextInput bound to
    styles.header        tappable regions     controlled state
```

**Reading the diagram.** Every screen in this repo is a tree of `View` nodes. `Text` sits inside those boxes because React Native will not render raw strings as children of `View` — unlike the web, there is no implicit text node.

`StyleSheet.create` registers styles once at module load. Components reference `styles.chip` rather than inline objects, which keeps re-renders cheap and names readable.

`Pressable` replaces the older `TouchableOpacity` pattern here: cards, buttons, and profile avatars all use `onPress` to trigger navigation or cart actions. `TextInput` pairs with `useState` for search and forms — the value lives in React, not inside the native widget.

The insight this note delivers: **React Native UI is intentionally small.** You compose a handful of primitives with flex layout (owned by [Flexbox defaults](../04-style-patterns/01-flexbox-and-layout-defaults.md)) rather than importing a component library for basics.

---

<a id="view-and-text"></a>

## 3 · View and Text — structure without a DOM

```text
  View (container)                    Text (content only)
  ┌─────────────────────┐            ┌─────────────────────┐
  │  flexDirection:     │            │  "Top Restaurants"  │
  │  column (default)   │  wraps     │  fontSize, fontWeight│
  │  flex: 1            │ ────────►  │  color              │
  └─────────────────────┘            └─────────────────────┘
        ▲
        │ no DOM — no <p>, <span>, cascade
        │ see 01-internals/08
```

There is no HTML in React Native → see [What the platform lacks](../01-internals/08-what-the-platform-lacks.md#no-dom). `CategoryChip` is the smallest example: a styled pill built from `View` + `Text`.

`src/components/CategoryChip.js`

```javascript
export function CategoryChip({ title }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{title}</Text>
    </View>
  );
}
```

`Header` shows the typical screen-top pattern: a row `View` with location `Text` and a circular profile `Pressable`.

`src/components/Header.js`

```javascript
<View style={styles.header}>
  <View>
    <Text style={styles.label}>Deliver To</Text>
    <Text style={styles.location}>Chandigarh, Punjab</Text>
  </View>
  <Pressable onPress={handleProfilePressButton}>
    <View style={styles.profile}>
      <Text style={styles.profileText}>GM</Text>
    </View>
  </Pressable>
</View>
```

---

<a id="stylesheet-and-style-arrays"></a>

## 4 · StyleSheet and conditional style arrays

```text
  StyleSheet.create({ ... })     at import time
         │
         ▼
  styles.input  ──►  [styles.input, error && styles.inputError]
                              ▲
                              └── later object overrides earlier
```

Styles are plain JS objects. `StyleSheet.create` validates keys and can optimize lookup. Conditional borders use a **style array** — the pattern in `AppInput`:

`src/components/AppInput.js`

```javascript
<TextInput
  ref={ref}
  style={[styles.input, error && styles.inputError]}
  {...props}
/>
```

Composition without CSS cascade is owned by [StyleSheet composition](../04-style-patterns/05-stylesheet-composition-no-cascade.md) — this note only shows the call-site shape.

---

<a id="pressable"></a>

## 5 · Pressable — manual onPress wiring

```text
  user tap
     │
     ▼
  Pressable.onPress()
     │
     ├── navigation.navigate('RestaurantScreen', { restaurant })
     ├── addItem(item)          ← MenuItem
     └── fetchLocation()        ← AddressScreen
```

Unlike web `onClick`, nothing is clickable unless you wrap it in `Pressable` (or similar). `RestaurantCard` wraps the entire card:

`src/components/RestaurantCard.js`

```javascript
<Pressable
  onPress={() =>
    navigation.navigate('RestaurantScreen', {
      restaurant,
    })
  }
>
  <View style={styles.card}>
    {/* image + text content */}
  </View>
</Pressable>
```

`MenuItem` uses `Pressable` for ADD and quantity steppers. Disabled state appears on `AddressScreen`'s location button via `disabled={loading}`.

---

<a id="textinput-controlled"></a>

## 6 · TextInput — controlled value from state

```text
  keystroke
     │
     ▼
  onChangeText(setSearchText)
     │
     ▼
  searchText state updates ──► re-render ──► TextInput value={searchText}
```

`SearchBar` is the minimal controlled field:

`src/components/SearchBar.js`

```javascript
<TextInput
  placeholder="Search for restaurants or food"
  value={searchText}
  onChangeText={setSearchText}
  style={styles.input}
  placeholderTextColor="#888888"
/>
```

The full controlled-input pattern (never debounce the field itself) lives in [Controlled components](../03-patterns/05-controlled-components.md).

`AppInput` adds label, helper text, error display, and `forwardRef` so `LoginScreen` can chain focus from email to password:

`src/screens/LoginScreen.js`

```javascript
onSubmitEditing={() => passwordRef.current?.focus()}
// …
<AppInput ref={passwordRef} label="Password" secureTextEntry … />
```

---

<a id="statusbar"></a>

## 7 · StatusBar — OS chrome, JS styling

```text
  ┌─ StatusBar (Android/iOS system) ─────────────────┐
  │  4G   10:40   🔋                                │
  └─────────────────────────────────────────────────┘
  ┌─ Your app (SafeAreaView starts below notch) ────┐
```

`StatusBar` does not live inside your layout tree as a sibling box — it configures the system bar. `App.jsx` sets it once at the root:

`App.jsx`

```javascript
<StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
```

Safe-area padding for notches uses `SafeAreaView` from `react-native-safe-area-context` → [Safe area and insets](../04-style-patterns/03-safe-area-and-insets.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 8 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| View + Text layout | `src/components/CategoryChip.js` | Minimal pill component |
| Pressable navigation | `src/components/RestaurantCard.js` | `navigate` with params |
| Controlled TextInput | `src/components/SearchBar.js` | `value` + `onChangeText` |
| StyleSheet + errors | `src/components/AppInput.js` | Style array, `forwardRef` |
| Form keyboard flow | `src/screens/LoginScreen.js` | `returnKeyType`, `onSubmitEditing` |
| StatusBar | `App.jsx` | Root-level bar style |
| Screen shell | `src/screens/HomeScreen.js` | `SafeAreaView` wrapper |

---

<a id="wiring"></a>

## 9 · Wiring

- **Builds on:** [What the platform lacks](../01-internals/08-what-the-platform-lacks.md)
- **Used by:** [ScrollView and lists](02-scrollview-flatlist-image.md), [React Navigation](04-react-navigation-wiring.md), [Mobile forms](../03-patterns/11-mobile-forms-and-validation.md)
- **Contrast with:** Web `<div>` + `<span>` — no cascade, no raw text in containers, no hover
- **Common mistake:** Putting a string directly inside `View` — wrap it in `Text` or the app crashes in dev
