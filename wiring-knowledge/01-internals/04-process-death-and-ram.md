# Process death, RAM, and what survives

> Why in-memory React state disappears when Android kills your background process, and what persists because it lives on disk instead of in RAM.

**Folder:** 01-internals · **Prerequisites:** [App lifecycle and AppState](03-app-lifecycle-and-appstate.md) · **Next:** [Deep link cold start](14-deep-link-intents-and-cold-start.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Process death | OS removes your app's entire Linux process from RAM |
| RAM | Fast temporary memory — holds JS heap, React tree, navigation stack |
| Disk storage | Persistent storage — survives process death (AsyncStorage, SQLite) |
| Cold start | App launched when no process existed — first tap or after kill |
| Warm start | Same process still in memory — quick return from background |
| Process death restart | Was running, OS killed it, user returns — new process, must hydrate |
| Hydration | Reading persisted data into React state on startup → [Hydration gating](../03-patterns/04-hydration-gating-pattern.md) |
| Activity | UI entry point inside a process — not the same as the process itself |
| Hermes VM | JS engine inside the process — destroyed with the process |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  PHONE RAM (limited, shared)              DISK (persistent)
  ┌─────────────────────────┐              ┌─────────────────────────┐
  │ WhatsApp, Chrome, …     │              │ AsyncStorage            │
  │ Foodie Process (PID)    │              │ SQLite / SecureStore    │
  │  ├─ Hermes VM + JS heap │──save───────►│ files on device         │
  │  ├─ React component tree│              └─────────────────────────┘
  │  ├─ Context / Redux     │                        ▲
  │  └─ Navigation stack    │                        │ load on startup
  └───────────┬─────────────┘                        │
              │                                        │
              ▼ OS low memory                          │
         PROCESS KILLED                                 │
              │                                        │
              ▼ new PID on relaunch                    │
  ┌─────────────────────────┐              ┌─────────┴───────────────┐
  │ Fresh Hermes, empty heap│──hydrate────►│ restore cart, addresses │
  └─────────────────────────┘              └─────────────────────────┘
```

**Reading the diagram.** Your app competes with every other app for RAM. When memory pressure rises, Android kills **background** processes first — not paused, not saved to disk, **gone**. Everything in the left column vanishes: `useState`, Context, navigation history, Hermes itself.

The right column is what production apps rely on. Data written to AsyncStorage before death can be read back when a new process starts. The arrow labeled hydrate is the bridge from disk back into React state — owned in detail by → [Hydration gating](../03-patterns/04-hydration-gating-pattern.md).

The insight: **AppState `"background"` is not a save point.** The OS can kill without warning, so anything that must survive must be on disk before you lose the process.

---

<a id="what-survives"></a>

## 3 · RAM vs disk — what survives process death

```text
  LOST ON DEATH (RAM)              SURVIVES (DISK)
  ├── useState / useReducer         ├── AsyncStorage
  ├── Context values                ├── MMKV
  ├── Redux / Zustand in memory     ├── SQLite
  ├── React Query cache             └── SecureStore / Keychain
  ├── Navigation stack
  └── Hermes VM
```

| Storage | Survives death | Speed | Best for |
|---|---|---|---|
| `useState` | ❌ | Instant | Ephemeral UI |
| Context | ❌ | Instant | In-session shared state |
| AsyncStorage | ✅ | Async | Cart, addresses, prefs |

This repo persists cart and addresses via `storageService.js` — the hydration pattern in `CartContext` and `AddressContext` is documented in → [AsyncStorage and storageService](../02-implementations/06-asyncstorage-and-storage-service.md).

---

<a id="process-vs-activity"></a>

## 4 · Process vs Activity

```text
  Linux Process (PID 2345)
  ├── Hermes Engine
  ├── Native Modules
  ├── React Context (in RAM)
  └── MainActivity  ← one UI container, not the whole process
        └── NavigationContainer → screens
```

| Concept | Destroyed when |
|---|---|
| **Process** | OS kills for memory, or user force-quits |
| **Activity** | Can be destroyed while process lives (with "Don't keep activities") |
| **Hermes VM** | Process dies |

Process death is worse than Activity recreation: the entire JS runtime is new. `AppState` never emits a transition — the old process is already dead.

---

<a id="cold-warm-process-restart"></a>

## 5 · Cold start vs warm start vs process death restart

```text
  Launch
    │
    ├── Cold start ──────► new process, never ran before
    ├── Warm start ──────► same process, Hermes still alive, state preserved
    └── Death restart ───► new process, was killed, must hydrate from disk
```

| | Cold start | Warm start | Process death restart |
|---|---|---|---|
| Process | Brand new | Same | New after kill |
| React state | Initial | Preserved | Initial (hydrate) |
| Hermes | Starts fresh | Still running | Starts fresh |
| Speed | Slowest | Fastest | Medium |

Both cold start and process death restart need hydration from disk. Warm start is the only case where in-memory Context still holds your cart.

---

<a id="process-death-inside-rn"></a>

## 6 · What happens inside React Native during process death

```text
  BEFORE                          KILL                    AFTER (new PID)
  Foodie process                  Android                 Foodie process
  ├─ count = 5 in useState        Kill PID                ├─ count = 0 (initial)
  ├─ cart in Context              ───────►                ├─ cart = [] until hydrate
  └─ nav on RestaurantScreen                              └─ nav = initial route
```

No `"background"` → `"active"` sequence occurs across the kill boundary. The user taps the icon and boots from `index.js` again:

`index.js`

```javascript
AppRegistry.registerComponent(appName, () => Root);
```

Deep links arriving after death follow the cold-start path → [Deep link cold start](14-deep-link-intents-and-cold-start.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 7 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Persisted storage keys | `src/services/storageService.js` | `STORAGE_KEYS.CART`, `STORAGE_KEYS.ADDRESSES` |
| Cart hydration | `src/context/CartContext.js` | `getData` on mount, `saveData` gated on `isHydrated` |
| Address hydration | `src/context/AddressContext.js` | Same restore-then-save pattern |
| JS re-entry after kill | `index.js` | Fresh `AppRegistry` mount every new process |

---

<a id="wiring"></a>

## 8 · Wiring

- **Builds on:** [App lifecycle and AppState](03-app-lifecycle-and-appstate.md)
- **Used by:** [Deep link cold start](14-deep-link-intents-and-cold-start.md), [AsyncStorage and storageService](../02-implementations/06-asyncstorage-and-storage-service.md), [Hydration gating](../03-patterns/04-hydration-gating-pattern.md)
- **Contrast with:** Reload in dev — destroys Hermes VM intentionally but keeps the same native process; process death kills both
- **Common mistake:** storing auth tokens only in Context — gone on death; use SecureStore or disk → [Hydration gating](../03-patterns/04-hydration-gating-pattern.md)
