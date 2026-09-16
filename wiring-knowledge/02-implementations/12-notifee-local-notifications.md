# Notifee — channels, scheduling, foreground events

> How Foodie requests Android notification permission, registers channels, shows cart toasts, and schedules a lunch reminder.

**Folder:** 02-implementations · **Prerequisites:** [Notification OS pipeline](../01-internals/13-notification-os-pipeline.md) · **Next:** [Deep linking](13-deep-linking-linking-api.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Notifee | Native module wrapping Android/iOS notification APIs |
| Notification channel | Android category users can mute independently (orders, offers, cart) |
| displayNotification | Show a notification immediately from JS |
| createTriggerNotification | Schedule a future notification by timestamp |
| TriggerType.TIMESTAMP | Fire at a specific `Date.getTime()` |
| POST_NOTIFICATIONS | Android 13+ runtime permission for showing notifications |
| importance | Channel priority — affects heads-up vs silent drawer |
| Local notification | Triggered by app code — no server/FCM required |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  App.jsx useEffect (mount)
         │
         ├── requestNotificationPermission()
         ├── createNotificationChannels()  orders | offers | cart
         ├── showWelcomeNotification()
         └── scheduleLunchReminder()

  CartContext.addItem()
         │
         └── showCartNotification(item.name)

  JS (notificationService) ──► Notifee native ──► Android NotificationManager
                                                      │
                                                      └── channel → drawer
```

**Reading the diagram.** Notifications belong to the OS, not React Native → [Notification OS pipeline](../01-internals/13-notification-os-pipeline.md). Notifee is the bridge; your JS builds a payload object, native code displays it.

Init runs once in `App.jsx`. Cart notifications fire from context when items are added — a side effect colocated with the mutation.

The insight: **channel id on every notification.** Android 8+ rejects or misroutes notifications without a registered channel.

---

<a id="permission-and-channels"></a>

## 3 · Permission and channel registration

```text
  POST_NOTIFICATIONS (Android 13+)
         │ granted
         ▼
  createChannel({ id, name, importance })
         │
         ├── orders   (importance 4)
         ├── offers   (importance 3)
         └── cart     (importance 3)
```

`src/services/notificationService.js`

```javascript
export async function requestNotificationPermission() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function createNotificationChannels() {
  await notifee.createChannel({ id: 'orders', name: 'Orders', importance: 4 });
  await notifee.createChannel({ id: 'offers', name: 'Offers', importance: 3 });
  await notifee.createChannel({ id: 'cart', name: 'Cart Updates', importance: 3 });
}
```

`App.jsx` bails early if permission denied — no channels, no welcome notification.

---

<a id="display-notifications"></a>

## 4 · Immediate notifications — welcome and cart

```text
  displayNotification({ title, body, android: { channelId } })
```

Welcome on launch:

`src/services/notificationService.js`

```javascript
export async function showWelcomeNotification() {
  await notifee.displayNotification({
    title: '🎉 Welcome to Foodie!',
    body: "Explore restaurants and discover today's offers.",
    android: { channelId: 'offers' },
  });
}
```

Cart hook from context:

`src/context/CartContext.js`

```javascript
const addItem = item => {
  setCartItems(previousCart => [...previousCart, { ...item, quantity: 1 }]);
  showCartNotification(item.name);
};
```

The file also contains reference implementations (big text, image, inbox, progress) not wired into live flows — treat as snippets per `CLAUDE.md`.

---

<a id="scheduled-trigger"></a>

## 5 · Scheduled trigger — lunch reminder

```text
  getNextLunchTime() → today 13:00 or tomorrow if passed
         │
         ▼
  createTriggerNotification(payload, { type: TIMESTAMP, timestamp })
```

`src/services/notificationService.js`

```javascript
function getNextLunchTime() {
  const date = new Date();
  date.setHours(13, 0, 0, 0);
  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

export async function scheduleLunchReminder() {
  const lunchTime = getNextLunchTime();
  await notifee.createTriggerNotification(
    {
      id: LUNCH_REMINDER_ID,
      title: '🍔 Lunch Time!',
      body: 'Your favorite restaurants are waiting for you.',
      android: { channelId: 'offers' },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: lunchTime.getTime(),
    },
  );
}
```

`cancelLunchReminder()` uses the same stable `id` to remove the pending trigger.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| All notification APIs | `src/services/notificationService.js` | Channels, display, schedule |
| App init | `App.jsx` | Mount effect calling service |
| Cart trigger | `src/context/CartContext.js` | `showCartNotification` in `addItem` |
| README architecture | `README.md` §12 | Local vs push, channel table |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Notification OS pipeline](../01-internals/13-notification-os-pipeline.md)
- **Used by:** [Cart context](05-context-and-providers.md), future FCM integration (README §13 — not implemented)
- **Contrast with:** Push/FCM — server-triggered, needs network; this repo uses local only
- **Common mistake:** Calling `displayNotification` without `createChannel` first on Android 8+
