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
| 🔥 **9 differences** | Memorize the web → RN mapping table — your brain's cheat sheet | [→ readme.md](readme.md#nine-differences-at-a-glance) |

---

## 🔥 The 9 Differences at a Glance — Memorize This Table

> **This is the table to drill until it sticks.** Every row is a web habit you must unlearn.

| # | React Web | React Native | Read More |
|---|-----------|--------------|-----------|
| 1 | **DOM Renderer** | **Native Renderer** | [→ readme.md](readme.md#no-dom) |
| 2 | `div`, `button`, `span` | `View`, `Pressable`, `Text` | [→ readme.md](readme.md#no-dom) |
| 3 | **CSS** | **`StyleSheet` / Style Objects** | [→ readme.md](readme.md#no-css-cascade) |
| 4 | Flex default: **`row`** | Flex default: **`column`** | [→ readme.md](readme.md#nine-differences-at-a-glance) |
| 5 | **Mouse events** | **Touch events** | [→ readme.md](readme.md#no-hover-touch-states) |
| 6 | **React Router** | **React Navigation** | [→ readme.md](readme.md#deep-linking-not-urls) |
| 7 | **Cookies / localStorage** | **AsyncStorage / Secure Storage** | [→ readme.md](readme.md#no-cookies-auth-storage) |
| 8 | **Media queries** | **`Dimensions` + Flexbox** | [→ readme.md](readme.md#no-media-queries) |
| 9 | **Browser APIs** | **Native device APIs** | [→ readme.md](readme.md#browser-apis-alternatives) |

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

- **Memorize the 9 differences table above** — it's the fastest way to catch web habits before they bite you.
- **Flex default is `column` in RN, `row` on web** — the #1 layout surprise for React web devs.
- **React Native is not a browser** — no DOM, CSS engine, or URL bar.
- **Styles don't cascade** — every component owns its own style object.
- **When stuck, ask:** "How would Android or iOS do this natively?"

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 14*

</div>
