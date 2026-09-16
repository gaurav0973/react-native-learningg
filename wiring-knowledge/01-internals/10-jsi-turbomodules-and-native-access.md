# JSI, TurboModules, and native access

> How JavaScript calls into Android and iOS code in the New Architecture — direct JSI instead of the old async bridge, and lazy TurboModules for device APIs.

**Folder:** 01-internals · **Prerequisites:** [Hermes and the JS engine](09-hermes-and-the-js-engine.md) · **Next:** [Fabric render pipeline](11-fabric-render-pipeline.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| JSI | JavaScript Interface — C++ layer for direct JS ↔ native object calls |
| Old bridge | Legacy async message queue with JSON serialization |
| TurboModule | Lazy-loaded native module in the New Architecture |
| Native module | Platform API exposed to JS (GPS, storage, notifications) |
| Synchronous call | JS can call native without waiting for the next bridge tick (when safe) |
| newArchEnabled | Gradle flag enabling JSI + Fabric + TurboModules together |
| Codegen | Generates type-safe JSI bindings from native module specs |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  JAVASCRIPT (Hermes)                    NATIVE (Android/iOS)
  ┌─────────────────────┐               ┌─────────────────────┐
  │ Geolocation.        │               │ LocationManager     │
  │   getCurrentPosition  │               │ Camera              │
  │ notifee.display…    │               │ NotificationManager │
  └──────────┬──────────┘               └──────────▲──────────┘
             │                                    │
             ▼                                    │
  ╔══════════════════════════════════════════════════════════╗
  ║  JSI — direct C++ interface (no JSON queue)             ║
  ╚══════════════════════════╤═══════════════════════════════╝
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       TurboModules (lazy)            Fabric (UI — note 11)
       load on first use              shadow tree → native views
```

**Reading the diagram.** JavaScript cannot read GPS, show notifications, or touch the file system by itself. Native modules bridge that gap. In the old architecture, calls crossed an async bridge as serialized messages. JSI replaces that with a shared C++ interface — JS can hold references to native objects and call methods with lower overhead.

TurboModules sit on JSI and load **on demand**. Old modules initialized everything at startup; TurboModules defer cost until JS actually imports and calls the module.

The insight: **JS describes intent; JSI is the synchronous boundary; native code does privileged work the sandbox forbids JS from doing directly.**

---

<a id="old-bridge-vs-jsi"></a>

## 3 · Old bridge vs JSI

```text
  OLD BRIDGE                         JSI (New Architecture)
  JS call ──► queue ──► JSON ──► native   JS call ──► JSI ──► native
              async                         direct (sync when allowed)
```

| Old bridge | JSI |
|---|---|
| Async message queue | Direct C++ interface |
| JSON serialization | Shared typed objects |
| All modules at startup | TurboModules lazy-loaded |

This repo runs New Architecture:

`android/gradle.properties`

```properties
newArchEnabled=true
hermesEnabled=true
```

---

<a id="turbomodules-lazy-load"></a>

## 4 · TurboModules — lazy native modules

```text
  App starts
      │
      ▼
  Need @notifee/react-native?
      │
   NO ──► module not loaded (faster startup)
   YES ──► TurboModule loads native code on first import/call
```

| Old modules | TurboModules |
|---|---|
| Load all at startup | Load when first used |
| Higher memory | Lower startup cost |

Packages with native code in this repo — installed via npm, linked by Gradle on full rebuild:

`package.json`

```json
"@notifee/react-native": "^9.1.8",
"@react-native-community/geolocation": "^3.4.0",
"@react-native-async-storage/async-storage": "^3.1.1"
```

---

<a id="native-access-example"></a>

## 5 · Native access in this repo — GPS path

```text
  JS: Geolocation.getCurrentPosition()
         │
         ▼
  @react-native-community/geolocation (TurboModule)
         │
         ▼
  Android Location API → GPS hardware → coords back to JS
```

JS cannot read GPS directly — README §11 documents the bridge chain. Runtime permission must succeed before native code runs → [OS permission lifecycle](12-os-permission-lifecycle.md).

`src/hooks/useCurrentLocation.js`

```javascript
import Geolocation from '@react-native-community/geolocation';

Geolocation.getCurrentPosition(
  position => setLocation(position.coords),
  e => setError(e.message),
);
```

Implementation wiring for permissions and UI → [Geolocation and PermissionsAndroid](../02-implementations/11-geolocation-and-permissions-android.md).

---

<a id="notifee-native-path"></a>

## 6 · Notifee — another TurboModule path

```text
  JS: notifee.displayNotification({ … })
         │
         ▼
  @notifee/react-native native module
         │
         ▼
  Android NotificationManager (OS displays notification)
```

Notifications are OS-owned — JS only requests → [Notification OS pipeline](13-notification-os-pipeline.md), [Notifee implementation](../02-implementations/12-notifee-local-notifications.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| New Architecture flags | `android/gradle.properties` | `newArchEnabled`, `hermesEnabled` |
| Geolocation native module | `src/hooks/useCurrentLocation.js` | `Geolocation.getCurrentPosition` |
| Notifee native module | `src/services/notificationService.js` | `import notifee from '@notifee/react-native'` |
| AsyncStorage native module | `src/services/storageService.js` | AsyncStorage import |
| Native deps in manifest | `AndroidManifest.xml` | permissions for location, notifications |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Hermes and the JS engine](09-hermes-and-the-js-engine.md)
- **Used by:** [Fabric render pipeline](11-fabric-render-pipeline.md), [Notification OS pipeline](13-notification-os-pipeline.md), [Geolocation implementation](../02-implementations/11-geolocation-and-permissions-android.md)
- **Contrast with:** Pure JS libraries — no native folder, no Gradle link, no TurboModule
- **Common mistake:** calling native APIs before manifest permission exists — native throws `SecurityException` → [OS permission lifecycle](12-os-permission-lifecycle.md)
