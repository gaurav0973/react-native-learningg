<div align="center">

# 📚 Learning Docs — Index
### React Native Foundation — Completed Questions

</div>

> Quick index of all foundation topics you've completed.
> Each module has a **summary** (`read.md`) and **deep dive notes** (`readme.md`).
> All modules live under **[foundation/](foundation/readme.md)**.

---

## ✅ Completed Questions

| # | Question | Summary | Deep Dive |
|---|----------|---------|-----------|
| 1 | What is an app — APK / AAB / IPA, signing, keystore, versionCode vs versionName? | [read.md](foundation/1/read.md) | [readme.md](foundation/1/readme.md) |
| 2 | App lifecycle — active / background / inactive — and how AppState works in your app. | [read.md](foundation/2/read.md) | [readme.md](foundation/2/readme.md) |
| 3 | Simulate process death (Android "Don't keep activities") and watch state vanish. | [read.md](foundation/3/read.md) | [readme.md](foundation/3/readme.md) |
| 4 | The three build loops — Fast Refresh vs Reload vs Full Rebuild — know which one you need. | [read.md](foundation/4/read.md) | [readme.md](foundation/4/readme.md) |
| 5 | Find a native crash in `adb logcat` / the Xcode console — JS red box ≠ native crash. | [read.md](foundation/5/read.md) | [readme.md](foundation/5/readme.md) |
| 6 | Density (dp/pt not px), PixelRatio, @2x/@3x, safe areas and notches. | [read.md](foundation/6/read.md) | [readme.md](foundation/6/readme.md) |
| 7 | The four states of every screen: loading (skeleton), empty, error, loaded. | [read.md](foundation/7/read.md) | [readme.md](foundation/7/readme.md) |
| 8 | Perceived speed: optimistic updates, prefetch, never show a blank screen. | [read.md](foundation/8/read.md) | [readme.md](foundation/8/readme.md) |
| 9 | Reachability: primary actions at the bottom, sticky footer CTAs, 44pt targets. | [read.md](foundation/9/read.md) | [readme.md](foundation/9/readme.md) |
| 10 | Platform conventions & Android back button — production navigation behavior. | [read.md](foundation/10/read.md) | [readme.md](foundation/10/readme.md) |
| 11 | Toast vs inline vs bottom sheet vs alert; never a tap with no response | [read.md](foundation/11/read.md) | [readme.md](foundation/11/readme.md) |
| 12 | Mobile forms: keyboard types, autofill, OTP autofill, validate on blur, useRef & forwardRef | [read.md](foundation/12/read.md) | [readme.md](foundation/12/readme.md) |
| 13 | Use VoiceOver or TalkBack to complete a real flow | [read.md](foundation/13/read.md) | [readme.md](foundation/13/readme.md) |

> 📂 **Full track index with module details:** [foundation/readme.md](foundation/readme.md)

---

## 📖 Module Details

### Module 1 — What Is an App?

> **Question:** What is an app — APK / AAB / IPA, signing, keystore, versionCode vs versionName?

- 📋 [Summary → read.md](foundation/1/read.md)
- 📖 [Deep Dive → readme.md](foundation/1/readme.md)

---

### Module 2 — App Lifecycle & AppState

> **Question:** App lifecycle — active / background / inactive — and how AppState works in your app.

- 📋 [Summary → read.md](foundation/2/read.md)
- 📖 [Deep Dive → readme.md](foundation/2/readme.md)

---

### Module 3 — Process Death & State Survival

> **Question:** Simulate process death (Android "Don't keep activities") and watch state vanish.

- 📋 [Summary → read.md](foundation/3/read.md)
- 📖 [Deep Dive → readme.md](foundation/3/readme.md)

---

### Module 4 — The Three Build Loops

> **Question:** The three build loops — Fast Refresh vs Reload vs Full Rebuild — know which one you need.

- 📋 [Summary → read.md](foundation/4/read.md)
- 📖 [Deep Dive → readme.md](foundation/4/readme.md)

---

### Module 5 — Native Crashes & Debugging

> **Question:** Find a native crash in `adb logcat` / the Xcode console — JS red box ≠ native crash.

- 📋 [Summary → read.md](foundation/5/read.md)
- 📖 [Deep Dive → readme.md](foundation/5/readme.md)

---

### Module 6 — Density, PixelRatio & Safe Areas

> **Question:** Density (dp/pt not px), PixelRatio, @2x/@3x, safe areas and notches.

- 📋 [Summary → read.md](foundation/6/read.md)
- 📖 [Deep Dive → readme.md](foundation/6/readme.md)

---

### Module 7 — The Four States of Every Screen

> **Question:** The four states of every screen: loading (skeleton), empty, error, loaded.

- 📋 [Summary → read.md](foundation/7/read.md)
- 📖 [Deep Dive → readme.md](foundation/7/readme.md)

---

### Module 8 — Perceived Speed & Optimistic Updates

> **Question:** Perceived speed: optimistic updates, prefetch, never show a blank screen.

- 📋 [Summary → read.md](foundation/8/read.md)
- 📖 [Deep Dive → readme.md](foundation/8/readme.md)

---

### Module 9 — Reachability & Touch Targets

> **Question:** Reachability: primary actions at the bottom, sticky footer CTAs, 44pt targets.

- 📋 [Summary → read.md](foundation/9/read.md)
- 📖 [Deep Dive → readme.md](foundation/9/readme.md)

---

### Module 10 — Platform Conventions & Android Back Button

> **Question:** Platform conventions & Android back button — production navigation behavior.

- 📋 [Summary → read.md](foundation/10/read.md)
- 📖 [Deep Dive → readme.md](foundation/10/readme.md)

---

### Module 11 — Feedback Patterns

> **Question:** Toast vs inline vs bottom sheet vs alert; never a tap with no response

- 📋 [Summary → read.md](foundation/11/read.md)
- 📖 [Deep Dive → readme.md](foundation/11/readme.md)

---

### Module 12 — Mobile Forms & Login UX

> **Question:** Mobile forms: keyboard types, autofill, OTP autofill, validate on blur

- 📋 [Summary → read.md](foundation/12/read.md)
- 📖 [Deep Dive → readme.md](foundation/12/readme.md)
- 🗺️ [useRef + forwardRef Diagram → useRef-forwardRef-flow.excalidraw](foundation/12/useRef-forwardRef-flow.excalidraw)

**Implemented in app:** `src/screens/LoginScreen.js`, `src/components/AppInput.js`, `src/hooks/useLoginForm.js`

---

### Module 13 — Accessibility Testing with VoiceOver & TalkBack

> **Question:** Use VoiceOver or TalkBack to complete a real flow

- 📋 [Summary → read.md](foundation/13/read.md)
- 📖 [Deep Dive → readme.md](foundation/13/readme.md)

**Test flow in app:** Login screen — email → password → login button (audio-only navigation)

---

<div align="center">

*React Native Foundation · Learning Docs Index*

</div>
