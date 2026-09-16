# App lifecycle and AppState

> How the operating system moves your app between foreground, background, and inactive states, and how JavaScript learns about those transitions through AppState.

**Folder:** 01-internals · **Prerequisites:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md) · **Next:** [Process death and RAM](04-process-death-and-ram.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| App lifecycle | OS-managed states an app passes through while installed and running |
| ACTIVE | App is foreground — user can see and interact |
| INACTIVE | App is visible but not receiving input (call overlay, notification banner) |
| BACKGROUND | App is hidden — user pressed Home or switched apps |
| TERMINATED | Process destroyed — swiped away or killed by OS → [Process death](04-process-death-and-ram.md) |
| AppState | React Native module exposing lifecycle as JS events (`active`, `background`, `inactive`) |
| Activity lifecycle bridge | Android Activity callbacks mapped to AppState values |
| onResume / onPause | Android Activity methods that trigger `active` / `inactive` |
| Resource management | Pausing timers, polling, and animations when backgrounded |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  USER ACTION                    NATIVE LAYER                 JAVASCRIPT
  ┌─────────────┐               ┌─────────────┐              ┌─────────────┐
  │ Open app    │──────────────►│ onResume()  │─────────────►│ AppState    │
  │             │               │             │   bridge     │ "active"    │
  └─────────────┘               └─────────────┘              └─────────────┘
  ┌─────────────┐               ┌─────────────┐              ┌─────────────┐
  │ Home button │──────────────►│ onPause()   │─────────────►│ "inactive"  │
  │             │               │ onStop()    │              │ "background"│
  └─────────────┘               └─────────────┘              └─────────────┘
  ┌─────────────┐               ┌─────────────┐              ┌─────────────┐
  │ Return app  │──────────────►│ onRestart() │─────────────►│ "active"    │
  │             │               │ onResume()  │              │ again       │
  └─────────────┘               └─────────────┘              └─────────────┘
                                       │
                                       ▼
                              Swipe away / OS kill
                                       │
                                       ▼
                              Process TERMINATED
                              (no AppState event — new process on relaunch)
```

**Reading the diagram.** Navigation changes **screens**; the OS changes **lifecycle states**. Your React components never call Android APIs directly — a native module listens to Activity (or iOS `UIApplication`) callbacks and emits AppState strings to JavaScript.

The middle column is the activity lifecycle bridge. `onResume` means the user can interact again; `onStop` means the app is no longer visible. React Native collapses these into three strings JS can subscribe to.

The bottom branch is critical: when the process is killed, AppState does **not** emit a graceful `"background"` → `"active"` sequence on restart. A new process boots from `index.js` — which is why in-memory state vanishes → [Process death and RAM](04-process-death-and-ram.md).

---

<a id="lifecycle-state-machine"></a>

## 3 · Lifecycle state machine

```text
                    ┌───────────┐
         ┌─────────►│  ACTIVE   │◄─────────┐
         │          └─────┬─────┘          │
   return│                │ home / switch  │ notification dismissed
         │                ▼                │
         │          ┌───────────┐          │
         │          │ BACKGROUND│          │
         │          └─────┬─────┘          │
         │                │ call overlay  │
         │                ▼                │
         │          ┌───────────┐          │
         └──────────│ INACTIVE  │──────────┘
                    └───────────┘
                          │
                    swipe away / OS kill
                          ▼
                    TERMINATED
```

| User action | AppState result |
|---|---|
| Open app | `active` |
| Press Home | `background` |
| Incoming call overlay | `inactive` |
| Return to app | `active` |

---

<a id="android-activity-bridge"></a>

## 4 · Android Activity → AppState bridge

```text
  Android OS                React Native bridge              JS thread
  onCreate/onStart
       │
       ▼
  onResume()  ──────────────────────────────────────►  AppState = "active"
       │
  onPause()   ──────────────────────────────────────►  "inactive"
       │
  onStop()    ──────────────────────────────────────►  "background"
       │
  onDestroy() ──► process may end (not the same as "background")
```

| Android callback | AppState |
|---|---|
| `onResume()` | `active` |
| `onPause()` | `inactive` |
| `onStop()` | `background` |

AppState is consumed in JS with `AppState.currentState` and `AppState.addEventListener('change', …)`. Always call `subscription.remove()` on unmount — the pattern for listener cleanup lives in → [useEffect and cleanup](../02-implementations/07-useeffect-and-side-effects.md#cleanup-order).

---

<a id="resource-management"></a>

## 5 · Resource management by AppState

```text
         ACTIVE                          BACKGROUND
  ┌──────────────────┐            ┌──────────────────┐
  │ poll APIs        │            │ stop polling     │
  │ run animations   │            │ pause animations │
  │ play video       │            │ pause video      │
  │ show location UI │            │ reduce GPS freq  │
  └──────────────────┘            └──────────────────┘
```

Production apps gate expensive work on `nextState === 'active'`. This repo initializes notifications once at mount in `App.jsx` — that runs at cold start regardless of prior lifecycle, which is the correct model when the process may have been killed:

`App.jsx`

```javascript
useEffect(() => {
  async function initializeNotifications() {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;
    await createNotificationChannels();
    await showWelcomeNotification();
    await scheduleLunchReminder();
  }
  initializeNotifications();
}, []);
```

Deep links and notifications behave differently per lifecycle state → [Deep link cold start](14-deep-link-intents-and-cold-start.md), [Notification OS pipeline](13-notification-os-pipeline.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Cold-start init (runs after process create) | `App.jsx` | `useEffect` notification setup |
| Native entry Activity | `android/app/src/main/AndroidManifest.xml` | `MainActivity` with `launchMode="singleTask"` |
| JS entry after native launch | `index.js` | `AppRegistry.registerComponent` |
| Deep link + lifecycle interaction | `src/navigation/AppNavigator.js` | `NavigationContainer` with linking config |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md)
- **Used by:** [Process death and RAM](04-process-death-and-ram.md), [Deep link cold start](14-deep-link-intents-and-cold-start.md), [Notification OS pipeline](13-notification-os-pipeline.md)
- **Contrast with:** React Navigation screen stack — screens push/pop in memory; lifecycle is OS-wide process state
- **Common mistake:** assuming `"background"` always fires before process death — the OS can kill silently with no JS callback → [Process death and RAM](04-process-death-and-ram.md#process-death-inside-rn)
