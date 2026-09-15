<div align="center">

# 📋 Module 8 — Summary
### React Native Foundation: Perceived Speed & Optimistic Updates

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Perceived%20Speed%20·%20Optimistic%20·%20Prefetch%20·%20TTI%20·%20FPS-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| ⚡ **Why Performance** | Perceived (feel fast) + Measurable (TTI, FPS) | [→ readme.md](readme.md#why-performance-matters) |
| 📊 **TTI & FPS** | Launch speed vs runtime smoothness — target 60 FPS | [→ readme.md](readme.md#tti-and-fps) |
| 🚫 **Never Blank** | Always show skeleton or cached data — white screen = broken | [→ readme.md](readme.md#never-show-a-blank-screen) |
| 🦴 **Skeleton & Prefetch** | Placeholder UI + load data before user navigates | [→ readme.md](readme.md#skeleton-prefetch-and-stale-while-revalidate) |
| 🚀 **Optimistic Updates** | Update UI instantly, confirm server later, rollback on fail | [→ readme.md](readme.md#optimistic-updates) |
| 🧵 **Threading** | UI thread renders, JS thread runs logic — block JS = jank | [→ readme.md](readme.md#react-native-threading) |
| 🔄 **Profiling** | Measure re-renders → memo, callback, native driver | [→ readme.md](readme.md#reconciliation-and-profiling) |
| 📋 **Playbook** | Skeleton + prefetch + optimistic + debounce + memo | [→ readme.md](readme.md#perceived-speed-playbook) |
| 🍔 **Foodie Examples** | SkeletonCard, cart optimistic, debounce, hydration | [→ readme.md](readme.md#foodie-app-examples) |

---

## ⚡ Short Notes

> Core one-liners — know these by heart.

| Term | Short Note |
|------|-----------|
| **Perceived speed** | How fast the app *feels* — skeleton, optimistic, prefetch |
| **TTI** | Time to Interactive — boot time until app is usable |
| **FPS** | Frames per second — 60 FPS = smooth, below 30 = janky |
| **Skeleton UI** | Placeholder shapes matching real content — no blank screen |
| **Prefetch** | Fetch data before the user needs it |
| **Optimistic update** | Update UI immediately, sync with server in background |
| **Stale-while-revalidate** | Show cached data now, refresh silently in background |
| **JS thread** | Runs React logic — if busy > 16ms, frames drop |
| **useNativeDriver** | Runs animations on UI thread — keeps JS thread free |
| **Profiling** | Measuring which code consumes the most CPU/memory |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| Perceived vs real speed? | Perceived = illusion (skeleton, optimistic). Real = TTI/FPS metrics |
| What is TTI? | Time until the app is interactive after launch |
| Why never show blank? | Users think the app crashed — skeleton feels like progress |
| What is prefetch? | Start loading the next screen's data before navigation |
| What is an optimistic update? | UI changes on tap; server confirms later; rollback if it fails |
| Why does scroll jank happen? | JS thread blocked > 16ms — can't send layout updates in time |
| How to fix unnecessary re-renders? | `React.memo`, `useMemo`, `useCallback` after profiling |

---

## 🗺️ Perceived Speed Architecture

> From user action to the illusion of instant response.

```
User Action (tap, open screen, scroll)
        │
        ▼
┌── Never Blank ──┐
│ Skeleton / Cache │  ← show something immediately
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Prefetch   Optimistic
 (parallel   (instant UI
  fetch)      update)
    │         │
    ▼         ▼
 Keep JS     60 FPS
 thread      (native driver,
 free        memo, debounce)
    │         │
    └────┬────┘
         ▼
   App feels instant ✅
```

---

## 🖼️ Reference Diagrams

| # | Diagram | Topic |
|---|---------|-------|
| 8.1 | [Why Performance Matters](../../public/8.1.png) | Perceived vs measurable performance |
| 8.2 | [TTI & FPS Metrics](../../public/8.2.png) | Launch vs runtime speed |
| 8.3 | [RN Threading Architecture](../../public/8.3.png) | UI, JS, and native module threads |
| 8.4 | [Reconciliation & Profiling](../../public/8.4.png) | Re-render pipeline and optimization |

> Full explanations with each diagram → **[readme.md](readme.md)**

---

## 🧠 Things You Should Remember Forever

- ⚡ **Perceived speed > real speed** for user satisfaction — skeleton beats a faster API with a blank screen
- 🚫 **Never show a blank screen** — skeleton, splash, or cached data within 200ms
- 🚀 **Optimistic updates** make taps feel instant — update UI first, confirm server later
- 🧵 **JS thread blocked = jank** — use `useNativeDriver`, `useMemo`, and debounce to stay at 60 FPS
- 📊 **Profile before optimizing** — don't guess; measure re-renders and CPU time first

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 8*

</div>
