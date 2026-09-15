<div align="center">

# 📖 Module 4 — Deep Dive Notes
### React Native: The Three Build Loops

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Fast%20Refresh%20·%20Reload%20·%20Full%20Rebuild-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** The three build loops — Fast Refresh vs Reload vs Full Rebuild — know which one you need.
>
> This teaches you the most important development workflow in React Native: **knowing which build loop to use** instead of rebuilding your app every time you change something.
>
> Every React Native developer learns this through experience — we'll learn it from **first principles**.

---

## 1 · 🔀 The Three Build Loops — Overview

| Loop | Trigger | What changes | Hermes | State |
|------|---------|-------------|--------|-------|
| ⚡ **Fast Refresh** | React component / UI / styles change | Only changed JS modules | VM preserved, new module injected | ✅ Preserved |
| 🔄 **Reload** | JS runtime needs restart (context, env, navigation) | Entire JS bundle re-executed | VM destroyed and recreated | ❌ Reset |
| 🏗️ **Full Rebuild** | Native code changed | New APK/IPA compiled and installed | New VM in new process | ❌ Everything wiped |

```
                    YOU SAVE A FILE
                           │
                           ▼
               "What changed in my app?"
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 React Component       JavaScript Runtime    Native Android/iOS
  UI / Logic Change        Needs Restart       Code Changed
        │                  │                  │
        ▼                  ▼                  ▼
 FAST REFRESH            RELOAD           FULL REBUILD
        │                  │                  │
        ▼                  ▼                  ▼
 Update Component     Restart Hermes      Recompile APK/IPA
 Preserve State       Reset JS State      Install New App
```

---

## 2 · 🏛️ React Native Development Architecture

> Where each build loop lives in the project structure.

| Layer | Tool |
|-------|------|
| React code | **Metro** |
| JS runtime | **Hermes** |
| Native build | **Gradle / Xcode** |

```
                  REACT NATIVE PROJECT

                        Source Code
                            │
     ┌──────────────────────┼──────────────────────┐
     │                      │                      │
     ▼                      ▼                      ▼
 React Components      Metro Bundler         Native Project
 (App.js, Screens)     (JS Compiler)      android/ ios/
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │
                            ▼
                      Hermes JavaScript VM
                            │
                            ▼
                   React Component Tree
                            │
                            ▼
                   Android / iOS Application
```

---

## 3 · ⚡ Fast Refresh Pipeline — The Fastest Loop

> This happens **dozens of times every hour** while developing.
> Metro sends only the **delta** (what changed) — not the whole bundle.

```
Edit HomeScreen.js
        │
        ▼
Ctrl+S / Save File
        │
        ▼
Metro Detects File Change
        │
        ▼
Recompile Changed Module Only        ← NOT the full bundle
        │
        ▼
Create Delta JavaScript Bundle
        │
        ▼
Send Delta to Hermes VM
        │
        ▼
React Refresh Runtime Receives Module
        │
        ▼
Replace Component Implementation
        │
        ▼
Component Re-renders Instantly
```

### What Fast Refresh Preserves vs Resets

| | Fast Refresh |
|-|-------------|
| `useState` values | ✅ Preserved |
| `useRef` values | ✅ Preserved |
| Context values | ✅ Preserved |
| Redux store | ✅ Preserved |
| Component scroll position | ✅ Usually preserved |
| `useEffect` cleanup | 🔁 Re-runs on updated component |

### Fast Refresh Failure Cases

> When Fast Refresh can't update safely, it falls back to a Reload.

| What you changed | Result |
|-----------------|--------|
| Hook order changed | 🔄 Forces **Reload** |
| Component export changed | 🔄 Forces **Reload** |
| Syntax error | 🔴 **Red Screen** (error overlay) |

**Hook order example:**

```js
// Before
useState()
useEffect()

// After (hooks reordered)
useEffect()
useState()

// ↓ Hook order mismatch → Reload required
```

> React requires hooks to always be called in the **same order** on every render. Changing their order breaks this contract → Fast Refresh gives up → triggers Reload.

---

## 4 · 🔄 Reload Pipeline — Restart JavaScript Only

> Hermes VM is **destroyed and recreated**. All in-memory JS state is gone.
> Native layer is untouched — no APK reinstall needed.

```
Press Reload (shake device → Reload, or Cmd+R in dev menu)
      │
      ▼
Destroy Hermes VM               ← JavaScript engine is killed
      │
      ▼
Clear JavaScript Memory         ← all useState, context, redux gone
      │
      ▼
Read index.android.bundle Again ← Metro sends fresh full bundle
      │
      ▼
Execute index.js                ← app bootstraps from scratch
      │
      ▼
Mount Root App Component
      │
      ▼
Render Entire React Tree
```

**When to use Reload:**
- Changed environment variables (`.env`)
- Changed navigation structure / initial route
- Changed Context initial values
- Fast Refresh got stuck or showing stale state
- Added a new library that has JS-only setup

---

## 5 · 🏗️ Full Rebuild Pipeline — Native Compilation

> The slowest loop. Only needed when **native files** change.
> Creates a brand-new APK and reinstalls it.

```
Native File Changed
       │
       ▼
npx react-native run-android
       │
       ▼
Gradle Starts
       │
  ┌────┼────┐
  │    │    │
  ▼    ▼    ▼
Compile  Merge   Bundle JS
Java/    Resources
Kotlin
  │    │    │
  └────┼────┘
       ▼
 Create APK / AAB
       │
       ▼
  Install APK
       │
       ▼
Launch New Android Process
       │
       ▼
  Start Hermes VM
       │
       ▼
    Launch App
```

**When you MUST do a Full Rebuild:**

| File changed | Why rebuild? |
|-------------|-------------|
| `AndroidManifest.xml` | Permissions, package identity |
| `Info.plist` | iOS permissions and metadata |
| `build.gradle` | SDK versions, signing config |
| `google-services.json` | Firebase configuration |
| `.kt` / `.swift` files | Native module code |
| Added a new native library | Gradle needs to link it |
| Permissions added | Manifest change requires reinstall |

---

## 6 · 🚇 Metro's Role in Every Loop

> **Metro only bundles JavaScript — it never compiles Kotlin, Java, Swift, or Objective-C.**

```
                    METRO BUNDLER
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
      ▼                   ▼                   ▼
 FAST REFRESH          RELOAD          FULL REBUILD
      │                   │                   │
Changed Module      Entire JS Bundle   JS Bundle for APK
      │                   │                   │
 Delta Bundle       Fresh Bundle       Production Bundle
      │                   │                   │
 Hermes Updated     Hermes Restart     Gradle/Xcode Uses Bundle
```

| Loop | What Metro does |
|------|----------------|
| Fast Refresh | Recompiles **only the changed module** → sends delta |
| Reload | Recompiles **entire JS bundle** → sends fresh bundle |
| Full Rebuild | Compiles JS bundle → hands it to **Gradle/Xcode** to embed in APK |

---

## 7 · 🔥 Hermes Behavior Across Loops

> **Interview favourite** — know exactly what happens to the JS engine in each loop.

```
            Fast Refresh
                 │
                 ▼
         Existing Hermes VM       ← same VM, same memory
                 │
         Inject New Module        ← hot-swap the changed module
                 │
         Continue Running         ← state preserved

──────────────────────────────────────────────────

              Reload
                 │
                 ▼
         Destroy Hermes VM        ← VM is killed
                 │
          Create New Hermes VM    ← fresh engine, empty memory
                 │
           Execute index.js       ← app restarts from scratch

──────────────────────────────────────────────────

           Full Rebuild
                 │
                 ▼
         New APK Installed        ← new binary on device
                 │
         New Android Process      ← new Linux PID
                 │
          New Hermes VM Created   ← fresh engine in new process
```

| | Fast Refresh | Reload | Full Rebuild |
|-|-------------|--------|--------------|
| Hermes VM | ♻️ Reused | 🔄 Restarted | 🆕 New VM in new process |
| JS Memory | ✅ Kept | ❌ Cleared | ❌ Cleared |
| APK | ✅ Same | ✅ Same | 🆕 Reinstalled |
| Speed | ⚡ < 1s | 🕐 ~2–5s | 🐢 30s–5min |

---

## 8 · 🧮 State Preservation Matrix

| State Type | Fast Refresh | Reload | Full Rebuild |
|-----------|-------------|--------|--------------|
| `useState` | ✅ Preserved | ❌ Reset | ❌ Destroyed |
| `useRef` | ✅ Preserved | ❌ Reset | ❌ Destroyed |
| `Context` values | ✅ Preserved | ❌ Reset | ❌ Destroyed |
| `Redux` store | ✅ Preserved | ❌ Reset | ❌ Destroyed |
| `AsyncStorage` | ✅ Survives | ✅ Survives | ✅ Survives |
| `MMKV` | ✅ Survives | ✅ Survives | ✅ Survives |

> **Key rule:** Anything in JavaScript memory (RAM) → lost on Reload/Full Rebuild.
> Anything on disk (AsyncStorage, MMKV, SQLite) → always survives.

---

## 9 · 🌳 Which Changes Need Which Loop?

> The golden decision tree — use this before every rebuild.

```
           I CHANGED SOMETHING
                  │
                  ▼
  ┌──────────────────────────────────┐
  │  React UI / Styles / Components? │ → YES → ⚡ FAST REFRESH
  └──────────────────────────────────┘
                  │ NO
                  ▼
  ┌──────────────────────────────────┐
  │  JavaScript Runtime?             │ → YES → 🔄 RELOAD
  │  (Context, ENV, Nav State)       │
  └──────────────────────────────────┘
                  │ NO
                  ▼
  ┌──────────────────────────────────┐
  │  Native Files?                   │ → YES → 🏗️ FULL REBUILD
  │  AndroidManifest, Info.plist,    │
  │  Gradle, Firebase, Kotlin, Swift,│
  │  Permissions                     │
  └──────────────────────────────────┘
```

### Quick Reference — What needs what

| What you changed | Loop needed |
|-----------------|-------------|
| JSX / styles / component logic | ⚡ Fast Refresh |
| New `useState` / hook added | ⚡ Fast Refresh |
| Navigation screen added | ⚡ Fast Refresh |
| `.env` variable | 🔄 Reload |
| Context initial value | 🔄 Reload |
| Navigation initial route | 🔄 Reload |
| JS-only library added | 🔄 Reload |
| `AndroidManifest.xml` | 🏗️ Full Rebuild |
| `Info.plist` | 🏗️ Full Rebuild |
| `build.gradle` | 🏗️ Full Rebuild |
| `google-services.json` | 🏗️ Full Rebuild |
| Native library (Kotlin/Swift) | 🏗️ Full Rebuild |
| Added permission | 🏗️ Full Rebuild |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 4*

</div>