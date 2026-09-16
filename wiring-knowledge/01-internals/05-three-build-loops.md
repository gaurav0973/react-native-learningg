# The three build loops

> Which feedback loop to use when you change React UI, JavaScript runtime setup, or native platform files — and why rebuilding every time wastes minutes.

**Folder:** 01-internals · **Prerequisites:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md) · **Next:** [Expo vs React Native CLI](15-expo-vs-react-native-cli.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Fast Refresh | Metro hot-swaps changed JS modules; Hermes VM and state preserved |
| Reload | Full JS bundle re-executed; Hermes VM destroyed and recreated |
| Full rebuild | Native compile + new APK/IPA install — slowest loop |
| Hermes VM | JS engine instance — reused, restarted, or recreated per loop |
| Native deps trigger | Installing a package with native code forces full rebuild |
| Delta bundle | Fast Refresh sends only changed modules, not entire graph |
| Dev menu reload | Shake device → Reload — triggers Reload loop |
| Gradle / Xcode | Native build tools — only involved in full rebuild |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  YOU SAVE A FILE / RUN A COMMAND
              │
              ▼
     "What layer changed?"
              │
  ┌───────────┼───────────┐
  │           │           │
  ▼           ▼           ▼
 JSX/styles  JS runtime   Native files
  │           │           │
  ▼           ▼           ▼
(1) FAST     (2) RELOAD   (3) FULL
 REFRESH                 REBUILD
  │           │           │
  ▼           ▼           ▼
 Metro       Metro       Metro bundle +
 delta       full        Gradle/Xcode
  │           │           │
  ▼           ▼           ▼
 Hermes      Hermes       New APK +
 reused      restarted    new process +
 state ✅    state ❌     new Hermes ❌
```

**Reading the diagram.** The decision tree is the whole note. Row (1) is the default during development — edit a screen, save, see UI update in under a second with state intact. Row (2) is when the JavaScript **runtime** needs a clean boot: env vars, navigation initial route, stuck Fast Refresh. Row (3) is when **native** files change — Metro cannot compile Kotlin or update the manifest.

Metro's role differs per row: delta in (1), full bundle in (2), production bundle handed to Gradle in (3) → [Metro and the JS bundle](02-metro-and-the-js-bundle.md).

The insight: **match the loop to the layer you touched** — using full rebuild for a JSX tweak costs minutes; using Fast Refresh after a manifest edit changes nothing on device.

---

<a id="fast-refresh"></a>

## 3 · Fast Refresh — the fastest loop

```text
  Edit HomeScreen.js → Save
         │
         ▼
  Metro detects change → recompile THAT module only
         │
         ▼
  Delta sent to Hermes → React Refresh swaps implementation
         │
         ▼
  Re-render — useState / Context preserved ✅
```

| Preserved | Reset / re-run |
|---|---|
| `useState`, `useRef`, Context | `useEffect` cleanup + body on updated component |
| Redux store | — |

Fast Refresh **falls back to Reload** when hook order changes or exports change — React's rules of hooks require stable call order.

---

<a id="reload-loop"></a>

## 4 · Reload — restart JavaScript only

```text
  Dev menu → Reload
         │
         ▼
  Destroy Hermes VM → clear JS memory
         │
         ▼
  Metro sends fresh bundle → execute index.js from scratch
         │
         ▼
  Mount Root — all in-memory state gone ❌
```

Use Reload when you change `.env` (`API_BASE_URL` via `react-native-config`), Context initial values, or navigation structure. AsyncStorage on disk still survives Reload.

Entry re-executes:

`index.js`

```javascript
AppRegistry.registerComponent(appName, () => Root);
```

---

<a id="full-rebuild"></a>

## 5 · Full rebuild — native compilation

```text
  Native file changed (Manifest, Gradle, new native npm package)
         │
         ▼
  npm run android   ← Terminal 2; Metro stays in Terminal 1
         │
         ▼
  Gradle compile → package APK → install → new process → new Hermes
```

**When you MUST full rebuild:**

| File changed | Why |
|---|---|
| `AndroidManifest.xml` | Permissions, intent filters |
| `build.gradle` | SDK, signing, native deps |
| New native library | Gradle must link native code |
| `.kt` / `.swift` | Native source changed |

This repo's workflow from `CLAUDE.md`: keep `npm run start` running; only re-run `npm run android` after native deps or native file edits.

---

<a id="which-loop"></a>

## 6 · Decision tree — which loop?

```text
  Changed JSX / styles / hook logic?     → Fast Refresh
  Changed .env / nav initial route?    → Reload
  Changed AndroidManifest / Gradle?    → Full rebuild
  npm install package with native code?  → Full rebuild
```

| What you changed | Loop |
|---|---|
| Component logic | ⚡ Fast Refresh |
| `.env` / `API_BASE_URL` | 🔄 Reload |
| `AndroidManifest.xml` permission | 🏗️ Full rebuild |
| `@notifee/react-native` first install | 🏗️ Full rebuild |

Hermes behavior across loops → [Hermes and the JS engine](09-hermes-and-the-js-engine.md#hermes-across-loops).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Metro dev server | `package.json` | `"start": "react-native start --client-logs"` |
| Android install | `package.json` | `"android": "react-native run-android --active-arch-only"` |
| Release full pipeline | `package.json` | `build:android`, `android:build:apk` |
| Watcher stability during Gradle | `metro.config.js` | `blockList` for android build dirs |
| Manifest change example | `android/app/src/main/AndroidManifest.xml` | permissions + deep link intent filter |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md)
- **Used by:** [Expo vs React Native CLI](15-expo-vs-react-native-cli.md), [Native crashes and logcat](06-native-crashes-and-logcat.md), [Hermes and the JS engine](09-hermes-and-the-js-engine.md)
- **Contrast with:** Production release build — always full native compile; no Fast Refresh or dev server
- **Common mistake:** running `npm run android` after every JS edit — keep Metro running and let Fast Refresh work → [Metro config](02-metro-and-the-js-bundle.md#metro-config)
