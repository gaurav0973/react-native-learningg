# Metro and the JavaScript bundle

> How Metro turns your React source into a bundle the native app can execute, and why development delivery differs from production.

**Folder:** 01-internals · **Prerequisites:** [What is an app](01-what-is-an-app.md) · **Next:** [App lifecycle and AppState](03-app-lifecycle-and-appstate.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Metro bundler | React Native's JS bundler and dev server — resolves imports, watches files, serves bundles |
| JS bundle | Single (or chunked) JavaScript file containing your app's module graph |
| Entry point | First file Metro executes — `index.js` in this repo |
| Module graph | Tree of files reachable from the entry via `import` / `require` |
| Fast Refresh | Dev-only hot update of changed modules without full restart → [Three build loops](05-three-build-loops.md#fast-refresh) |
| Source map | Mapping from bundled code back to original files for debugging |
| blockList | Metro paths excluded from watching to prevent watcher crashes |
| Hermes | JS engine that executes the bundle on device → [Hermes and the JS engine](09-hermes-and-the-js-engine.md) |
| Dev server | Metro process on your machine (default port 8081) serving JS over HTTP |
| Production bundle | Minified, Hermes-compiled bundle embedded in the APK at build time |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  SOURCE FILES                         METRO BUNDLER
  ┌──────────────┐                    ┌──────────────────────────┐
  │ index.js     │──import chain─────►│ resolve imports          │
  │ App.jsx      │                    │ transpile (Babel)        │
  │ src/screens/ │                    │ watch file changes       │
  │ src/hooks/   │                    │ bundle module graph      │
  └──────────────┘                    └────────────┬─────────────┘
                                                   │
                    ═══════════════════════════════╪══════════════════════
                    DEVELOPMENT                    │           PRODUCTION
                    Metro serves over HTTP         │           Metro runs once
                                                   ▼
                              index.android.bundle / Hermes bytecode
                                                   │
                                                   ▼
                              ┌────────────────────────────────────┐
                              │ Native app (MainActivity)        │
                              │ loads bundle → Hermes executes   │
                              │ → AppRegistry mounts Root        │
                              └────────────────────────────────────┘
```

**Reading the diagram.** Metro's job starts at `index.js` and walks every reachable module. It does not compile Kotlin or Swift — only JavaScript/TypeScript. In development (left path under the double line), the app on device fetches the bundle from your machine's Metro server, which is why Metro must stay running in a separate terminal.

In production (right path), Metro runs once during `build:android` or the Gradle release task, writes the bundle into `android/app/src/main/assets/`, and the installed app never talks to Metro again.

The insight: **Metro owns JavaScript delivery only.** When native code changes, Metro cannot help — you need a full native rebuild → [Three build loops](05-three-build-loops.md).

---

<a id="entry-point-chain"></a>

## 3 · Entry point chain

```text
  index.js
     │  AppRegistry.registerComponent(appName, () => Root)
     ▼
  Root = SafeAreaProvider → App
     ▼
  App = CartProvider → AddressProvider → AppNavigator
     ▼
  Hermes executes → React mounts component tree
```

This is box (1) of the master diagram, opened up. The entry file is the contract between native startup and your React tree:

`index.js`

```javascript
import { AppRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { name as appName } from './app.json';

function Root() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent(appName, () => Root);
```

`app.json` supplies the name native code looks up:

`app.json`

```json
{
  "name": "first",
  "displayName": "first"
}
```

If `appName` here does not match what Gradle/Xcode registered, the app shows a redbox before any of your screens render.

---

<a id="metro-config"></a>

## 4 · Metro configuration in this repo

```text
  Gradle/CMake mid-build
  creates/deletes dirs under android/.gradle, android/build, …
         │
         ▼
  Metro watcher would crash (ENOENT) without blockList
         │
         ▼
  blockList excludes those paths → Metro stays stable alongside builds
```

`metro.config.js`

```javascript
const config = {
  resolver: {
    blockList: [
      /[\\/]android[\\/]\.gradle[\\/]/,
      /[\\/]android[\\/]build[\\/]/,
      /[\\/]android[\\/]app[\\/]build[\\/]/,
      /[\\/]android[\\/]app[\\/]\.cxx[\\/]/,
      /[\\/]ios[\\/]build[\\/]/,
      /[\\/]ios[\\/]Pods[\\/]/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

Run Metro with `npm run start` (Terminal 1). Pure `.js`/`.jsx` edits only need Metro's reload — not `npm run android`.

---

<a id="dev-vs-prod-delivery"></a>

## 5 · Development vs production delivery

```text
  DEBUG                         RELEASE
  Device ──HTTP──► Metro:8081    Device reads assets/index.android.bundle
  Fast Refresh on save           Bundle minified + Hermes bytecode at build
  Requires adb reverse on        No network dependency after install
  physical device (8081)
```

Production bundle output path from `package.json`:

```json
"build:android": "react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res"
```

Metro's role in production is **one-shot bundling** — see [What is an app](01-what-is-an-app.md#debug-vs-release) for how Gradle embeds the result.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Entry registration | `index.js` | `AppRegistry.registerComponent` |
| App name for native | `app.json` | `"name"` field |
| Metro watcher safety | `metro.config.js` | `resolver.blockList` |
| Start dev server | `package.json` | `"start": "react-native start --client-logs"` |
| Release bundle command | `package.json` | `"build:android"` |
| Root component tree | `App.jsx` | Providers wrapping `AppNavigator` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [What is an app](01-what-is-an-app.md)
- **Used by:** [App lifecycle and AppState](03-app-lifecycle-and-appstate.md), [Three build loops](05-three-build-loops.md), [Hermes and the JS engine](09-hermes-and-the-js-engine.md)
- **Contrast with:** Gradle/Xcode — they compile native code; Metro never touches `.kt`, `.swift`, or manifest files
- **Common mistake:** running `npm run android` after every JS edit — Metro Fast Refresh handles pure JS changes; rebuild only when native deps change → [Three build loops](05-three-build-loops.md#which-loop)
