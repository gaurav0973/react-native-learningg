# React Navigation — stacks, tabs, nested navigators

> How Foodie moves between Home, restaurant detail, cart, and profile — nested native stacks inside bottom tabs.

**Folder:** 02-implementations · **Prerequisites:** [Core UI primitives](01-core-ui-primitives.md) · **Next:** [Deep linking](13-deep-linking-linking-api.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| NavigationContainer | Root wrapper required for any navigator to function |
| Native stack | Screen transitions handled by native fragments, not JS animations |
| Bottom tab navigator | Persistent tab bar switching between top-level sections |
| Nested navigator | A stack placed inside a tab — each tab owns its own back stack |
| Stack.Screen | Registers one routable screen with a unique `name` string |
| navigation prop | Object with `navigate`, `goBack`, etc. — auto-injected on screen components |
| route prop | Carries `params` passed during `navigate('Name', { … })` |
| useNavigation | Hook to access `navigation` without prop drilling |
| screenOptions | Navigator-level defaults — headers, tab colors, tab bar height |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  NavigationContainer (linking config)
  └── BottomTabs
       ├── Tab "Home" ──► HomeStack (Native Stack)
       │                    ├── HomeScreen
       │                    └── RestaurantScreen  ◄── params.restaurant
       ├── Tab "Fruits" ──► FruitExplorerScreen
       ├── Tab "Cart" ──► CartStack
       │                    ├── CartScreen
       │                    └── AddressScreen
       └── Tab "Profile" ──► LoginScreen
```

**Reading the diagram.** `AppNavigator` is thin: it wraps `BottomTabs` in `NavigationContainer` and passes the `linking` object for deep links. Each tab either mounts a screen directly or a **nested stack** so back gestures stay inside that tab.

Screen names must match what you pass to `navigate`. `RestaurantCard` calls `'RestaurantScreen'` because that is how `HomeStack` registered it — not `'Restaurant'`.

The insight: **tabs preserve independent stacks.** Pushing `AddressScreen` on the Cart tab does not affect the Home tab's stack.

---

<a id="navigation-container-and-tabs"></a>

## 3 · NavigationContainer and BottomTabs

```text
  index.js
    └── SafeAreaProvider
          └── App.jsx
                └── CartProvider / AddressProvider
                      └── AppNavigator
                            └── NavigationContainer
```

`src/navigation/AppNavigator.js`

```javascript
export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <BottomTabs />
    </NavigationContainer>
  );
}
```

`BottomTabs` registers four tabs with icons and colors:

`src/navigation/BottomTabs.js`

```javascript
<Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#16A34A', … }}>
  <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: HomeIcon }} />
  <Tab.Screen name="Fruits" component={FruitExplorerScreen} … />
  <Tab.Screen name="Cart" component={CartStack} … />
  <Tab.Screen name="Profile" component={LoginScreen} … />
</Tab.Navigator>
```

Native setup (`MainActivity.kt`, `react-native-screens`) is required after install → see `navigation.md` §4 and [Three build loops](../01-internals/05-three-build-loops.md#full-rebuild).

---

<a id="nested-stacks"></a>

## 4 · Nested stacks — HomeStack and CartStack

```text
  Home tab back stack          Cart tab back stack
  ┌───────────────┐            ┌───────────────┐
  │ RestaurantScr │            │ AddressScreen │
  ├───────────────┤            ├───────────────┤
  │ HomeScreen    │            │ CartScreen    │
  └───────────────┘            └───────────────┘
```

`HomeStack`:

`src/navigation/HomeStack.js`

```javascript
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="HomeScreen" component={HomeScreen} />
  <Stack.Screen name="RestaurantScreen" component={RestaurantScreen} />
</Stack.Navigator>
```

`CartStack` pushes checkout flow:

`src/navigation/CartStack.js`

```javascript
<Stack.Screen name="CartScreen" component={CartScreen} />
<Stack.Screen name="AddressScreen" component={AddressScreen} />
```

`CartScreen` navigates with `navigation.navigate('AddressScreen')` — name matches the stack registration exactly.

---

<a id="navigate-and-params"></a>

## 5 · navigate, goBack, and route.params

```text
  RestaurantCard                RestaurantScreen
  navigate('RestaurantScreen',  route.params
           { restaurant })  ──►  const { restaurant } = route.params
```

Push from card:

`src/components/RestaurantCard.js`

```javascript
navigation.navigate('RestaurantScreen', { restaurant })
```

Read on destination:

`src/screens/RestaurantScreen.js`

```javascript
export function RestaurantScreen({ navigation, route }) {
  const { restaurant } = route.params;
```

`Header` uses `useNavigation()` instead of props:

`src/components/Header.js`

```javascript
const navigation = useNavigation();
navigation.navigate('Profile');
```

`FloatingCartBar` navigates to tab `'Cart'` from inside the Home stack — tab name, not stack screen name.

Back from detail: `navigation.goBack()` on the hero back `Pressable`.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Root container | `src/navigation/AppNavigator.js` | `NavigationContainer`, `linking` |
| Tab bar | `src/navigation/BottomTabs.js` | Four tabs, `screenOptions` |
| Home stack | `src/navigation/HomeStack.js` | Two-screen push stack |
| Cart stack | `src/navigation/CartStack.js` | Cart → Address flow |
| Push with params | `src/components/RestaurantCard.js` | `navigate` + object |
| Read params | `src/screens/RestaurantScreen.js` | `route.params.restaurant` |
| Hook navigation | `src/components/Header.js` | `useNavigation()` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Core UI primitives](01-core-ui-primitives.md)
- **Used by:** [Deep linking](13-deep-linking-linking-api.md), [Platform back button](../03-patterns/12-platform-back-button-flow.md)
- **Contrast with:** Single stack app — no tab bar, one global back history
- **Common mistake:** `navigate('Restaurant')` when the registered name is `'RestaurantScreen'` — silent no-op or wrong screen
