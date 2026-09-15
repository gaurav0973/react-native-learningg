<div align="center">

# 📖 Module 10 — Deep Dive Notes
### React Native: Platform Conventions & Android Back Button

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-BackHandler%20·%20Platform%20·%20Navigation%20·%20Android%20Back-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Platform conventions & Android back button — production navigation behavior.
>
> This chapter is about making your React Native app feel **native on both Android and iOS** instead of behaving like a web app pasted onto a phone.

---

<a id="first-principle-native-experiences"></a>

## 1 · 🎯 First Principle — Native Experiences

> **Cross-platform code should produce platform-native experiences.**

React Native lets you write one codebase. It does **not** mean one identical UI/UX on both platforms. Users on Android and iOS have different expectations — your app should respect them.

| Web-app thinking | Native-app thinking |
|-----------------|---------------------|
| Same back button everywhere | Android = hardware/gesture back; iOS = swipe from edge |
| One navigation pattern | Material navigation on Android, iOS nav bar conventions on iOS |
| Generic touch feedback | Ripple on Android, opacity highlight on iOS |
| Exit via back button | Normal on Android; almost never expected on iOS |

```
One codebase, two native experiences

        React Native JS
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
  Android OS          iOS OS
  Material UX         Human Interface Guidelines
  BackHandler         Swipe-back gesture
  Ripple effects      Opacity feedback
  Exit via back       Home button to exit
```

> **Key insight:** "Cross-platform" ≠ "identical." It means **one team, one codebase**, but platform-appropriate behavior at the edges.

---

<a id="platform-conventions-android-vs-ios"></a>

## 2 · 🤖🍎 Platform Conventions — Android vs iOS

| Behavior | Android | iOS |
|----------|---------|-----|
| **Back navigation** | Hardware / gesture back button | Swipe from left edge |
| **Exit app** | Back on root screen → exit (with double-tap pattern) | Home button / app switcher — back rarely exits |
| **Navigation bar** | Material top app bar | Native navigation bar with large titles |
| **Touch feedback** | Ripple effects (`android_ripple`) | Opacity / highlight on press |
| **Permission dialogs** | Runtime permissions (`PermissionsAndroid`) | Native iOS permission prompts |
| **Tab bar** | Material bottom navigation | iOS tab bar (blur background) |
| **Status bar** | Customizable, light/dark icons | Managed via `StatusBar` + safe area |

```
User presses "back"

Android                          iOS
    │                               │
    ▼                               ▼
Hardware / gesture back        Swipe from left edge
    │                               │
    ▼                               ▼
BackHandler event              Navigation pop
OR React Navigation pop        (no hardware back)
    │                               │
    ▼                               ▼
On root screen →               On root screen →
double-tap to exit             stays in app
```

**When to branch with `Platform.OS`:**

```jsx
import { Platform, Pressable } from 'react-native';

// Android-only permission request
if (Platform.OS === 'android') {
  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
}

// Platform-specific styling
const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
    android: { elevation: 4 },
  }),
});
```

Foodie already uses `Platform.OS === 'android'` in `useCurrentLocation.js` and `notificationService.js` — runtime permissions are Android-only in that flow.

---

<a id="backhandler-api"></a>

## 3 · ⬅️ React Native BackHandler API

React Native exposes Android's hardware/gesture back button through `BackHandler`.

```jsx
import { BackHandler } from 'react-native';
```

| Fact | Detail |
|------|--------|
| **Platform** | Android only — no effect on iOS |
| **Event** | `"hardwareBackPress"` |
| **Who listens** | Any mounted component can register a listener |
| **Multiple listeners** | Last registered listener gets the event first |

**Basic listener:**

```jsx
useEffect(() => {
  const subscription = BackHandler.addEventListener(
    'hardwareBackPress',
    () => {
      console.log('Back pressed');
      return true;
    },
  );

  return () => subscription.remove();
}, []);
```

```
Back press event flow

User presses Android back
        │
        ▼
BackHandler fires "hardwareBackPress"
        │
        ▼
Your listener callback runs
        │
   ┌────┴────┐
   │         │
   ▼         ▼
return true  return false
"I handled   "Continue default
 this"        back behavior"
   │         │
   ▼         ▼
Stop here   React Navigation pops
            OR app exits on root
```

---

<a id="return-true-vs-false"></a>

## 4 · ✅ Return `true` vs `false` — Critical Rule

This is one of the most important things to remember about `BackHandler`.

| Return value | Meaning | Effect |
|-------------|---------|--------|
| **`true`** | "I handled this event" | Default back behavior is **blocked** |
| **`false`** | "I didn't handle it" | React Navigation (or system) continues default back |

```jsx
// Block back — show confirmation dialog instead
BackHandler.addEventListener('hardwareBackPress', () => {
  showExitConfirmation();
  return true;   // ← prevents immediate navigation
});

// Allow default — let React Navigation pop the screen
BackHandler.addEventListener('hardwareBackPress', () => {
  if (hasUnsavedChanges) {
    showSaveDialog();
    return true;  // ← block until user decides
  }
  return false;   // ← let navigation handle it
});
```

| Scenario | Return |
|----------|--------|
| Custom back logic (double-tap exit, unsaved form) | `true` |
| Want React Navigation to pop normally | `false` |
| Modal / bottom sheet open — close it first | `true` (close modal), then `false` on next press |

> If you return `true` everywhere by mistake, back navigation stops working entirely.

---

<a id="double-tap-to-exit"></a>

## 5 · 🔁 Double Tap to Exit (Production Android UX)

Many Android apps don't exit immediately on back at the root screen. Instead they use a **double-tap to exit** pattern.

```
First back press (root screen)
        │
        ▼
Show toast: "Press back again to exit"
        │
        ▼
User presses back again within 2 seconds?
        │
   ┌────┴────┐
   │         │
  Yes        No (timeout passed)
   │         │
   ▼         ▼
exitApp()   Show toast again
```

**Apps that use this:** WhatsApp, Telegram, Paytm, PhonePe, Swiggy.

**Full implementation:**

```jsx
import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';

const lastBackPress = useRef(0);

useEffect(() => {
  const subscription = BackHandler.addEventListener(
    'hardwareBackPress',
    () => {
      const now = Date.now();

      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPress.current = now;

      ToastAndroid.show(
        'Press back again to exit',
        ToastAndroid.SHORT,
      );

      return true;
    },
  );

  return () => subscription.remove();
}, []);
```

| Detail | Why |
|--------|-----|
| `useRef(0)` for timestamp | Persists across renders without causing re-renders |
| 2000 ms window | Industry standard — long enough to double-tap, short enough to reset |
| `return true` on both presses | Blocks default exit on first press; handles exit manually on second |
| `ToastAndroid` | Native Android toast — lightweight, no modal needed |
| `BackHandler.exitApp()` | Cleanly closes the app on second press |

---

<a id="usefocuseffect-vs-useeffect"></a>

## 6 · 🔍 useFocusEffect vs useEffect

A common senior-level improvement: register `BackHandler` with **`useFocusEffect`**, not plain `useEffect`.

| Hook | When it runs | Problem with BackHandler |
|------|-------------|-------------------------|
| **`useEffect`** | Component mounts / unmounts | Listener stays active even when screen is **not visible** (behind another screen in the stack) |
| **`useFocusEffect`** | Screen becomes focused / unfocused | Listener only active when this screen is **on top** |

```
Navigation stack: Home → Restaurant → Cart

useEffect on HomeScreen:
  BackHandler listener ALWAYS active ❌
  (even when Restaurant is on top)

useFocusEffect on HomeScreen:
  Listener active only when Home is focused ✅
  Cleanup when Restaurant pushes on top
```

**Production pattern with React Navigation:**

```jsx
import { useCallback, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

function HomeScreen() {
  const lastBackPress = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          const now = Date.now();

          if (now - lastBackPress.current < 2000) {
            BackHandler.exitApp();
            return true;
          }

          lastBackPress.current = now;
          ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
          return true;
        },
      );

      return () => subscription.remove();
    }, []),
  );

  return (/* screen content */);
}
```

| Rule | Why |
|------|-----|
| Wrap callback in `useCallback` | `useFocusEffect` requires a stable callback reference |
| Cleanup in return function | Remove listener when screen loses focus |
| Register on **root tab screen only** | Double-tap exit only makes sense at the app's root |

---

<a id="react-navigation-back-behavior"></a>

## 7 · 🧭 React Navigation & Back Behavior

React Navigation handles most back behavior automatically. You only need `BackHandler` for **custom overrides**.

```
Default React Navigation back flow (Android)

User presses back
        │
        ▼
Is there a screen in the stack to pop?
        │
   ┌────┴────┐
   │         │
  Yes        No (root screen)
   │         │
   ▼         ▼
Pop screen   App exits (or your
(go back)     BackHandler override)
```

**Foodie's navigation structure:**

```
NavigationContainer
└── BottomTabs
    ├── HomeStack
    │   ├── HomeScreen        ← root of Home tab
    │   └── RestaurantScreen  ← back pops to HomeScreen
    ├── FruitExplorerScreen
    ├── CartStack
    │   ├── CartScreen
    │   └── AddressScreen
    └── ProfileScreen
```

| Screen | Back behavior (default) | Custom override needed? |
|--------|------------------------|------------------------|
| `RestaurantScreen` | Pop to `HomeScreen` | No — React Navigation handles it |
| `AddressScreen` | Pop to `CartScreen` | No |
| `HomeScreen` (root tab) | Would exit app | **Yes** — double-tap to exit |
| Modal / bottom sheet | Should close modal first | **Yes** — return `true`, close modal |

**Foodie currently:** No `BackHandler` is wired up. On Android, pressing back on the home tab exits immediately — adding double-tap-to-exit on the root tab screens is the production upgrade.

---

<a id="production-patterns"></a>

## 8 · 🏭 Production Patterns Checklist

| Pattern | Platform | When |
|---------|----------|------|
| Double-tap to exit | Android | Root screen of each tab (or app root) |
| `useFocusEffect` + cleanup | Android | Any screen with custom back logic |
| Unsaved changes guard | Both | Form screens — block back, show "Discard?" dialog |
| Close modal on back | Android | Bottom sheets, action sheets, image viewers |
| `Platform.OS` branching | Both | Permissions, shadows, status bar, ripple |
| `Pressable` with `android_ripple` | Android | Material touch feedback |
| Swipe-back gesture | iOS | Enabled by default in native stack navigator |

**Unsaved changes guard example:**

```jsx
useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      if (hasUnsavedChanges) {
        Alert.alert('Discard changes?', 'You have unsaved changes.', [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', onPress: () => navigation.goBack() },
        ]);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => subscription.remove();
  }, [hasUnsavedChanges, navigation]),
);
```

---

<a id="foodie-app-examples"></a>

## 9 · 🍔 Foodie App — Current State & Upgrades

| Area | Current | Production upgrade |
|------|---------|-------------------|
| **Back on root tab** | Exits immediately (Android default) | Add double-tap-to-exit on `HomeScreen` |
| **Back on nested screens** | React Navigation pops correctly ✅ | No change needed |
| **Platform branching** | `Platform.OS` in location + notifications ✅ | Extend to shadows, ripple on buttons |
| **Touch feedback** | `Pressable` without ripple | Add `android_ripple` on primary buttons |
| **iOS swipe-back** | Native stack enables it by default ✅ | Keep `headerShown: false` — gesture still works |

**Where to add double-tap exit in Foodie:**

```jsx
// HomeScreen.js — root of HomeStack, inside a tab
// Register useFocusEffect + BackHandler here
// Only fires when HomeScreen is focused AND is the top of the stack
```

> Don't add double-tap exit on `RestaurantScreen` — back should pop to home normally (`return false` or no listener).

---

<a id="interview-questions"></a>

## 10 · 💼 Interview Questions

| Question | Answer |
|----------|--------|
| What is the first principle of cross-platform RN? | One codebase should produce **platform-native experiences**, not identical UI |
| What is `BackHandler`? | React Native API that listens to Android hardware/gesture back button |
| Does `BackHandler` work on iOS? | No — iOS uses swipe-from-edge gesture handled by the native stack navigator |
| `return true` vs `return false`? | `true` = "I handled it" (block default). `false` = let system/navigation continue |
| Why double-tap to exit? | Prevents accidental app exit on Android — industry standard on root screens |
| Why `useRef` for the timestamp? | Persists value across renders without triggering re-renders |
| Why `useFocusEffect` over `useEffect`? | Listener only active when screen is focused — avoids intercepting back on other screens |
| When do you need custom back handling? | Root screen exit, unsaved forms, open modals, custom drawer behavior |
| Android vs iOS back? | Android = hardware/gesture back. iOS = swipe from left edge, no exit-on-back |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 10*

</div>
