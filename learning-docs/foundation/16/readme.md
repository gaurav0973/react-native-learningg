<div align="center">

# 📖 Module 16 — Deep Dive Notes
### React Native: Expo vs CLI

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Expo%20·%20Bare%20CLI%20·%20Managed%20·%20Prebuild%20·%20EAS-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Expo vs React Native CLI — who owns the native Android/iOS layer, and why does this course use Bare CLI?
>
> Expo is **not a different framework** — it's a platform built on top of React Native. The real question is: **who owns the native layer?**

---

<a id="first-principle-ownership"></a>

## 1 · 🎯 First Principle — An Ownership Decision

```
         REACT NATIVE APP
                │
     ┌──────────┴──────────┐
     ▼                     ▼
   EXPO               BARE CLI
Expo Manages         You Manage
 android/ ios/       android/ ios/
 Hidden from you     Visible to you
```

| | Expo | Bare CLI |
|---|------|----------|
| **Who owns native?** | Expo manages it | You manage it |
| **Built on RN?** | ✅ Yes | ✅ Yes |
| **Produces real apps?** | ✅ APK / IPA | ✅ APK / IPA |

> **Managed vs Bare is an ownership decision, not a UI decision.**

Both workflows produce Android and iOS applications. The difference is how much of the native layer you control.

**Why this course uses Bare CLI:** To teach native architecture, permissions, Gradle/CocoaPods builds, and native modules used in production React Native apps.

**This project is Bare CLI:** You have `android/`, `ios/`, `AndroidManifest.xml`, `build.gradle`, and `MainActivity.kt` from day one.

---

<a id="two-workflows-at-a-glance"></a>

## 2 · 🔥 Two Workflows at a Glance — Memorize This Table

| | Expo Managed | Bare CLI |
|---|-------------|----------|
| **Native folders** | Hidden (`android/` / `ios/` not visible) | Visible and editable |
| **Native APIs** | Expo SDK APIs | Install native libraries yourself |
| **Configuration** | `app.json` | `AndroidManifest.xml`, `Info.plist`, Gradle |
| **Dev runtime** | Expo Go / EAS | Gradle / CocoaPods |
| **Setup** | Easy onboarding | Full native control |
| **Native deps** | Expo upgrades them | You upgrade them |
| **Flexibility** | Simpler start | Maximum flexibility |

---

<a id="what-is-react-native-cli"></a>

## 3 · 🛠️ What Is React Native CLI?

```
     npx react-native init App
                │
                ▼
     Complete Native Project

     ├── android/
     ├── ios/
     ├── src/
     ├── package.json
     ├── metro.config.js
     └── babel.config.js
```

React Native CLI creates a **real Android Studio project** and a **real Xcode project**. The `android/` and `ios/` folders contain native code you can open and edit.

### Android folder structure

```
android/
├── app/
├── build.gradle
├── gradle.properties
├── AndroidManifest.xml
└── MainActivity.kt
```

### iOS folder structure

```
ios/
├── AppDelegate.swift
├── Info.plist
├── Podfile
└── Xcode Project
```

**Implemented in this app:** `android/app/src/main/AndroidManifest.xml` (permissions), `android/gradle.properties` (`hermesEnabled`, `newArchEnabled`), `metro.config.js` (Metro bundler config).

---

<a id="what-is-expo"></a>

## 4 · 📦 What Is Expo?

```
     npx create-expo-app
               │
               ▼
   JavaScript / TypeScript App
               │
               ▼
        Expo Runtime
               │
               ▼
 Expo Manages Native Projects
   (Hidden from Developer)
```

Expo gives you a React Native project **without exposing native folders initially**. Expo generates and manages the native code internally until you choose otherwise.

| Fact | Detail |
|------|--------|
| **Different framework?** | ❌ No — Expo is built on React Native |
| **Native code exists?** | ✅ Yes — Expo just hides it in managed workflow |
| **Can you get native folders later?** | ✅ Yes — via `expo prebuild` |

---

<a id="managed-vs-bare-workflow"></a>

## 5 · 🔀 Managed Workflow vs Bare Workflow

```
            YOUR CODE
                │
       React Components
                │
      ┌─────────┴─────────┐
      ▼                   ▼
 Managed Workflow     Bare Workflow
 Expo owns native     You own native
 Android/iOS hidden   Android/iOS editable
```

| Managed (Expo) | Bare CLI |
|----------------|----------|
| Native code hidden | Native code visible |
| Expo upgrades native dependencies | You upgrade native dependencies |
| Easy onboarding | Maximum flexibility |
| `app.json` drives config | Edit native files directly |

Expo is **not all-or-nothing**. You can start managed and later own the native code — that's the **Bare Workflow** within Expo.

---

<a id="expo-go-vs-bare-runtime"></a>

## 6 · 📱 How Expo Go Runs vs Bare CLI

### Expo Go (development)

```
 JavaScript Code
        │
        ▼
   Expo Go App          ← you don't install YOUR app
        │
        ▼
  Hermes Runtime
        │
        ▼
 Expo Native Modules
 (Camera, Location, Notifications, Storage)
```

When using **Expo Go**, you install Expo Go — not your own native app. Expo Go already contains dozens of native modules. Your JS runs **inside** Expo Go. That's why development feels fast.

### Bare CLI (this project)

```
 React Native Code
         │
         ▼
      Hermes
         │
         ▼
  Your Native App
         │
 ┌───────┴─────────┐
 ▼                 ▼
Android APK      iOS IPA
         │
         ▼
 Device Runs YOUR App
```

Bare CLI builds **your own APK/IPA**. There is no Expo Go runtime between your app and Android. Your application owns everything.

---

<a id="expo-sdk-vs-native-modules"></a>

## 7 · 🧩 Expo SDK vs Native Modules

```
 JavaScript App
       │
       ▼
 Expo SDK APIs          ← maintained by Expo
 (Camera, Image Picker,
  Notifications, Location, Sensors)
       │
       ▼
 Native Android / iOS APIs
```

| Expo SDK | Bare CLI native modules |
|----------|------------------------|
| Pre-packaged, maintained by Expo | You install and link yourself |
| `npx expo install camera` | `npm install` + Gradle + Pods |
| Simpler when in SDK | Full control over any library |

Instead of installing native libraries yourself, Expo ships many of them in the SDK.

---

<a id="why-expo-feels-easier"></a>

## 8 · ⚡ Why Expo Feels Easier

```
Create App → Run Expo Go → Scan QR → App Opens → Fast Refresh
```

| Step Expo skips (initially) | Bare CLI requires |
|----------------------------|-------------------|
| Android Studio build | ✅ Gradle build |
| Xcode build | ✅ CocoaPods + Xcode |
| Gradle setup | ✅ `android/build.gradle` |
| CocoaPods setup | ✅ `ios/Podfile` |
| Native linking | ✅ Manual or autolinking |

That's why beginners love Expo — many setup steps are removed. Bare CLI exposes them so you learn how RN becomes an APK/IPA.

---

<a id="where-expo-hits-limits"></a>

## 9 · 🚧 Where Expo Hits Limits

```
    Need Feature?
          │
          ▼
 Is it inside Expo SDK?
          │
    ┌─────┴──────┐
    │            │
    ▼            ▼
   Yes          No
 Use SDK    Need Native Module
                  │
                  ▼
           Prebuild / Bare
```

Eventually you need something the Expo SDK doesn't include:

| Example | Why it breaks managed |
|---------|----------------------|
| Custom Bluetooth SDK | Not in Expo SDK |
| Payment SDK (Stripe native) | Needs native config |
| Native C++ modules | Requires native project access |

Now Expo needs native code — that's when **`expo prebuild`** enters.

---

<a id="expo-prebuild"></a>

## 10 · 🏗️ What Is `expo prebuild`?

```
 Expo Managed Project
        │
        ▼
   expo prebuild
        │
        ▼
   Generates:
   android/
   ios/
        │
        ▼
 Bare Native Project Created
```

| What prebuild does | What it does NOT do |
|--------------------|---------------------|
| Generates `android/` and `ios/` from `app.json` | Rewrite your React code |
| Converts managed → bare native project | Change your JS components |
| Applies config plugins (permissions, etc.) | Remove Expo entirely |

### Managed → Bare path

```
Expo Managed → app.json → expo prebuild → android/ + ios/ → Bare Workflow
```

---

<a id="native-dependency-installation"></a>

## 11 · 📥 Native Dependency Installation

```
Need Camera Library

──────── WEB THINKING ────────
npm install camera → Done

──────── REACT NATIVE CLI ─────
npm install package
        ↓
Android Gradle
        ↓
iOS Pods
        ↓
Native Build

──────── EXPO ────────────────
npx expo install camera
        ↓
Expo SDK Handles Native Setup
```

| CLI install often includes | Expo (when in SDK) |
|---------------------------|-------------------|
| Gradle changes | Simplified install |
| CocoaPods | Expo manages native setup |
| Native linking | Config plugins |
| Permission entries | Generated from `app.json` |

**Implemented in this app:** Packages like `@notifee/react-native` and `@react-native-async-storage/async-storage` required native Gradle setup — that's why you run `npm run android` after installing native deps.

---

<a id="build-pipeline-comparison"></a>

## 12 · 🔨 Build Pipeline Comparison

### CLI Build (this project)

```
JavaScript → Metro Bundler → Hermes Bytecode → Gradle / Xcode → APK / IPA
```

### Expo Build

```
JavaScript → Metro → EAS Build Service → APK / IPA
```

| | Both use | Difference |
|---|---------|------------|
| **Bundler** | Metro | Same |
| **JS engine** | Hermes | Same |
| **Native compile** | CLI: Gradle/Xcode locally | Expo: EAS Build (remote or local) |

**Implemented in this app:** `npm run build:android` bundles JS into `android/app/src/main/assets`. `npm run android:build:apk` runs Gradle `assembleRelease`.

---

<a id="permissions-workflow"></a>

## 13 · 🔐 Permissions Workflow

```
Need Camera Permission
        │
        ▼
```

| Bare CLI | Expo |
|----------|------|
| Edit `AndroidManifest.xml` | Configure `app.json` |
| Edit `Info.plist` | Expo Config Plugin |
| Native permission dialog | Manifest generated automatically |

**Implemented in this app:** `AndroidManifest.xml` declares `ACCESS_FINE_LOCATION` and `POST_NOTIFICATIONS`. Runtime prompts use `PermissionsAndroid` in JS — manifest must exist first or the prompt never appears.

| Permission | Where declared (CLI) |
|------------|---------------------|
| Camera | `AndroidManifest.xml` + runtime request |
| Location | `ACCESS_FINE_LOCATION` in manifest |
| Notifications | `POST_NOTIFICATIONS` (Android 13+) |

CLI requires editing native files. Expo generates permission entries from configuration.

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 16*

</div>
