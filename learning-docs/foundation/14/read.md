<div align="center">

# 📋 Module 14 — Summary
### React Native Foundation: What Does NOT Exist

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-DOM%20·%20CSS%20·%20Hover%20·%20Cookies%20·%20URLs-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🎯 **First principle** | React Native is not a browser — native views, not HTML | [→ readme.md](readme.md#first-principle-not-a-browser) |
| 🏗️ **Architecture** | React → Bridge/JSI → Native UI → Android Views / iOS UIKit | [→ readme.md](readme.md#browser-vs-rn-architecture) |
| 🚫 **No DOM** | No `document` — control UI with state and refs | [→ readme.md](readme.md#no-dom) |
| 🎨 **No CSS cascade** | Every component owns its own style object | [→ readme.md](readme.md#no-css-cascade) |
| 👆 **No hover** | Touch states: `onPressIn` → pressed → `onPressOut` → `onPress` | [→ readme.md](readme.md#no-hover-touch-states) |
| 📐 **No media queries** | Read dimensions in JS, choose layout with Flexbox | [→ readme.md](readme.md#no-media-queries) |
| 🔗 **No URL bar** | Deep links map into React Navigation stack | [→ readme.md](readme.md#deep-linking-not-urls) |
| 🍪 **No cookies** | Store JWT manually in AsyncStorage or Keychain | [→ readme.md](readme.md#no-cookies-auth-storage) |

---

## ⚡ Short Notes

| Web concept | React Native reality |
|-------------|---------------------|
| **DOM / HTML** | Native components (`View`, `Text`, `Pressable`) |
| **CSS cascade** | JavaScript style objects — no inheritance |
| **`:hover`** | Press states (`onPressIn`, `onPressOut`) |
| **`@media` queries** | `useWindowDimensions()` + conditional rendering |
| **URL bar / history** | React Navigation in-memory stack |
| **Cookies / localStorage** | AsyncStorage, Secure Storage, Context |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| Why doesn't React Native have a DOM? | It renders **native UI components** into Android Views and iOS UIKit — not HTML |
| How is styling different from CSS? | JavaScript style objects with **no cascade**, selectors, or pseudo-classes |
| How do you make responsive layouts without media queries? | `useWindowDimensions()`, Flexbox, conditional rendering, `Platform.OS` |
| What replaces cookies in authentication? | JWT stored in **AsyncStorage or Keychain**, attached manually to API requests |
| What replaces browser routing? | **React Navigation** manages an in-memory navigation stack |
| What to ask when stuck? | **"How would Android or iOS do this natively?"** |

---

## 🗺️ Web vs React Native Architecture

```
         WEB                              REACT NATIVE

   React Components                    React Components
          │                                    │
          ▼                                    ▼
    Virtual DOM                          Bridge / JSI
          │                                    │
          ▼                                    ▼
    HTML DOM Tree                       Native UI Components
          │                               ┌──────┴──────┐
          ▼                               ▼             ▼
   Browser + CSS Engine            Android Views    iOS UIKit
          │                                    │
          ▼                                    ▼
       Screen                             Device Screen
```

---

## 🧠 Things You Should Remember Forever

- **React Native is not a browser** — if you're looking for a DOM, CSS engine, or URL bar, wrong mental model.
- **Everything is a native view** — not an HTML element.
- **Styles don't cascade** — every component owns its own style object.
- **Navigation replaces URLs** — device storage replaces cookies/localStorage.
- **When stuck, ask:** "How would Android or iOS do this natively?"

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 14*

</div>
