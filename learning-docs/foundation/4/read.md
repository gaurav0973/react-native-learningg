<div align="center">

# 📋 Module 4 — Summary
### React Native Foundation: The Three Build Loops

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Fast%20Refresh%20·%20Reload%20·%20Full%20Rebuild-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| ⚡ **Fast Refresh Pipeline** | `Metro → Delta Bundle → Hermes → Component Update` | [→ readme.md](readme.md#fast-refresh-pipeline-the-fastest-loop) |
| 🔄 **Reload Pipeline** | `Destroy Hermes → Execute index.js → Mount React App` | [→ readme.md](readme.md#reload-pipeline-restart-javascript-only) |
| 🏗️ **Full Rebuild Pipeline** | `Gradle/Xcode → APK/IPA → Install → Launch` | [→ readme.md](readme.md#full-rebuild-pipeline-native-compilation) |
| 🚇 **Metro Architecture** | Metro handles **JavaScript only** — never compiles native code | [→ readme.md](readme.md#metros-role-in-every-loop) |
| 🔥 **Hermes Lifecycle** | `Preserve VM` vs `Restart VM` vs `New VM` | [→ readme.md](readme.md#hermes-behavior-across-loops) |
| 🌳 **Decision Tree** | UI → Fast Refresh · JS Runtime → Reload · Native → Full Rebuild | [→ readme.md](readme.md#which-changes-need-which-loop) |

---

## 🗺️ Build Loop Architecture

> When you save a file — which loop fires?

```
                    REACT NATIVE DEVELOPMENT

                           SAVE FILE
                               │
                               ▼
                  What Changed In The Project?
                               │
      ┌────────────────────────┼────────────────────────┐
      │                        │                        │
      ▼                        ▼                        ▼
 React Component         JavaScript Runtime         Native Android/iOS
(UI, Styles, Hooks)       Needs Restart            Configuration/Code
      │                        │                        │
      ▼                        ▼                        ▼
 FAST REFRESH                RELOAD               FULL REBUILD
      │                        │                        │
 Metro Creates Delta      Metro Sends Bundle      Gradle/Xcode Starts
      │                        │                        │
 Hermes Injects Module     Hermes Restarted       Native Compilation
      │                        │                        │
 React Re-renders          App Starts Fresh       APK Installed Again
      │                        │                        │
 State Preserved           State Reset            Everything Restarted
```

---

## 🧠 Things to Remember

- ⚡ **Fast Refresh** updates modules inside the existing Hermes VM and **tries to preserve React state**
- 🔄 **Reload** destroys the Hermes VM and executes `index.js` again — all in-memory state **resets**
- 🏗️ **Full Rebuild** recompiles native Android/iOS code and installs a **new application binary**
- 🚇 **Metro** only watches and bundles JavaScript — it **never** compiles Kotlin, Java, Swift, or Objective-C
- 💡 Before rebuilding, always ask: **"Did I change JavaScript or native code?"**

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 4*

</div>
