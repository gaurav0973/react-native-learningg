# React Navigation Guide (Beginner Friendly)

This guide explains how navigation works in **this project** (`first`), step by step, using the official [React Navigation docs](https://reactnavigation.org/docs/getting-started/).

It is written for beginners. Every important concept is explained in plain language.

---

## Table of Contents

1. [What is React Navigation?](#1-what-is-react-navigation)
2. [Key Concepts You Must Know](#2-key-concepts-you-must-know)
3. [Two Layers: JavaScript vs Native](#3-two-layers-javascript-vs-native)
4. [Step-by-Step Setup (Follow This Order)](#4-step-by-step-setup-follow-this-order)
5. [How This Project Is Wired](#5-how-this-project-is-wired)
6. [Navigating Between Screens](#6-navigating-between-screens)
7. [Passing Data Between Screens](#7-passing-data-between-screens)
8. [Going Back](#8-going-back)
9. [Daily Workflow (What to Run and When)](#9-daily-workflow-what-to-run-and-when)
10. [Native Stack vs JS Stack](#10-native-stack-vs-js-stack)
11. [Common Errors and Fixes](#11-common-errors-and-fixes)
12. [Official Docs Links](#12-official-docs-links)

---

## 1. What is React Navigation?

React Navigation is the most popular library for moving between screens in a React Native app.

Think of your app like a stack of pages:

```
[ Home Screen ]  →  tap a restaurant  →  [ Restaurant Details Screen ]
```

React Navigation handles:

- Which screen is visible
- Animations when switching screens
- The Android back button / iOS swipe-back gesture
- Passing data (like a restaurant object) from one screen to another

**Official site:** https://reactnavigation.org/

---

## 2. Key Concepts You Must Know

### Screen

A **screen** is one full page in your app.

In this project:

| Screen name (in navigator) | File | What it shows |
|-----------------------------|------|---------------|
| `"Home"` | `src/screens/HomeScreen.js` | Restaurant list |
| `"Restaurant"` | `src/screens/RestaurantScreen.js` | One restaurant's details |

### Navigator

A **navigator** decides *how* screens are arranged and how you move between them.

We use a **Native Stack Navigator** — screens slide in/out using native Android/iOS animations.

Created in `src/navigation/AppNavigator.js`:

```js
const Stack = createNativeStackNavigator();
```

### `Stack.Navigator`

The **container** that holds all your stack screens. Think of it as the "manager" of the stack.

```js
<Stack.Navigator>
  {/* all Stack.Screen entries go here */}
</Stack.Navigator>
```

### `Stack.Screen`

Each `Stack.Screen` **registers** one screen with the navigator.

```js
<Stack.Screen name="Home" component={HomeScreen} />
```

- **`name`** — a unique string ID used when navigating (e.g. `"Home"`, `"Restaurant"`)
- **`component`** — the React component to render for that screen

### `NavigationContainer`

The **root wrapper** for all navigation. Every navigator must be inside it.

Without `NavigationContainer`, navigation does not work.

```js
<NavigationContainer>
  <Stack.Navigator>...</Stack.Navigator>
</NavigationContainer>
```

### `navigation` prop

When a screen is registered inside a navigator, React Navigation automatically passes a **`navigation`** object to that screen.

Example from `HomeScreen.js`:

```js
export function HomeScreen({ navigation }) {
  // navigation.navigate(...) moves to another screen
}
```

Common methods:

| Method | What it does |
|--------|--------------|
| `navigation.navigate('Restaurant', { restaurant })` | Go to a screen (push onto stack) |
| `navigation.goBack()` | Go back to the previous screen |
| `navigation.replace('Home')` | Replace current screen (no back to previous) |
| `navigation.popToTop()` | Go back to the first screen in the stack |

### `route` prop

Every screen also receives a **`route`** object with info about the current screen.

Most importantly: **`route.params`** — data passed when navigating.

Example from `RestaurantScreen.js`:

```js
export function RestaurantScreen({ route }) {
  const { restaurant } = route.params;
}
```

### Params (route parameters)

**Params** are data you send from Screen A to Screen B.

In `RestaurantCard.js`:

```js
navigation.navigate('Restaurant', { restaurant });
//                                    ↑ this object becomes route.params
```

On the destination screen:

```js
const { restaurant } = route.params;
```

---

## 3. Two Layers: JavaScript vs Native

This is the most important thing beginners miss.

Your React Native app has **two separate layers**:

| Layer | What it is | Updated by |
|-------|-----------|------------|
| **JavaScript (JS)** | Your `.js` / `.jsx` files, React components, navigation logic | Metro bundler — reload app (`R, R`) |
| **Native (Android/iOS)** | Kotlin/Java/Swift code compiled into the APK/IPA | `npm run android` or `npm run ios` |

Navigation libraries like `react-native-screens` and `react-native-safe-area-context` have **both** JS code and native code.

### Rule of thumb

| You changed... | You need to... |
|----------------|----------------|
| Screen UI, navigation logic, new `.js` files | Reload app in Metro (`R, R`) or restart Metro |
| Installed a new npm package with native code | Run `npm run android` (full native rebuild) |
| Edited `MainActivity.kt` or `AndroidManifest.xml` | Run `npm run android` |
| Added a new screen file only (no new packages) | Reload is enough |

**Metro reload alone cannot add new native modules.** That is why you saw errors like `RNSScreenContentWrapper not found` — the JS was ready but the APK was old.

---

## 4. Step-by-Step Setup (Follow This Order)

These steps match the [Getting Started guide](https://reactnavigation.org/docs/getting-started/) for **React Native CLI** (not Expo).

### Step 1 — Install core navigation package

```bash
npm install @react-navigation/native
```

**What it does:** Installs the core routing logic (`NavigationContainer`, hooks, etc.).

---

### Step 2 — Install required peer dependencies

```bash
npm install react-native-screens react-native-safe-area-context
```

| Package | Why it is needed |
|---------|-----------------|
| `react-native-screens` | Uses native screen containers for better performance and correct back-stack behavior |
| `react-native-safe-area-context` | Handles notches, status bar, and home indicator areas safely |

These packages include **native code**. After installing them, you **must rebuild** the app (Step 5).

---

### Step 3 — Install a navigator type

For mobile apps, the docs recommend **Native Stack**:

```bash
npm install @react-navigation/native-stack
```

**What it does:** Gives you `createNativeStackNavigator()` for native push/pop screen transitions.

> **Note:** There is also `@react-navigation/stack` (JS-based animations). It requires `react-native-gesture-handler` and is harder to set up on Windows. This project uses **native-stack** instead.

---

### Step 4 — Configure Android native files

These changes live outside JavaScript. They only take effect after a native rebuild.

#### 4a. `MainActivity.kt`

File: `android/app/src/main/java/com/first/MainActivity.kt`

Add the `RNScreensFragmentFactory` in `onCreate`:

```kotlin
import android.os.Bundle
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()
    super.onCreate(savedInstanceState)
  }

  // ... rest of the file
}
```

**Why:** Prevents Android crashes when the activity is recreated (e.g. after rotation or process death). Required by [react-native-screens on Android](https://reactnavigation.org/docs/getting-started/).

#### 4b. `AndroidManifest.xml`

File: `android/app/src/main/AndroidManifest.xml`

Inside the `<application>` tag, add:

```xml
android:enableOnBackInvokedCallback="false"
```

**Why:** React Navigation does not yet support Android's predictive back gesture. This makes the system back button work correctly.

#### 4c. Windows path fix (this project only)

If your Windows username or project path contains **spaces** (e.g. `GAURAV MAURYA`), native C++ builds can fail. This project includes a fix in `android/build.gradle` that adds `-canonical-prefixes` to all CMake builds.

If you move the project to a path without spaces (e.g. `C:\dev\first`), builds are more reliable.

---

### Step 5 — Rebuild the native app

**Stop Metro first**, then run:

```bash
npm run android
```

Use **two terminals** for daily development:

```bash
# Terminal 1 — JS bundler
npm run start

# Terminal 2 — build & install native app (only when native deps change)
npm run android
```

On Mac, for iOS you would also run:

```bash
npx pod-install ios
npm run ios
```

---

### Step 6 — Wrap the app with `SafeAreaProvider`

File: `index.js`

```js
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Root() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent(appName, () => Root);
```

**Why:** Makes safe-area insets available to all screens (notch, status bar, bottom bar). Screens can then use `SafeAreaView` or hooks like `useSafeAreaInsets()`.

---

### Step 7 — Create the navigator

File: `src/navigation/AppNavigator.js`

```js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { RestaurantScreen } from '../screens/RestaurantScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Concept recap:**

- `createNativeStackNavigator()` — factory that creates the stack type
- `Stack.Navigator` — holds all screens
- `Stack.Screen` — registers one screen with a `name` and `component`
- `NavigationContainer` — required root wrapper

---

### Step 8 — Use the navigator in `App.jsx`

File: `App.jsx`

```js
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return (
    <>
      <StatusBar barStyle="auto" backgroundColor="#FFFFFF" />
      <AppNavigator />
    </>
  );
}
```

---

### Step 9 — Navigate from a screen or component

Any component rendered **inside** a navigator can receive `navigation` if you pass it down, or use the `useNavigation()` hook.

**This project passes `navigation` as a prop:**

`HomeScreen.js` receives it automatically (because it is a registered screen):

```js
export function HomeScreen({ navigation }) {
  // ...
}
```

`RestaurantCard.js` receives it from `HomeScreen`:

```js
navigation.navigate('Restaurant', { restaurant });
```

**Alternative — `useNavigation()` hook** (no prop drilling):

```js
import { useNavigation } from '@react-navigation/native';

function RestaurantCard({ restaurant }) {
  const navigation = useNavigation();
  // navigation.navigate(...)
}
```

---

## 5. How This Project Is Wired

Here is the full flow from app launch to a restaurant detail screen:

```
index.js
  └── SafeAreaProvider
        └── App.jsx
              └── AppNavigator.js
                    └── NavigationContainer
                          └── Stack.Navigator
                                ├── Stack.Screen "Home" → HomeScreen.js
                                │     └── RestaurantCard.js
                                │           └── navigation.navigate('Restaurant', { restaurant })
                                └── Stack.Screen "Restaurant" → RestaurantScreen.js
                                      └── reads route.params.restaurant
```

### File responsibilities

| File | Role |
|------|------|
| `index.js` | App entry point, registers root component, wraps with `SafeAreaProvider` |
| `App.jsx` | Top-level UI shell (StatusBar + navigator) |
| `src/navigation/AppNavigator.js` | Defines all screens and the stack structure |
| `src/screens/HomeScreen.js` | Home page — receives `navigation` prop |
| `src/screens/RestaurantScreen.js` | Detail page — reads `route.params` |
| `src/components/RestaurantCard.js` | Tappable card — calls `navigation.navigate()` |
| `MainActivity.kt` | Android native setup for react-native-screens |
| `AndroidManifest.xml` | Android back gesture config |

---

## 6. Navigating Between Screens

### Go to a screen

```js
navigation.navigate('Restaurant', { restaurant: item });
```

- First argument: screen **name** (must match `Stack.Screen name="..."`)
- Second argument: **params** object (optional)

### Navigate to the same screen again

`navigate` goes to an existing screen in the stack if it is already there (by default). To always push a new instance, use:

```js
navigation.push('Restaurant', { restaurant: item });
```

### Set screen title in the header

```js
<Stack.Screen
  name="Restaurant"
  component={RestaurantScreen}
  options={{ title: 'Restaurant Details' }}
/>
```

Or set it dynamically inside the screen:

```js
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

useLayoutEffect(() => {
  navigation.setOptions({ title: restaurant.name });
}, [navigation, restaurant.name]);
```

### Hide the header

```js
<Stack.Navigator screenOptions={{ headerShown: false }}>
```

Or per screen:

```js
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{ headerShown: false }}
/>
```

---

## 7. Passing Data Between Screens

### Sending params

```js
// From RestaurantCard.js
navigation.navigate('Restaurant', {
  restaurant: {
    id: '1',
    name: 'Pizza Place',
    rating: 4.5,
  },
});
```

### Reading params

```js
// From RestaurantScreen.js
export function RestaurantScreen({ route }) {
  const { restaurant } = route.params;

  // Always guard against missing params during development
  if (!restaurant) {
    return null;
  }
}
```

### Typing params (optional, for TypeScript)

If you migrate to TypeScript later, you can define param lists for type-safe navigation. See the [TypeScript guide](https://reactnavigation.org/docs/typescript/).

---

## 8. Going Back

### User presses Android back button

Handled automatically by the native stack.

### Programmatic back

```js
navigation.goBack();
```

### Check if you can go back

```js
if (navigation.canGoBack()) {
  navigation.goBack();
}
```

---

## 9. Daily Workflow (What to Run and When)

### Normal JS-only changes (UI, styles, navigation logic)

1. Save your file
2. Press `R, R` in the app (or enable Fast Refresh — on by default)

### Added a new screen `.js` file (no new npm packages)

1. Register it in `AppNavigator.js` with a new `Stack.Screen`
2. Reload the app (`R, R`) — no native rebuild needed

### Installed a new npm package (especially navigation-related)

1. Stop Metro (`Ctrl+C`)
2. `npm install`
3. `npm run android` (native rebuild)
4. `npm run start -- --reset-cache`
5. Reload app

### Changed `MainActivity.kt` or `AndroidManifest.xml`

1. `npm run android`
2. Reload app

### Recommended two-terminal setup

```bash
# Terminal 1 — keep running
npm run start

# Terminal 2 — run when needed
npm run android
```

---

## 10. Native Stack vs JS Stack

| | `@react-navigation/native-stack` ✅ (this project) | `@react-navigation/stack` |
|--|--|--|
| Animations | Native (fast, platform-native feel) | JavaScript |
| Extra dependency | `react-native-screens` | `react-native-screens` + `react-native-gesture-handler` |
| Best for | Most mobile apps | Custom transition animations |
| Docs | [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator/) | [Stack Navigator](https://reactnavigation.org/docs/stack-navigator/) |

**Recommendation for beginners:** stick with `native-stack` unless you specifically need custom JS-driven transitions.

---

## 11. Common Errors and Fixes

### `Can't find ViewManager 'RNSScreenContentWrapper'`

**Cause:** The APK on your phone does not include `react-native-screens` native code.

**Fix:**

```bash
npm run android
```

Do not rely on Metro reload alone.

---

### `RNGestureHandlerModule could not be found`

**Cause:** You are using `@react-navigation/stack` (JS stack) without installing/linking `react-native-gesture-handler`.

**Fix for this project:** We use `native-stack`, so this should not appear. If you switch to JS stack, install gesture-handler and add `import 'react-native-gesture-handler'` as the **first line** of `index.js`, then rebuild.

---

### Metro bundles fine but app crashes on device

**Cause:** JS is updated but native binary is old.

**Fix:** `npm run android`

---

### `Filename longer than 260 characters` (Windows)

**Cause:** Windows MAX_PATH limit with long project paths or Gradle cache paths.

**Fix:**

- Move project to a shorter path: `C:\dev\first`
- Avoid running builds inside sandboxed environments with extra-long cache paths
- Use your normal Gradle cache: `%USERPROFILE%\.gradle`

---

### Metro crash during `npm install`

**Cause:** Metro file watcher conflicts with npm modifying `node_modules`.

**Fix:**

1. Stop Metro
2. Run `npm install`
3. Start Metro with `npm run start -- --reset-cache`

---

## 12. Official Docs Links

| Topic | URL |
|-------|-----|
| Getting Started | https://reactnavigation.org/docs/getting-started/ |
| Hello React Navigation | https://reactnavigation.org/docs/hello-react-navigation/ |
| Native Stack Navigator | https://reactnavigation.org/docs/native-stack-navigator/ |
| Stack Navigator (JS) | https://reactnavigation.org/docs/stack-navigator/ |
| Passing params | https://reactnavigation.org/docs/params/ |
| Navigation prop | https://reactnavigation.org/docs/navigation-prop/ |
| Screen options (headers) | https://reactnavigation.org/docs/screen-options/ |
| TypeScript | https://reactnavigation.org/docs/typescript/ |
| Troubleshooting | https://reactnavigation.org/docs/troubleshooting/ |

---

## Quick Checklist — Adding Navigation to a New React Native CLI Project

- [ ] `npm install @react-navigation/native`
- [ ] `npm install react-native-screens react-native-safe-area-context`
- [ ] `npm install @react-navigation/native-stack`
- [ ] Edit `MainActivity.kt` — add `RNScreensFragmentFactory`
- [ ] Edit `AndroidManifest.xml` — set `enableOnBackInvokedCallback="false"`
- [ ] Wrap app with `SafeAreaProvider` in `index.js`
- [ ] Create `AppNavigator.js` with `NavigationContainer` + `Stack.Navigator`
- [ ] Use `<AppNavigator />` in `App.jsx`
- [ ] **`npm run android`** — rebuild native app
- [ ] `npm run start` — start Metro
- [ ] Register each new screen with `Stack.Screen`
- [ ] Use `navigation.navigate('ScreenName', { params })` to move between screens
- [ ] Use `route.params` on the destination screen to read passed data

---

*This guide reflects the setup in the `first` project as of React Native 0.87 + React Navigation 7.x.*
