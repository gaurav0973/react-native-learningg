# What is an app — APK, AAB, IPA, signing

> What an installable React Native application actually contains, how it is packaged for each platform, and why signing and versioning matter before you ship.

**Folder:** 01-internals · **Prerequisites:** — · **Next:** [Metro and the JavaScript bundle](02-metro-and-the-js-bundle.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| APK | Android install package — a ZIP containing native code, assets, manifest, and signature |
| AAB | Android App Bundle — upload format; Google Play generates device-specific APKs |
| IPA | iOS install package — the App Store / TestFlight distribution format |
| JS bundle | Compiled JavaScript your React code becomes at build time |
| Native binaries | Platform code (Kotlin/Java on Android, Swift/Obj-C on iOS) compiled into the app |
| Keystore | Secure file holding the private key used to sign Android releases |
| Digital signature | Certificate embedded in the package proving who built it and that it was not tampered with |
| Debug build | Dev install that loads JS from Metro over the network |
| Release build | Production install with JS embedded inside the package |
| versionName | Human-readable version string shown to users (e.g. `"1.0"`) |
| versionCode | Integer Android uses to decide whether an upload is newer |
| Gradle | Android build tool that compiles, packages, and signs the app |
| AndroidManifest.xml | Declares package identity, permissions, and entry points |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  (1) YOUR SOURCE                          (4) INSTALLABLE PACKAGE
  ┌─────────────────────────┐              ┌─────────────────────────┐
  │ React components (.jsx) │              │ APK  → direct install   │
  │ android/  ios/  assets/   │              │ AAB  → Play Store upload│
  └────────────┬────────────┘              │ IPA  → App Store upload │
               │                            └────────────┬────────────┘
               ▼                                         │
  (2) BUILD PIPELINE                                     ▼
  ┌─────────────────────────┐              (5) USER DEVICE
  │ Metro → JS bundle       │              Package Installer reads
  │ Gradle/Xcode → native   │              Manifest + META-INF signature
  │ Merge assets + configs  │                         │
  └────────────┬────────────┘              ┌───────────┴───────────┐
               │                          ▼                       ▼
               ▼                       Valid cert              Mismatch
  (3) SIGNING                   Install app              Reject install
  ┌─────────────────────────┐
  │ Keystore private key    │  ← release identity; lose it → cannot update
  │ signs unsigned package  │
  └─────────────────────────┘
```

**Reading the diagram.** Box (1) is not "just JavaScript" — a React Native app is JS source plus native project folders, images, fonts, and platform config files. Box (2) is where two parallel pipelines meet: Metro produces the JS bundle, while Gradle (Android) or Xcode (iOS) compiles native code and merges everything into an unsigned package.

Box (3) is the trust layer. Android refuses to install or update an app whose signing certificate does not match what is already on the device or Play Store. Box (4) is the format choice: APK for sideloading and local testing, AAB for Play Store distribution (Google strips unused CPU architectures per device), IPA for iOS.

The load-bearing insight: **an app is a signed native container with your JS bundle baked or streamed inside it** — Metro and Gradle are not interchangeable; they own different halves of the same artifact.

---

<a id="apk-internal-structure"></a>

## 3 · APK internal structure

```text
  APK (ZIP archive)
  ├── AndroidManifest.xml   ← package name, permissions, launcher Activity
  ├── classes.dex           ← compiled Kotlin/Java bytecode
  ├── assets/               ← JS bundle + bundled images/fonts (release)
  ├── lib/                  ← CPU-specific .so files (arm64-v8a, x86_64, …)
  └── META-INF/             ← signature + certificate  ← Android verifies on install
```

When a user taps an APK, the Package Installer reads `AndroidManifest.xml` for identity and permissions, then checks `META-INF/` against any existing install. Certificate mismatch means the update is rejected — which is why you must never lose your release keystore.

This repo's manifest declares the app identity and permissions that ship with every build:

`android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <!-- … -->
    <application android:name=".MainApplication" …>
      <activity android:name=".MainActivity" android:exported="true">
```

---

<a id="debug-vs-release"></a>

## 4 · Debug build vs release build

```text
        DEBUG                              RELEASE
  ┌──────────────────┐              ┌──────────────────┐
  │ App on device    │              │ App on device    │
  │ loads JS via HTTP│              │ JS inside assets/│
  │ localhost:8081   │              │ no Metro needed  │
  └────────┬─────────┘              └────────┬─────────┘
           │                                 │
           ▼                                 ▼
  Developer machine Metro            Metro ran once at build time
  Fast Refresh enabled               Hermes bytecode embedded
  debug.keystore                     release keystore (you own)
```

| | Debug | Release |
|---|-------|---------|
| JS delivery | Streamed from Metro | Embedded in APK/AAB |
| Dev tools | Fast Refresh, dev menu | Stripped out |
| Keystore | Auto-generated debug keystore | Your permanent release keystore |
| Who runs it | Developers only | End users |

Release bundling in this repo is explicit:

`package.json`

```json
"build:android": "react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res",
"android:build:apk": "cd android && gradlew.bat assembleRelease --continue",
"android:build:aab": "cd android && gradlew.bat bundleRelease --continue"
```

---

<a id="apk-vs-aab"></a>

## 5 · APK vs AAB

```text
  Developer uploads                Play Store delivers
  ┌─────────┐                      ┌─────────┐  arm64 phone → arm64 slice only
  │   AAB   │ ─── Google splits ──►│ ~18 MB  │  tablet      → tablet assets only
  │ (one)   │                      └─────────┘
  ┌─────────┐
  │   APK   │ ─── sideload / legacy ──► same file to every device (~larger)
  └─────────┘
```

AAB is preferred for Play Store because users download only the native libraries and assets their device needs. APK remains useful for direct install during development and QA.

---

<a id="signing-and-versioning"></a>

## 6 · Signing and versioning

```text
  versionName "1.0"  ──► shown to humans in Settings / Play listing
  versionCode   1    ──► compared by Play Store; must always increase

  Release 1.0  (code 1) ──sign──► Key A ──upload──► Play Store stores fingerprint
  Release 1.1  (code 2) ──must use Key A again or update rejected
```

`android/app/build.gradle`

```gradle
defaultConfig {
    applicationId "com.first"
    versionCode 1
    versionName "1.0"
}
```

Debug signing is wired locally — release signing is your responsibility before store upload:

`android/app/build.gradle`

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
    }
}
```

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Package identity + permissions | `android/app/src/main/AndroidManifest.xml` | `<manifest>`, `<application>`, `<activity>` |
| Version numbers | `android/app/build.gradle` | `versionCode`, `versionName`, `applicationId` |
| Debug signing | `android/app/build.gradle` | `signingConfigs.debug` |
| Release bundle scripts | `package.json` | `build:android`, `android:build:apk`, `android:build:aab` |
| App registry name | `app.json` | `"name": "first"` — must match native registration |
| Entry registration | `index.js` | `AppRegistry.registerComponent(appName, …)` |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** —
- **Used by:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md), [Native crashes and logcat](06-native-crashes-and-logcat.md), [OS permission lifecycle](12-os-permission-lifecycle.md), [Expo vs React Native CLI](15-expo-vs-react-native-cli.md)
- **Contrast with:** [Expo vs React Native CLI](15-expo-vs-react-native-cli.md#managed-vs-bare) — Expo can hide `android/` until prebuild; this repo owns native folders from day one
- **Common mistake:** bumping `versionName` without incrementing `versionCode` — Play Store ignores the human string → [Signing and versioning](#signing-and-versioning)
