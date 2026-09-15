<div align="center">

# 📋 Module 2 — Summary
### React Native Foundation: App Lifecycle & AppState

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Lifecycle%20·%20AppState%20·%20Notifications%20·%20Resources-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🔄 **App Lifecycle Flow** | `Active ↔ Inactive ↔ Background` | [→ readme.md](readme.md#complete-mobile-app-lifecycle) |
| 🤖 **Android Mapping** | `onResume → active`, `onPause → inactive`, `onStop → background` | [→ readme.md](readme.md#android-activity-lifecycle-appstate) |
| 🌉 **AppState Bridge** | `Native Lifecycle → AppState Module → JavaScript` | [→ readme.md](readme.md#native-lifecycle-appstate-bridge) |
| 🔔 **Notification Flow** | Different handling for active, background, and terminated | [→ readme.md](readme.md#appstate-notifications) |
| ⚡ **Production Refresh Flow** | Pause work in background, refresh when active again | [→ readme.md](readme.md#resource-management-appstate) |

---

## 🗺️ AppState Architecture

> The complete flow from user interaction → JavaScript event.

```
                   USER INTERACTION
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    Open App        Home Button     Phone Call
        │                │                │
        ▼                ▼                ▼
      ACTIVE         BACKGROUND        INACTIVE
        │                │                │
        └────────────────┼────────────────┘
                         ▼
             Native Lifecycle (Android/iOS)
                         │
                         ▼
               React Native AppState
                         │
                         ▼
      AppState.addEventListener("change")
                         │
                         ▼
             JavaScript Event Listener
                         │
        ┌────────────────┼──────────────────┐
        │                │                  │
        ▼                ▼                  ▼
 Pause APIs        Refresh Data      Lock Session
 Pause Timers      Resume Polling    Analytics Event
 Pause Video       Update Location   Notification Logic
                         │
                         ▼
                React Component State
                         │
                         ▼
                  UI Re-renders
```

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 2*

</div>