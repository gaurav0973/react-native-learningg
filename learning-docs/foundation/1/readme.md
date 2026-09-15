# 📖 Module 1 — Deep Dive Notes

### React Native: What Actually Is an App?

![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)
![Topic](https://img.shields.io/badge/Topic-APK%20·%20AAB%20·%20IPA%20·%20Signing%20·%20Versioning-6C63FF?style=for-the-badge)

> **Question:** What is an app — APK / AAB / IPA, signing, keystore, versionCode vs versionName?

---

## 1 · 🏠 What Actually Is an App?

An **application** is not just JavaScript. It's a fully packaged bundle containing:

- **JS bundle** — your compiled React component code
- **Native binaries** — platform-specific compiled code (Java/Kotlin or Swift/Obj-C)
- **Assets** — images, fonts, media
- **Configs** — `AndroidManifest.xml`, `Info.plist`
- **Digital signature** — the certificate that proves who built it

```
                    REACT NATIVE APP
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  JavaScript Code      Native Android      Native iOS
 (React Components)   (Java / Kotlin)   (Swift / Obj-C)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                     Assets + Config
              (Images, Fonts, Manifest, Info.plist)
                           │
                           ▼
                  INSTALLABLE APPLICATION
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
      APK                AAB                IPA
 (Android Install)  (Play Store Build)  (iOS Install)
```


| Format  | Platform | Used For                 |
| ------- | -------- | ------------------------ |
| **APK** | Android  | Direct device install    |
| **AAB** | Android  | Google Play Store upload |
| **IPA** | iOS      | App Store / TestFlight   |


---



## 2 · 🔄 Complete Production Pipeline

The four stages of shipping a React Native app:


| Stage                     | Tool Responsible                                     |
| ------------------------- | ---------------------------------------------------- |
| JS Bundle creation        | **Metro Bundler**                                    |
| Android / iOS compilation | **Gradle** / **Xcode**                               |
| Packaging                 | **Gradle** / **Xcode**                               |
| Signing                   | **Keystore** (Android) / **Apple Certificate** (iOS) |


```
               YOU WRITE CODE
                      │
                      ▼
         React Native Project Folder
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
  JavaScript     Android Code    iOS Code
  Components     Java/Kotlin     Swift/Obj-C
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
               Metro Bundler
                      │
                      ▼
       index.android.bundle / index.ios.bundle
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
     Android (Gradle)       iOS (Xcode)
            │                   │
    Compile Native Code  Compile Native Code
    Merge Resources      Merge Resources
    Embed JS Bundle      Embed JS Bundle
    Compress Assets      Compress Assets
            │                   │
            ▼                   ▼
     Unsigned APK/AAB      Unsigned IPA
            │                   │
            └─────────┬─────────┘
                      │
                      ▼
               Digital Signing
                      │
                      ▼
          Play Store / App Store
                      │
                      ▼
             User Installs App
```

---



## 3 · 📱 APK Internal Structure

An APK file is a ZIP archive. When you unpack it, here's what's inside:

```
APK
│
├── AndroidManifest.xml  →  Identity: package name, permissions, entry points
├── classes.dex          →  Native code: compiled Java & Kotlin (Dalvik bytecode)
├── assets/              →  React Native JS bundle + images, fonts
├── lib/                 →  CPU-specific native binaries (arm64-v8a, x86_64)
└── META-INF/            →  Trust: signature file + certificate
```

> **Why does** `META-INF` **matter?**
> When Android installs an APK, it reads the certificate in `META-INF` and verifies it against what's already on the device.
> If they don't match → **installation is rejected**.

---



## 4 · 🐛 Debug Build vs Release Build

```
            REACT NATIVE BUILD
                   │
      ┌────────────┴────────────┐
      │                         │
      ▼                         ▼
  DEBUG BUILD             RELEASE BUILD
      │                         │
 Starts Metro Server     Metro Creates Bundle
      │                         │
 JS Loaded via HTTP      JS Embedded in APK
 localhost:8081          assets/index.android.bundle
      │                         │
 Debug Tools Enabled     Optimized Bundle
 Fast Refresh            Minified Code
 Flipper                 Hermes Optimizations
      │                         │
 Debug Keystore          Release Keystore
      │                         │
      ▼                         ▼
 Debug APK               Release APK / AAB
```


|              | Debug                            | Release                         |
| ------------ | -------------------------------- | ------------------------------- |
| JS source    | Loaded from Metro over HTTP      | Bundled inside the APK          |
| Bundle state | Not minified, readable           | Minified + Hermes-optimized     |
| Dev tools    | ✅ Fast Refresh, Flipper, DevMenu | ❌ All stripped out              |
| Keystore     | Auto-generated debug keystore    | Your permanent release keystore |
| Who runs it  | Developer machine only           | End users via Play Store        |


**How the two modes differ physically:**

```
Debug App (Phone)
  │
  ├── "I need Metro to run!"
  ▼
Developer Machine (serves JS over localhost:8081)


Release App (Phone)
  │
  └── Everything already inside APK — no external dependencies
```

---



## 5 · ⚙️ Metro's Role

> **Metro exists during development only.** In production, it's gone.

Metro is React Native's JavaScript bundler and development server. It watches your files, resolves imports, and serves the bundle to the app running on your device or emulator.

```
App.js
│
├── HomeScreen.js
├── CartScreen.js
├── Components/
├── Assets/
└── Utilities/
     │
     ▼
    Metro
     │
     ├── Resolves Imports
     ├── Bundles all JS into one file
     ├── Watches for File Changes
     ├── Enables Fast Refresh
     └── Generates Source Maps
     │
     ▼
JavaScript Bundle
```


| Environment     | How JS is delivered                           |
| --------------- | --------------------------------------------- |
| **Development** | App → Metro Server → Bundle sent over network |
| **Production**  | App → Bundle already baked inside the APK     |


---



## 6 · 🌐 APK vs AAB

**APK** — one giant package for every device. You upload it, everyone gets the same file.

**AAB** (Android App Bundle) — you give Google a blueprint. Google builds the right APK for each specific device.

```
           DEVELOPER
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
  APK                   AAB
  (direct install)       │
                         ▼
                  Google Play Store
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
      arm64 APK       x86 APK       Tablet APK
         │               │               │
         ▼               ▼               ▼
         └──── User gets only the compatible APK ────┘
```

**Why downloads are smaller with AAB:**


| Device              | What it downloads                                  |
| ------------------- | -------------------------------------------------- |
| Pixel phone (arm64) | Only arm64 native libs + phone assets → ~**18 MB** |
| Samsung tablet      | Only tablet-optimized assets → ~**23 MB**          |


> Developer uploads **one** AAB. Google strips everything the device doesn't need before delivering it.


|                            | APK         | AAB             |
| -------------------------- | ----------- | --------------- |
| One file for all devices   | ✅           | ❌               |
| Direct install (sideload)  | ✅           | ❌               |
| Smaller user downloads     | ❌           | ✅               |
| Recommended for Play Store | ⚠️ (legacy) | ✅ **Preferred** |


---



## 7 · 🔏 APK Signing Architecture



### The Trust System

Every APK must be signed. Signing proves **who built the app** and guarantees the APK hasn't been tampered with.

- **Private Key** → creates the signature (stays on your machine, never share)
- **Public Certificate** → verifies the signature (embedded in the APK's `META-INF/`)

```
            KEYSTORE
               │
 ┌─────────────┴─────────────┐
 │                           │
 ▼                           ▼
Private Key              Public Certificate
 │                           │
 └─────────────┬─────────────┘
               ▼
          Sign APK / AAB
               │
               ▼
     Signed Application Package
               │
               ▼
        Android Installation
               │
               ▼
    Verify Certificate Matches?
         │               │
        YES              NO
         │               │
         ▼               ▼
    Install App     Reject Installation
```

---



## 8 · 🗝️ Keystore Anatomy

A keystore file is a secure container that holds your app's signing credentials.

```
my-upload-key.keystore
│
├── Alias: foodie              ← the name of the key entry inside the store
│
├── Private Key
│     Used to digitally sign your APK / AAB
│
├── Certificate
│     Your public identity — embedded in every signed build
│
├── Validity Period
│     How long the certificate is trusted
│
└── Metadata
      Organization, country, etc.
```

---



## 9 · ⚠️ Why Losing a Keystore Is Dangerous

```
Release 1.0  →  Signed with Key A  →  Uploaded to Play Store
     │
     ▼
Release 1.1  →  Need Key A to sign the update
     │
     ├── Use Key A  →  ✅  Accepted by Play Store
     └── Use Key B  →  ❌  Rejected — certificate mismatch!
```

**How Play Store validates updates:**

```
Existing App on Play Store
  Certificate Fingerprint:  SHA256 = ABC123

New Upload Attempt
  Certificate Fingerprint:  SHA256 = XYZ789

Result:  Mismatch → Update Rejected
```

> 🔴 If you lose your release keystore, you **cannot push updates** to your existing app — ever.
> You would have to publish a brand-new app with a new package name.

---



## 10 · 🔑 Debug Keystore vs Release Keystore

```
                    SIGNING
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
   Debug Keystore             Release Keystore
         │                           │
 Generated Automatically       Created By Developer
         │                           │
 Same on Dev Machine           Permanent Identity
         │                           │
 Used for Emulator/Dev         Used for Play Store
         │                           │
 Can be Recreated              Must Never Lose
```


|            | Debug Keystore                | Release Keystore               |
| ---------- | ----------------------------- | ------------------------------ |
| Created by | Android SDK automatically     | You, manually                  |
| Location   | `~/.android/debug.keystore`   | Wherever you store it securely |
| Purpose    | Dev builds / emulator testing | Google Play Store distribution |
| If lost    | Regenerate freely             | ⛔ App can **never be updated** |


---



## 11 · 🔢 versionCode vs versionName

```
             APPLICATION VERSIONING

          Human Side           Android Side
               │                    │
               ▼                    ▼
         versionName           versionCode
               │                    │
          "2.3.1"                  18
               │                    │
   Visible to Users         Compared by Play Store
```

- **versionName** → can be anything readable — `"1.0"`, `"2.3.1"`, `"Oreo"` — for humans
- **versionCode** → must **always increase** — Play Store uses this integer to decide if an update is newer

**Release timeline example:**

```
v1.0.0  versionCode=1  →  Initial release
   │
   ▼
v1.0.1  versionCode=2  →  Bug fix patch
   │
   ▼
v1.1.0  versionCode=3  →  New feature added
   │
   ▼
v2.0.0  versionCode=4  →  Major breaking change / rewrite
```

---



## 12 · 📐 Semantic Versioning

```
        MAJOR . MINOR . PATCH

             2 . 3  . 5
             │   │    │
             │   │    └──── Patch  →  Bug Fix (backwards compatible)
             │   │
             │   └──────── Minor  →  New Feature (backwards compatible)
             │
             └────────── Major  →  Breaking Change (not backwards compatible)
```


| Part      | When to bump                     | Example           |
| --------- | -------------------------------- | ----------------- |
| **PATCH** | Bug fix, no API changes          | `1.0.0` → `1.0.1` |
| **MINOR** | New feature, old API still works | `1.0.1` → `1.1.0` |
| **MAJOR** | Breaking API changes             | `1.1.0` → `2.0.0` |


---



## 13 · 🚀 React Native Release Build — Full Android Pipeline

```
npx react-native build-android
              │
              ▼
       Metro Bundler Starts
              │
              ▼
  Create index.android.bundle
              │
              ▼
          Gradle Begins
              │
              ├── Compile Kotlin
              ├── Compile Java
              ├── Merge Resources
              ├── Merge Manifest
              ├── Add JS Bundle
              ├── Add Assets
              └── Optimize Native Libraries
              │
              ▼
        Unsigned APK / AAB
              │
              ▼
       Load Keystore (.jks)
              │
              ▼
      Sign Using Private Key
              │
              ▼
      Signed APK / Signed AAB
              │
              ▼
      Ready for Distribution ✅
```

---



## 14 · 🔍 Android Installation Verification Flow

> What happens the moment a user taps an APK file:

```
User Taps APK
      │
      ▼
Package Installer
      │
      ▼
Read AndroidManifest.xml       ←  checks package name, permissions
      │
      ▼
Read META-INF Signature        ←  extracts the certificate
      │
      ▼
Verify Certificate
      │
 ┌────┴────┐
 │         │
 ▼         ▼
Valid     Invalid
 │         │
 ▼         ▼
Install  Installation Failed
```

---



## 15 · 🍎 Android vs iOS Build Ecosystem

```
                    REACT NATIVE
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
      Android                           iOS
        │                                 │
        ▼                                 ▼
      Gradle                            Xcode
        │                                 │
        ▼                                 ▼
 AndroidManifest.xml                Info.plist
        │                                 │
        ▼                                 ▼
      APK / AAB                          IPA
        │                                 │
        ▼                                 ▼
 Google Play Store                App Store Connect
        │                                 │
        ▼                                 ▼
    Android Phone                       iPhone
```


|               | Android                       | iOS                         |
| ------------- | ----------------------------- | --------------------------- |
| Build Tool    | Gradle                        | Xcode                       |
| Config File   | `AndroidManifest.xml`         | `Info.plist`                |
| Output Format | APK / AAB                     | IPA                         |
| Distribution  | Google Play Store             | App Store Connect           |
| Signing       | Keystore `.jks` / `.keystore` | Apple Developer Certificate |


---



## 16 · 🗃️ Important Native Files


| File                       | Why You'll Use It                                    |
| -------------------------- | ---------------------------------------------------- |
| `android/app/build.gradle` | Version numbers, signing config, SDK configuration   |
| `AndroidManifest.xml`      | Permissions, deep links, package identity            |
| `assets/`                  | Images, fonts, and the bundled JS resources          |
| `ios/Info.plist`           | iOS permissions and app metadata                     |
| `my-upload-key.keystore`   | Android signing identity — **keep this safe always** |


---

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 1*