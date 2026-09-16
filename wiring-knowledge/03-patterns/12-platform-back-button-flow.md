# Android back button — BackHandler flow

> How Android hardware/gesture back differs from iOS swipe-back, and when to intercept
> with `BackHandler` vs letting React Navigation handle it.

**Folder:** 03-patterns · **Prerequisites:**
[React Navigation wiring](../02-implementations/04-react-navigation-wiring.md) ·
**Next:** [Permission request flow](13-permission-request-flow.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Platform conventions | Android and iOS users expect different navigation patterns |
| BackHandler | React Native API for Android hardware/gesture back — iOS has no equivalent |
| `hardwareBackPress` | Event name BackHandler listens for |
| Return true | Handler consumed the event — block default back behaviour |
| Return false | Not handled — React Navigation pops or system exits |
| Double-tap exit | Toast on first back at root; exit on second within ~2 s |
| `useFocusEffect` | Register listener only while screen is focused |
| Root screen | Bottom of stack — back would exit the app |
| Native stack swipe | iOS back gesture — handled by navigator, not BackHandler |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  Android user presses BACK
           │
           ▼
  ┌────────────────────┐
  │ BackHandler        │  Android only — no iOS equivalent
  │ listeners (LIFO)   │
  └─────────┬──────────┘
            │
     handler returns?
            │
     ┌──────┴──────┐
     │             │
    true          false
     │             │
     ▼             ▼
  STOP here    React Navigation
  (custom)     pops stack OR
               system exits app
```

**Reading the diagram.** On Android, back is a first-class OS event. `BackHandler` lets
you intercept it before the navigator or system acts. On iOS, back is a swipe-from-edge
gesture built into the native stack — no `BackHandler` → see
[React Navigation](../02-implementations/04-react-navigation-wiring.md).

Foodie does not yet wire `BackHandler` — React Navigation's default pop handles nested
stacks. This note documents the production pattern to add double-tap exit on root tabs.

The insight: **cross-platform ≠ identical.** One codebase, platform-native behaviour at
the edges.

---

<a id="backhandler-api"></a>

## 3 · BackHandler API

```text
  import { BackHandler } from 'react-native';

  BackHandler.addEventListener('hardwareBackPress', handler)
        │
        handler() returns boolean
        │
        ├─ true  → event consumed, nothing else happens
        └─ false → fall through to next listener / navigation
```

Minimal listener:

```javascript
// pattern — not yet in Foodie repo
function handler() {
  return true; // block back
}

BackHandler.addEventListener('hardwareBackPress', handler);
// cleanup: BackHandler.removeEventListener('hardwareBackPress', handler)
```

Listeners stack LIFO — the most recently added runs first. Only one should return `true`
for a given press.

Platform branching elsewhere in Foodie:

`src/hooks/useCurrentLocation.js`

```javascript
if (Platform.OS === 'android') {
  const hasPermission = await PermissionsAndroid.check(/* … */);
}
```

Same `Platform.OS` pattern applies when registering BackHandler only on Android.

---

<a id="return-true-vs-false"></a>

## 4 · Return true vs false

```text
  SCENARIO                    RETURN
  ────────                    ──────
  Modal open → close modal    true (you handled it)
  Inner stack → pop screen    false (let navigation pop)
  Root tab → double-tap exit  true on first (show toast)
  Root tab → second back      true + BackHandler.exitApp()
  Form dirty → confirm leave  true (show alert first)
```

The most common bug is returning the wrong value — `true` when navigation should pop
(traps user) or `false` when you meant to intercept (app exits unexpectedly).

React Navigation already pops on back when your handler returns `false` and the stack has
history. Custom BackHandler is only needed for **overrides**: exit app, close modal,
unsaved-changes guard.

---

<a id="double-tap-exit"></a>

## 5 · Double-tap to exit

```text
  User on ROOT screen presses back
        │
        ▼
  First press within 2s window?
        │
   ┌────┴────┐
  No         Yes (first press)
   │              │
   ▼              ▼
 exitApp()    ToastAndroid.show(
              "Press back again to exit")
              return true
              reset timer on second press → exitApp()
```

Industry standard on food-delivery and payment apps — prevents accidental exit.

```javascript
// production pattern — not yet wired in Foodie
import { BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRef, useCallback } from 'react';

function useDoubleTapExit() {
  const lastBackPress = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const handler = () => {
        const now = Date.now();
        if (now - lastBackPress.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPress.current = now;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', handler);
      return () => BackHandler.removeEventListener('hardwareBackPress', handler);
    }, []),
  );
}
```

`useRef` for timestamp avoids re-renders on every back press.

---

<a id="usefocuseffect"></a>

## 6 · useFocusEffect — not useEffect

```text
  Screen A (focused)     Screen B pushed on top
  listener ACTIVE        listener REMOVED (cleanup)
                         Screen A listener NOT running
```

Plain `useEffect` keeps the listener active when the screen is hidden under another —
Screen A would steal back presses meant for Screen B.

`useFocusEffect` from React Navigation registers on focus and cleans up on blur — the
correct hook for BackHandler →
[React Navigation](../02-implementations/04-react-navigation-wiring.md).

Foodie's `BottomTabs` root screens (Home, Fruits, Cart, Profile) are the candidates for
double-tap exit — one level above nested stacks like `HomeStack`.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Default back (navigation) | `src/navigation/HomeStack.js` | native stack pop — no BackHandler |
| Platform branch | `src/hooks/useCurrentLocation.js` | `Platform.OS === 'android'` |
| Root tabs | `src/navigation/BottomTabs.js` | where double-tap exit would attach |
| iOS swipe back | native-stack default | no code needed on iOS |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [React Navigation](../02-implementations/04-react-navigation-wiring.md),
  [useEffect](../02-implementations/07-useeffect-and-side-effects.md)
- **Used by:** [Permission flow](13-permission-request-flow.md) (settings redirect on
  NEVER_ASK_AGAIN uses different APIs)
- **Contrast with:** iOS — no BackHandler; native stack handles swipe-back
- **Common mistake:** BackHandler in plain `useEffect` — intercepts back on hidden screens
  → [#usefocuseffect](#usefocuseffect)
