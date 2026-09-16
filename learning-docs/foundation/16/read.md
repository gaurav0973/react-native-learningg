<div align="center">

# 📋 Module 16 — Summary
### React Native Foundation: Expo vs CLI

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Expo%20·%20Bare%20CLI%20·%20Managed%20·%20Prebuild-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🎯 **First principle** | Managed vs Bare = **who owns the native layer** | [→ readme.md](readme.md#first-principle-ownership) |
| 🛠️ **React Native CLI** | Creates real `android/` + `ios/` projects from day one | [→ readme.md](readme.md#what-is-react-native-cli) |
| 📦 **Expo** | Platform on top of RN — hides native folders initially | [→ readme.md](readme.md#what-is-expo) |
| 📱 **Expo Go** | Your JS runs inside Expo Go — not your own APK | [→ readme.md](readme.md#expo-go-vs-bare-runtime) |
| 🚧 **Expo limits** | Custom native SDK → need `expo prebuild` or bare | [→ readme.md](readme.md#where-expo-hits-limits) |
| 🏗️ **Prebuild** | Generates `android/` + `ios/` from `app.json` | [→ readme.md](readme.md#expo-prebuild) |
| 📥 **Native deps** | CLI: npm + Gradle + Pods · Expo: `expo install` | [→ readme.md](readme.md#native-dependency-installation) |
| 🔨 **Build** | Both use Metro + Hermes · CLI uses Gradle/Xcode directly | [→ readme.md](readme.md#build-pipeline-comparison) |

---

## 🔥 Two Workflows at a Glance — Memorize This Table

| | Expo Managed | Bare CLI |
|---|-------------|----------|
| **Native folders** | Hidden | Visible (`android/`, `ios/`) |
| **Native APIs** | Expo SDK | Install libraries yourself |
| **Configuration** | `app.json` | `AndroidManifest.xml`, Gradle |
| **Dev runtime** | Expo Go / EAS | Gradle / CocoaPods |
| **Setup** | Easy | Full native control |
| **Upgrades** | Expo manages native deps | You manage native deps |

Both workflows build real Android and iOS apps. The difference is **how much native layer you control**.

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| What's the biggest difference? | Expo **manages** the native layer; CLI **exposes** it for you to edit |
| Does Expo use React Native? | **Yes** — Expo is built on top of React Native |
| Why no `android/`/`ios/` in managed Expo? | Managed workflow **hides** native projects |
| What does `expo prebuild` do? | **Generates** native Android/iOS projects from Expo config |
| Why does Bare CLI need Gradle and CocoaPods? | You're building native Android/iOS apps **directly** |
| Why is this course using Bare CLI? | To teach native architecture, permissions, builds, and production native modules |
| Is Expo a different framework? | **No** — it's a platform built on React Native |

---

## 🗺️ Expo vs Bare CLI Architecture

```
              REACT NATIVE
                  │
       JavaScript / TypeScript
                  │
       Hermes + Metro + React
                  │
    ─────────────────────────────
       TWO DEVELOPMENT WORKFLOWS
    ─────────────────────────────
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
  EXPO MANAGED            BARE CLI
  Native hidden           Native visible
  Expo Go / EAS           Gradle / CocoaPods
       │                     │
       └──────────┬──────────┘
                  ▼
         BUILDS NATIVE APPS
      (Android APK / iOS IPA)
```

---

## 🧠 Things You Should Remember Forever

- **Expo is not a different framework** — it's React Native with managed native layer.
- **Managed vs Bare = ownership decision**, not a UI decision.
- **Bare CLI gives you `android/` and `ios/` from day one** — this project is Bare CLI.
- **Expo Go runs your JS inside Expo's app** — Bare CLI builds YOUR app.
- **`expo prebuild` bridges managed → bare** when you need custom native code.
- **Learning Bare CLI teaches how RN becomes an APK/IPA** — why this roadmap uses it.

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 16*

</div>
