# Feedback selection — inline, toast, sheet, alert

> Which feedback pattern to use after a tap, and why visual response must come before
> the network call.

**Folder:** 03-patterns · **Prerequisites:**
[UI as a function of state](01-ui-as-function-of-state.md) ·
**Next:** [Mobile forms](11-mobile-forms-and-validation.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Feedback | Any signal that the app heard the user's action |
| Visual feedback | Press state, ripple, opacity — must happen first |
| Inline message | Error or hint rendered next to the triggering control |
| Toast | Brief global message that auto-dismisses |
| Snackbar | Toast with an action button — usually Undo |
| Bottom sheet | Overlay panel for choosing among several actions |
| Alert / dialog | Modal confirmation — blocks until user chooses |
| Loading feedback | Disabled button or spinner during a long operation |
| Tap with no response | The cardinal mobile UX failure |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
                    USER TAP
                       │
                       ▼
              ┌────────────────┐
              │ VISUAL FIRST   │  Pressable pressed state / ripple
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │ ACTION / API   │
              └───────┬────────┘
                      │
           ┌──────────┼──────────┐
           │          │          │
           ▼          ▼          ▼
       SUCCESS     FAILURE    CHOICE NEEDED
           │          │          │
           ▼          ▼          ▼
        Toast/     Inline/    Bottom
        Snackbar   Alert      Sheet
```

**Reading the diagram.** Every tap flows through visual feedback before any async work.
The result branch picks the pattern by what the user needs to know — not by what is easiest
to code.

The insight: **feedback ≠ success.** Feedback means "I heard you." A disabled button during
login is feedback even before the API returns.

---

<a id="decision-tree"></a>

## 3 · The decision tree

```text
  What does the user need?
        │
   ┌────┼────────┬────────────┬────────────┐
   │    │        │            │            │
   ▼    ▼        ▼            ▼            ▼
 Worked? Wrong?  Pick one?   Confirm?
   │    │        │            │
   ▼    ▼        ▼            ▼
 Toast Inline  Bottom      Alert
       message  sheet
```

| User need | Pattern | Example |
|-----------|---------|---------|
| Did it work? | Toast / notification | Cart item added |
| What's wrong? | Inline message | "Invalid email" under field |
| Choose an action? | Bottom sheet | Sort by price / rating |
| Confirm destructive? | Alert | "Delete address?" |
| Reversible delete? | Snackbar + Undo | Remove item, offer undo |
| Long operation? | Loading on control | "Signing In..." button |

Quick rules: confirmation → Alert · selection → sheet · validation → inline · success → toast.

---

<a id="tap-lifecycle"></a>

## 4 · Tap feedback lifecycle

```text
  Tap "Add to Cart"
        │
        ├─ Pressable visual state     ← instant
        ├─ setCartItems (optimistic)  ← instant
        ├─ FloatingCartBar appears    ← instant
        └─ showCartNotification       ← ~100ms (native)
```

Foodie's add-to-cart path demonstrates the full lifecycle:

`src/context/CartContext.js`

```javascript
const addItem = item => {
  setCartItems(previousCart => [...previousCart, { ...item, quantity: 1 }]);
  showCartNotification(item.name);
};
```

State update is immediate → [Optimistic updates](08-optimistic-updates-and-prefetch.md).
Notification is OS-level toast equivalent via Notifee →
[Notifee](../02-implementations/12-notifee-local-notifications.md).

Login submit shows loading feedback on the button:

`src/screens/LoginScreen.js`

```javascript
<Button
  title={loading ? 'Signing In...' : 'Login'}
  disabled={loading}
  onPress={submitLogin}
/>
```

Inline validation errors render under the field via `AppInput`:

`src/components/AppInput.js`

```javascript
{error ? <Text style={styles.errorText}>{error}</Text> : null}
```

---

<a id="snackbar-undo"></a>

## 5 · Snackbar undo flow

```text
  User deletes item
        │
        ├─ remove from list immediately
        └─ show snackbar "Removed · Undo"
                │
         ┌──────┴──────┐
         │             │
      Tap Undo      Timeout
         │             │
         ▼             ▼
      restore       commit delete
```

Not implemented in Foodie yet — documented in foundation module 11. Pattern: optimistic
remove + time-limited undo beats a confirmation alert for low-stakes deletes.

Contrast: destructive account deletion → Alert with explicit Confirm/Cancel, not snackbar.

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Cart notification | `src/services/notificationService.js` | `showCartNotification` |
| Inline validation | `src/components/AppInput.js` | `error` prop → red text |
| Button loading | `src/screens/LoginScreen.js` | disabled + label change |
| Location error | `src/screens/AddressScreen.js` | inline `{error ? <Text>…}` |
| Pressable | `src/components/FloatingCartBar.js` | tap → navigate to Cart |
| Pressable disabled | `src/screens/AddressScreen.js` | location button while loading |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [UI as a function of state](01-ui-as-function-of-state.md),
  [Core UI primitives](../02-implementations/01-core-ui-primitives.md)
- **Used by:** [Mobile forms](11-mobile-forms-and-validation.md),
  [Optimistic updates](08-optimistic-updates-and-prefetch.md)
- **Contrast with:** [Four screen states](03-four-screen-states.md) — screen-level error
  is full-screen; feedback selection is action-level
- **Common mistake:** waiting for API before any visual response — user taps twice →
  [#tap-lifecycle](#tap-lifecycle)
