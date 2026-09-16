<div align="center">

# 📖 Module 14 — Deep Dive Notes
### React Native: What Does NOT Exist

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-DOM%20·%20CSS%20·%20Hover%20·%20Media%20Queries%20·%20Cookies%20·%20URLs-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Internalize what does NOT exist in React Native — no DOM, CSS cascade, hover, media queries, cookies, or URL bar
>
> React Native renders **native Android/iOS views**, not HTML. There is no browser engine between your code and the UI. If you're looking for a DOM, CSS engine, or cookie jar, you're using the wrong mental model.

---

<a id="first-principle-not-a-browser"></a>

## 1 · 🎯 First Principle — React Native Is Not a Browser

> **React Native is not a browser.** Everything is a native view, not an HTML element.

When you're stuck, ask: **"How would Android or iOS do this natively?"** That's usually the React Native solution.

| Web mental model | React Native reality |
|------------------|---------------------|
| HTML elements | Native components (`View`, `Text`, `Pressable`) |
| CSS cascade & selectors | JavaScript style objects per component |
| `:hover` pseudo-class | Press / focus states (`onPressIn`, `onPressOut`) |
| `@media` queries | `Dimensions`, `useWindowDimensions`, Flexbox |
| URL bar & browser history | In-memory navigation stack (React Navigation) |
| Automatic cookie jar | Manual token storage (AsyncStorage / Keychain) |

---

<a id="browser-vs-rn-architecture"></a>

## 2 · 🏗️ Browser vs React Native Architecture

```
         WEB (React DOM)                    REACT NATIVE

    React Components                       React Components
           │                                      │
           ▼                                      ▼
     Virtual DOM                          Bridge / JSI
           │                                      │
           ▼                                      ▼
     HTML DOM Tree                       Native UI Components
           │                               ┌──────┴──────┐
           ▼                               ▼             ▼
   Browser (Chrome/Safari)          Android Views    iOS UIKit
           │                                      │
           ▼                                      ▼
   CSS Engine + Layout Engine              Device Screen
           │
           ▼
        Screen
```

| Layer | Web | React Native |
|-------|-----|--------------|
| **UI tree** | HTML DOM | Native view hierarchy |
| **Layout** | CSS engine | Yoga (Flexbox) |
| **Rendering** | Browser paint | Native platform draw |
| **Bridge** | None (same process) | JS ↔ native (Bridge / JSI) |

**Key insight:** On web, the browser sits between React and the screen. In React Native, your components map directly to platform-native widgets.

---

<a id="no-dom"></a>

## 3 · 🚫 DOM Does NOT Exist

```
Web React                          React Native

document                           App
├── body                           ├── View
│   ├── nav                        │   ├── Text
│   ├── main                       │   ├── TextInput
│   └── footer                     │   └── Pressable
```

There is no `document`, no DOM traversal, no `querySelector`. You control UI through **state and refs**.

| Web | React Native |
|-----|--------------|
| `document.querySelector()` | `useRef()` |
| `getElementById()` | `ref.current.focus()` |
| DOM traversal | Component state & refs |
| Global DOM events | Component props (`onPress`, `onChangeText`) |

```javascript
// Web — you query the DOM
const input = document.querySelector('#email');
input.focus();

// React Native — you hold a ref to the component
const emailRef = useRef(null);
emailRef.current?.focus();
```

**Implemented in app:** `src/components/AppInput.js` uses `forwardRef` so parent screens can focus inputs — the React Native equivalent of DOM focus control.

---

<a id="no-css-cascade"></a>

## 4 · 🎨 CSS Cascade Does NOT Exist

On the web, styles **inherit and cascade**:

```css
/* Web — button inherits from body unless overridden */
body { color: black; }
button { color: red; }
```

In React Native, styles **do not cascade**. Every component owns its own style object.

```
Component
    │
    ▼
Style Object (JavaScript)
    │
    ▼
Applied ONLY to That Component
```

| CSS feature | React Native |
|-------------|--------------|
| Selectors (`div > p`) | ❌ Not available |
| Inheritance (`color` from parent) | ❌ Not automatic |
| Pseudo-classes (`:hover`, `:active`) | ❌ Use press states instead |
| `StyleSheet.create()` | ✅ Optimized style objects |
| Array syntax `[styleA, styleB]` | ✅ Merge styles manually |

```javascript
// Styles apply only to this View — children don't inherit
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>  {/* must set its own color */}
</View>
```

---

<a id="no-hover-touch-states"></a>

## 5 · 👆 Hover Does NOT Exist — Touch States Do

Browsers have a **mouse pointer** with hover. Mobile has **finger touch** with press states.

```
Browser                              React Native

Mouse Pointer                        Finger Touch
      │                                    │
      ▼                                    ▼
Hover Button                         Press Starts (onPressIn)
      │                                    │
      ▼                                    ▼
Background Changes                   Pressed State (opacity/ripple)
                                           │
                                           ▼
                                     Release (onPressOut)
                                           │
                                           ▼
                                       onPress
                                           │
                                           ▼
                                       Completed
```

| Web pseudo-class | React Native equivalent |
|------------------|------------------------|
| `:hover` | ❌ Does not exist |
| `:active` | `onPressIn` / `onPressOut` |
| `:focus` | `onFocus` / `onBlur` on `TextInput` |
| `:visited` | ❌ Not applicable |

```javascript
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
  onPressIn={() => setPressed(true)}
  onPressOut={() => setPressed(false)}
  onPress={handleSubmit}
>
  <Text>Submit</Text>
</Pressable>
```

**Rule:** Design for **touch**, not hover. Every interactive element needs visible press feedback.

---

<a id="no-media-queries"></a>

## 6 · 📐 Media Queries Do NOT Exist

There is no `@media (min-width: 768px)`. Instead, read device dimensions in JavaScript and choose layout conditionally.

```
Device Starts
     │
     ▼
Dimensions API Reads Screen
     │
     ▼
Width / Height Returned
     │
     ▼
Component Chooses Layout (in JS)
```

| Tool | Purpose |
|------|---------|
| `useWindowDimensions()` | Live width/height — updates on rotation |
| `Dimensions.get('window')` | Initial screen size (one-time read) |
| `Platform.OS` | `'android'` vs `'ios'` branching |
| **Flexbox** | Adaptive layouts without breakpoints |

```javascript
const { width } = useWindowDimensions();
const isTablet = width >= 768;

return isTablet ? <TabletLayout /> : <PhoneLayout />;
```

**Implemented in app:** `src/components/OfferCarousel.js` and `src/screens/RestaurantScreen.js` use `Dimensions.get('window').width` for carousel sizing.

---

<a id="deep-linking-not-urls"></a>

## 7 · 🔗 Deep Linking Replaces URLs

There is no URL bar. Navigation is an **in-memory stack** managed by React Navigation. Deep links map external URLs into that stack.

```
WhatsApp Link
     │
     ▼
myapp://restaurant/25
     │
     ▼
App Opens (cold or warm start)
     │
     ▼
React Navigation resolves route
     │
     ▼
Restaurant Details Screen
```

| Web | React Native |
|-----|--------------|
| `window.location` | React Navigation state |
| Browser back/forward | `navigation.goBack()` / hardware back |
| Shareable URL in address bar | Custom scheme (`first://`) or universal links |
| `<a href="...">` | `navigation.navigate('Screen', { id })` |

**Implemented in app:** `src/navigation/linking.js` maps `first://` paths to nested screens. `AppNavigator.js` passes the linking config to `NavigationContainer`.

---

<a id="no-cookies-auth-storage"></a>

## 8 · 🍪 Cookies Do NOT Exist — Manual Token Storage

There is no browser cookie jar. You decide where authentication lives.

```
Login
  │
  ▼
API Returns JWT
  │
  ▼
Store Token (your choice)
  │
  ▼
Attach Token to Every Request
```

| Storage | Use for |
|---------|---------|
| **AsyncStorage** | Non-sensitive persistent data (cart, addresses) |
| **Secure Storage / Keychain** | Tokens, credentials |
| **Memory (React state)** | Session-only data — lost on process death |

```javascript
// Web — browser handles cookies automatically
// fetch('/api') → cookie sent automatically

// React Native — you attach the token manually
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Implemented in app:** `src/services/storageService.js` wraps AsyncStorage with `STORAGE_KEYS` for cart, addresses, and user data. `CartContext` and `AddressContext` hydrate from storage on mount.

---

<a id="browser-apis-alternatives"></a>

## 9 · 🔄 Browser APIs That Don't Exist

| Browser API | React Native alternative |
|-------------|-------------------------|
| `document` | Refs & component state |
| `window` | `Dimensions`, `Platform`, `Linking` |
| `localStorage` | AsyncStorage |
| `sessionStorage` | In-memory state (Context / useState) |
| `cookies` | Manual token storage |
| `history` / `location` | React Navigation |
| `navigator.clipboard` | `@react-native-clipboard/clipboard` |
| `window.matchMedia` | `useWindowDimensions()` + conditional JS |

```
Browser APIs                    React Native Alternatives
─────────────────               ─────────────────────────
document                   →    Refs
window                     →    Dimensions / Platform
localStorage               →    AsyncStorage
sessionStorage             →    Context / useState
cookies                    →    Secure Storage / Keychain
history / location         →    React Navigation
navigator.clipboard        →    Clipboard API package
```

**Golden rule:** When you reach for a browser API, stop and ask what the **native platform** provides instead.

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 14*

</div>
