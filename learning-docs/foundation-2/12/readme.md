<div align="center">

# 📖 Module 12 — Deep Dive Notes
### React Native: Mobile Forms & Login UX

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Forms%20·%20Keyboard%20·%20Autofill%20·%20Validation%20·%20useRef-6C63FF?style=for-the-badge)](.)
[![Diagram](https://img.shields.io/badge/🗺️%20Diagram-useRef--forwardRef--flow.excalidraw-FF6B6B?style=for-the-badge)](useRef-forwardRef-flow.excalidraw)

</div>

> **Question:** Mobile forms: keyboard types, autofill, OTP autofill, validate on blur
>
> Mobile forms are not web forms. Keyboards, autofill, focus chains, OTP suggestions, and validation timing all change the user experience. This module covers the theory and the Foodie login implementation.

---

<a id="mobile-form-lifecycle"></a>

## 1 · 🔄 Mobile Form Lifecycle

Validation should happen **progressively**, not all at once while the user is still typing.

```
             USER OPENS LOGIN SCREEN
                      │
                      ▼
              Form Renders Inputs
                      │
                      ▼
        User Starts Typing Into Field
                      │
                      ▼
      Correct Keyboard Opens Automatically
                      │
                      ▼
        User Completes Field & Leaves It
                  (onBlur)
                      │
                      ▼
          Validate Current Field Only
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
      Invalid                  Valid
          │                        │
          ▼                        ▼
 Show Inline Error          Save Field State
          │                        │
          └───────────┬────────────┘
                      ▼
             User Presses Submit
                      │
                      ▼
         Validate Entire Form Again
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
     Errors Found             No Errors
          │                        │
          ▼                        ▼
 Focus First Error         API Request Starts
                                   │
                                   ▼
                          Disable Submit Button
                                   │
                                   ▼
                          Success / Failure
```

| Stage | What happens | Why |
|-------|-------------|-----|
| **Typing** | No validation errors shown | Don't punish incomplete input |
| **onBlur** | Validate the field the user just left | Feedback when they're done with that field |
| **Submit** | Validate all fields + `Keyboard.dismiss()` | Final gate before API call |
| **Loading** | Disable button, show loading label | Prevent double submit |

---

<a id="keyboard-selection"></a>

## 2 · ⌨️ Keyboard Selection Decision Tree

The keyboard is part of UX. Never make the user manually switch keyboard types.

```
              TEXT INPUT CREATED
                     │
                     ▼
        What data is expected here?
                     │
 ┌──────────┬──────────┬──────────┬───────────┬────────────┐
 │          │          │          │           │            │
 ▼          ▼          ▼          ▼           ▼            ▼
Email     Phone      OTP/PIN    Price       Search      Password
 │          │          │          │           │            │
 ▼          ▼          ▼          ▼           ▼            ▼
email-    phone-    number-    decimal-    default +    default +
address    pad        pad         pad       returnKey    secureTextEntry
                                                      = search
```

| Field type | `keyboardType` | Other props |
|------------|----------------|-------------|
| Email | `email-address` | `autoCapitalize="none"`, `autoComplete="email"` |
| Phone | `phone-pad` | `autoComplete="tel"` |
| OTP / PIN | `number-pad` | `autoComplete="sms-otp"`, `maxLength={6}` |
| Price | `decimal-pad` | — |
| Search | `default` | `returnKeyType="search"` |
| Password | `default` | `secureTextEntry`, `autoComplete="password"` |

**Foodie login — Email field:**

```jsx
<AppInput
  keyboardType="email-address"
  autoComplete="email"
  autoCapitalize="none"
  returnKeyType="next"
/>
```

---

<a id="autofill-architecture"></a>

## 3 · 🔐 Autofill Architecture (Android + iOS)

Your app does **not** know the user's saved email. The **OS password manager** does.

```
             USER TAPS EMAIL FIELD
                      │
                      ▼
        React Native Provides Hint
        autoComplete="email"
                      │
                      ▼
      Android / iOS Password Manager
        Checks Saved User Information
                      │
          ┌───────────┴────────────┐
          │                        │
          ▼                        ▼
   Email Found               Nothing Saved
          │                        │
          ▼                        ▼
 Suggest Email             User Types Manually
          │
          ▼
 User Selects Suggestion
          │
          ▼
 Field Filled Instantly
```

| Prop | Purpose |
|------|---------|
| `autoComplete="email"` | OS suggests saved email addresses |
| `autoComplete="password"` | OS suggests saved passwords |
| `autoCapitalize="none"` | Email fields should not auto-capitalize |

React Native only **declares intent**. The OS decides whether a suggestion appears.

---

<a id="otp-autofill-flow"></a>

## 4 · 📱 OTP Autofill Flow

React Native **never reads SMS directly**. The OS detects verification codes and offers them above the keyboard.

```
          USER ENTERS PHONE NUMBER
                    │
                    ▼
             OTP REQUEST SENT
                    │
                    ▼
      SMS ARRIVES ON THE DEVICE
                    │
                    ▼
 Android / iOS Detects Verification Code
                    │
                    ▼
 React Native Input Declares
 autoComplete="sms-otp"
 keyboardType="number-pad"
                    │
                    ▼
 OTP Suggestion Appears Above Keyboard
                    │
                    ▼
 User Taps Suggestion
                    │
                    ▼
 OTP Field Filled Automatically
                    │
                    ▼
 Verification API Called
```

```jsx
<TextInput
  keyboardType="number-pad"
  autoComplete="sms-otp"
  maxLength={6}
/>
```

> **Key insight:** Your job is to declare the right hints. The OS handles SMS detection and the suggestion UI.

---

<a id="validation-timing"></a>

## 5 · ✅ Validation Timing — onBlur, not onChange

Do not validate on every keystroke. Validate when the user is **done** with a field, and again on submit.

| Moment | When it fires | Use for |
|--------|--------------|---------|
| `onChangeText` | Every character | Update state only |
| `onBlur` | User leaves the field | Inline field validation |
| Submit | Button press | Full form validation |

```
             USER TYPES EMAIL
                    │
                    ▼
       onChange Fires Every Character
                    │
      g → ga → gau → gaur → gaura → gaurav
                    │
                    ▼
          User Leaves Field (onBlur)
                    │
                    ▼
      Validate Email Format Once
                    │
         ┌──────────┴─────────┐
         │                    │
         ▼                    ▼
     Invalid                Valid
         │                    │
         ▼                    ▼
Inline Error           Continue Form
                    │
                    ▼
         Submit Button Pressed
                    │
                    ▼
       Validate Entire Form Again
```

**Foodie implementation — `useLoginForm.js`:**

```javascript
const validateEmail = () => {
  const error = isValidEmail(email);
  setErrors(prev => ({ ...prev, email: error }));
  return error === '';
};

// Called on blur from LoginScreen:
onBlur={validateEmail}
```

**Submit flow — validate all + dismiss keyboard:**

```javascript
async function submitLogin() {
  Keyboard.dismiss();
  const isValid = validateForm();
  if (!isValid) return;
  setLoading(true);
  // API call...
}
```

---

<a id="focus-management-useref-forwardref"></a>

## 6 · 🎯 Focus Management — useRef & forwardRef

Users should not tap every field manually. Each field should know where focus goes next.

| Field | Return key | Action |
|-------|-----------|--------|
| Email | `next` | Focus password field |
| Password | `done` | Submit form |

```
            EMAIL FIELD
                 │
      Return Key = Next
                 │
                 ▼
        PASSWORD FIELD
                 │
      Return Key = Done
                 │
                 ▼
          SUBMIT FORM
```

### useRef — create a handle to the input

```javascript
const passwordRef = useRef(null);
// passwordRef = { current: null } → later { current: TextInput }
```

### forwardRef — pass ref through AppInput wrapper

Without `forwardRef`, `passwordRef.current` stops at `AppInput` and `.focus()` fails.

```javascript
// AppInput.js
export const AppInput = forwardRef(({ label, error, ...props }, ref) => (
  <View>
    <Text>{label}</Text>
    <TextInput ref={ref} {...props} />
  </View>
));
```

### Wiring in LoginScreen

```javascript
// Email — triggers focus on password
onSubmitEditing={() => passwordRef.current?.focus()}

// Password — receives the ref
<AppInput ref={passwordRef} ... />
```

### Memory card

| Tool | Role |
|------|------|
| `useRef` | CREATE the handle |
| `ref={}` | ATTACH the handle |
| `forwardRef` | PASS through wrapper |
| `.current` | USE the handle |
| `.focus()` | COMMAND the input |

> 🗺️ **Full visual flow:** [useRef-forwardRef-flow.excalidraw](useRef-forwardRef-flow.excalidraw)
>
> ![useRef + forwardRef diagram](../../public/12.1.png)

---

<a id="keyboard-avoiding-layout"></a>

## 7 · 📐 Keyboard Layout — AvoidingView, Dismiss & Scroll

The keyboard must never hide the active input or submit button.

```
KeyboardAvoidingView          ← shifts layout when keyboard opens
  └── TouchableWithoutFeedback  ← tap background to dismiss keyboard
        └── ScrollView            ← scroll if content still doesn't fit
              └── Email, Password, Login button
```

| Component / prop | Role |
|------------------|------|
| `KeyboardAvoidingView` | Adjusts layout when keyboard appears |
| `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` | iOS adds padding; Android shrinks height |
| `TouchableWithoutFeedback onPress={Keyboard.dismiss}` | Tap empty area → close keyboard |
| `keyboardShouldPersistTaps="handled"` | Buttons still work while keyboard is open |
| `Keyboard.dismiss()` in submit | Close keyboard before validation/API |

**iOS vs Android:**

| Platform | `behavior` | Effect |
|----------|-----------|--------|
| iOS | `'padding'` | Adds bottom padding equal to keyboard height |
| Android | `'height'` | Shrinks view height so content stays visible |

---

<a id="foodie-login-implementation"></a>

## 8 · 🍔 Foodie Login — Complete Form Architecture

End-to-end flow implemented in the Foodie app:

```
          LOGIN SCREEN
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
  Email    Password   Submit
    │         │         │
    ▼         ▼         ▼
keyboard   secure    Keyboard.dismiss()
email      TextEntry validateForm()
onBlur     onBlur    loading state
    │         │         │
    └────┬────┴────┬────┘
         ▼         ▼
    useLoginForm hook
    (state + validation)
         │
         ▼
    AppInput wrapper
    (label + error + forwardRef)
         │
         ▼
    Native TextInput
```

### File responsibilities

| File | Responsibility |
|------|---------------|
| `src/hooks/useLoginForm.js` | State (`email`, `password`, `errors`, `loading`) + validators |
| `src/components/AppInput.js` | Reusable labeled input with error UI + `forwardRef` |
| `src/utils/validators.js` | `isValidEmail`, `isValidPassword` pure functions |
| `src/screens/LoginScreen.js` | Layout, keyboard handling, focus chain, submit |

### Data flow (controlled inputs)

```
useLoginForm (state)
       ↓ props
LoginScreen (wiring)
       ↓ props
AppInput (label, error + ...props)
       ↓ ...props
TextInput (value, onChangeText, onBlur)
```

| Prop | Goes to | Purpose |
|------|---------|---------|
| `label`, `error` | AppInput UI | Label text + red border/message |
| `value`, `onChangeText`, `onBlur` | TextInput via `...props` | Controlled input + validation |

### Submit success / failure (planned)

```
   ┌─────────────┴──────────────┐
   ▼                            ▼
Success                     Failure
Toast                       Inline Errors
Navigate Home               Keep Form Visible
```

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation 2 · Module 12*

</div>
