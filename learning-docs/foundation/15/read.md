<div align="center">

# 📋 Module 15 — Summary
### React Native Foundation: Internal Architecture

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Hermes%20·%20JSI%20·%20Fabric%20·%20TurboModules-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🎯 **First principle** | JS describes UI — native renders it | [→ readme.md](readme.md#first-principle-js-controls-native) |
| 🏗️ **Big picture** | React → Hermes → JSI → Fabric + TurboModules → Screen | [→ readme.md](readme.md#big-picture-architecture) |
| 📱 **Native vs RN** | Native = platform code only · RN = JS instructions → native views | [→ readme.md](readme.md#native-app-vs-react-native) |
| ⚡ **Hermes** | Bytecode at build time — fast startup, no runtime parsing | [→ readme.md](readme.md#hermes-engine) |
| 🔗 **JSI** | Direct JS ↔ native — replaces async Bridge | [→ readme.md](readme.md#jsi-interface) |
| 🎨 **Fabric** | New renderer — shadow tree → native view tree | [→ readme.md](readme.md#fabric-renderer) |
| 📦 **TurboModules** | Lazy-load native modules on demand | [→ readme.md](readme.md#turbomodules) |
| 🚀 **New Architecture** | Hermes + JSI + Fabric + TurboModules together | [→ readme.md](readme.md#new-architecture) |
| 🧵 **Threads** | JS thread · UI thread · Native module thread | [→ readme.md](readme.md#thread-architecture) |

---

## 🔥 Architecture Glossary — Memorize This Table

| Term | One-liner | Read More |
|------|-----------|-----------|
| **Native App** | Kotlin/Java or Swift/Obj-C — no JS | [→ readme.md](readme.md#native-app-vs-react-native) |
| **React Native** | JS runs while rendering native UI | [→ readme.md](readme.md#native-app-vs-react-native) |
| **Hermes** | Mobile-optimized JS engine (bytecode) | [→ readme.md](readme.md#hermes-engine) |
| **JSI** | Direct JS ↔ native communication | [→ readme.md](readme.md#jsi-interface) |
| **Fabric** | New UI rendering engine | [→ readme.md](readme.md#fabric-renderer) |
| **TurboModules** | Lazy-loaded native modules | [→ readme.md](readme.md#turbomodules) |
| **New Architecture** | All four pieces replacing the old Bridge | [→ readme.md](readme.md#new-architecture) |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| What is the first principle of React Native? | **JavaScript controls native components** — JS describes, native renders |
| What does Hermes do? | Executes JavaScript — ships **bytecode** at build for fast startup |
| What replaced the old Bridge? | **JSI** — direct C++ interface between JS and native |
| What is Fabric? | The **new UI renderer** — shadow tree → native views efficiently |
| What are TurboModules? | **Lazy-loaded** native modules — load on demand, not at startup |
| What is the New Architecture? | **Hermes + JSI + Fabric + TurboModules** working together |
| What is a Shadow Tree? | Invisible layout nodes (width, height, flex) — not visible UI |
| What runs on the JS thread? | React, hooks, state, business logic |
| What runs on the UI thread? | Rendering, gestures, native animations |

---

## 🗺️ React Native Architecture

```
    React Components (JS/TS)
              │
              ▼
      Hermes (JS Engine)
              │
              ▼
     JSI (Direct Bridge)
       ┌──────┴──────┐
       ▼             ▼
   Fabric       TurboModules
       ▼             ▼
 Native Views   Device APIs
       ▼
  Android / iOS Screen
```

---

## 🧠 Things You Should Remember Forever

- **JS describes UI, native renders it** — your `<Text>` becomes a TextView or UILabel.
- **Memorize the glossary table** — Hermes, JSI, Fabric, TurboModules, New Architecture.
- **Hermes ships bytecode** — faster startup than parsing JS at runtime.
- **JSI killed the async Bridge** — direct JS ↔ native calls.
- **TurboModules load lazily** — only what you use, when you use it.
- **Three threads:** JS (logic) · UI (render/touch) · Native modules (camera, GPS).

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 15*

</div>
