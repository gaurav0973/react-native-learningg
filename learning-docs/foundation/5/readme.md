<div align="center">

# 📖 Module 5 — Deep Dive Notes
### React Native: Finding Native Crashes with ADB Logcat & Xcode Console

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-ADB%20·%20Logcat%20·%20RedBox%20·%20Native%20Crash-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Find a native crash in `adb logcat` / the Xcode console — JS red box ≠ native crash.
>
> This teaches you how to **debug crashes that JavaScript cannot see**.

---

<a id="adb-architecture"></a>

## 1 · 🔌 ADB Architecture

> **ADB is not part of React Native.**
> ADB talks to the **Android operating system**, and Android talks to your app.

```
               YOUR DEVELOPMENT MACHINE
     (VS Code • Terminal • Android Studio • Metro)

                         adb commands
                              │
                              │  USB / Wi-Fi
                              ▼
                  ANDROID DEBUG BRIDGE (ADB)
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
  Android Emulator      Physical Android      Android TV / Device
                             Device
       │                      │
       └──────────────────────┘
                Android Operating System
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
    Activity          Logcat          Package Manager
    Manager
       │                 │                 │
       ▼                 ▼                 ▼
          Your React Native Application
```

| ADB Command | What it does |
|-------------|-------------|
| `adb devices` | List all connected devices and emulators |
| `adb logcat` | Stream all Android system logs in real time |
| `adb logcat -c` | Clear the existing log buffer |
| `adb logcat *:E` | Show **errors only** across the entire system |
| `adb logcat -s ReactNativeJS` | Show **only your JS logs** |
| `adb shell` | Open a Linux terminal directly on the Android device |
| `adb reverse tcp:8081 tcp:8081` | Forward Metro port to device (for physical devices) |
| `adb install app.apk` | Install an APK directly to the device |
| `adb shell pm list packages` | List all installed app packages |
| `adb shell dumpsys` | Dump system service state |

---

<a id="where-logcat-lives"></a>

## 2 · 📜 Where Logcat Lives Inside Android

> **Logcat = Android's event recorder.**
> Everything happening on Android is **continuously streamed** into this buffer — not just your app.

```
          ANDROID OPERATING SYSTEM

     Every component writes logs continuously.

              Android Framework
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
 Activity Logs   Permission Logs   System Logs
      │              │              │
      ├──────────────┼──────────────┤
      ▼              ▼              ▼
 Firebase Logs   Camera Logs   Bluetooth Logs
      │              │              │
      ├──────────────┼──────────────┤
      ▼              ▼              ▼
 React Native JS  Native Modules  Crash Logs
      │              │              │
      └──────────────┼──────────────┘
                     ▼
                LOGCAT BUFFER
                     │
             adb logcat reads here
```

**Logcat log levels:**

| Level | Flag | Meaning |
|-------|------|---------|
| Verbose | `V` | Most detailed — everything |
| Debug | `D` | Debug information |
| Info | `I` | Normal operational messages |
| Warning | `W` | Something unexpected but not fatal |
| Error | `E` | Something failed |
| Fatal | `F` | App is about to crash |

> **Tip:** Use `adb logcat *:E` to filter to errors only. Use `adb logcat *:F` for fatal crashes only.

---

<a id="redbox-vs-native-crash"></a>

## 3 · 🔴 RedBox vs Native Crash

> The single most important distinction in React Native debugging.

| | RedBox | Native Crash |
|-|--------|-------------|
| Who catches it | **Hermes** (JS engine) | **Android Runtime** / iOS |
| App process | ✅ Stays alive | ❌ Process is killed |
| Visible to user | 🔴 Red overlay screen | App **closes instantly** |
| Where to debug | **Metro** terminal | **Logcat** / Xcode Console |
| Fixed by | Fast Refresh / Reload | Fix native code + Full Rebuild |

```
                   SOMETHING WENT WRONG
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
      JavaScript Error              Native Android/iOS Error
            │                             │
            ▼                             ▼
     Hermes Throws Error         Java/Kotlin/Swift Crash
            │                             │
            ▼                             ▼
        React Native                Android Runtime
          Handles It                  Terminates Process
            │                             │
            ▼                             ▼
       REDBOX SCREEN                APP CLOSES INSTANTLY
            │                             │
            ▼                             ▼
   Metro Stack Trace             Logcat / Xcode Stack Trace
```

> 🔑 **Key rule:** If the app closes instantly with no RedBox → it's a **native crash**. Go to Logcat.

---

<a id="android-native-crash-pipeline"></a>

## 4 · ☠️ Complete Android Native Crash Pipeline

> What actually happens from the moment the user opens the app to a native crash.

```
         USER OPENS FOOD DELIVERY APP
                      │
                      ▼
               Android Launches App
                      │
                      ▼
             MainActivity.onCreate()
                      │
                      ▼
          Native Library Initialization
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
       Success                  Crash
          │                       │
          ▼                       ▼
    React Native Starts   NullPointerException
          │                IllegalStateException
          │                SecurityException
          │                SIGSEGV (segfault)
          ▼                       │
    JS Bundle Loaded              ▼
                          Android Runtime
                                │
                                ▼
                          FATAL EXCEPTION
                                │
                                ▼
                           Process Killed
```

**Common crash types and their causes:**

| Exception | Cause |
|-----------|-------|
| `NullPointerException` | Accessing an object that is `null` (uninitialized native module) |
| `IllegalStateException` | Calling something in the wrong lifecycle state |
| `SecurityException` | Missing permission in `AndroidManifest.xml` |
| `SIGSEGV` | Segmentation fault — native C/C++ code accessing invalid memory |
| `ClassNotFoundException` | Native library not linked / not found |

---

<a id="anatomy-of-logcat-crash"></a>

## 5 · 🔍 Anatomy of a Logcat Crash

> Learn how to read a crash in seconds.

```bash
adb logcat *:E
```

```
│
├── FATAL EXCEPTION: main
│        ▲
│        └── Main UI thread crashed
│
├── Process: com.foodie, PID: 24893
│        ▲
│        └── Which application crashed
│
├── java.lang.NullPointerException
│        ▲
│        └── Root crash reason
│
├── at com.foodie.MainActivity.onCreate(MainActivity.kt:32)
│        ▲
│        └── YOUR code starts here — this is line 32 in MainActivity
│
└── Android framework stack...  (ignore the framework lines below yours)
```

**Reading strategy — top to bottom:**

| Step | What to look at | Why |
|------|----------------|-----|
| 1 | `FATAL EXCEPTION` | Confirms it's a crash |
| 2 | `Process: com.yourapp` | Confirms it's YOUR app |
| 3 | Exception type (e.g. `NullPointerException`) | Root cause |
| 4 | First `at com.yourapp.*` line | **Your code** — start fixing here |
| 5 | Ignore `at android.*`, `at com.android.*` | Framework internals |

---

<a id="crash-investigation-workflow"></a>

## 6 · 🔬 Crash Investigation Workflow

> The step-by-step process for debugging any native crash.

```
Step 1: Clear logs
  adb logcat -c

Step 2: Reproduce the crash
  Trigger the exact action that causes it

Step 3: Filter for errors
  adb logcat *:E

Step 4: Find your package
  Search for "com.yourapp" or "FATAL EXCEPTION"

Step 5: Read the exception type + line number
  Fix the root cause

Step 6: Rebuild
  npx react-native run-android
```

| Crash symptom | Likely cause | Where to look |
|--------------|-------------|---------------|
| App closes with no RedBox | Native crash | `adb logcat *:E` |
| `SecurityException` in logcat | Missing Manifest permission | `AndroidManifest.xml` |
| `NullPointerException` in native init | Firebase / native library not configured | `google-services.json`, SDK setup |
| App crashes before JS loads | Native library initialization failure | Look for crash **before** `ReactNativeJS` tag in logcat |
| Crash only on physical device | USB debugging / Metro connection issue | `adb reverse tcp:8081 tcp:8081` |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 5*

</div>