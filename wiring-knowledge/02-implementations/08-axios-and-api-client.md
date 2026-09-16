# axios, apiClient, and react-native-config

> How Foodie configures one HTTP client with a environment-specific base URL and calls per-resource API functions.

**Folder:** 02-implementations · **Prerequisites:** [useEffect and side effects](07-useeffect-and-side-effects.md) · **Next:** [Pagination loops](../03-patterns/09-pagination-loops.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| axios | Promise-based HTTP client for GET/POST/etc. |
| apiClient | Single configured axios instance shared app-wide |
| baseURL | Prefix prepended to every request path |
| react-native-config | Reads `.env` at build time into `Config.API_BASE_URL` |
| API_BASE_URL | Host reachable from the run target — emulator vs device differs |
| Per-resource API file | Plain async functions (`getRestaurants`) — no class layer |
| timeout | Milliseconds before axios aborts a hung request |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  .env
  API_BASE_URL=http://10.0.2.2:3000
       │
       ▼
  react-native-config ──► Config.API_BASE_URL
       │
       ▼
  apiClient (axios.create) ──► baseURL, timeout, headers
       │
       ├── restaurantApi.getRestaurants()
       ├── restaurantApi.searchRestaurants(query)
       └── fruitService.getAllFruits()  (may use fetch or axios)
       │
       ▼
  useEffect in screen ──► setState ──► UI
```

**Reading the diagram.** Environment config lives outside JS source so Android emulator (`10.0.2.2`), iOS simulator (`localhost`), and physical device (LAN IP) each get a reachable host without code changes.

Screens invoke API functions inside `useEffect` or event handlers — never during render. `HomeScreen` still uses mock `restaurantData` with `setTimeout`, but `restaurantApi.js` and `fruitService.js` show the real wiring shape.

The insight: **one axios instance, many thin wrappers.** Interceptors (auth headers) would attach to `apiClient` once, not per screen.

---

<a id="api-client-config"></a>

## 3 · apiClient — axios.create

```text
  axios.create({ baseURL, timeout, headers })
         │
         └── all .get('/restaurants') become GET baseURL/restaurants
```

`src/api/client.js`

```javascript
import axios from 'axios';
import Config from 'react-native-config';

export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

`.env` is not committed; CLAUDE.md documents per-target URLs. Changing `.env` requires a native rebuild because `react-native-config` bakes values at compile time.

---

<a id="resource-functions"></a>

## 4 · Per-resource API functions

```text
  screen ──► getRestaurants() ──► apiClient.get('/restaurants') ──► response.data
```

`src/api/restaurantApi.js`

```javascript
import { apiClient } from './client';

export const getRestaurants = async () => {
  const response = await apiClient.get('/restaurants');
  return response.data;
};

export const searchRestaurants = async query => {
  const response = await apiClient.get('/restaurants/search', {
    params: { query },
  });
  return response.data;
};
```

No repository class, no Redux thunk — just exported async functions matching project conventions in `CLAUDE.md`.

---

<a id="calling-from-effects"></a>

## 5 · Calling from effects and hooks

```text
  FruitExplorerScreen
  useEffect([], loadFruits)
       │
       └── getAllFruits() ──► setAllFruits ──► slice for pagination
```

`src/screens/FruitExplorerScreen.js`

```javascript
const loadFruits = async () => {
  try {
    setLoading(true);
    const fruits = await getAllFruits();
    setAllFruits(fruits);
    setVisibleFruits(fruits.slice(0, PAGE_SIZE));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadFruits();
}, []);
```

Four-state handling (loading, error, empty, loaded) → [Four screen states](../03-patterns/03-four-screen-states.md).

`HomeScreen` is still on mock data — swap `fetchRestaurants` body to `await getRestaurants()` when the backend is live; the effect shell stays the same.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Client config | `src/api/client.js` | `baseURL`, `timeout` |
| Restaurant endpoints | `src/api/restaurantApi.js` | GET + query params |
| Live fetch example | `src/services/fruitService.js` | External API used by FruitExplorer |
| Mock fetch | `src/screens/HomeScreen.js` | Effect pattern to replace |
| Env docs | `CLAUDE.md` | Emulator vs device base URL |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [useEffect and side effects](07-useeffect-and-side-effects.md)
- **Used by:** [Pagination loops](../03-patterns/09-pagination-loops.md), [Debouncing](../03-patterns/06-debounce-and-throttle.md) (search API)
- **Contrast with:** Raw `fetch` everywhere — duplicated headers and base URL strings
- **Common mistake:** Using `localhost` on Android emulator — emulator's localhost is not your machine; use `10.0.2.2`
