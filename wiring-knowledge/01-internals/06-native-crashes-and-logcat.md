# Native crashes, ADB, and logcat

> How to tell a JavaScript redbox from a native crash that kills the process, and how to read Android logcat to find the failing native line.

**Folder:** 01-internals · **Prerequisites:** [What is an app](01-what-is-an-app.md) · **Next:** [OS permission lifecycle](12-os-permission-lifecycle.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| RedBox | React Native JS error overlay — process stays alive |
| Native crash | Java/Kotlin/C++ failure — Android kills the process |
| ADB | Android Debug Bridge — CLI between your machine and device/emulator |
| Logcat | Android's continuous system log buffer |
| FATAL EXCEPTION | Logcat marker for an uncaught native crash on the main thread |
| SIGSEGV | Segmentation fault — native code accessed invalid memory |
| SecurityException | Native crash from missing manifest permission |
| Main thread | UI thread — crashes here close the app instantly |
| ReactNativeJS | Logcat tag for console output from Hermes |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  SOMETHING FAILS IN THE APP
              │
  ┌───────────┴───────────┐
  │                       │
  ▼                       ▼
JS throws in Hermes    Native code throws
  │                       │
  ▼                       ▼
React Native catches   Android Runtime
  │                       │
  ▼                       ▼
 REDBOX overlay         PROCESS KILLED
 Metro shows stack      App closes instantly
  │                       │
  ▼                       ▼
 Fix JS → Fast Refresh  adb logcat *:E
                        find FATAL EXCEPTION
                        fix native → Full rebuild
```

**Reading the diagram.** The fork is the first question on every bug report: did the app show a red screen, or did it vanish? RedBox means Hermes caught a JavaScript exception — the native shell survived. Instant close means the Android Runtime terminated your process — JavaScript never got a chance to render an overlay.

Debugging follows the bottom of each branch. JS errors appear in Metro terminal and on device. Native errors require `adb logcat` because they happen below the JS bridge — often before `ReactNativeJS` ever logs.

The insight: **no RedBox + instant close = native crash.** Do not reload Metro; open logcat.

---

<a id="redbox-vs-native"></a>

## 3 · RedBox vs native crash

```text
  REDBOX                          NATIVE CRASH
  ┌─────────────────┐             ┌─────────────────┐
  │ Process alive   │             │ Process dead    │
  │ Red overlay     │             │ App disappears  │
  │ Metro stack     │             │ Logcat stack    │
  │ Fix → Refresh   │             │ Fix → rebuild   │
  └─────────────────┘             └─────────────────┘
```

| | RedBox | Native crash |
|---|---|---|
| Caught by | Hermes / RN error handler | Android Runtime |
| User sees | Red error screen | App closes |
| Debug in | Metro terminal | `adb logcat *:E` |
| Fix loop | Fast Refresh / Reload | Full rebuild |

---

<a id="adb-logcat-pipeline"></a>

## 4 · ADB and logcat pipeline

```text
  YOUR MACHINE                         ANDROID DEVICE
  ┌──────────────┐                    ┌──────────────┐
  │ adb logcat   │◄──── USB/Wi-Fi ────│ Logcat buffer│
  └──────────────┘                    │ ◄─ all apps  │
        ▲                             │ ◄─ system    │
        │                             │ ◄─ your RN   │
  adb devices                         └──────────────┘
  adb logcat -c    clear before repro
  adb logcat *:E   errors only
```

| Command | Purpose |
|---|---|
| `adb devices` | List connected emulators/devices |
| `adb logcat -c` | Clear buffer before reproducing |
| `adb logcat *:E` | Stream errors only |
| `adb logcat -s ReactNativeJS` | JS console logs only |
| `adb reverse tcp:8081 tcp:8081` | Forward Metro to physical device |

ADB is part of Android platform tools — not React Native. It talks to the OS, which talks to your app process.

---

<a id="reading-a-crash"></a>

## 5 · Reading a logcat crash

```text
  FATAL EXCEPTION: main          ← main thread crash
  Process: com.first, PID: …     ← confirm YOUR app
  java.lang.SecurityException    ← root cause type
  at com.first.MainActivity…     ← YOUR code — start here
  at android.app…                ← framework — ignore first
```

**Reading strategy:**

| Step | Look for |
|---|---|
| 1 | `FATAL EXCEPTION` |
| 2 | `Process: com.first` (this repo's `applicationId`) |
| 3 | Exception type (`SecurityException`, `NullPointerException`) |
| 4 | First `at com.first.*` line — your code |
| 5 | Ignore `at android.*` until you understand your frame |

`SecurityException` often means a permission used at runtime without manifest declaration — see → [OS permission lifecycle](12-os-permission-lifecycle.md).

---

<a id="investigation-workflow"></a>

## 6 · Crash investigation workflow

```text
  (1) adb logcat -c
  (2) reproduce crash
  (3) adb logcat *:E
  (4) find com.first + exception
  (5) fix native/JS cause
  (6) npm run android  if native changed
```

| Symptom | Likely cause | Where to look |
|---|---|---|
| Instant close, no RedBox | Native crash | Logcat |
| `SecurityException` | Missing manifest permission | `AndroidManifest.xml` |
| Crash before JS logs | Native init failure | Logcat before `ReactNativeJS` tag |
| Red overlay with stack | JS error | Metro terminal |

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Package name in crashes | `android/app/build.gradle` | `applicationId "com.first"` |
| Permission-related native crash | `AndroidManifest.xml` | `ACCESS_FINE_LOCATION`, `POST_NOTIFICATIONS` |
| Native entry point | `android/app/src/main/AndroidManifest.xml` | `MainActivity` |
| CMake path fix (native build) | `android/app/build.gradle` | `cppFlags "-canonical-prefixes"` for Windows paths |
| Rebuild after native fix | `package.json` | `"android": "react-native run-android …"` |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [What is an app](01-what-is-an-app.md)
- **Used by:** [OS permission lifecycle](12-os-permission-lifecycle.md), [Three build loops](05-three-build-loops.md)
- **Contrast with:** RedBox — JS-layer failure with process survival
- **Common mistake:** staring at Metro when the app closes instantly — switch to logcat → [RedBox vs native](#redbox-vs-native)
