# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A React Native CLI (0.87, React 19) food-delivery style learning app ("Foodie") — restaurant browsing, cart, address, offers, plus a fruit-explorer demo. `README.md` is the author's personal concept-by-concept learning log (not setup docs); `navigation.md` documents the React Navigation wiring in more depth than needed here.

## Commands

```bash
npm run start                 # Metro bundler (Terminal 1, keep running)
npm run android                # Build & install on Android (Terminal 2, only when native deps change)
npm run android:standard       # Same, without --active-arch-only
npm run ios                    # Build & install on iOS (macOS only)

npm test                       # Run all Jest tests
npx jest __tests__/App.test.tsx   # Run a single test file
npx jest -t "renders correctly"   # Run tests matching a name

npm run lint                   # ESLint, --max-warnings=0
npm run lint:fix
npm run format                 # Prettier write
npm run validate               # lint + prettier --check (run before considering work done)

npm run build:android          # Bundle JS + assets into android/app/src/main/assets (release bundle)
npm run android:build:debug    # gradlew assembleDebug
npm run android:build:apk      # gradlew assembleRelease (APK)
npm run android:build:aab      # gradlew bundleRelease (AAB)
npm run android:clean          # gradlew clean
```

Two-terminal workflow: `npm run start` stays running; only re-run `npm run android` after installing a package with native code, or editing native files (`AndroidManifest.xml`, `MainActivity.kt`, `build.gradle`). Pure `.js`/`.jsx` changes just need a Metro reload.

`.env` holds `API_BASE_URL` (loaded via `react-native-config`). It differs per run target: `10.0.2.2` for Android emulator, `localhost` for iOS simulator, LAN IP for a physical device.

## Architecture

**Entry chain:** `index.js` → wraps `App` in `SafeAreaProvider` → `App.jsx` → wraps everything in `CartProvider` → `AddressProvider` → `AppNavigator`.

**Navigation** (`src/navigation/`): `AppNavigator.js` sets up `NavigationContainer` with a `linking` config (`linking.js`, scheme `first://`) and renders `BottomTabs.js` (Home / Fruits / Cart / Profile tabs). `HomeStack.js` and `CartStack.js` are native-stack navigators nested inside their respective tabs. Deep link paths must be added in `linking.js` `config.screens` matching the actual nested screen names (e.g. `Home.screens.RestaurantScreen`), or the link silently fails to route.

**State — React Context, not Redux/Zustand:** `src/context/CartContext.js` and `AddressContext.js` are the only global stores. Both follow the same hydration pattern:
- On mount, read persisted state via `getData(STORAGE_KEYS.X)` from `storageService.js` and set `isHydrated` when done.
- A second effect persists state via `saveData()` whenever it changes, gated on `isHydrated` (to avoid overwriting storage with the initial empty state before restore completes).
- The provider renders `null` until hydrated.
When adding a new persisted piece of global state, follow this same restore-then-save-with-hydration-guard pattern rather than introducing a new state library.

**Storage** (`src/services/storageService.js`): thin wrapper around AsyncStorage — `saveData`/`getData`/`removeData`/`clearStorage`, keyed by `STORAGE_KEYS` (`CART`, `TOKEN`, `USER`, `ADDRESSES`). All values are JSON-stringified on write, parsed on read.

**API layer** (`src/api/`): `client.js` exports a single configured `axios` instance (`apiClient`) using `Config.API_BASE_URL` from `react-native-config`. Per-resource files (e.g. `restaurantApi.js`) export plain async functions built on `apiClient` — no class wrappers, no separate service layer.

**Notifications** (`src/services/notificationService.js`): built on `@notifee/react-native`. Channels (`orders`, `offers`, `cart`) are created once in `App.jsx`'s init effect alongside permission request and a scheduled lunch-reminder trigger notification. Cart additions trigger a notification directly from `CartContext.addItem`. The file also contains several notification-style examples (big text, image, inbox/grouped, progress) that are not currently wired into the app flow — treat those as reference snippets, not live code paths.

**Deep linking**: custom URL scheme `first://` (see `linking.js`). `Linking.getInitialURL()` handles cold start, `Linking.addEventListener('url')` handles a running app — both are needed since a closed app has no JS runtime yet to receive an event.

## Platform notes

- This project's Windows path (contains spaces, e.g. `GAURAV MAURYA`) has needed a `-canonical-prefixes` CMake fix in `android/build.gradle` for native C++ builds — don't remove it without checking why it's there.
- Metro's `blockList` (in `metro.config.js`) excludes `android/.gradle`, `android/build`, `android/app/build`, `android/app/.cxx`, `ios/build`, `ios/Pods` — Gradle/CMake create/delete files under these mid-build and otherwise crash Metro's watcher.
- `PermissionsAndroid` runtime requests are used for both location (`ACCESS_FINE_LOCATION`) and notifications (`POST_NOTIFICATIONS`); manifest declarations must exist first or the runtime prompt never appears.
