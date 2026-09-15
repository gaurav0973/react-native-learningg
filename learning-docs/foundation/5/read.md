<div align="center">

# 📋 Module 5 — Summary
### React Native Foundation: ADB, Logcat & Native Crashes

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-ADB%20·%20Logcat%20·%20RedBox%20·%20Native%20Crash-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🔌 **ADB Architecture** | `Computer ↔ Android OS ↔ React Native App` | [→ readme.md](readme.md#adb-architecture) |
| 📜 **Logcat Pipeline** | Android components continuously write into Logcat | [→ readme.md](readme.md#where-logcat-lives) |
| 🔴 **RedBox vs Native Crash** | JavaScript survives vs Process dies | [→ readme.md](readme.md#redbox-vs-native-crash) |
| 🔍 **Logcat Reading Order** | `FATAL EXCEPTION → Exception Type → Your Package → Line Number` | [→ readme.md](readme.md#anatomy-of-logcat-crash) |
| 🔐 **Permission Crash Flow** | Missing Manifest permission → `SecurityException` | [→ readme.md](readme.md#android-native-crash-pipeline) |
| 🔥 **Firebase Crash Flow** | Native initialization fails before JavaScript starts | [→ readme.md](readme.md#android-native-crash-pipeline) |
| 🛠️ **Crash Investigation Workflow** | `Clear logs → Reproduce → Filter → Fix → Rebuild` | [→ readme.md](readme.md#crash-investigation-workflow) |

---

## 🛠️ ADB Commands Mind Map

```
                      ADB

                       adb
                        │
      ┌─────────────────┼────────────────┬─────────────────┐
      │                 │                │                 │
      ▼                 ▼                ▼                 ▼
 devices            logcat           shell            reverse
      │                 │                │                 │
 List Devices     Read Logs      Linux Terminal     Connect Metro
      │                 │                │                 │
      ▼                 ▼                ▼                 ▼
 install          logcat -c       pm list packages   localhost:8081
 uninstall        *:E             dumpsys
                  ReactNativeJS
```

| Command | What it does |
|---------|-------------|
| `adb devices` | List connected devices and emulators |
| `adb logcat` | Stream all Android system logs |
| `adb logcat -c` | Clear the log buffer |
| `adb logcat *:E` | Show only **errors** across the system |
| `adb shell` | Open a Linux terminal on the Android device |
| `adb reverse tcp:8081 tcp:8081` | Connect device to Metro on your machine |

---

## 🏗️ Native Crash Architecture

```
                 REACT NATIVE DEBUGGING

                  Something Goes Wrong
                          │
        ┌─────────────────┴──────────────────┐
        │                                    │
        ▼                                    ▼
 JavaScript Layer                      Native Layer
        │                                    │
        ▼                                    ▼
 Hermes Exception                 Java/Kotlin/Swift Crash
        │                                    │
        ▼                                    ▼
     REDBOX SCREEN                    FATAL EXCEPTION
        │                                    │
        ▼                                    ▼
 Metro Stack Trace                 Android Logcat / Xcode Console
        │                                    │
        ▼                                    ▼
 Fast Refresh / Reload             Read Exception + Line Number
        │                                    │
        ▼                                    ▼
 Continue Development               Fix Native Code / Manifest
                                                 │
                                                 ▼
                                           Full Rebuild
```

---

## 🧠 Things You Should Remember Forever

> These are permanent mental models — not just for this module.

- 🔌 **ADB** is the communication bridge between your computer and the Android operating system
- 📜 **Logcat** is Android's system-wide event stream — not just your app's logs
- 💀 **`FATAL EXCEPTION`** is the first thing to search for when an Android app crashes
- 🔀 JavaScript debugging ends in **Metro**. Native debugging begins in **Logcat / Xcode**
- ⚡ If the app **closes instantly without a RedBox** → assume a **native crash** until proven otherwise

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 5*

</div>