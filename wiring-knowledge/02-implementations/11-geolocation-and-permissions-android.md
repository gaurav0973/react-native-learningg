# Geolocation, PermissionsAndroid, useCurrentLocation

> How Foodie asks for location permission at tap-time and reads GPS coordinates through a reusable hook.

**Folder:** 02-implementations · **Prerequisites:** [OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md), [Custom hook extraction](../03-patterns/07-custom-hook-extraction.md) · **Next:** [Permission request flow](../03-patterns/13-permission-request-flow.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Geolocation | `@react-native-community/geolocation` native module for GPS reads |
| PermissionsAndroid | RN API to check/request Android runtime permissions from JS |
| ACCESS_FINE_LOCATION | Manifest + runtime permission for precise GPS |
| Runtime permission | OS dialog shown while app is running — not at install only |
| getCurrentPosition | One-shot GPS read with success/error callbacks |
| useCurrentLocation | Custom hook encapsulating permission + fetch + state |
| NEVER_ASK_AGAIN | User denied permanently — must open Settings |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  AddressScreen "Use Current Location" tap
         │
         ▼
  fetchLocation() in useCurrentLocation
         │
         ├── Platform.OS === 'android' ?
         │        ├── PermissionsAndroid.check(FINE_LOCATION)
         │        └── PermissionsAndroid.request() if needed
         │
         ▼
  Geolocation.getCurrentPosition(success, error)
         │
         ▼
  setLocation(coords) ──► UI shows lat/lng/accuracy
```

**Reading the diagram.** JS never touches GPS hardware directly — the call crosses into native code → see [JSI and native access](../01-internals/10-jsi-turbomodules-and-native-access.md). Manifest must declare location first or the runtime dialog never appears → [OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md#manifest-declaration).

Permission is requested **when the user taps**, not on app launch — matches [Permission request flow](../03-patterns/13-permission-request-flow.md#ask-when-needed).

The insight: **permission and GPS are two steps.** Granting permission does not guarantee a fix — timeout and unavailable errors still surface.

---

<a id="manifest-and-package"></a>

## 3 · Manifest declaration and native module

```text
  AndroidManifest.xml          package.json
  ACCESS_FINE_LOCATION    +    @react-native-community/geolocation
  ACCESS_COARSE_LOCATION       npm run android (native rebuild)
```

README §11 documents `AndroidManifest.xml` entries. Without install + rebuild, `Geolocation.getCurrentPosition` is undefined at runtime.

---

<a id="use-current-location-hook"></a>

## 4 · useCurrentLocation — permission then GPS

```text
  fetchLocation()
     │
     ├─ setLoading(true), clear error/location
     ├─ Android: check → request → handle DENIED / NEVER_ASK_AGAIN
     └─ Geolocation.getCurrentPosition(…)
```

`src/hooks/useCurrentLocation.js`

```javascript
export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      setLocation(null);

      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (!hasPermission) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );

          if (permission === PermissionsAndroid.RESULTS.DENIED) {
            throw new Error('Location permission denied');
          }
          if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            throw new Error('Location permission permanently denied');
          }
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          setLocation(position.coords);
          setLoading(false);
        },
        e => {
          if (e.code === 3) setError('Location request timed out');
          else if (e.code === 2) setError('Location is currently unavailable');
          else setError(e.message);
          setLoading(false);
        },
      );
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return { location, loading, error, fetchLocation };
}
```

Hook extraction keeps `AddressScreen` declarative → [Custom hook extraction](../03-patterns/07-custom-hook-extraction.md).

---

<a id="address-screen-ui"></a>

## 5 · AddressScreen — button-triggered fetch

```text
  Pressable onPress={fetchLocation} disabled={loading}
       │
       ├── loading → ActivityIndicator
       ├── error → red Text
       └── location → lat/lng/accuracy card
```

`src/screens/AddressScreen.js`

```javascript
const { location, loading, error, fetchLocation } = useCurrentLocation();

<Pressable onPress={fetchLocation} disabled={loading}>
  {loading ? <ActivityIndicator color="#FFFFFF" /> : (
    <Text style={styles.locationText}>Use Current Location</Text>
  )}
</Pressable>

{location ? (
  <View style={styles.locationCard}>
    <Text>Latitude: {location.latitude.toFixed(6)}</Text>
    <Text>Longitude: {location.longitude.toFixed(6)}</Text>
    <Text>Accuracy: {Math.round(location.accuracy)} meters</Text>
  </View>
) : null}
```

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Hook implementation | `src/hooks/useCurrentLocation.js` | Permission + GPS + error codes |
| UI trigger | `src/screens/AddressScreen.js` | Button, loading, coords display |
| Manifest | `android/app/src/main/AndroidManifest.xml` | Location permissions |
| README flow | `README.md` §11 | GPS theory, lifecycle diagram |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [OS permission lifecycle](../01-internals/12-os-permission-lifecycle.md), [Custom hooks](../03-patterns/07-custom-hook-extraction.md)
- **Used by:** [Permission request flow](../03-patterns/13-permission-request-flow.md), [Address provider](05-context-and-providers.md) (addresses saved separately)
- **Contrast with:** Requesting location on app start — higher denial rate, worse UX
- **Common mistake:** Missing manifest permission — `request()` never shows a dialog
