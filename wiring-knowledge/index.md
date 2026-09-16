# Wiring Knowledge — Foodie

> Every concept from this repo, explained once, in dependency order.
> 51 notes across four tracks. Start at the reading path below.

---

## How to read this

- **Read in order the first time.** The numbering is a dependency order.
- **Each concept lives in exactly one note.** Use [concept lookup](concept-lookup.md).
- **Every note is shaped the same way:** terms → master diagram → sub-diagrams → repo → wiring.

---

## The reading path

```text
  01 INTERNALS                02 IMPLEMENTATIONS           03 PATTERNS
  how the machine works  ──►  what you call to build  ──►  how to shape a solution
         │                            │                           │
         └────────────────────────────┴───────────────► 04 STYLE PATTERNS
                                                        how it is laid out
```

**Spine (limited time):** [Three build loops](01-internals/05-three-build-loops.md) → [Fabric render pipeline](01-internals/11-fabric-render-pipeline.md) → [UI as function of state](03-patterns/01-ui-as-function-of-state.md) → [React Navigation wiring](02-implementations/04-react-navigation-wiring.md) → [Hydration gating](03-patterns/04-hydration-gating-pattern.md) → [Deep linking](02-implementations/13-deep-linking-linking-api.md).

---

## 01 · Internals

> How the runtime, OS, and build work underneath your code.

| # | Note | What it answers | Assumes |
|---|------|-----------------|---------|
| 01 | [What is an app — APK, AAB, IPA, signing](01-internals/01-what-is-an-app.md) | What is an app — APK, AAB, IPA, signing | — |
| 02 | [Metro and the JavaScript bundle](01-internals/02-metro-and-the-js-bundle.md) | Metro and the JavaScript bundle | [01-what-is-an-app](01-internals/01-what-is-an-app.md) |
| 03 | [App lifecycle and AppState](01-internals/03-app-lifecycle-and-appstate.md) | App lifecycle and AppState | [02-metro-and-the-js-bundle](01-internals/02-metro-and-the-js-bundle.md) |
| 04 | [Process death, RAM, and what survives](01-internals/04-process-death-and-ram.md) | Process death, RAM, and what survives | [03-app-lifecycle-and-appstate](01-internals/03-app-lifecycle-and-appstate.md) |
| 05 | [The three build loops](01-internals/05-three-build-loops.md) | The three build loops | [02-metro-and-the-js-bundle](01-internals/02-metro-and-the-js-bundle.md) |
| 06 | [Native crashes, ADB, and logcat](01-internals/06-native-crashes-and-logcat.md) | Native crashes, ADB, and logcat | [01-what-is-an-app](01-internals/01-what-is-an-app.md) |
| 07 | [Density, dp/pt, and PixelRatio](01-internals/07-density-dp-and-pixel-ratio.md) | Density, dp/pt, and PixelRatio | — |
| 08 | [What React Native is not — no DOM, cascade, or browser](01-internals/08-what-the-platform-lacks.md) | What React Native is not — no DOM, cascade, or browser | — |
| 09 | [Hermes and the JavaScript engine](01-internals/09-hermes-and-the-js-engine.md) | Hermes and the JavaScript engine | [02-metro-and-the-js-bundle](01-internals/02-metro-and-the-js-bundle.md) |
| 10 | [JSI, TurboModules, and native access](01-internals/10-jsi-turbomodules-and-native-access.md) | JSI, TurboModules, and native access | [09-hermes-and-the-js-engine](01-internals/09-hermes-and-the-js-engine.md) |
| 11 | [Fabric, reconciliation, and the thread model](01-internals/11-fabric-render-pipeline.md) | Fabric, reconciliation, and the thread model | [10-jsi-turbomodules-and-native-access](01-internals/10-jsi-turbomodules-and-native-access.md) |
| 12 | [OS permission lifecycle](01-internals/12-os-permission-lifecycle.md) | OS permission lifecycle | [01-what-is-an-app](01-internals/01-what-is-an-app.md) |
| 13 | [How the OS displays notifications](01-internals/13-notification-os-pipeline.md) | How the OS displays notifications | [10-jsi-turbomodules-and-native-access](01-internals/10-jsi-turbomodules-and-native-access.md) |
| 14 | [Intents, cold start, and deep link delivery](01-internals/14-deep-link-intents-and-cold-start.md) | Intents, cold start, and deep link delivery | [04-process-death-and-ram](01-internals/04-process-death-and-ram.md) |
| 15 | [Expo vs React Native CLI — who owns native](01-internals/15-expo-vs-react-native-cli.md) | Expo vs React Native CLI — who owns native | [01-what-is-an-app](01-internals/01-what-is-an-app.md), [05-three-build-loops](01-internals/05-three-build-loops.md) |

---

## 02 · Implementations

> Specific APIs and libraries you call to build features.

| # | Note | What it answers | Assumes |
|---|------|-----------------|---------|
| 01 | [View, Text, StyleSheet, Pressable, TextInput](02-implementations/01-core-ui-primitives.md) | View, Text, StyleSheet, Pressable, TextInput | [08-what-the-platform-lacks](01-internals/08-what-the-platform-lacks.md) |
| 02 | [ScrollView, FlatList, Image, ImageBackground](02-implementations/02-scrollview-flatlist-image.md) | ScrollView, FlatList, Image, ImageBackground | [01-core-ui-primitives](02-implementations/01-core-ui-primitives.md) |
| 03 | [FlashList, recycling, and RefreshControl](02-implementations/03-flashlist-and-pull-to-refresh.md) | FlashList, recycling, and RefreshControl | [02-scrollview-flatlist-image](02-implementations/02-scrollview-flatlist-image.md) |
| 04 | [React Navigation — stacks, tabs, nested navigators](02-implementations/04-react-navigation-wiring.md) | React Navigation — stacks, tabs, nested navigators | [01-core-ui-primitives](02-implementations/01-core-ui-primitives.md) |
| 05 | [Context API — CartProvider and AddressProvider](02-implementations/05-context-and-providers.md) | Context API — CartProvider and AddressProvider | [01-ui-as-function-of-state](03-patterns/01-ui-as-function-of-state.md) |
| 06 | [AsyncStorage and storageService](02-implementations/06-asyncstorage-and-storage-service.md) | AsyncStorage and storageService | [04-process-death-and-ram](01-internals/04-process-death-and-ram.md) |
| 07 | [useEffect, dependency arrays, and cleanup](02-implementations/07-useeffect-and-side-effects.md) | useEffect, dependency arrays, and cleanup | [01-ui-as-function-of-state](03-patterns/01-ui-as-function-of-state.md) |
| 08 | [axios, apiClient, and react-native-config](02-implementations/08-axios-and-api-client.md) | axios, apiClient, and react-native-config | [07-useeffect-and-side-effects](02-implementations/07-useeffect-and-side-effects.md) |
| 09 | [Lottie — JSON-driven animations](02-implementations/09-lottie-animations.md) | Lottie — JSON-driven animations | [01-core-ui-primitives](02-implementations/01-core-ui-primitives.md) |
| 10 | [Animated API — Value, timing, loop](02-implementations/10-animated-api-and-skeleton.md) | Animated API — Value, timing, loop | [01-core-ui-primitives](02-implementations/01-core-ui-primitives.md) |
| 11 | [Geolocation, PermissionsAndroid, useCurrentLocation](02-implementations/11-geolocation-and-permissions-android.md) | Geolocation, PermissionsAndroid, useCurrentLocation | [12-os-permission-lifecycle](01-internals/12-os-permission-lifecycle.md), [07-custom-hook-extraction](03-patterns/07-custom-hook-extraction.md) |
| 12 | [Notifee — channels, scheduling, foreground events](02-implementations/12-notifee-local-notifications.md) | Notifee — channels, scheduling, foreground events | [13-notification-os-pipeline](01-internals/13-notification-os-pipeline.md) |
| 13 | [Deep linking — Linking config and listeners](02-implementations/13-deep-linking-linking-api.md) | Deep linking — Linking config and listeners | [04-react-navigation-wiring](02-implementations/04-react-navigation-wiring.md), [14-deep-link-intents-and-cold-start](01-internals/14-deep-link-intents-and-cold-start.md) |
| 14 | [Accessibility props and the accessibility tree](02-implementations/14-accessibility-props.md) | Accessibility props and the accessibility tree | [01-core-ui-primitives](02-implementations/01-core-ui-primitives.md) |

---

## 03 · Patterns

> Reusable solution shapes that survive swapping the API underneath.

| # | Note | What it answers | Assumes |
|---|------|-----------------|---------|
| 01 | [UI as a function of state](03-patterns/01-ui-as-function-of-state.md) | UI as a function of state | — |
| 02 | [Derived state — one source of truth](03-patterns/02-derived-state.md) | Derived state — one source of truth | [01-ui-as-function-of-state](03-patterns/01-ui-as-function-of-state.md) |
| 03 | [The four states of every screen](03-patterns/03-four-screen-states.md) | The four states of every screen | [01-ui-as-function-of-state](03-patterns/01-ui-as-function-of-state.md) |
| 04 | [Hydration gating — restore then save](03-patterns/04-hydration-gating-pattern.md) | Hydration gating — restore then save | [06-asyncstorage-and-storage-service](02-implementations/06-asyncstorage-and-storage-service.md), [05-context-and-providers](02-implementations/05-context-and-providers.md) |
| 05 | [Controlled vs uncontrolled inputs](03-patterns/05-controlled-components.md) | Controlled vs uncontrolled inputs | [01-ui-as-function-of-state](03-patterns/01-ui-as-function-of-state.md) |
| 06 | [Debouncing and throttling](03-patterns/06-debounce-and-throttle.md) | Debouncing and throttling | [05-controlled-components](03-patterns/05-controlled-components.md), [07-useeffect-and-side-effects](02-implementations/07-useeffect-and-side-effects.md) |
| 07 | [Extracting custom hooks](03-patterns/07-custom-hook-extraction.md) | Extracting custom hooks | [07-useeffect-and-side-effects](02-implementations/07-useeffect-and-side-effects.md) |
| 08 | [Optimistic updates, prefetch, stale-while-revalidate](03-patterns/08-optimistic-updates-and-prefetch.md) | Optimistic updates, prefetch, stale-while-revalidate | [03-four-screen-states](03-patterns/03-four-screen-states.md) |
| 09 | [Server-side vs client-side pagination](03-patterns/09-pagination-loops.md) | Server-side vs client-side pagination | [03-flashlist-and-pull-to-refresh](02-implementations/03-flashlist-and-pull-to-refresh.md) |
| 10 | [Feedback selection — inline, toast, sheet, alert](03-patterns/10-feedback-selection.md) | Feedback selection — inline, toast, sheet, alert | [01-ui-as-function-of-state](03-patterns/01-ui-as-function-of-state.md) |
| 11 | [Mobile forms — keyboard types, autofill, validate on blur](03-patterns/11-mobile-forms-and-validation.md) | Mobile forms — keyboard types, autofill, validate on blur | [05-controlled-components](03-patterns/05-controlled-components.md), [01-core-ui-primitives](02-implementations/01-core-ui-primitives.md) |
| 12 | [Android back button — BackHandler flow](03-patterns/12-platform-back-button-flow.md) | Android back button — BackHandler flow | [04-react-navigation-wiring](02-implementations/04-react-navigation-wiring.md) |
| 13 | [Permission request flow — ask when needed](03-patterns/13-permission-request-flow.md) | Permission request flow — ask when needed | [12-os-permission-lifecycle](01-internals/12-os-permission-lifecycle.md) |
| 14 | [State management evolution — useState to Zustand](03-patterns/14-state-management-evolution.md) | State management evolution — useState to Zustand | [05-context-and-providers](02-implementations/05-context-and-providers.md) |

---

## 04 · Style patterns

> Layout, spacing, and visual system — StyleSheet patterns.

| # | Note | What it answers | Assumes |
|---|------|-----------------|---------|
| 01 | [Flexbox defaults in React Native](04-style-patterns/01-flexbox-and-layout-defaults.md) | Flexbox defaults in React Native | [08-what-the-platform-lacks](01-internals/08-what-the-platform-lacks.md) |
| 02 | [Margin, padding, absolute, overflow](04-style-patterns/02-margin-padding-and-positioning.md) | Margin, padding, absolute, overflow | [01-flexbox-and-layout-defaults](04-style-patterns/01-flexbox-and-layout-defaults.md) |
| 03 | [SafeAreaView and notch handling](04-style-patterns/03-safe-area-and-insets.md) | SafeAreaView and notch handling | [07-density-dp-and-pixel-ratio](01-internals/07-density-dp-and-pixel-ratio.md) |
| 04 | [Dimensions API and @2x/@3x assets](04-style-patterns/04-responsive-dimensions-and-assets.md) | Dimensions API and @2x/@3x assets | [07-density-dp-and-pixel-ratio](01-internals/07-density-dp-and-pixel-ratio.md) |
| 05 | [StyleSheet composition without cascade](04-style-patterns/05-stylesheet-composition-no-cascade.md) | StyleSheet composition without cascade | [08-what-the-platform-lacks](01-internals/08-what-the-platform-lacks.md), [01-flexbox-and-layout-defaults](04-style-patterns/01-flexbox-and-layout-defaults.md) |
| 06 | [Touch targets, thumb zone, reachability](04-style-patterns/06-touch-targets-and-thumb-zone.md) | Touch targets, thumb zone, reachability | [01-flexbox-and-layout-defaults](04-style-patterns/01-flexbox-and-layout-defaults.md) |
| 07 | [Sticky footer CTA and floating components](04-style-patterns/07-sticky-footer-and-floating-ui.md) | Sticky footer CTA and floating components | [02-margin-padding-and-positioning](04-style-patterns/02-margin-padding-and-positioning.md) |
| 08 | [Skeleton cards and shimmer construction](04-style-patterns/08-skeleton-shimmer-construction.md) | Skeleton cards and shimmer construction | [10-animated-api-and-skeleton](02-implementations/10-animated-api-and-skeleton.md), [03-four-screen-states](03-patterns/03-four-screen-states.md) |

---

## Concept lookup

Alphabetical index of every owned concept: [concept-lookup.md](concept-lookup.md).

---

## Source map

| Source | Distilled into |
|--------|----------------|
| `README.md` §1–2 | 02-implementations/01–02, 04-style-patterns/01–02 |
| `README.md` §3–13 | 02-implementations/04, 07, 11–13; 03-patterns; 01-internals/12–14 |
| `navigation.md` | 02-implementations/04-react-navigation-wiring.md |
| `learning-docs/foundation/1–6` | 01-internals/01–07 |
| `learning-docs/foundation/7–12` | 03-patterns/03, 08, 10–13; 02-implementations/14 |
| `learning-docs/foundation/14–16` | 01-internals/08–11, 15 |
| `src/**` implementations | Cited in every note's repo table |
