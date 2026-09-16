# Expo vs React Native CLI — who owns native

> Managed Expo hides the native layer; Bare React Native CLI exposes it — this repo uses CLI so you edit Gradle, manifest, and native modules directly.

**Folder:** 01-internals · **Prerequisites:** [What is an app](01-what-is-an-app.md), [Three build loops](05-three-build-loops.md) · **Next:** [What the platform lacks](08-what-the-platform-lacks.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| React Native CLI | `npx react-native init` — generates visible `android/` and `ios/` projects |
| Expo managed workflow | Expo owns native projects; you start with JS + `app.json` only |
| Expo bare workflow | Expo tooling with exposed native folders — hybrid ownership |
| expo prebuild | Generates `android/` and `ios/` from `app.json` and config plugins |
| Expo Go | Prebuilt dev app containing Expo native modules — not your APK |
| EAS Build | Expo cloud/local build service producing APK/IPA |
| Native ownership | Who edits Gradle, Podfile, manifest, and links native npm packages |
| Autolinking | RN CLI discovers native modules from `node_modules` at build time |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
              REACT NATIVE (same JS/React model)
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   EXPO MANAGED                   BARE CLI (this repo)
   native hidden                  android/ ios/ visible
   app.json config                AndroidManifest.xml
         │                         build.gradle, MainActivity
         ▼                             │
   Expo Go / EAS Build                 ▼
         │                         npm run android
         ▼                         Gradle → YOUR APK
   Expo-managed APK/IPA            full native control
```

**Reading the diagram.** Expo is not a different framework — it is a platform on top of React Native. The split is **who owns native code**. Managed Expo defers Gradle/Xcode to Expo's infrastructure; you configure permissions and plugins through `app.json`. Bare CLI gives you the native tree on day one, which is why this learning project can open `AndroidManifest.xml`, set `hermesEnabled`, and add Notifee with manual rebuilds.

Both paths use Metro and Hermes for JS. Both ship real store binaries. The difference is visibility and responsibility when a native module needs a manifest line or a Gradle change.

The insight: **Expo vs CLI is an ownership decision, not a UI framework choice.**

---

<a id="managed-vs-bare"></a>

## 3 · Managed vs bare — side by side

```text
  MANAGED EXPO                    BARE CLI (Foodie / first)
  ─────────────                   ─────────────────────────
  android/ hidden                 android/ in repo ✅
  expo install camera             npm install + Gradle rebuild
  permissions via app.json        edit AndroidManifest.xml ✅
  Expo Go for dev                 your own debug APK ✅
```

| | Expo managed | Bare CLI (this repo) |
|---|---|---|
| Native folders | Hidden until prebuild | Present from init |
| Dev runtime | Expo Go / dev client | `npm run android` |
| Config surface | `app.json`, plugins | Manifest, Gradle, plist |
| Native deps | Expo SDK or prebuild | You link + rebuild |

---

<a id="this-repo-is-cli"></a>

## 4 · This repo is Bare CLI — evidence

```text
  first/
  ├── android/          ← Gradle project
  │   └── app/src/main/AndroidManifest.xml
  ├── ios/              ← Xcode project (macOS builds)
  ├── index.js
  ├── metro.config.js
  └── app.json          ← name only; not Expo config
```

Native flags you edit directly:

`android/gradle.properties`

```properties
hermesEnabled=true
newArchEnabled=true
```

`app.json` here is minimal — not Expo's full config schema:

```json
{
  "name": "first",
  "displayName": "first"
}
```

Install flow for native packages matches README/CLAUDE: `npm install` then `npm run android` → [Three build loops](05-three-build-loops.md).

---

<a id="expo-go-vs-own-apk"></a>

## 5 · Expo Go vs your own debug APK

```text
  EXPO GO                         BARE CLI DEV BUILD
  ┌─────────────────┐             ┌─────────────────┐
  │ Expo's native   │             │ com.first APK   │
  │ module bundle   │             │ your modules    │
  │ your JS inside  │             │ only what you   │
  └─────────────────┘             │ installed       │
                                  └─────────────────┘
```

Expo Go is fast onboarding because native modules are preinstalled. Bare CLI compiles **your** binary with **your** native dependencies (`@notifee/react-native`, geolocation, etc.) — slower first build, production-faithful.

---

<a id="native-dependency-install"></a>

## 6 · Native dependency installation contrast

```text
  WEB:     npm install → done

  CLI:     npm install @notifee/react-native
           → autolinking + Gradle
           → npm run android (full rebuild)

  EXPO:    npx expo install notifee
           → SDK / config plugin (when supported)
           → may still need prebuild for unknown native code
```

This repo's `package.json` native deps all required Gradle after install. Manifest permissions were added manually for location and notifications → [OS permission lifecycle](12-os-permission-lifecycle.md).

---

<a id="prebuild-bridge"></a>

## 7 · expo prebuild — escape hatch from managed

```text
  Expo managed project
         │
         ▼
    expo prebuild
         │
         ▼
  generates android/ + ios/
         │
         ▼
  same shape as CLI from here forward
```

Prebuild does not rewrite your React components — it exposes native projects. After prebuild, workflow resembles this repo: edit manifest, run Gradle, full rebuild loops apply.

---

<a id="build-pipeline"></a>

## 8 · Build pipeline — both use Metro + Hermes

```text
  JavaScript → Metro → Hermes bytecode → Gradle/Xcode → APK/IPA
                     ▲
                     same bundler both paths
```

CLI release commands in this repo:

`package.json`

```json
"build:android": "react-native bundle --platform android --dev false …",
"android:build:apk": "cd android && gradlew.bat assembleRelease --continue",
"android:build:aab": "cd android && gradlew.bat bundleRelease --continue"
```

Expo would typically use EAS Build for the same native compile step remotely — Metro side is identical → [What is an app](01-what-is-an-app.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 9 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| CLI project structure | `android/`, `ios/` | full native trees |
| Gradle + Hermes + New Arch | `android/gradle.properties` | `hermesEnabled`, `newArchEnabled` |
| Manual manifest edits | `AndroidManifest.xml` | permissions, deep links |
| Metro config | `metro.config.js` | dev bundler (shared with Expo) |
| Native module examples | `package.json` | Notifee, geolocation, AsyncStorage |
| Build scripts | `package.json` | `android`, `android:build:apk` |

---

<a id="wiring"></a>

## 10 · Wiring

- **Builds on:** [What is an app](01-what-is-an-app.md), [Three build loops](05-three-build-loops.md)
- **Used by:** Every implementation note that touches native files
- **Contrast with:** Expo managed — trades native visibility for faster initial setup
- **Common mistake:** expecting `expo install` workflow in a CLI repo — use npm + Gradle rebuild → [Native dependency install](#native-dependency-install)
