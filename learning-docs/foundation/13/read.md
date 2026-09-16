<div align="center">

# 📋 Module 13 — Summary
### React Native Foundation: Accessibility & Screen Readers

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Accessibility%20·%20VoiceOver%20·%20TalkBack-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 👁️ **Why a11y** | Can't see UI → screen reader reads tree → VoiceOver / TalkBack | [→ readme.md](readme.md#why-accessibility-matters) |
| 🔊 **Reader perspective** | Ignores colors/shadows — only role, label, state, order | [→ readme.md](readme.md#screen-reader-perspective) |
| 🌳 **Accessibility tree** | RN builds a spoken tree — missing node = feature doesn't exist | [→ readme.md](readme.md#accessibility-tree) |
| 🏷️ **Key props** | `accessibilityLabel`, `accessibilityRole`, `accessibilityState` | [→ readme.md](readme.md#accessibility-props) |
| 🧪 **Testing flow** | Enable reader → put phone away → audio-only → ship or fix | [→ readme.md](readme.md#testing-flow) |
| 🔗 **Label flow** | Label → reader speaks → user understands → user acts | [→ readme.md](readme.md#label-flow) |
| 📱 **Enable readers** | VoiceOver (iOS) · TalkBack (Android) — swipe + double-tap | [→ readme.md](readme.md#enable-voiceover-talkback) |
| 🍔 **Foodie login test** | Complete email → password → login blind | [→ readme.md](readme.md#foodie-login-a11y-test) |

---

## ⚡ Short Notes

| Term | Meaning |
|------|---------|
| **VoiceOver** | iOS screen reader |
| **TalkBack** | Android screen reader |
| **Accessibility Tree** | Structure read by screen readers — not pixels |
| **accessibilityLabel** | Spoken description of an element |
| **accessibilityRole** | Element type — button, text field, header |
| **accessibilityState** | Spoken state — disabled, selected, checked |
| **Screen Reader** | Reads UI aloud for visually impaired users |
| **Focus Order** | Sequence when swiping between elements |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| Do screen readers read pixels? | **No** — they read the accessibility tree |
| What if something is missing from the tree? | User **cannot discover it** — feature effectively doesn't exist |
| What do readers ignore? | Colors, shadows, border radius, animations |
| What do readers need? | What is it? What does it do? How do I interact? |
| Best way to test? | Enable TalkBack/VoiceOver, **put phone away**, navigate by audio only |
| Placeholder enough as label? | **No** — disappears after typing; use `accessibilityLabel` |
| iOS vs Android reader? | **VoiceOver** on iOS, **TalkBack** on Android — same concept, different gestures |

---

## 🗺️ Screen Reader Architecture

```
     VISUAL UI                    ACCESSIBILITY TREE
  (what you style)               (what gets spoken)
        │                                │
   TextInput                       Text Field
   + placeholder          ──►       Label: Email
   + red border                    State: —
        │                                │
   Button "Login"          ──►       Button · Login
        │                                │
        ▼                                ▼
  Screen reader NEVER reads pixels — only the tree
```

### Testing pipeline

```
Build → Enable Reader → Eyes Off → Swipe + Double-tap → Task Done?
                              │                           │
                              │                      No → Fix labels/roles
                              └────────────────────── Yes → Ship
```

---

## 🧠 Things You Should Remember Forever

- **Two UIs exist:** the visual one you design and the spoken one you must wire up.
- **Missing from the tree = missing from the product** for screen reader users.
- **Test blind** — enable TalkBack/VoiceOver and put the phone away.
- **`accessibilityLabel` is not optional** on interactive elements.
- **Visual labels don't auto-link** to inputs — you must pass the label to the TextInput.

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 13*

</div>
