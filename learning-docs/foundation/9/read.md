<div align="center">

# 📋 Module 9 — Summary
### React Native Foundation: Reachability & Touch Targets

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Reachability%20·%20Thumb%20Zone%20·%20Sticky%20CTA%20·%2044pt-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🤚 **Reachability** | Design for thumbs, not mouse cursors | [→ readme.md](readme.md#why-reachability-matters) |
| 👍 **Thumb Zones** | Easy (bottom) · Stretch (middle) · Hard (top) | [→ readme.md](readme.md#thumb-zone-principle) |
| ⬇️ **Actions at Bottom** | Checkout, Pay, Continue live in the easy zone | [→ readme.md](readme.md#primary-actions-at-the-bottom) |
| 📌 **Sticky Footer CTA** | Fixed bottom button while content scrolls | [→ readme.md](readme.md#sticky-footer-cta) |
| 👆 **44pt / 48dp** | Minimum touch target — iOS 44pt, Android 48dp | [→ readme.md](readme.md#touch-targets-44pt-48dp-rule) |
| 🎯 **hitSlop** | Expand tap area without changing visible size | [→ readme.md](readme.md#icon-size-vs-touch-target--hitslop) |
| 🛡️ **Safe Area + Footer** | `insets.bottom + 16` — never overlap home indicator | [→ readme.md](readme.md#safe-area--sticky-footer-pattern) |
| 🔘 **FAB vs Sticky** | FAB = create action · Sticky = checkout/continue | [→ readme.md](readme.md#fab-vs-sticky-footer) |
| 🍔 **Foodie Examples** | BottomTabs, FloatingCartBar, checkout button | [→ readme.md](readme.md#foodie-app-examples) |

---

## ⚡ Short Notes

> Core one-liners — know these by heart.

| Term | Short Note |
|------|-----------|
| **Reachability** | Placing UI where the thumb naturally reaches on a one-handed grip |
| **Easy zone** | Bottom third — comfortable thumb reach, zero grip shift |
| **Stretch zone** | Middle third — slight thumb extension needed |
| **Hard zone** | Top third — must shift grip or use second hand |
| **Sticky footer CTA** | Primary button fixed at bottom while content scrolls |
| **44pt / 48dp** | Minimum touch target size (iOS / Android guidelines) |
| **hitSlop** | Invisible padding on `Pressable` to enlarge tap area |
| **FAB** | Floating Action Button — small circular create/add action |
| **Visual vs touch size** | Icon can be 20dp; tappable area must be 44–48dp |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| What is reachability? | Designing UI around natural **thumb movement** on one-handed phone use |
| Why sticky checkout buttons? | Stay visible during scroll — less friction, higher conversion |
| FAB vs sticky footer? | FAB = floating create action. Sticky footer = persistent Checkout / Continue / Pay |
| Why 44pt / 48dp? | Minimum comfortable and accessible touch target for human fingers |
| What is `hitSlop`? | `Pressable` prop that expands tappable area without changing layout |
| Why bottom tab navigation? | Bottom of screen is the **easy zone** — reachable by both thumbs |
| Why `paddingBottom` on ScrollView? | Prevents last content from hiding behind a sticky footer |

---

## 🗺️ Thumb Zone Architecture

> Where to place actions on a one-handed phone screen.

```
┌─────────────────────────┐
│  HARD ZONE              │  back buttons, top nav
│  (shift grip needed)    │
├─────────────────────────┤
│  STRETCH ZONE           │  search, filters, cards
│  (slight extension)     │
├─────────────────────────┤
│  EASY ZONE              │  CTAs, checkout, tabs
│  (thumb rests here)     │
│  [Home] [Cart] [Profile]│
└─────────────────────────┘
```

---

## 📐 Touch Target Cheat Sheet

| Element | Recommended |
|---------|-------------|
| Icon visual size | 20–24 dp |
| Touch target | 44–48 dp |
| Button spacing | 8–16 dp between targets |
| Sticky footer padding | `insets.bottom + 16` |

> Full code patterns → **[readme.md § Touch Targets](readme.md#touch-targets-44pt-48dp-rule)**

---

## 🧠 Things You Should Remember Forever

- 🤚 Mobile interfaces are designed for **thumbs**, not mouse pointers
- ⬇️ The most important action should usually live in the **bottom third** of the screen
- 📌 A sticky CTA should always remain visible and **respect safe area insets**
- 👆 Visual size and touch size are different — every interactive element needs at least **44–48dp** touch target
- 🎯 Use `Pressable` with `hitSlop` to improve usability without changing your layout

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 9*

</div>
