<div align="center">

# 📖 Module 15 — Deep Dive Notes
### React Native: Internal Architecture

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Hermes%20·%20JSI%20·%20Fabric%20·%20TurboModules%20·%20New%20Architecture-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** How does React Native work internally — Hermes, JSI, Fabric, TurboModules, and the New Architecture?
>
> After this module, you'll understand how React Native actually works under the hood — not just how to use it. JavaScript describes UI; native code renders it.

---

<a id="first-principle-js-controls-native"></a>

## 1 · 🎯 First Principle — JavaScript Controls Native Components

> **React Native is JavaScript controlling native components.**

Your React code does **not** draw pixels. It creates **instructions** for the platform.

```javascript
<View>
  <Text>Hello</Text>
</View>
```

React Native translates this to:

| Platform | Instruction |
|----------|-------------|
| **Android** | Create a `TextView` |
| **iOS** | Create a `UILabel` |

**JavaScript describes UI. Native renders UI.**

---

<a id="architecture-glossary"></a>

## 2 · 📚 Architecture Glossary — Memorize This Table

| Term | One-liner |
|------|-----------|
| **Native App** | Runs entirely in Kotlin/Java or Swift/Objective-C — no JavaScript |
| **React Native** | Runs JavaScript while rendering native UI |
| **Hermes** | JavaScript engine optimized for mobile |
| **JSI** | Direct communication between JS and Native (no async bridge) |
| **Fabric** | New rendering engine for native UI |
| **TurboModules** | Faster, lazy-loaded native module system |
| **New Architecture** | Hermes + JSI + Fabric + TurboModules working together |

---

<a id="big-picture-architecture"></a>

## 3 · 🏗️ The Big Picture — How Your App Runs

```
                YOUR REACT NATIVE APP

    React Components (JavaScript / TypeScript)
                    │
                    ▼
        Hermes (JavaScript Engine)
                    │
                    ▼
       JSI (JavaScript Interface Layer)
        ┌───────────┴────────────┐
        ▼                        ▼
    Fabric Renderer        TurboModules
        ▼                        ▼
    Native Views        Camera, GPS, Storage,
                         Bluetooth, etc.
        ▼
    Android / iOS Screen
```

| Layer | Role |
|-------|------|
| **React Components** | Your UI code — hooks, state, business logic |
| **Hermes** | Executes JavaScript |
| **JSI** | Direct JS ↔ native bridge (C++ interface) |
| **Fabric** | Renders native UI from React's shadow tree |
| **TurboModules** | Exposes device APIs (camera, GPS, storage) to JS |

**Implemented in app:** `android/gradle.properties` has `hermesEnabled=true` and `newArchEnabled=true` — this project runs on the New Architecture stack.

---

<a id="native-app-vs-react-native"></a>

## 4 · 📱 Native App vs React Native

### Native App Flow

```
     USER INSTALLS APP
             │
             ▼
   Android APK / iOS IPA
             │
             ▼
  Operating System Launches App
       ┌─────┴─────┐
       ▼           ▼
 Android Runtime  iOS Runtime
 Kotlin / Java    Swift / Obj-C
       │           │
       ▼           ▼
 Native UI        Native UI
       │           │
       ▼           ▼
  Screen Painted by OS
```

| | Native App | React Native |
|---|-----------|--------------|
| **Language** | Kotlin, Java, Swift, Objective-C | JavaScript / TypeScript |
| **Contains JS?** | ❌ No | ✅ Yes |
| **UI creation** | Platform code creates views directly | JS sends instructions → native creates views |
| **Startup** | Platform runtime only | Hermes + RN runtime + native |

**Platform languages:**

| Android | iOS |
|---------|-----|
| Kotlin | Swift |
| Java | Objective-C |

When a native app starts, Kotlin/Swift code runs immediately and creates native views. In React Native, Hermes must start first, then your JS bundle executes, then native views are created from JS instructions.

---

<a id="hermes-engine"></a>

## 5 · ⚡ Hermes — JavaScript Engine

```
       YOUR JAVASCRIPT CODE
                 │
                 ▼
          Hermes Engine
                 │
     Parses + Executes JS
                 │
                 ▼
        React Native Runtime
```

**Hermes** is the JavaScript engine that executes your code. Without an engine, JS cannot run — no variables, functions, loops, promises, or React hooks.

### JavaScript Engines Comparison

```
      JavaScript Code
             │
   ┌─────────┼─────────┐
   ▼         ▼         ▼
 Chrome     Safari   React Native
   V8    JavaScriptCore  Hermes
```

| Engine | Used by |
|--------|---------|
| **V8** | Chrome, Node.js |
| **JavaScriptCore (JSC)** | Safari, older React Native |
| **Hermes** | Modern React Native (default) |

### Why Hermes Is Different

Hermes converts JavaScript into **bytecode at build time**. The app ships with bytecode — at runtime there is no parsing, no compilation, just immediate execution.

| Benefit | Reason |
|---------|--------|
| **Faster startup** | Bytecode already generated at build |
| **Lower memory** | Optimized garbage collector |
| **Smaller APK** | Optimized runtime footprint |
| **Better performance** | Designed specifically for React Native |

---

<a id="jsi-interface"></a>

## 6 · 🔗 JSI — JavaScript Interface

> **JSI is the heart of modern React Native** — a C++ interface shared by JavaScript and Native code.

### Old Bridge vs JSI

```
 OLD (Bridge)                    NEW (JSI)

 JS calls camera()               JS calls camera()
       │                               │
       ▼                               ▼
 Async Bridge                    JSI (direct, sync)
 (JSON serialized)                     │
       │                               ▼
       ▼                         Native Camera Module
 Native Camera Module                  │
       │                               ▼
       ▼                          Camera Opens
 Camera Opens
```

```
JS Object  →  JSI  →  Native Object
```

| Old Bridge | JSI |
|------------|-----|
| Async — messages queued | Direct — synchronous calls possible |
| JSON serialization overhead | C++ shared interface |
| Slower native module calls | Near-native speed |

**JSI enables:** Fabric renderer, TurboModules, and synchronous native calls when needed.

---

<a id="fabric-renderer"></a>

## 7 · 🎨 Fabric — New Rendering Engine

Fabric is the **new UI renderer** — it renders native views more efficiently than the old bridge-based renderer.

### Old Renderer vs Fabric

```
 OLD RENDERER                    FABRIC

 React Shadow Tree               React Shadow Tree
       │                               │
   Bridge (async)                 Fabric Renderer
       │                               │
 Native View Tree                Native View Tree
```

### Fabric Rendering Pipeline

```
 React Components
        │
        ▼
 React Shadow Tree
        │
        ▼
 Fabric Calculates Layout
        │
        ▼
 Native View Tree Updated
        │
        ▼
 Android / iOS Paint Screen
```

| Benefit | Why |
|---------|-----|
| **Faster mounting** | Layout closer to native rendering |
| **Better animations** | UI thread coordination improved |
| **Concurrent rendering** | Supports React 18 concurrent features |

---

<a id="shadow-tree"></a>

## 8 · 🌳 What Is a Shadow Tree?

```
 Visible UI                 Shadow Tree
 ──────────                 ───────────
 View                       Layout Nodes Only
 Text                       ├── Width
 Image                      ├── Height
                            ├── Position
                            └── Flexbox
```

The **Shadow Tree** is **not visible UI**. It stores layout information — width, height, position, flexbox values.

| | Visible UI | Shadow Tree |
|---|-----------|-------------|
| **What you see** | Text, colors, images on screen | Invisible layout nodes |
| **Purpose** | Display content | Calculate layout |
| **Who uses it** | User | React + Fabric |

React calculates layout in the shadow tree. Fabric converts those layout nodes into native views on screen.

---

<a id="turbomodules"></a>

## 9 · 📦 TurboModules — Lazy Native Modules

Native modules expose platform APIs to JavaScript:

| Module | Platform API |
|--------|-------------|
| Camera | Device camera |
| Bluetooth | BLE / classic Bluetooth |
| GPS | Location services |
| Storage | File system / Keychain |
| Contacts | Address book |

### TurboModules vs Old Modules

```
 App Starts
      │
      ▼
 Need Camera Module?
      │
  ┌───┴────┐
  │        │
  ▼        ▼
 No       Yes
Nothing   Load Module On Demand
           │
           ▼
      Native Camera Ready
```

| Old Modules | TurboModules |
|-------------|--------------|
| Load **everything** at startup | Load **on demand** |
| Slower startup | Faster startup |
| More memory used | Lower memory footprint |

TurboModules are **lazy-loaded** — a module loads only when JavaScript actually calls it.

---

<a id="new-architecture"></a>

## 10 · 🚀 New Architecture — Four Pieces Together

> **The New Architecture is not one feature.** It's four technologies working together.

```
            REACT COMPONENTS
                    │
                    ▼
          Hermes JavaScript Engine
                    │
                    ▼
        JSI (Direct Communication)
          ┌─────────┴──────────┐
          ▼                    ▼
    Fabric Renderer      TurboModules
          ▼                    ▼
 Native View Tree      Native Device APIs
          ▼                    ▼
     Android / iOS Operating System
```

| Technology | Responsibility |
|------------|----------------|
| **Hermes** | Executes JavaScript |
| **JSI** | Connects JS to Native directly |
| **Fabric** | Renders UI efficiently |
| **TurboModules** | Loads native modules lazily |

Together they **replace the old Bridge architecture** — async JSON messages between JS and native are gone.

**Old Architecture:** Bridge → slow, async, loads all modules at startup
**New Architecture:** JSI + Fabric + TurboModules → fast, direct, lazy

---

<a id="thread-architecture"></a>

## 11 · 🧵 Thread Architecture

```
              REACT NATIVE APP

       ┌─────────────┼─────────────┐
       ▼             ▼             ▼

 JavaScript       UI Thread    Native Modules
   Thread

 React Code       Rendering     Camera, GPS,
 useState         Touch         Storage
 useEffect        Animations    Sensors
 Business logic
```

| Thread | Runs | Examples |
|--------|------|----------|
| **JavaScript** | React, hooks, state, business logic | `useState`, `useEffect`, API calls |
| **UI Thread** | Rendering, gestures, native animations | Touch handling, screen paint |
| **Native Module** | Platform APIs | Camera, Bluetooth, database, sensors |

**Rule:** Heavy work on the JS thread blocks React. Animations and gestures should run on the UI thread when possible — this is why Fabric's improvements matter.

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 15*

</div>
