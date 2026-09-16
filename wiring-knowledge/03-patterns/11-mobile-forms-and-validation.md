# Mobile forms — keyboard types, autofill, validate on blur

> How mobile forms differ from web forms — keyboard selection, OS autofill, focus chains,
> and when to validate.

**Folder:** 03-patterns · **Prerequisites:**
[Controlled components](05-controlled-components.md),
[Core UI primitives](../02-implementations/01-core-ui-primitives.md) ·
**Next:** [Feedback selection](10-feedback-selection.md)

---

<a id="terms-and-terminology"></a>

## 1 · Terms and terminology

| Term | Meaning in one line |
|------|---------------------|
| Form validation | Checking field values against rules before submit |
| Validate on blur | Run validator when user leaves the field — not every keystroke |
| Validate on submit | Final gate — check all fields before API call |
| `keyboardType` | Tells OS which keyboard layout to show |
| `autoComplete` | Hint to OS password manager — app does not store saved emails |
| `secureTextEntry` | Masks password characters |
| `returnKeyType` | Labels the keyboard action button — `next`, `done`, `search` |
| `useRef` | Persistent handle — `{ current }` points at a native input |
| `forwardRef` | Passes ref through a wrapper component to inner TextInput |
| `KeyboardAvoidingView` | Shifts layout when keyboard opens |
| Focus chain | Email → Next → Password → Done/submit via refs |

---

<a id="the-master-diagram"></a>

## 2 · The master diagram

```text
  LOGIN SCREEN
       │
       ├── KeyboardAvoidingView (platform behaviour)
       │     └── TouchableWithoutFeedback → Keyboard.dismiss
       │           └── ScrollView
       │                 ├── AppInput (email) ── onBlur validate
       │                 ├── AppInput (password, ref) ── onBlur validate
       │                 └── Button ── submitLogin
       │
       └── useLoginForm() ── state + validators
                │
                └── AppInput ── forwardRef ──► TextInput
```

**Reading the diagram.** Layout wrappers handle keyboard overlap and tap-to-dismiss.
`useLoginForm` owns state and validation logic. `AppInput` is the reusable field shell.
`forwardRef` tunnels focus commands from the screen to the native input.

The insight: **validate on blur, not on change.** Punishing incomplete input while the user
is still typing erodes trust. Submit is the final gate.

---

<a id="validation-timing"></a>

## 3 · Validation timing

```text
  TYPING          onBlur              SUBMIT
  ──────          ──────              ──────
  update state    validate ONE field  validate ALL fields
  no errors shown show inline error   Keyboard.dismiss()
                                      API call if valid
```

`useLoginForm` validates individual fields:

`src/hooks/useLoginForm.js`

```javascript
const validateEmail = () => {
  const error = isValidEmail(email);
  setErrors(prev => ({ ...prev, email: error }));
  return error === '';
};

const validateForm = () => {
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  return emailValid && passwordValid;
};
```

`LoginScreen` wires blur and submit:

`src/screens/LoginScreen.js`

```javascript
async function submitLogin() {
  Keyboard.dismiss();
  const isValid = validateForm();
  if (!isValid) return;
  // API call…
}

<AppInput onBlur={validateEmail} … />
<AppInput onBlur={validatePassword} … />
```

Errors render inline via `AppInput` → [Feedback selection](10-feedback-selection.md).

---

<a id="keyboard-and-autofill"></a>

## 4 · Keyboard and autofill

```text
  Field type     keyboardType       other props
  ──────────     ────────────       ───────────
  Email          email-address      autoComplete="email"
  Phone          phone-pad          autoComplete="tel"
  OTP            number-pad         autoComplete="sms-otp"
  Password       default            secureTextEntry, autoComplete="password"
```

Login email field:

`src/screens/LoginScreen.js`

```javascript
// Email
<AppInput
  keyboardType="email-address"
  autoComplete="email"
  autoCapitalize="none"
  returnKeyType="next"
/>

// Password
<AppInput
  secureTextEntry
  autoComplete="password"
  returnKeyType="done"
/>
```

`autoComplete` is a hint to the **OS**, not app storage — the password manager fills values;
React state still owns them via controlled inputs →
[Controlled components](05-controlled-components.md).

OTP autofill: Android/iOS read SMS — React Native never accesses messages directly; declare
`autoComplete="sms-otp"` and `maxLength={6}` on the OTP field.

---

<a id="focus-chain"></a>

## 5 · Focus chain — useRef + forwardRef

```text
  LoginScreen                    AppInput (forwardRef)
    passwordRef = useRef(null)
         │
         ref={passwordRef} ──────►  <TextInput ref={ref} />
         │
  email onSubmitEditing ──► passwordRef.current?.focus()
  password onSubmitEditing ──► submitLogin()
```

`AppInput` forwards the ref:

`src/components/AppInput.js`

```javascript
export const AppInput = forwardRef(({ label, helperText, error, ...props }, ref) => {
  return (
    <View style={styles.container}>
      <TextInput ref={ref} style={[styles.input, error && styles.inputError]} {...props} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});
```

Without `forwardRef`, `passwordRef.current` would point at `AppInput`, not `TextInput`,
and `.focus()` would fail.

Keyboard layout stack:

`src/screens/LoginScreen.js`

```javascript
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView keyboardShouldPersistTaps="handled">
```

iOS uses `'padding'`; Android uses `'height'` — platform branch at the edge →
[Platform back](12-platform-back-button-flow.md).

---

<a id="where-this-shows-up-in-the-repo"></a>

## 6 · Where this shows up in the repo

| Concept | File | What to look at |
|---|---|---|
| Form hook | `src/hooks/useLoginForm.js` | state, validators, loading |
| Login layout | `src/screens/LoginScreen.js` | KeyboardAvoidingView, focus chain |
| Input wrapper | `src/components/AppInput.js` | forwardRef, inline error |
| Validators | `src/utils/validators.js` | `isValidEmail`, `isValidPassword` |
| Address form | `src/screens/AddressScreen.js` | local form state, `keyboardType="number-pad"` |

---

<a id="wiring"></a>

## 7 · Wiring

- **Builds on:** [Controlled components](05-controlled-components.md),
  [Custom hook extraction](07-custom-hook-extraction.md),
  [Feedback selection](10-feedback-selection.md)
- **Used by:** [Permission flow](13-permission-request-flow.md) (location button forms)
- **Contrast with:** web forms — no DOM autofill attributes; mobile uses `autoComplete`
  prop and OS keyboard types
- **Common mistake:** validating on every `onChangeText` — use onBlur →
  [#validation-timing](#validation-timing)
