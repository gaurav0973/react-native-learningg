

# 📖 Module 2 — Deep Dive Notes

### React Native: App Lifecycle & AppState

![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)
![Topic](https://img.shields.io/badge/Topic-Lifecycle%20·%20AppState%20·%20Notifications%20·%20Resources-6C63FF?style=for-the-badge)



> **Question:** App lifecycle — active / background / inactive — and how AppState works in your app.
>
> How React Native knows whether your app is open, minimized, locked, or returning to the foreground.
>
> This is one of the most important concepts for **notifications, location tracking, media playback, authentication, and analytics**.

---



## 1 · 🔄 Complete Mobile App Lifecycle

> Every app moves through **states**, not screens.
>
> - Navigation changes **screens**
> - The OS changes **lifecycle states**

```
                     APP INSTALLED
                           │
                           ▼
                  Process Created
                           │
                           ▼
                        ACTIVE
              (User can see & interact)
                           │
        ┌──────────────────┼───────────────────┐
        │                  │                   │
        ▼                  ▼                   ▼
   Home Button        Phone Call        Notification Overlay
        │                  │                   │
        ▼                  ▼                   ▼
   BACKGROUND          INACTIVE            INACTIVE
        │                  │                   │
        │                  ▼                   ▼
        │             BACKGROUND             ACTIVE
        │                  │
        └──────────────────┘
                 │
                 ▼
         App Sleeping / Hidden
                 │
        User opens app again
                 │
                 ▼
              ACTIVE
                 │
         Swipe app away
                 │
                 ▼
         PROCESS DESTROYED
```


| State          | What it means                                                              |
| -------------- | -------------------------------------------------------------------------- |
| **ACTIVE**     | App is in the foreground — user can see and interact                       |
| **INACTIVE**   | App is visible but not receiving input (call overlay, notification banner) |
| **BACKGROUND** | App is hidden — user pressed Home or switched apps                         |
| **TERMINATED** | Process is gone — app was swiped away or killed by OS                      |


---



## 2 · 👆 User Actions → Lifecycle State

> Every common action maps to a predictable state transition.


| User Action           | Resulting State                         |
| --------------------- | --------------------------------------- |
| Open app              | `active`                                |
| Press Home button     | `background`                            |
| Incoming notification | `inactive`                              |
| Incoming call         | `inactive` → `background` (if accepted) |
| Return to app         | `active`                                |


```
┌──────────────────────────────────────────┐
│  Open App                                │
└──────────────────────────────────────────┘
                │
                ▼
             ACTIVE
────────────────────────────────────────────
                │
                ▼
      Press Home Button
                │
                ▼
           BACKGROUND
────────────────────────────────────────────
                │
                ▼
     Lock Screen / Power Button
                │
                ▼
            INACTIVE
                │
                ▼
           BACKGROUND
────────────────────────────────────────────
                │
                ▼
      Incoming Phone Call
                │
                ▼
            INACTIVE
                │
        Call Accepted?
         │          │
        YES         NO
         │          │
         ▼          ▼
    BACKGROUND    ACTIVE
────────────────────────────────────────────
                │
                ▼
      User taps App Icon
                │
                ▼
             ACTIVE
```

---



## 3 · 🤖 Android Activity Lifecycle → React Native AppState

> Android exposes lifecycle as callbacks on the `Activity` class.
> React Native reads these callbacks and maps them to AppState values.


| Android Callback | React Native AppState |
| ---------------- | --------------------- |
| `onResume()`     | `active`              |
| `onPause()`      | `inactive`            |
| `onStop()`       | `background`          |
| `onDestroy()`    | App process destroyed |


```
         ANDROID OPERATING SYSTEM

          Activity Created
                 │
                 ▼
             onCreate()
                 │
                 ▼
             onStart()
                 │
                 ▼
            onResume()
                 │
                 ▼
       React Native → ACTIVE
─────────────────────────────────
                 │
                 ▼
             onPause()
                 │
                 ▼
       React Native → INACTIVE
─────────────────────────────────
                 │
                 ▼
             onStop()
                 │
                 ▼
       React Native → BACKGROUND
─────────────────────────────────
                 │
                 ▼
           onRestart()
                 │
                 ▼
             onStart()
                 │
                 ▼
            onResume()
                 │
                 ▼
              ACTIVE
─────────────────────────────────
                 │
                 ▼
           onDestroy()
                 │
                 ▼
          Process Removed
```

---



## 4 · 🍎 iOS Lifecycle → React Native AppState

> iOS has more granular transition states than Android.
> `UIApplication` delegates control the flow.


| iOS Callback          | React Native AppState |
| --------------------- | --------------------- |
| `didBecomeActive`     | `active`              |
| `willResignActive`    | `inactive`            |
| `didEnterBackground`  | `background`          |
| `willEnterForeground` | transition → `active` |


```
               UIApplication

                   Launch
                     │
                     ▼
            didFinishLaunching
                     │
                     ▼
            didBecomeActive
                     │
                     ▼
                  ACTIVE
─────────────────────────────────
                     │
                     ▼
           willResignActive
                     │
                     ▼
                 INACTIVE
─────────────────────────────────
                     │
                     ▼
         didEnterBackground
                     │
                     ▼
                BACKGROUND
─────────────────────────────────
                     │
                     ▼
        willEnterForeground
                     │
                     ▼
           didBecomeActive
                     │
                     ▼
                  ACTIVE
```

---



## 5 · 🌉 Native Lifecycle → JavaScript (AppState Bridge)

> **AppState is a bridge module.**
> It converts native lifecycle events into JavaScript-consumable events.
> Your React component never talks to the OS directly — AppState does that for you.

```
        USER PRESSES HOME BUTTON
                  │
                  ▼
          Android / iOS Native
                  │
                  ▼
      Native Lifecycle Callback
                  │
        (onPause / onStop)
                  │
                  ▼
      React Native Native Module
                  │
                  ▼
            AppState Module
                  │
                  ▼
       "background" Event Emitted
                  │
                  ▼
      JavaScript Event Listener
                  │
                  ▼
      Your React Component Updates
```

**Usage in code:**

```js
import { AppState } from 'react-native';

// Read current state
const currentState = AppState.currentState; // "active" | "background" | "inactive"

// Listen for changes
const subscription = AppState.addEventListener('change', (nextState) => {
  if (nextState === 'active') {
    // App came to foreground → refresh data
  }
  if (nextState === 'background') {
    // App went to background → pause work, save state
  }
});

// Clean up on unmount
subscription.remove();
```

---



## 6 · 🔔 AppState + Notifications

> Push notifications behave differently depending on the app's current state.

```
                 PUSH NOTIFICATION
                         │
     ┌───────────────────┼────────────────────┐
     │                   │                    │
     ▼                   ▼                    ▼
  ACTIVE             BACKGROUND           TERMINATED
     │                   │                    │
 In-App UI         System Notification   System Notification
     │                   │                    │
     ▼                   ▼                    ▼
 Handle Directly    User Taps Banner     Launch Application
     │                   │                    │
     └───────────────────┼────────────────────┘
                         ▼
                      ACTIVE
                         │
                  Navigate to Screen
```


| App State      | Notification Behavior                               |
| -------------- | --------------------------------------------------- |
| **Active**     | Show in-app UI (custom banner, modal, etc.)         |
| **Background** | OS shows system notification in tray                |
| **Terminated** | OS shows system notification → tapping launches app |


---



## 7 · 🔗 AppState + Deep Linking

> How a deep link (`foodie://restaurant/42`) reaches the right screen depending on app state.

```
                USER OPENS LINK

           foodie://restaurant/42
                     │
                     ▼
          Is App Already Running?
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
      YES                        NO
        │                         │
        ▼                         ▼
    ACTIVE State           App Launches
        │                         │
        ▼                         ▼
 Navigation.navigate()     Initial URL Read
        │                         │
        └────────────┬────────────┘
                     ▼
            Restaurant Screen
```


| App State                       | Deep Link Handling                                              |
| ------------------------------- | --------------------------------------------------------------- |
| **Running (active/background)** | `Linking` event fires → `Navigation.navigate()`                 |
| **Not running**                 | App launches → reads initial URL from `Linking.getInitialURL()` |


---



## 8 · ⚡ Resource Management Based on AppState

> This is how production apps save battery life.
> **Foreground = user experience. Background = battery optimization.**

```
                 APPSTATE
                    │
      ┌─────────────┴─────────────┐
      │                           │
      ▼                           ▼
    ACTIVE                    BACKGROUND
      │                           │
 Poll APIs                   Stop Polling
 Run Animations              Pause Animations
 Run Timers                  Pause Timers
 Show Location UI            Hide UI Updates
 Play Video                  Pause Video
 Enable Search               Disable Keyboard
```


| Resource              | Active            | Background             |
| --------------------- | ----------------- | ---------------------- |
| API polling           | ✅ Run on interval | ⏸️ Stop polling        |
| Animations            | ✅ Running         | ⏸️ Paused              |
| Timers                | ✅ Ticking         | ⏸️ Paused              |
| Location updates      | ✅ Shown in UI     | 🔋 Reduce frequency    |
| Video playback        | ✅ Playing         | ⏸️ Paused              |
| WebSocket connections | ✅ Active          | 🔋 Throttled or closed |


> **Why this matters:** The OS may kill background apps to reclaim memory. If you don't clean up timers, intervals, and subscriptions when going to background, they may fire after the app is resumed or cause memory leaks.

---



📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 2*

