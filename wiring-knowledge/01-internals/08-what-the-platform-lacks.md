# What React Native is not — no DOM, cascade, or browser

> The web APIs and layout assumptions that do not exist in React Native, and the native replacements this repo uses instead.

**Folder:** 01-internals · **Prerequisites:** — · **Next:** [Core UI primitives](../02-implementations/01-core-ui-primitives.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| DOM | Browser document tree — **does not exist** in React Native |
| Native renderer | Maps React components to Android Views / iOS UIKit widgets |
| CSS cascade | Web inheritance of styles — **does not exist**; each component owns styles |
| StyleSheet | RN optimized style objects — no selectors or pseudo-classes |
| Hover | Mouse-over state — **does not exist**; use press states |
| Media queries | CSS breakpoints — **does not exist**; use `Dimensions` in JS |
| Cookies | Automatic browser cookie jar — **does not exist**; manual token storage |
| React Navigation | In-memory route stack replacing URL bar and browser history |
| Touch events | `onPress`, `onPressIn`, `onPressOut` replace click/hover |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  WEB (React DOM)                         REACT NATIVE (this repo)

  React Components                        React Components
        │                                       │
        ▼                                       ▼
  Virtual DOM                           JSI / Fabric (see internals 09–11)
        │                                       │
        ▼                                       ▼
  HTML DOM tree                         Native view hierarchy
  + CSS engine                          + Yoga (Flexbox only)
        │                               ┌───────┴───────┐
        ▼                               ▼               ▼
  Browser paints screen            Android Views    iOS UIKit
```

**Reading the diagram.** On web, a browser sits between React and the screen — HTML, CSS cascade, hover, cookies, and the URL bar are all browser services. React Native removes that layer. Your components map to platform widgets; layout is Flexbox via Yoga; styling is per-component JavaScript objects.

When stuck, ask: **"How would Android or iOS do this natively?"** That question routes you to the right RN primitive or package.

The insight: **React Native is not a browser in a WebView** (by default) — it is React controlling native UI with a different rule set.

---

<a id="nine-differences"></a>

## 3 · Nine web habits to replace

```text
  WEB HABIT                    RN REPLACEMENT IN THIS REPO
  ─────────                    ───────────────────────────
  div / button / span    →     View / Pressable / Text
  CSS cascade            →     StyleSheet per component
  flex default row       →     flex default column
  :hover                 →     Pressable pressed style
  @media queries         →     Dimensions.get('window')
  React Router URLs      →     React Navigation stack
  cookies / localStorage →     AsyncStorage (manual)
  document.querySelector →     useRef / forwardRef
  window.location        →     Linking + navigation.navigate
```

| # | Web | React Native |
|---|---|---|
| 1 | DOM renderer | Native renderer |
| 2 | HTML tags | `View`, `Text`, `Pressable` |
| 3 | CSS cascade | `StyleSheet` objects |
| 4 | Flex default `row` | Flex default **`column`** |
| 5 | Mouse / hover | Touch / press states |
| 6 | URL in address bar | In-memory nav stack |
| 7 | Automatic cookies | Manual storage |
| 8 | `@media` | `Dimensions` + conditional JSX |
| 9 | `document`, `window` | `Platform`, `Linking`, refs |

Flex direction default is the day-one gotcha — detailed in → [Flexbox defaults](../04-style-patterns/01-flexbox-and-layout-defaults.md).

---

<a id="no-dom"></a>

## 4 · No DOM — refs instead of querySelector

```text
  Web:  document.querySelector('#email').focus()
  RN:   emailRef.current?.focus()   via forwardRef on TextInput
```

There is no `document`, no DOM traversal, no global event delegation on a tree. UI is driven by React state and component refs → [Core UI primitives](../02-implementations/01-core-ui-primitives.md).

---

<a id="no-css-cascade"></a>

## 5 · No CSS cascade

```text
  Web                          React Native
  body { color: black }        <View style={styles.container}>
  button inherits? maybe       <Text style={styles.title}>  ← must set color here
```

Styles apply **only** to the component they are passed to. Children do not inherit font or color automatically. Composition uses style arrays — owned in → [StyleSheet composition](../04-style-patterns/05-stylesheet-composition-no-cascade.md).

---

<a id="no-hover"></a>

## 6 · No hover — press states

```text
  Browser:  :hover → visual change
  RN:       onPressIn → pressed style → onPressOut → onPress
```

Use `Pressable` with a function style `({ pressed }) => [...]` for touch feedback → [Core UI primitives](../02-implementations/01-core-ui-primitives.md).

---

<a id="no-media-queries"></a>

## 7 · No media queries

```text
  Web:  @media (min-width: 768px) { … }
  RN:   const { width } = useWindowDimensions();
        return width >= 768 ? <Tablet /> : <Phone />;
```

This repo reads width once for carousels:

`src/components/OfferCarousel.js`

```javascript
const SCREEN_WIDTH = Dimensions.get('window').width;
```

---

<a id="no-cookies"></a>

## 8 · No cookies — manual storage

```text
  Web fetch → cookie attached automatically
  RN axios  → you attach Authorization header yourself
            → persist token via AsyncStorage / SecureStore
```

Cart and addresses persist through `storageService.js` — not a browser jar → [AsyncStorage and storageService](../02-implementations/06-asyncstorage-and-storage-service.md).

Deep links replace shareable URLs in a browser bar → [Deep linking wiring](../02-implementations/13-deep-linking-linking-api.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 9 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Native components not HTML | `src/screens/HomeScreen.js` | `View`, `Text`, `Pressable` |
| No cascade — explicit Text styles | All screens | Each `Text` sets its own style |
| Dimensions not @media | `src/components/OfferCarousel.js` | `Dimensions.get('window').width` |
| Manual persistence not cookies | `src/services/storageService.js` | `saveData` / `getData` |
| Nav stack not URL bar | `src/navigation/AppNavigator.js` | `NavigationContainer` |
| Custom scheme not http bar | `src/navigation/linking.js` | `prefixes: ['first://']` |

---

<a id="wiring"></a>

## 10 · Wiring

- **Builds on:** —
- **Used by:** [Core UI primitives](../02-implementations/01-core-ui-primitives.md), [StyleSheet composition](../04-style-patterns/05-stylesheet-composition-no-cascade.md), [Flexbox defaults](../04-style-patterns/01-flexbox-and-layout-defaults.md)
- **Contrast with:** React Native Web — deliberately reintroduces DOM/CSS for browser targets; this repo is native-only
- **Common mistake:** expecting child `Text` to inherit parent color — set styles on each `Text` → [StyleSheet composition](../04-style-patterns/05-stylesheet-composition-no-cascade.md)
