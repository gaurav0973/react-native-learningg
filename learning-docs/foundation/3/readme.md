<div align="center">

# 📖 Module 3 — Deep Dive Notes
### React Native: Simulating Process Death & State Survival

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Process%20Death%20·%20RAM%20·%20Hydration%20·%20Storage-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Simulate process death (Android "Don't keep activities") and watch state vanish.
>
> It explains why your app **suddenly forgets everything** after being minimized, and how production apps survive it.

---

<a id="phone-ram-fundamental"></a>

## 1 · 🧠 The Fundamental — Phone RAM

> My phone has **limited RAM**. Android constantly decides: *"Which app should stay alive, and which one should I kill to free memory?"*
>
> Your app is just **one process among many**.

```
Phone RAM
│
├── WhatsApp
├── Instagram
├── Camera
├── Spotify
├── Chrome
├── Foodie (Your App)
└── PUBG
```

**When memory becomes low, Android Memory Manager kicks in:**

```
Android Memory Manager
│
▼
Find Background Apps
│
▼
Kill Lowest Priority Process
│
▼
Foodie Process Removed from RAM
```

> This is called **Process Death**.

---

<a id="what-is-process-death"></a>

## 2 · 💀 What Is Process Death?

Process death means Android **completely removes your application's process from memory**:

- ❌ Not paused
- ❌ Not background
- ❌ **Gone** — everything stored in JavaScript memory disappears

| What gets destroyed | What survives |
|--------------------|---------------|
| `useState` values | `AsyncStorage` data |
| `useReducer` state | `MMKV` data |
| `Context` values | `SQLite` data |
| `Redux` store | `SecureStore` / `Keychain` |
| React component tree | Files on disk |
| Navigation stack | — |
| Hermes VM (JS engine) | — |

---

<a id="process-death-vs-cold-start"></a>

## 3 · 🔄 Process Death vs Cold Start

| | Cold Start | Process Death Restart |
|-|------------|----------------------|
| Was app running before? | ❌ Never ran | ✅ Was running earlier, killed by OS |
| How process is created | Fresh new process | New process after kill |
| How it launches | Tapping icon for first time | Returning after Android killed app |
| Hermes VM | Starts fresh | Starts fresh (again) |

```jsx
// Both cases need hydration — this pattern handles both:
const [count, setCount] = useState(null);

useEffect(() => {
  loadCounter(); // reads from AsyncStorage
}, []);
```

---

<a id="activity-vs-process"></a>

## 4 · 📱 Activity vs Process

> **Process contains Activity. Activity does NOT contain Process.**

- A **Linux Process** is the entire running application — the JS engine, native modules, and all memory
- An **Activity** is just a UI container (one screen / entry point) inside that process

```
                     ANDROID APPLICATION

                   Linux Process (PID 2345)
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
  Hermes Engine      Native Modules       React Context
  (JavaScript VM)    Navigation/Redux
       │
       ▼
  MainActivity
       │
       ▼
  NavigationContainer
       │
       ├── HomeScreen
       ├── RestaurantScreen
       ├── CartScreen
       └── ProfileScreen
```

| Concept | What it is | Destroyed when |
|---------|-----------|----------------|
| **Process** | The entire running app (PID) | OS kills it for memory, or user force-quits |
| **Activity** | One UI entry point / screen | App goes to background (with "Don't Keep Activities" on) |
| **Hermes VM** | JavaScript engine inside the process | Process dies |

---

<a id="android-memory-manager"></a>

## 5 · 🤖 Android Memory Manager

> This explains **why** Android kills your app.

Android assigns priority levels to all running processes:

| Priority | Example | Android treats it |
|----------|---------|-------------------|
| 🔴 **High** | Currently visible app | Never killed |
| 🟡 **Medium** | Picture-in-picture, foreground service | Rarely killed |
| 🟢 **Low** | Minimized / background apps | **Killed first** under pressure |

Your minimized app is at the bottom of the priority list. When another app (PUBG, Camera) needs memory, Android kills your process without asking.

---

<a id="process-death-inside-react-native"></a>

## 6 · ☠️ What Happens Inside React Native During Process Death?

### Before Process Death

```
Foodie Process
│
├── Hermes VM
│   ├── JS Heap
│   ├── React Components
│   └── useState Values
│
├── Context API
│
├── Redux Store
│
├── Navigation Stack
│
└── AppState Listener
```

### Android kills the process

```
Android
│
Kill PID 2345
│
▼
Entire Process Removed — all of the above is gone
```

### New Process Starts (PID 3921)

```
Foodie Process (NEW)
│
├── New Hermes VM        ← fresh JS engine, no memory of before
├── New React Tree       ← all components re-mount
├── New Redux Store      ← initial state only
├── New Context          ← initial values only
└── New Navigation Stack ← starts at initial route
```

> **Key insight:** `AppState` never fires `"background"` → `"active"` during process death. The old JS process is gone before it can emit anything. The new process starts from `App.js` with zero state.

---

<a id="state-hydration-flow"></a>

## 7 · 💧 State Hydration Flow (AsyncStorage)

> **Hydration** = reading data from persistent storage and loading it into React state on startup.

```
ACTIVE
│
Counter = 5
│
▼
AsyncStorage.setItem("counter", "5")     ← save to disk while alive
│
────────────────────────────────────────────
│
Process Dies                              ← JS memory wiped
│
────────────────────────────────────────────
│
App Launches (new process)
│
▼
AsyncStorage.getItem("counter")          ← read from disk
│
▼
setCount(5)                              ← restore into React state
│
▼
UI Restored ✅
```

**Pattern in code:**

```js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save before going to background
async function saveCounter(value) {
  await AsyncStorage.setItem('counter', String(value));
}

// Hydrate on app startup
async function loadCounter() {
  const saved = await AsyncStorage.getItem('counter');
  if (saved !== null) setCount(Number(saved));
}
```

---

<a id="cold-start-warm-start-process-death"></a>

## 8 · 🚀 Cold Start vs Warm Start vs Process Death

```
                APP START TYPES

                     Launch
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
   Cold Start      Warm Start     Process Restart
       │               │               │
Process Created   Existing Process  New Process Created
Hermes Starts     Hermes Alive      Hermes Starts Again
React Mounted     React Alive       React Mounted Again
```

| | Cold Start | Warm Start | Process Death Restart |
|-|------------|------------|----------------------|
| Process | Brand new | **Same process** | New process |
| Hermes VM | Starts | Already running | Starts again |
| React state | Initial | **Preserved** | Initial (hydrate from disk) |
| Speed | Slowest | Fastest | Medium |
| When it happens | First ever launch | Tab switching, quick return | OS killed app in background |

---

<a id="state-survival-matrix"></a>

## 9 · 🧮 State Survival Matrix — RAM vs Persistent Storage

> **RAM = Fast but Temporary. Disk = Slower but Persistent.**

```
                REACT NATIVE STATE

                   Where is it stored?
                          │
      ┌───────────────────┴───────────────────┐
      │                                       │
      ▼                                       ▼
     RAM                               DEVICE STORAGE
  (Temporary)                           (Persistent)
      │                                       │
      ├── useState                     AsyncStorage
      ├── useReducer                   MMKV
      ├── Context API                  SQLite
      ├── Redux Store                  SecureStore
      └── React Query Cache            Keychain / Keystore
      │                                       │
      ▼                                       ▼
Lost on Process Death               Survives Process Death
```

| Storage | Survives Death | Speed | Best For |
|---------|---------------|-------|----------|
| `useState` | ❌ | ⚡ Instant | UI-only ephemeral state |
| `Context API` | ❌ | ⚡ Instant | Shared in-memory state |
| `Redux` / `Zustand` | ❌ | ⚡ Instant | Global app state (in-memory) |
| `React Query Cache` | ❌ | ⚡ Instant | Server data cache |
| `AsyncStorage` | ✅ | 🐢 Async | User prefs, small key-value data |
| `MMKV` | ✅ | ⚡ Fast | High-perf key-value (sync reads) |
| `SQLite` | ✅ | 🐢 Async | Relational / complex / large data |
| `SecureStore` / `Keychain` | ✅ | 🐢 Async | Auth tokens, passwords, secrets |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 3*

</div>