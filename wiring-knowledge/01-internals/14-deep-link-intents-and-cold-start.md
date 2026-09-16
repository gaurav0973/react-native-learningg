# Intents, cold start, and deep link delivery

> How Android Intents deliver URLs into your app, why cold start needs getInitialURL, and how custom schemes differ from universal links.

**Folder:** 01-internals · **Prerequisites:** [Process death and RAM](04-process-death-and-ram.md) · **Next:** [Deep linking — Linking API](../02-implementations/13-deep-linking-linking-api.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Deep link | URL that opens a specific screen inside the app |
| Android Intent | OS message object used to start Activities and pass data between apps |
| Intent filter | Manifest declaration matching URL schemes/paths to an Activity |
| Cold start | App process not running — link launches new process from scratch |
| Warm start | App in memory — link delivered to running JS via event |
| Custom URL scheme | App-specific scheme like `first://` — works only if app installed |
| Universal / App Links | HTTPS URLs verified to open app or fall back to website |
| getInitialURL | Linking API for URL that launched a killed app |
| URL event listener | Linking API for URLs while app is already running |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  EXTERNAL APP (WhatsApp, browser, QR)
         │
         ▼
  URL: first://restaurant/42
         │
         ▼
  Android Intent system — matches intent-filter in Manifest
         │
         ▼
  MainActivity launched / brought to foreground
         │
  ═══════════════════════════════════════════════════════
  COLD START (no JS yet)          WARM (JS running)
         │                              │
         ▼                              ▼
  New process → Hermes →          Linking 'url' event
  index.js → AppNavigator         NavigationContainer
         │                              │
         └──────────┬───────────────────┘
                    ▼
         linking.js maps path → RestaurantScreen { id: 42 }
```

**Reading the diagram.** Deep links are not magic URLs inside React — they are **Android Intents**. The manifest intent-filter tells the OS which URLs belong to your app. When the user taps `first://restaurant/42`, Android starts or foregrounds `MainActivity` and attaches the URL.

If the process was dead (cold start), no JavaScript existed to listen yet — React Navigation reads the initial URL after mount via `Linking.getInitialURL()`. If the app was already running, the `url` event fires. Both paths are required — using only one misses half the cases → [Deep linking implementation](../02-implementations/13-deep-linking-linking-api.md).

The insight: **native Intent delivery happens before JS; Linking bridges Intent data into navigation state.**

---

<a id="intent-filter"></a>

## 3 · Intent filter in the manifest

```text
  MainActivity
  ├── intent-filter LAUNCHER     → home screen icon
  └── intent-filter VIEW+BROWSABLE + data scheme "first"
                                   → first://… links open this app
```

`android/app/src/main/AndroidManifest.xml`

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="first"/>
</intent-filter>
```

`launchMode="singleTask"` on the same Activity avoids duplicate task stacks when links arrive repeatedly.

---

<a id="url-anatomy"></a>

## 4 · URL anatomy — this repo's scheme

```text
  first://restaurant/42?coupon=FIRST50
  ───┬── ──────┬────── ─┬─ ────────┬────────
  scheme    path      param      query
```

| Part | This repo | Example |
|---|---|---|
| scheme | `first://` | from `linking.js` prefixes |
| path | route pattern | `restaurant/:restaurantId` |
| param | dynamic segment | `42` |

README §13 uses `foodie://` in examples; this app registers **`first://`** — match the manifest and linking config, not the marketing name.

`src/navigation/linking.js`

```javascript
export const linking = {
  prefixes: ['first://'],
  config: {
    screens: {
      Home: {
        screens: {
          HomeScreen: '',
          RestaurantScreen: 'restaurant/:restaurantId',
        },
      },
      Profile: 'profile',
    },
  },
};
```

---

<a id="cold-vs-warm-delivery"></a>

## 5 · Cold start vs warm delivery

```text
  COLD START                         WARM (active/background)
  Process killed                     JS runtime alive
       │                                  │
       ▼                                  ▼
  Intent → MainActivity              Intent → Activity onNewIntent
       │                                  │
       ▼                                  ▼
  JS boots index.js                  Linking.addEventListener('url')
       │                                  │
       ▼                                  ▼
  getInitialURL()                    handler navigates immediately
```

| App state | Mechanism |
|---|---|
| Not running | `Linking.getInitialURL()` after JS loads |
| Running | `Linking.addEventListener('url', …)` |

Process death means every cold start is also a fresh navigation stack → [Process death and RAM](04-process-death-and-ram.md). React Navigation wiring → [React Navigation](../02-implementations/04-react-navigation-wiring.md).

`src/navigation/AppNavigator.js`

```javascript
<NavigationContainer linking={linking}>
  <BottomTabs />
</NavigationContainer>
```

---

<a id="link-types"></a>

## 6 · Custom scheme vs universal / app links

```text
  CUSTOM SCHEME (this repo)          HTTPS APP LINKS (not configured here)
  first://restaurant/42              https://foodie.com/restaurant/42
  ✅ easy manifest entry             ✅ verified domain
  ⚠️ fails if app not installed      ✅ falls back to website
```

| Type | This repo |
|---|---|
| Custom scheme `first://` | ✅ implemented |
| Android App Links (https) | ❌ not configured |
| iOS Universal Links | ❌ not configured |

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Intent filter | `android/app/src/main/AndroidManifest.xml` | `VIEW` + `scheme="first"` |
| URL → screen map | `src/navigation/linking.js` | nested `config.screens` |
| NavigationContainer | `src/navigation/AppNavigator.js` | `linking={linking}` |
| Activity launch mode | `AndroidManifest.xml` | `launchMode="singleTask"` |
| README walkthrough | `README.md` §13 | Intent + Linking API table |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Process death and RAM](04-process-death-and-ram.md), [App lifecycle](03-app-lifecycle-and-appstate.md)
- **Used by:** [Deep linking — Linking API](../02-implementations/13-deep-linking-linking-api.md), [React Navigation](../02-implementations/04-react-navigation-wiring.md)
- **Contrast with:** In-app `navigation.navigate()` — no Intent, no URL, purely JS stack
- **Common mistake:** adding a path to `linking.js` but not nested under the correct tab stack — link silently fails to route → [Deep linking implementation](../02-implementations/13-deep-linking-linking-api.md)
