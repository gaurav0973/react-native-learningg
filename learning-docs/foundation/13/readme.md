<div align="center">

# 📖 Module 13 — Deep Dive Notes
### React Native: Accessibility Testing with VoiceOver & TalkBack

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Accessibility%20·%20VoiceOver%20·%20TalkBack%20·%20Screen%20Reader-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Use VoiceOver or TalkBack to complete a real flow
>
> Most developers build apps for themselves. Great mobile developers build apps for everyone. This module teaches how to verify that a blind or visually impaired user can successfully use your app — by testing with real screen readers, not by guessing from visual design.

---

<a id="why-accessibility-matters"></a>

## 1 · 👁️ Why Accessibility Matters — The Thought Process

Accessibility is not a polish step at the end. It is a **product requirement** for any app that real people will use.

```
        HUMAN
          │
          ▼
   Cannot See UI
          │
          ▼
  Screen Reader Reads UI
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
VoiceOver    TalkBack
  (iOS)       (Android)
```

| Perspective | What they see |
|-------------|---------------|
| **Sighted developer** | Colors, spacing, icons, animations |
| **Screen reader user** | Role, label, state, focus order — nothing else |

**Core rule:** If a feature is missing from the accessibility tree, it **effectively does not exist** for that user.

---

<a id="screen-reader-perspective"></a>

## 2 · 🔊 How a Screen Reader Sees Your App

Screen readers do not read pixels. They read a **semantic tree** built from accessibility metadata.

### Visual UI (what you design)

```
Email Input
Password Input
[ Login ]
```

### What TalkBack / VoiceOver reads

```
Email Input
  Role: Text Field
  Label: Email
──────────────────
Password Input
  Role: Text Field
  Label: Password
──────────────────
Login Button
  Role: Button
  Label: Login
```

### What screen readers ignore

| Ignored | Why |
|---------|-----|
| Colors | No semantic meaning |
| Shadows / border radius | Purely visual |
| Animations | Not actionable information |
| Layout position | Focus order matters, not x/y coordinates |

### What screen readers need

| Question | Provided by |
|----------|-------------|
| What is this? | `accessibilityLabel` |
| What type of element? | `accessibilityRole` |
| What state is it in? | `accessibilityState` (disabled, selected, checked…) |
| How do I interact? | Role + hint + focus order |

---

<a id="accessibility-tree"></a>

## 3 · 🌳 The Accessibility Tree

React Native creates an **accessibility tree** on top of the native view hierarchy. The screen reader walks this tree — never the pixel buffer.

```
React Native Component Tree          Accessibility Tree
─────────────────────────           ──────────────────
<View>                                Group
  <Text>Email</Text>        ──►       (may or may not be read)
  <TextInput />             ──►       Text Field · Label: ?
  <Button title="Login" />  ──►       Button · Label: Login
</View>
```

| Fact | Implication |
|------|-------------|
| Tree is built from props + native defaults | Missing props = missing information |
| Not every `<Text>` is announced | Decorative text may be skipped |
| `TextInput` without label prop | Reader may only read placeholder — often insufficient |
| Touchable without label | Reader says "button" with no context — useless |

**Mental model:** Think of two parallel UIs — the visual one you style, and the spoken one you must explicitly design.

---

<a id="accessibility-props"></a>

## 4 · 🏷️ Key React Native Accessibility Props

| Prop | Purpose | Example |
|------|---------|---------|
| `accessibilityLabel` | Spoken name of the element | `"Email address"` |
| `accessibilityHint` | What happens after activation | `"Moves to password field"` |
| `accessibilityRole` | Element type | `"button"`, `"header"`, `"text"` |
| `accessibilityState` | Current state object | `{ disabled: true }` |
| `accessible` | Whether element is focusable | `true` / `false` |
| `importantForAccessibility` | Android: include / exclude from tree | `"yes"`, `"no"`, `"no-hide-descendants"` |

### Label sources (priority)

```
1. accessibilityLabel (explicit — best)
2. accessibilityLabelledBy (points to another element's ID)
3. Text children (Button title, Text content)
4. placeholder (TextInput fallback — weakest)
```

### Example — labeled input

```jsx
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter the email you use to sign in"
  placeholder="Enter your email"
  keyboardType="email-address"
/>
```

### Example — button with loading state

```jsx
<Button
  title={loading ? 'Signing In...' : 'Login'}
  accessibilityLabel={loading ? 'Signing in, please wait' : 'Login'}
  accessibilityState={{ disabled: loading }}
  disabled={loading}
  onPress={submitLogin}
/>
```

### Example — hide decorative icon from tree

```jsx
<Image
  source={icon}
  accessible={false}
  importantForAccessibility="no"
/>
```

---

<a id="testing-flow"></a>

## 5 · 🧪 The Accessibility Testing Flow

Real accessibility testing means **using the app without looking at the screen**.

```
        Build Feature
              │
              ▼
      Enable TalkBack / VoiceOver
              │
              ▼
        Put Phone Away
      (eyes off the screen)
              │
              ▼
   Navigate Using Audio Only
              │
              ▼
   Can User Complete Task?
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
     Yes              No
      │                │
      ▼                ▼
 Ship Feature     Fix Accessibility
                  (label, role, order)
```

| Step | Why it matters |
|------|----------------|
| Enable screen reader first | Forces you into the user's mode |
| Put phone away | Stops you from cheating with visual cues |
| Complete a real task | "Can I log in?" not "Does it read something?" |
| Fix before ship | Broken tree = broken feature for real users |

---

<a id="label-flow"></a>

## 6 · 🔗 Accessibility Label Flow

Every interactive element needs a clear spoken identity.

```
Developer Creates Button
          │
          ▼
accessibilityLabel Added
          │
          ▼
Screen Reader Reads Label
          │
          ▼
User Understands Action
          │
          ▼
User Interacts Correctly
```

Without the label step, the flow breaks silently:

```
Button with no label
          │
          ▼
Reader says: "Button"
          │
          ▼
User asks: "Button for what?"
          │
          ▼
User gives up
```

---

<a id="enable-voiceover-talkback"></a>

## 7 · 📱 Enabling VoiceOver & TalkBack

### iOS — VoiceOver

| Action | Gesture / Setting |
|--------|-------------------|
| Enable | Settings → Accessibility → VoiceOver → On |
| Quick toggle | Triple-click Side button (if configured) |
| Move focus | Swipe right / left |
| Activate | Double-tap |
| Rotor | Two-finger rotate (adjust reading granularity) |

### Android — TalkBack

| Action | Gesture / Setting |
|--------|-------------------|
| Enable | Settings → Accessibility → TalkBack → On |
| Quick toggle | Volume Up + Volume Down (hold 3 sec) on many devices |
| Move focus | Swipe right / left |
| Activate | Double-tap |
| Global menu | Swipe down then right |

### Testing gestures to learn

| Gesture | Result |
|---------|--------|
| Swipe right | Next element in focus order |
| Swipe left | Previous element |
| Double-tap | Activate focused element |
| Two-finger swipe up | Read all from top (TalkBack) |

---

<a id="foodie-login-a11y-test"></a>

## 8 · 🍔 Foodie Login — Real Flow to Test

Use the Foodie login screen as your first end-to-end accessibility test.

**Goal:** Complete login (email → password → submit) using **only** VoiceOver or TalkBack.

```
LoginScreen
     │
     ├── Email field      → "Text field, Email" (or similar)
     ├── Password field   → "Text field, Password"
     └── Login button     → "Button, Login"
              │
              ▼
     Can you reach, fill, and submit
     without looking at the screen?
```

### Files involved

| File | Accessibility relevance |
|------|------------------------|
| `src/screens/LoginScreen.js` | Focus order: email → password → login button |
| `src/components/AppInput.js` | Visual `<Text>` label must reach the `TextInput` for screen readers |
| `src/hooks/useLoginForm.js` | Error messages must be announced when validation fails |

### What to verify

| Check | Pass criteria |
|-------|---------------|
| Email field | Reader announces a clear label — not just placeholder |
| Password field | Reader announces "Password" — secure field still needs a label |
| Focus order | Swiping moves email → password → login in logical order |
| Login button | Reader says "Login" or "Sign in" — not just "Button" |
| Validation errors | Error text is reachable and readable after failed submit |
| Loading state | Button announces disabled / "Signing in" when loading |

### Current gap in AppInput (fix target)

`AppInput` renders a visual label as a separate `<Text>` node. Screen readers may **not** automatically associate it with the `TextInput` unless you wire accessibility props:

```jsx
// AppInput.js — accessibility wiring to add
<TextInput
  ref={ref}
  accessibilityLabel={label}
  accessibilityHint={helperText}
  {...props}
/>

{error ? (
  <Text
    accessibilityLiveRegion="polite"
    accessibilityRole="alert"
  >
    {error}
  </Text>
) : null}
```

| Without wiring | With wiring |
|--------------|-------------|
| Reader may read placeholder only | Reader reads "Email address, text field" |
| Error appears visually but silently | Error is announced when it appears |
| User confused about field purpose | User knows exactly what to type |

### Test script (run blind)

```
1. Enable TalkBack (Android) or VoiceOver (iOS)
2. Open Login screen
3. Swipe until you hear the email field — double-tap to edit
4. Type a test email
5. Swipe to password — double-tap to edit
6. Type a test password
7. Swipe to Login — double-tap to activate
8. If validation fails, confirm you hear the error message
9. Pass = completed without looking at the screen
```

---

<a id="common-a11y-mistakes"></a>

## 9 · ⚠️ Common Accessibility Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Icon-only button | "Button" with no context | Add `accessibilityLabel="Add to cart"` |
| Placeholder as only label | Label disappears after typing | Set `accessibilityLabel` explicitly |
| Visual label not linked to input | Field reads as empty / generic | Pass label to `accessibilityLabel` on TextInput |
| Decorative images in tree | Clutters navigation | `accessible={false}` |
| Wrong focus order | User gets lost swiping | Reorder components or use `importantForAccessibility` |
| Error only shown in red color | Blind user never knows | Add `accessibilityLiveRegion="polite"` on error text |
| Loading button still focusable | User taps dead button | `accessibilityState={{ disabled: true }}` |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 13*

</div>
