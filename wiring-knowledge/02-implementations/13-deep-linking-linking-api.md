# Deep linking — Linking config and listeners

> How Foodie maps `first://` URLs to nested tab/stack screens so external links open the right restaurant.

**Folder:** 02-implementations · **Prerequisites:** [React Navigation](04-react-navigation-wiring.md), [Deep link cold start](../01-internals/14-deep-link-intents-and-cold-start.md) · **Next:** [Platform back button](../03-patterns/12-platform-back-button-flow.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology
| Term | Meaning in one line |
|------|---------------------|
| Deep link | URL that opens a specific screen inside the installed app |
| Custom URL scheme | App-specific protocol — this repo uses `first://` |
| linking config | Object passed to `NavigationContainer` mapping paths to screen names |
| prefixes | URL schemes the app claims (`first://`) |
| Path param | Dynamic segment — `restaurant/:restaurantId` |
| getInitialURL | Read URL that launched a cold-start app |
| URL event listener | Receive links while app is already running |
| Nested screen path | Tab → stack screen path in `config.screens` |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  first://restaurant/42
         │
         ▼
  Android Intent  ──►  React Native Linking
         │
         ▼
  NavigationContainer (linking config)
         │
         └── Home (tab) → HomeStack → RestaurantScreen
                                    params: { restaurantId: '42' }

  App state          Handler
  ─────────          ───────
  cold start    →    getInitialURL()     (no JS yet until launch)
  foreground  →    Linking event       (JS alive)
```

**Reading the diagram.** OS delivers the URL; React Navigation's linking integration parses it against `config.screens`. Nested navigators need **nested keys** matching tab and stack screen names exactly.

Cold start vs warm delivery is owned by [Deep link intents](../01-internals/14-deep-link-intents-and-cold-start.md) — this note covers the JS config side only.

The insight: **a path missing from `config.screens` fails silently** — the app opens to the default tab, not the intended screen.

---

<a id="linking-config"></a>

## 3 · linking.js — prefixes and nested screens

```text
  prefixes: ['first://']
  config.screens.Home.screens.RestaurantScreen: 'restaurant/:restaurantId'
```

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
      Cart: {
        screens: {
          // match your CartStack screen names
        },
      },
      Profile: 'profile',
    },
  },
};
```

Tab name `Home` must match `BottomTabs` `Tab.Screen name="Home"`. Stack screen `RestaurantScreen` must match `HomeStack` registration.

Example URLs:
- `first://` → Home tab, `HomeScreen`
- `first://restaurant/42` → `RestaurantScreen` with `restaurantId: '42'`
- `first://profile` → Profile tab (`LoginScreen`)

---

<a id="navigation-container-wiring"></a>

## 4 · Passing linking to NavigationContainer

`src/navigation/AppNavigator.js`

```javascript
<NavigationContainer linking={linking}>
  <BottomTabs />
</NavigationContainer>
```

React Navigation subscribes to `Linking` internally when `linking` is provided — you do not duplicate listeners unless handling raw URLs outside navigation.

**Screen responsibility:** `RestaurantScreen` currently reads `route.params.restaurant` from in-app navigation. Deep links supply `restaurantId` instead — production code would fetch or lookup by id when `restaurant` is absent.

---

<a id="cold-vs-running"></a>

## 5 · Cold start vs app already running

```text
  CLOSED                          RUNNING
  getInitialURL() on launch       addEventListener('url', handler)
  JS bootstraps                   handler fires immediately
  NavigationContainer reads URL   same linking config parses path
```

README §13 table:

| Method | When |
|---|---|
| `Linking.getInitialURL()` | App launched from closed state |
| `Linking.addEventListener('url')` | App already in memory |

Both are required for complete coverage — cold start has no JS runtime to receive events until after launch.

Test on Android emulator:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "first://restaurant/42" com.first
```

(Package name from `app.json` / `AndroidManifest`.)

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Linking config | `src/navigation/linking.js` | Prefixes, nested paths |
| Container wiring | `src/navigation/AppNavigator.js` | `linking={linking}` |
| Tab/stack names | `src/navigation/BottomTabs.js`, `HomeStack.js` | Names must match config |
| In-app params | `src/screens/RestaurantScreen.js` | `route.params.restaurant` |
| README | `README.md` §13 | URL anatomy, intent diagram |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [React Navigation](04-react-navigation-wiring.md), [Deep link cold start](../01-internals/14-deep-link-intents-and-cold-start.md)
- **Used by:** Marketing links, notification tap targets (future)
- **Contrast with:** Universal/App Links (`https://`) — not configured in this repo yet
- **Common mistake:** Mapping `Restaurant` in config when stack registers `RestaurantScreen`
