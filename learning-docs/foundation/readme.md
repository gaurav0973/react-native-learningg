<div align="center">

# 📚 Foundation — Learning Index
### React Native Foundation Modules

[![Main Index →](https://img.shields.io/badge/📚%20Main%20Index-learning--docs/readme.md-6C63FF?style=for-the-badge)](../readme.md)

</div>

> All foundation modules live under `foundation/N/`.
> Each module has a **summary** (`read.md`) and **deep dive** (`readme.md`).

---

## ✅ Completed Modules

| # | Question | Summary | Deep Dive |
|---|----------|---------|-----------|
| 1 | What is an app — APK / AAB / IPA, signing, keystore, versionCode vs versionName? | [read.md](1/read.md) | [readme.md](1/readme.md) |
| 2 | App lifecycle — active / background / inactive — and how AppState works in your app. | [read.md](2/read.md) | [readme.md](2/readme.md) |
| 3 | Simulate process death (Android "Don't keep activities") and watch state vanish. | [read.md](3/read.md) | [readme.md](3/readme.md) |
| 4 | The three build loops — Fast Refresh vs Reload vs Full Rebuild — know which one you need. | [read.md](4/read.md) | [readme.md](4/readme.md) |
| 5 | Find a native crash in `adb logcat` / the Xcode console — JS red box ≠ native crash. | [read.md](5/read.md) | [readme.md](5/readme.md) |
| 6 | Density (dp/pt not px), PixelRatio, @2x/@3x, safe areas and notches. | [read.md](6/read.md) | [readme.md](6/readme.md) |
| 7 | The four states of every screen: loading (skeleton), empty, error, loaded. | [read.md](7/read.md) | [readme.md](7/readme.md) |
| 8 | Perceived speed: optimistic updates, prefetch, never show a blank screen. | [read.md](8/read.md) | [readme.md](8/readme.md) |
| 9 | Reachability: primary actions at the bottom, sticky footer CTAs, 44pt targets. | [read.md](9/read.md) | [readme.md](9/readme.md) |
| 10 | Platform conventions & Android back button — production navigation behavior. | [read.md](10/read.md) | [readme.md](10/readme.md) |
| 11 | Toast vs inline vs bottom sheet vs alert; never a tap with no response | [read.md](11/read.md) | [readme.md](11/readme.md) |
| 12 | Mobile forms: keyboard types, autofill, OTP autofill, validate on blur, useRef & forwardRef | [read.md](12/read.md) | [readme.md](12/readme.md) |
| 13 | Use VoiceOver or TalkBack to complete a real flow | [read.md](13/read.md) | [readme.md](13/readme.md) |

---

## 📖 Module Details

### Module 11 — Feedback Patterns

> **Question:** Toast vs inline vs bottom sheet vs alert; never a tap with no response

- 📋 [Summary → read.md](11/read.md)
- 📖 [Deep Dive → readme.md](11/readme.md)

---

### Module 12 — Mobile Forms & Login UX

> **Question:** Mobile forms: keyboard types, autofill, OTP autofill, validate on blur

- 📋 [Summary → read.md](12/read.md)
- 📖 [Deep Dive → readme.md](12/readme.md)
- 🗺️ [useRef + forwardRef Diagram → useRef-forwardRef-flow.excalidraw](12/useRef-forwardRef-flow.excalidraw)

**Implemented in app:** `src/screens/LoginScreen.js`, `src/components/AppInput.js`, `src/hooks/useLoginForm.js`

---

### Module 13 — Accessibility Testing with VoiceOver & TalkBack

> **Question:** Use VoiceOver or TalkBack to complete a real flow

- 📋 [Summary → read.md](13/read.md)
- 📖 [Deep Dive → readme.md](13/readme.md)

**Test flow in app:** Login screen — email → password → login button (audio-only navigation)

**Fix target:** Wire `accessibilityLabel` in `src/components/AppInput.js` so visual labels reach screen readers

---

<div align="center">

*React Native Foundation · Learning Docs Index*

</div>
