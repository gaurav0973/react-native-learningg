# Fabric, reconciliation, and the thread model

> How React's render pass becomes native views in the New Architecture — shadow tree, Fabric commit, and which work runs on the JS thread vs the UI thread.

**Folder:** 01-internals · **Prerequisites:** [JSI, TurboModules, and native access](10-jsi-turbomodules-and-native-access.md) · **Next:** [Core UI primitives](../02-implementations/01-core-ui-primitives.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Fabric | New Architecture UI renderer — commits shadow tree to native views via JSI |
| Shadow tree | Invisible layout tree with width, height, flex — not painted pixels |
| Reconciliation | React diffing old vs new element tree to find changes |
| Commit | Fabric applying reconciled changes to native view hierarchy |
| JS thread | Runs React, hooks, business logic, Hermes |
| UI thread | Native rendering, touch handling, screen paint |
| Yoga | Flexbox engine computing layout in logical units |
| New Architecture | Hermes + JSI + Fabric + TurboModules together |
| Concurrent rendering | React 18 features Fabric supports more efficiently |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  JS THREAD                         UI THREAD (native)
  ┌─────────────────────┐           ┌─────────────────────┐
  │ React components    │           │ Android Views /     │
  │ useState → re-render│           │ iOS UIKit widgets   │
  └──────────┬──────────┘           └──────────▲──────────┘
             │ reconcile                      │
             ▼                                │
  ┌─────────────────────┐                     │
  │ Shadow tree (Yoga)  │── Fabric commit ────┘
  │ layout in dp/pt     │     via JSI
  └─────────────────────┘
             │
             ▼
  PixelRatio + GPU paint → screen pixels
```

**Reading the diagram.** When state changes, React runs on the **JS thread** and produces a new element tree. Fabric builds/updates the **shadow tree** — layout nodes Yoga sizes in logical units. The commit step crosses JSI to mutate the **native view tree** on the **UI thread**, where the OS paints pixels.

You never draw pixels in JS. You describe `<View>` and `<Text>`; Fabric maps them to `ViewGroup`/`TextView` on Android. Heavy JS work blocks reconciliation; animations and gestures should prefer the UI thread when possible.

The insight: **React diffs intent on JS thread; Fabric materializes intent as native views on UI thread** — two trees, one boundary (JSI).

---

<a id="shadow-tree"></a>

## 3 · Shadow tree vs visible UI

```text
  Visible UI (user sees)          Shadow tree (layout only)
  ┌─────────────────┐             ┌─────────────────┐
  │ Text: "Hello"   │             │ node: width 100 │
  │ red background  │             │ node: flex 1    │
  └─────────────────┘             │ node: padding 16│
                                  └─────────────────┘
```

| | Visible UI | Shadow tree |
|---|---|---|
| Purpose | Display | Measure and position |
| Created by | Fabric from shadow results | React + Yoga during render |
| User sees it | Yes | No |

---

<a id="fabric-pipeline"></a>

## 4 · Fabric rendering pipeline

```text
  (1) setState in HomeScreen
         │
         ▼
  (2) React reconciliation — diff element tree
         │
         ▼
  (3) Shadow tree updated — Yoga layout
         │
         ▼
  (4) Fabric commit — native views created/updated
         │
         ▼
  (5) OS GPU paints frame
```

Old renderer sent async bridge messages for each update. Fabric batches commits through JSI — enabled in this repo with `newArchEnabled=true` in `android/gradle.properties`.

Component example — JS describes, native renders:

```javascript
<View>
  <Text>Hello</Text>
</View>
```

Maps to Android `ViewGroup` + `TextView` — not HTML `<div>` → [What the platform lacks](08-what-the-platform-lacks.md).

---

<a id="thread-model"></a>

## 5 · Thread model

```text
       REACT NATIVE PROCESS
  ┌────────────┬────────────┬────────────┐
  │ JS thread  │ UI thread  │ Native mod │
  │ React      │ paint      │ camera/GPS │
  │ useEffect  │ touch      │ (TurboMod) │
  │ API calls  │ animations │            │
  └────────────┴────────────┴────────────┘
```

| Thread | Runs | Blocks user if slow? |
|---|---|---|
| JavaScript | React, hooks, fetch | Yes — janky UI |
| UI | Layout commit, gestures | Yes — frozen frames |
| Native modules | I/O, sensors | Can block if misused |

State-driven UI patterns live in → [UI as a function of state](../03-patterns/01-ui-as-function-of-state.md). Layout numbers use logical units → [Density and PixelRatio](07-density-dp-and-pixel-ratio.md).

---

<a id="reconciliation-commit"></a>

## 6 · Reconciliation and commit — one update cycle

```text
  BEFORE render          AFTER setState({ count: 1 })
  <Text>0</Text>    →    <Text>1</Text>
       │                      │
       └──── reconcile ───────┘
                │
                ▼
         only Text node patched (if keys stable)
                │
                ▼
         Fabric updates native TextView string
```

List virtualization (FlatList/FlashList) reduces shadow tree size — → [FlatList](../02-implementations/02-scrollview-flatlist-image.md), [FlashList](../02-implementations/03-flashlist-and-pull-to-refresh.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| New Architecture / Fabric enabled | `android/gradle.properties` | `newArchEnabled=true` |
| Component tree root | `App.jsx` | Provider nesting → navigator |
| Native-mapped primitives | `src/screens/HomeScreen.js` | `View`, `Text`, `Pressable` |
| Flex layout (Yoga input) | Screen style objects | `flex`, `flexDirection: 'column'` default |
| List virtualization | `src/screens/HomeScreen.js` | FlashList reduces mount count |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [JSI and TurboModules](10-jsi-turbomodules-and-native-access.md), [Hermes](09-hermes-and-the-js-engine.md)
- **Used by:** [Core UI primitives](../02-implementations/01-core-ui-primitives.md), [Animated API](../02-implementations/10-animated-api-and-skeleton.md)
- **Contrast with:** React DOM — virtual DOM → HTML; RN shadow tree → native widgets
- **Common mistake:** heavy computation in render blocking JS thread — move to `useMemo`/effects or native driver animations → [Derived state](../03-patterns/02-derived-state.md)
