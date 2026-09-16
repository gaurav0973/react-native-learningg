# OS permission lifecycle

> The two-step Android permission model — manifest declaration at install time and runtime prompt at use time — and why missing the manifest blocks the popup entirely.

**Folder:** 01-internals · **Prerequisites:** [What is an app](01-what-is-an-app.md) · **Next:** [Permission request flow](../03-patterns/13-permission-request-flow.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Manifest permission | Declared in `AndroidManifest.xml` — required before OS allows access |
| Runtime permission | Dangerous permission requested while app runs — shows Allow/Deny dialog |
| Sandbox | App isolated from OS resources until permission granted |
| PermissionsAndroid | React Native API for runtime permission dialogs on Android |
| GRANTED | User allowed access — proceed with native API call |
| DENIED | User declined this time — may ask again later |
| NEVER_ASK_AGAIN | User permanently denied — must open Settings |
| POST_NOTIFICATIONS | Android 13+ runtime permission for showing notifications |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  (1) INSTALL TIME                    (2) RUNTIME (user taps feature)
  ┌─────────────────────┐             ┌─────────────────────┐
  │ Package Installer   │             │ JS calls            │
  │ reads Manifest    │             │ PermissionsAndroid  │
  │ records declared  │             │ .request(PERMISSION)│
  │ permissions       │             └──────────┬──────────┘
  └──────────┬──────────┘                        │
             │                                   ▼
             │ no manifest entry?                OS dialog
             │ ──► runtime popup NEVER appears   Allow / Deny
             │                                   │
             ▼                                   ▼
  App installed with capability listed    GRANTED → native API
                                          DENIED → show error
                                          NEVER_ASK_AGAIN → Settings
```

**Reading the diagram.** Android protects camera, location, microphone, notifications, and other sensitive APIs behind two gates. Gate (1) is install-time: the manifest tells the OS what your app *might* request. Gate (2) is runtime: when the user triggers a feature, JS calls `PermissionsAndroid.request()` and the OS shows a dialog.

If gate (1) is missing, gate (2) cannot fire — README §11 states this explicitly: without manifest declaration, the runtime popup will never appear. Native code that skips runtime and calls GPS anyway throws `SecurityException` → [Native crashes](06-native-crashes-and-logcat.md).

The insight: **manifest declares capability; runtime grants access for this session/user choice.**

---

<a id="manifest-declaration"></a>

## 3 · Manifest declaration — install time

```text
  AndroidManifest.xml
  ├── ACCESS_FINE_LOCATION    ← precise GPS
  ├── ACCESS_COARSE_LOCATION  ← approximate
  ├── POST_NOTIFICATIONS      ← Android 13+ notifications
  └── INTERNET                ← network (normal permission)
```

`android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

Changing manifest requires full rebuild → [Three build loops](05-three-build-loops.md#full-rebuild).

---

<a id="runtime-request"></a>

## 4 · Runtime request — when user needs the feature

```text
  User taps "Use Current Location"
         │
         ▼
  PermissionsAndroid.check() — already granted?
         │
    NO ──► PermissionsAndroid.request(ACCESS_FINE_LOCATION)
         │
         ▼
  GRANTED ──► Geolocation.getCurrentPosition()
  DENIED ──► error state in hook
  NEVER_ASK_AGAIN ──► guide to Settings
```

`src/hooks/useCurrentLocation.js`

```javascript
const permission = await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
);

if (permission === PermissionsAndroid.RESULTS.DENIED) {
  throw new Error('Location permission denied');
}

if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
  throw new Error('Location permission permanently denied');
}
```

Ask when needed, not at launch — UX pattern in → [Permission request flow](../03-patterns/13-permission-request-flow.md).

---

<a id="notification-permission"></a>

## 5 · Notification permission — same two-step model

```text
  Manifest: POST_NOTIFICATIONS
         │
         ▼
  App.jsx mount → requestNotificationPermission()
         │
         ▼
  GRANTED → create channels + show welcome notification
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
```

Notification display pipeline after permission → [Notification OS pipeline](13-notification-os-pipeline.md).

---

<a id="full-lifecycle-example"></a>

## 6 · Full lifecycle — location in this repo

```text
  1. Install app     → Android reads manifest permissions
  2. Open Cart       → no popup (not requested yet)
  3. Tap location btn→ PermissionsAndroid.request()
  4. User Allow      → Geolocation.getCurrentPosition()
  5. Coords returned → hook updates state → AddressScreen shows lat/lng
```

README §11 documents this sequence. Geolocation crosses JSI as a TurboModule → [JSI and native access](10-jsi-turbomodules-and-native-access.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| All manifest permissions | `android/app/src/main/AndroidManifest.xml` | `<uses-permission>` lines |
| Location runtime request | `src/hooks/useCurrentLocation.js` | `PermissionsAndroid.request` |
| Notification runtime request | `src/services/notificationService.js` | `POST_NOTIFICATIONS` |
| UI trigger (ask when needed) | `src/screens/AddressScreen.js` | button calls `fetchLocation` |
| App init notification permission | `App.jsx` | `requestNotificationPermission()` in mount effect |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [What is an app](01-what-is-an-app.md)
- **Used by:** [Geolocation implementation](../02-implementations/11-geolocation-and-permissions-android.md), [Notifee implementation](../02-implementations/12-notifee-local-notifications.md), [Permission request flow](../03-patterns/13-permission-request-flow.md)
- **Contrast with:** iOS — different API (`requestAuthorization`) but same two-layer idea (Info.plist + runtime)
- **Common mistake:** calling `Geolocation` before manifest + runtime grant — native crash or silent failure → [Manifest declaration](#manifest-declaration)
