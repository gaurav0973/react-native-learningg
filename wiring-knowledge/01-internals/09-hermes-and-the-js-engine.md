# Hermes and the JavaScript engine

> What executes your JavaScript on device, why React Native ships Hermes by default, and how bytecode changes startup compared to parsing source at runtime.

**Folder:** 01-internals · **Prerequisites:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md) · **Next:** [JSI, TurboModules, and native access](10-jsi-turbomodules-and-native-access.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| JS engine | Runtime that parses and executes JavaScript (Hermes, V8, JSC) |
| Hermes | Meta's mobile-optimized engine — default in modern React Native |
| JSC | JavaScriptCore — Safari's engine; older RN fallback |
| Bytecode | Pre-compiled Hermes output — executed directly at startup |
| Hermes VM | Live engine instance inside the app process — holds JS heap |
| Garbage collector | Hermes memory manager — tuned for mobile constraints |
| Parse time | Cost of reading JS source — avoided in release via bytecode |
| hermesEnabled | Gradle flag turning Hermes on/off for Android builds |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  BUILD TIME (release)                    RUNTIME (on device)
  ┌─────────────────────┐               ┌─────────────────────┐
  │ Metro bundles JS    │               │ Native app starts   │
  │ Hermes compiler     │               │ MainActivity loads  │
  │ produces bytecode   │──────────────►│ Hermes VM starts    │
  └─────────────────────┘   embedded    │ executes bytecode   │
         ▲                              │ React mounts tree   │
         │                              └──────────┬──────────┘
  DEV: Metro serves                            │
  plain JS over HTTP                           ▼
                                        JSI → native modules
                                        (see note 10)
```

**Reading the diagram.** Without an engine, your bundle is inert text. Hermes is the process that runs `useState`, promises, and your component functions. In release builds, Hermes bytecode is generated at compile time and shipped inside the APK — at launch the VM executes bytecode directly instead of parsing thousands of lines of minified JS.

In development, Metro still serves readable JS over HTTP for debugging; Hermes interprets it with dev tooling attached. The VM instance lives for the process lifetime — until Reload destroys it or the OS kills the process → [Process death and RAM](04-process-death-and-ram.md).

The insight: **Hermes optimizes mobile startup and memory** — it is not optional plumbing; it is where your React code actually runs.

---

<a id="engine-comparison"></a>

## 3 · JavaScript engines compared

```text
        JavaScript source / bytecode
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
     V8            JSC          Hermes
   Chrome        Safari      React Native
   Node.js       old RN         (default)
```

| Engine | Used by |
|---|---|
| V8 | Chrome, Node.js |
| JSC | Safari, legacy RN |
| Hermes | Modern RN (this repo) |

---

<a id="why-hermes-bytecode"></a>

## 4 · Why Hermes uses bytecode

```text
  WITHOUT pre-compile (conceptual)     WITH Hermes (release)
  Launch → parse JS → compile → run    Launch → run bytecode immediately
           slower startup                      faster startup
```

| Benefit | Reason |
|---|---|
| Faster startup | No parse/compile at launch |
| Lower memory | Mobile-tuned GC |
| Smaller footprint | Optimized runtime |

This repo enables Hermes explicitly:

`android/gradle.properties`

```properties
hermesEnabled=true
```

Setting `hermesEnabled=false` falls back to JSC — requires full rebuild to take effect → [Three build loops](05-three-build-loops.md#full-rebuild).

---

<a id="hermes-across-loops"></a>

## 5 · Hermes behavior across build loops

```text
  Fast Refresh     Reload              Full rebuild
  ────────────     ──────              ────────────
  Same VM          Destroy VM          New process
  inject module    new VM              new VM
  state kept ✅    state cleared ❌    everything new ❌
```

| Loop | Hermes VM |
|---|---|
| Fast Refresh | Reused — same memory |
| Reload | Destroyed and recreated |
| Full rebuild | New VM in new process |

Metro delivers JS; Hermes executes it — see [Three build loops](05-three-build-loops.md) for when each loop applies.

---

<a id="hermes-and-new-arch"></a>

## 6 · Hermes and the New Architecture

Hermes pairs with JSI for direct native calls — the old async JSON bridge is replaced:

`android/gradle.properties`

```properties
newArchEnabled=true
```

Full stack diagram → [JSI, TurboModules, and native access](10-jsi-turbomodules-and-native-access.md), [Fabric render pipeline](11-fabric-render-pipeline.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Hermes enabled | `android/gradle.properties` | `hermesEnabled=true` |
| New Architecture flag | `android/gradle.properties` | `newArchEnabled=true` |
| JS entry executed by Hermes | `index.js` | `AppRegistry.registerComponent` |
| Release bytecode path | `package.json` | `build:android` with `--dev false` |
| JS errors (not native) | Metro terminal | RedBox stack traces from Hermes |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [Metro and the JS bundle](02-metro-and-the-js-bundle.md)
- **Used by:** [JSI and TurboModules](10-jsi-turbomodules-and-native-access.md), [Three build loops](05-three-build-loops.md), [Native crashes](06-native-crashes-and-logcat.md)
- **Contrast with:** V8 in Node — general-purpose; Hermes targets RN mobile constraints
- **Common mistake:** toggling `hermesEnabled` and expecting Reload to apply it — needs full rebuild → [Full rebuild](05-three-build-loops.md#full-rebuild)
