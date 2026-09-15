<div align="center">

# 📋 Module 3 — Summary
### React Native Foundation: Process Death & State Survival

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Process%20Death%20·%20RAM%20·%20Hydration%20·%20Storage-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 📱 **Activity vs Process** | Activity is a screen; Process is the entire app | [→ readme.md](readme.md#activity-vs-process) |
| 💀 **Background vs Process Death** | Background keeps RAM alive; Process Death destroys RAM | [→ readme.md](readme.md#what-happens-inside-react-native-during-process-death) |
| 🧠 **Memory Manager** | Android kills low-priority background processes under memory pressure | [→ readme.md](readme.md#android-memory-manager) |
| 🛠️ **Don't Keep Activities** | Forces Activity recreation whenever app goes to background | [→ readme.md](readme.md#process-death-vs-cold-start) |
| 💧 **Hydration Flow** | Disk → React State during app startup | [→ readme.md](readme.md#state-hydration-flow-asyncstorage) |
| 🔐 **Authentication Restore** | Secure Storage → Context → Logged-in session | [→ readme.md](readme.md#state-survival-matrix-ram-vs-persistent-storage) |
| 🗺️ **Navigation Restore** | Persist navigation state if the UX requires it | [→ readme.md](readme.md#cold-start-vs-warm-start-vs-process-death) |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| Why is **"Don't Keep Activities"** useful? | It simulates Activity destruction so developers can verify that important state is restored correctly after recreation |
| Does **AppState detect process death**? | **No.** When the process is killed, JavaScript is gone. A new process starts fresh from `App.js` |
| What **survives** process death? | Only data persisted outside RAM — `AsyncStorage`, `MMKV`, `SQLite`, `SecureStore`, `Keychain` |
| **Activity recreation** vs **process death**? | Activity recreation rebuilds the UI container. Process death recreates the entire app process including the JavaScript engine |

---

## 🗺️ Process Death Architecture

> The complete flow from active app → process killed → UI restored.

```
                  ANDROID PROCESS DEATH

                    ACTIVE APP
                        │
                        ▼
                 User Presses Home
                        │
                        ▼
                  BACKGROUND STATE
                        │
                AppState = background
                        │
                        ▼
             Android Memory Manager
                        │
        Memory Pressure / Don't Keep Activities
                        │
                        ▼
                 PROCESS DESTROYED
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
 Hermes Gone      React State Gone   Context Gone
                        │
──────────────────────────────────────────────────────
                        │
                 User Opens App
                        │
                        ▼
                New Linux Process
                        │
                        ▼
                 Hermes Starts
                        │
                        ▼
                  App.js Executes
                        │
                        ▼
              Read Persistent Storage
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
      ▼                 ▼                 ▼
 JWT Token         Cart Items          Theme
 AsyncStorage      MMKV             SecureStore
                        │
                        ▼
              Hydrate React State
                        │
                        ▼
                  UI Restored ✅
```

---

## 🧮 State Survival Matrix — RAM vs Persistent Storage

> **RAM = Fast but Temporary. Disk = Slower but Persistent.**

```
                 REACT NATIVE STATE

                    Where is it stored?
                           │
      ┌────────────────────┴────────────────────┐
      │                                         │
      ▼                                         ▼
     RAM                                  DEVICE STORAGE
  (Temporary)                              (Persistent)
      │                                         │
      ├── useState                       AsyncStorage
      ├── useReducer                     MMKV
      ├── Context API                    SQLite
      ├── Redux Store                    SecureStore
      └── React Query Cache              Keychain / Keystore
      │                                         │
      ▼                                         ▼
Lost on Process Death                  Survives Process Death
```

| Storage Type | Survives Process Death | Speed | Use For |
|--------------|----------------------|-------|---------|
| `useState` / `useReducer` | ❌ | ⚡ Instant | Ephemeral UI state |
| `Context API` | ❌ | ⚡ Instant | Shared in-memory state |
| `Redux Store` | ❌ | ⚡ Instant | Global app state |
| `AsyncStorage` | ✅ | 🐢 Async | User prefs, small data |
| `MMKV` | ✅ | ⚡ Fast | High-performance storage |
| `SQLite` | ✅ | 🐢 Async | Relational / large data |
| `SecureStore` / `Keychain` | ✅ | 🐢 Async | Auth tokens, passwords |

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 3*

</div>