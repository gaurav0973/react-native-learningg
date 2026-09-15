<div align="center">

# 📋 Module 7 — Summary
### React Native Foundation: The Four States of Every Screen

[![Deep Dive Notes →](https://img.shields.io/badge/📖%20Full%20Notes-readme.md-6C63FF?style=for-the-badge)](readme.md)
[![Topic](https://img.shields.io/badge/Topic-Loading%20·%20Empty%20·%20Error%20·%20Loaded%20·%20Skeleton-00C896?style=for-the-badge)](.)

</div>

---

> 📖 **This is the quick-reference summary.**
> For full concept breakdowns, diagrams, and deep dives → **[open readme.md](readme.md)**

---

## 📌 Flows to Remember

| Flow | Remember As | Read More |
|------|------------|-----------|
| 🎯 **Four States** | Loading → Empty / Error / Loaded — every API screen needs all four | [→ readme.md](readme.md#why-every-screen-has-four-states) |
| 🔄 **State Machine** | One state visible at a time — mutually exclusive transitions | [→ readme.md](readme.md#state-machine-thinking) |
| ⏳ **Loading** | Skeleton for lists, spinner for small areas — never a blank screen | [→ readme.md](readme.md#loading-state-skeleton) |
| 📭 **Empty** | API succeeded but no data — show friendly message + CTA | [→ readme.md](readme.md#empty-state) |
| 🔴 **Error** | API failed — show message + retry, always stop loading in `finally` | [→ readme.md](readme.md#error-state) |
| ✅ **Loaded** | Happy path — content renders after other checks pass | [→ readme.md](readme.md#loaded-state) |
| 🔁 **Lifecycle** | Mount → fetch → evaluate response → transition to final state | [→ readme.md](readme.md#complete-screen-lifecycle) |
| 🛠️ **Pattern** | Three vars (`loading`, `error`, `data`) + early returns | [→ readme.md](readme.md#implementation-pattern-in-react-native) |
| 🍔 **Foodie Examples** | HomeScreen, FruitExplorer, AddressScreen — all four states in action | [→ readme.md](readme.md#foodie-app-examples) |

---

## ⚡ Short Notes

> Core one-liners — know these by heart.

| Term | Short Note |
|------|-----------|
| **Loading** | Data is being fetched — show skeleton or spinner immediately |
| **Empty** | API succeeded but returned no items — not an error |
| **Error** | API failed — show message and a retry action |
| **Loaded** | Data arrived and renders — the happy path |
| **Skeleton** | Placeholder UI matching real content shape (shimmer cards) |
| **State machine** | Only one state visible; transitions driven by API result |
| **Early return** | `if (loading) return …` — cleanest way to branch UI states |
| **ListEmptyComponent** | FlatList/FlashList prop for empty data inside a loaded list |
| **finally block** | Always set `loading=false` here to prevent infinite spinners |

---

## ❓ Quick Q&A

| Question | Answer |
|----------|--------|
| What are the four states? | **Loading**, **Empty**, **Error**, **Loaded** |
| Why skeleton over spinner? | Preserves layout shape — feels faster, prevents content jump |
| Empty vs Error? | Empty = success with no data. Error = request failed |
| How to avoid overlapping states? | Use early returns or a single `status` string — never show spinner + data together |
| Where does search-empty fit? | Inside **loaded** state via `ListEmptyComponent` — header stays visible |
| How to prevent infinite loading? | Set `loading=false` in `finally` after both success and catch |

---

## 🗺️ Screen State Architecture

> From user tap to the UI they see.

```
User Opens Screen
        │
        ▼
  Component Mounts
        │
        ▼
  fetchData() in useEffect
        │
        ▼
   STATUS = LOADING  ──►  Skeleton / Spinner
        │
        ▼
  ──── API Response ────
        │
   ┌────┼────┐
   │    │    │
   ▼    ▼    ▼
 Data  []  Fail
   │    │    │
   ▼    ▼    ▼
LOADED EMPTY ERROR
```

---

## 🧠 Things You Should Remember Forever

- 🎯 Every API-driven screen needs **four states** — missing any one feels broken to users
- 🔄 **One state at a time** — state machine thinking prevents overlapping UI
- ⏳ **Skeleton > spinner** for list screens — match the shape of real content
- 📭 **Empty ≠ Error** — empty means success with no data; error means the request failed
- 🔁 Always **`setLoading(false)` in `finally`** — or users stare at a spinner forever

---

<div align="center">

📖 **Ready to go deeper?**

**[Open Full Notes → readme.md](readme.md)**

*React Native Foundation · Module 7*

</div>
