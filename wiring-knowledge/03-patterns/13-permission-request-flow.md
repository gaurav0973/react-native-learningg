# Permission request flow — ask when needed

> When to request OS permissions, how Android's three grant states behave, and why
> manifest declaration must come before the runtime prompt.

**Folder:** 03-patterns · **Prerequisites:**
[OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md) ·
**Next:** [Geolocation](../02-implementations/11-geolocation-and-permissions-android.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Manifest permission | Declared in `AndroidManifest.xml` — required before runtime ask |
| Runtime permission | OS dialog shown while app is running — Android 6+ |
| Ask when needed | Request permission at the moment of use, not at app launch |
| GRANTED | User allowed — proceed with protected action |
| DENIED | User declined this time — can ask again later |
| NEVER_ASK_AGAIN | User checked "don't ask again" — must open Settings |
| Permission gate | Code path that checks/requests before accessing GPS, camera, etc. |
| Rationale | Optional explanation shown before the system dialog |
| Cold start vs warm | Permission state survives in OS — not in your JS state |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  USER TAPS "Use Current Location"
           │
           ▼
  ┌────────────────────┐
  │ Platform.OS check  │  Android: runtime flow
  └─────────┬──────────┘  iOS: separate prompt API
            │
            ▼
  ┌────────────────────┐
  │ PermissionsAndroid │  ← manifest must declare first
  │ .check()           │
  └─────────┬──────────┘
            │
     already granted?
       ┌────┴────┐
      Yes        No
       │          │
       │          ▼
       │    .request() → OS dialog
       │          │
       │    ┌─────┼─────┐
       │    │     │     │
       │  GRANT DENY NEVER_ASK
       │    │     │     │
       ▼    ▼     ▼     ▼
  Geolocation   proceed  error   error + Settings
  .getCurrentPosition
```

**Reading the diagram.** Permission is requested **when the user asks for location**, not
on app open — they understand why the dialog appeared. Manifest declaration is the
prerequisite the OS checks before showing any dialog →
[OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md).

The insight: **no manifest → no dialog.** Runtime request without manifest declaration
silently fails or crashes.

---

<a id="ask-when-needed"></a>

## 3 · Ask when needed — not on launch

```text
  BAD (launch)                    GOOD (on demand)
  ────────────                    ────────────────
  App.jsx useEffect               User taps location button
  request all permissions         request only location
  user confused why               user knows why
```

`AddressScreen` requests location only when the user presses the button:

`src/screens/AddressScreen.js`

```javascript
<Pressable onPress={fetchLocation} disabled={loading}>
  {loading ? <ActivityIndicator /> : <Text>Use Current Location</Text>}
</Pressable>
```

`fetchLocation` comes from `useCurrentLocation` — the permission gate lives inside the hook
→ [Custom hook extraction](07-custom-hook-extraction.md).

Notifications follow the same principle in `App.jsx` — permission requested during init
because notifications are app-wide; location is feature-scoped.

---

<a id="three-grant-states"></a>

## 4 · Three grant states

```text
  .request() result
        │
   ┌────┼────────────┐
   │    │            │
   ▼    ▼            ▼
GRANTED DENIED   NEVER_ASK_AGAIN
   │    │            │
   ▼    ▼            ▼
 proceed throw    throw + guide
         error      to Settings
```

`useCurrentLocation` implements the full branch:

`src/hooks/useCurrentLocation.js`

```javascript
if (!hasPermission) {
  const permission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (permission === PermissionsAndroid.RESULTS.DENIED) {
    throw new Error('Location permission denied');
  }

  if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    throw new Error('Location permission permanently denied');
  }
}

Geolocation.getCurrentPosition(
  position => { setLocation(position.coords); setLoading(false); },
  e => { setError(/* timeout / unavailable / message */); setLoading(false); },
);
```

Errors surface inline on `AddressScreen` → [Feedback selection](10-feedback-selection.md).

---

<a id="never-ask-again"></a>

## 5 · NEVER_ASK_AGAIN — the dead end

```text
  NEVER_ASK_AGAIN
        │
        ▼
  .request() will NOT show dialog again
        │
        ▼
  Show inline message:
  "Enable location in Settings"
        │
        ▼
  Linking.openSettings()  (user must opt in manually)
```

Production apps add a Settings button when permanent denial is detected. Foodie currently
shows the error string — upgrade path: catch `permanently denied` and offer `Linking.openSettings()`.

Post-notification permission on Android 13+ uses the same pattern with
`POST_NOTIFICATIONS` → declared in manifest, requested at runtime in `App.jsx`.

Bridge mechanics for GPS → [Geolocation implementation](../02-implementations/11-geolocation-and-permissions-android.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Permission hook | `src/hooks/useCurrentLocation.js` | check → request → three states |
| Trigger UI | `src/screens/AddressScreen.js` | button calls `fetchLocation` |
| Inline error | `src/screens/AddressScreen.js` | `{error ? <Text>…}` |
| Notification permission | `App.jsx` | init-time request for app-wide feature |
| Manifest | `android/app/src/main/AndroidManifest.xml` | `ACCESS_FINE_LOCATION` declaration |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md),
  [Custom hook extraction](07-custom-hook-extraction.md)
- **Used by:** [Geolocation](../02-implementations/11-geolocation-and-permissions-android.md)
- **Contrast with:** [BackHandler flow](12-platform-back-button-flow.md) — different OS
  edge API, same "platform branch at the edge" principle
- **Common mistake:** calling `.request()` without manifest entry — dialog never appears →
  [OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md)
