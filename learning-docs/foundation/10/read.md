<div align="center">

# 📋 Module 10 — Summary
### React Native Foundation: Platform Conventions & Android Back

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-BackHandler%20·%20Platform%20·%20Navigation%20·%20Android%20Back-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🎯 **First Principle** | Cross-platform = native experiences, not identical UI | [→ readme.md](readme.md#first-principle-native-experiences) |
| 🤖🍎 **Platform Conventions** | Android back / ripple / exit vs iOS swipe / opacity | [→ readme.md](readme.md#platform-conventions-android-vs-ios) |
| ⬅️ **BackHandler API** | Android-only listener for hardware/gesture back | [→ readme.md](readme.md#backhandler-api) |
| ✅ **true vs false** | `true` = handled (block default) · `false` = let navigation continue | [→ readme.md](readme.md#return-true-vs-false) |
| 🔁 **Double Tap Exit** | Toast → second back within 2s → `exitApp()` | [→ readme.md](readme.md#double-tap-to-exit) |
| 🔍 **useFocusEffect** | Register back listener only when screen is focused | [→ readme.md](readme.md#usefocuseffect-vs-useeffect) |
| 🧭 **React Navigation** | Default pop works — BackHandler only for custom overrides | [→ readme.md](readme.md#react-navigation-back-behavior) |
| 🏭 **Production Patterns** | Unsaved forms, modal close, platform branching | [→ readme.md](readme.md#production-patterns) |
| 🍔 **Foodie Upgrades** | Add double-tap exit on root tab, ripple on buttons | [→ readme.md](readme.md#foodie-app-examples) |

---

## ⚡ Short Notes

> Core one-liners — know these by heart.

| Term | Short Note |
|------|-----------|
| **Platform conventions** | Android and iOS users expect different navigation and feedback patterns |
| **BackHandler** | RN API for Android hardware/gesture back — iOS has no equivalent |
| **return true** | "I handled back" — blocks default navigation/exit |
| **return false** | "Not handled" — React Navigation pops or system exits |
| **Double-tap exit** | Toast on first back, exit on second within 2 seconds |
| **useFocusEffect** | Runs when screen gains/loses focus — correct hook for BackHandler |
| **useRef timestamp** | Tracks last back press without causing re-renders |
| **ToastAndroid** | Native Android toast for "Press back again to exit" |
| **Platform.OS** | Branch code for Android-only or iOS-only behavior |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| Cross-platform first principle? | One codebase → **platform-native** experiences, not identical UI |
| Does BackHandler work on iOS? | No — iOS uses swipe-from-edge via native stack navigator |
| `return true` vs `false`? | `true` blocks default back. `false` lets React Navigation handle it |
| Why double-tap to exit? | Prevents accidental app close — WhatsApp, Paytm, Swiggy all use it |
| Why `useFocusEffect` not `useEffect`? | Listener only active when screen is on top — avoids intercepting other screens |
| When is custom back handling needed? | Root screen exit, unsaved forms, open modals |
| Android vs iOS back? | Android = hardware/gesture back. iOS = swipe from left edge |

---

## 🗺️ Android Back Button Flow

> Double-tap to exit on root screen.

```
User on root screen presses back
        │
        ▼
First press → ToastAndroid
"Press back again to exit"
(return true — block exit)
        │
        ▼
Second press within 2 seconds?
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
exitApp()   Reset timer,
            show toast again
```

---

## 🧠 Things You Should Remember Forever

- 🎯 **Cross-platform ≠ identical** — respect Android and iOS conventions at the edges
- ⬅️ **`BackHandler` is Android-only** — iOS back is handled by native stack swipe gesture
- ✅ **`return true` blocks, `return false` passes through** — the most common BackHandler bug is returning the wrong value
- 🔁 **Double-tap to exit** on root screens — industry standard, prevents accidental closes
- 🔍 **Always use `useFocusEffect`** for back listeners — plain `useEffect` intercepts back on hidden screens

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 10*

</div>
