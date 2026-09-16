# How the OS displays notifications

> Why notifications belong to Android and iOS, not React Native, and the pipeline from JS request through NotificationManager to the drawer.

**Folder:** 01-internals · **Prerequisites:** [JSI, TurboModules, and native access](10-jsi-turbomodules-and-native-access.md) · **Next:** [Notifee local notifications](../02-implementations/12-notifee-local-notifications.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Notification OS pipeline | Path from app request → system service → user-visible notification |
| NotificationManager | Android system service that owns display, grouping, and priority |
| Notification channel | Android category with its own sound, vibration, and mute settings |
| Local notification | Triggered by app on device — no server required |
| Push notification | Triggered by backend via FCM/APNs — requires internet |
| Heads-up | High-importance notification that appears over current app |
| Foreground vs background | App visibility state changes how notification is presented |
| Notifee | Native module this repo uses to call Android notification APIs |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  JS LAYER                         NATIVE / OS LAYER
  ┌─────────────────────┐         ┌─────────────────────┐
  │ notificationService │         │ Notifee TurboModule │
  │ .displayNotification│────────►│ (JSI)               │
  └─────────────────────┘         └──────────┬──────────┘
                                             │
                                             ▼
                                  Android NotificationManager
                                             │
                         ┌───────────────────┼───────────────────┐
                         ▼                   ▼                   ▼
                    assign channel      sound/vibration       priority / badge
                         │                   │                   │
                         └───────────────────┼───────────────────┘
                                             ▼
                                  Notification Drawer (system UI)
```

**Reading the diagram.** Notifications render **outside** your app's React tree — in system UI the user sees even when your app is backgrounded or killed. React Native cannot draw there directly; it sends a structured request through a native module (Notifee), which calls `NotificationManager`.

Channels (Android 8+) are mandatory categories. Users mute `offers` while keeping `orders` — your JS picks `channelId` per notification. Permission for Android 13+ must be granted first → [OS permission lifecycle](12-os-permission-lifecycle.md).

The insight: **your app proposes; the OS disposes** — RN is a client of platform notification services, not the owner.

---

<a id="local-vs-push"></a>

## 3 · Local vs push notifications

```text
  LOCAL                           PUSH (not wired in this repo)
  App schedules or displays now   Server → FCM → device
  No internet needed              Internet required
  Notifee displayNotification     Firebase handlers (future)
  scheduleTriggerNotification
```

| | Local | Push |
|---|---|---|
| Trigger | App code | Backend |
| Offline | ✅ | ❌ |
| This repo | ✅ Notifee | ❌ reference only in README |

---

<a id="channel-mechanism"></a>

## 4 · Notification channels — OS mechanism

```text
  createChannel({ id: 'orders', name: 'Orders', importance: 4 })
  createChannel({ id: 'offers',  name: 'Offers',  importance: 3 })
  createChannel({ id: 'cart',    name: 'Cart',    importance: 3 })
         │
         ▼
  displayNotification({ android: { channelId: 'cart' } })
         │
         ▼
  OS applies channel rules (sound, heads-up, mute state)
```

`src/services/notificationService.js`

```javascript
await notifee.createChannel({
  id: 'orders',
  name: 'Orders',
  importance: 4,
});

await notifee.displayNotification({
  title: '🎉 Welcome to Foodie!',
  body: "Explore restaurants and discover today's offers.",
  android: { channelId: 'offers' },
});
```

Channel API details and scheduling → [Notifee implementation](../02-implementations/12-notifee-local-notifications.md).

---

<a id="three-layers"></a>

## 5 · Three layers of every notification

```text
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ UI layer    │  │ Behavior    │  │ Data layer  │
  │ title, body │  │ sound, pri  │  │ screen, ids │
  │ image, icon │  │ vibration   │  │ deep link   │
  └─────────────┘  └─────────────┘  └─────────────┘
```

README §12 table: UI (title/body/image), Behavior (sound/vibration/priority), Data (restaurantId, screen). Data layer connects to deep links when user taps → [Deep link cold start](14-deep-link-intents-and-cold-start.md).

---

<a id="app-init-pipeline"></a>

## 6 · App startup notification pipeline

```text
  App.jsx mount
       │
       ▼
  requestNotificationPermission()  ← runtime POST_NOTIFICATIONS
       │
       ▼
  createNotificationChannels()
       │
       ├── showWelcomeNotification()
       └── scheduleLunchReminder()  ← trigger notification at 13:00
```

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

Cart additions also trigger notifications from `CartContext` via `showCartNotification` — see implementation note.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Channel creation | `src/services/notificationService.js` | `createNotificationChannels` |
| Display notification | `src/services/notificationService.js` | `showWelcomeNotification`, `showCartNotification` |
| Scheduled local | `src/services/notificationService.js` | `scheduleLunchReminder`, `createTriggerNotification` |
| Manifest permission | `AndroidManifest.xml` | `POST_NOTIFICATIONS` |
| Startup wiring | `App.jsx` | `initializeNotifications` effect |
| Native dependency | `package.json` | `"@notifee/react-native"` |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [JSI and TurboModules](10-jsi-turbomodules-and-native-access.md), [OS permission lifecycle](12-os-permission-lifecycle.md)
- **Used by:** [Notifee implementation](../02-implementations/12-notifee-local-notifications.md)
- **Contrast with:** In-app toast/banner — rendered inside React tree, not OS drawer → [Feedback selection](../03-patterns/10-feedback-selection.md)
- **Common mistake:** calling `displayNotification` before channel exists or permission granted — silent failure or crash → [Channel mechanism](#channel-mechanism)
