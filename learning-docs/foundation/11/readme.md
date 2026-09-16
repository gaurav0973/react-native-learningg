<div align="center">

# 📖 Module 11 — Deep Dive Notes
### React Native: Feedback Patterns

[![Summary ←](https://img.shields.io/badge/📋%20Summary-read.md-00C896?style=for-the-badge)](read.md)
[![Topic](https://img.shields.io/badge/Topic-Toast%20·%20Inline%20·%20Bottom%20Sheet%20·%20Alert%20·%20Snackbar-6C63FF?style=for-the-badge)](.)

</div>

> **Question:** Toast vs inline vs bottom sheet vs alert; never a tap with no response
>
> Every production mobile app follows one rule: **a user should never tap something and wonder whether it worked.** This module teaches which feedback pattern to use and when.

---

<a id="first-principle-feedback"></a>

## 1 · 🎯 First Principle — Immediate Feedback

> **Every interaction must produce immediate feedback.**

Feedback does not always mean success. It means: **I heard your tap.**

| Bad UX | Good UX |
|--------|---------|
| Tap → nothing → user taps again | Tap → ripple/press state → action starts |
| Wait in silence during API call | Button disables / spinner shows |
| Success with no confirmation | Toast or inline message confirms result |

**Order matters:**

```
Tap
  ↓
Visual Feedback        ← must happen FIRST
  ↓
Network / Action       ← comes SECOND
  ↓
Result Feedback
```

---

<a id="feedback-decision-tree"></a>

## 2 · 🌳 Feedback Decision Tree

When the user performs an action, ask: **what does the user need to know?**

```
                 USER PERFORMS ACTION
                         │
                         ▼
             What does the user need?
                         │
 ┌──────────────┬───────────────┬──────────────┬──────────────┐
 │              │               │              │
 ▼              ▼               ▼              ▼
Did it work?  What's wrong?  Choose action?  Confirm action?
 │              │               │              │
 ▼              ▼               ▼              ▼
Toast /      Inline         Bottom Sheet     Alert / Dialog
Snackbar     Message
```

| User need | Pattern | Example |
|-----------|---------|---------|
| **Did it work?** | Toast / Snackbar | "Saved successfully" |
| **What's wrong?** | Inline message | "Email is invalid" under the field |
| **Choose an action?** | Bottom sheet | Sort by price / rating / delivery time |
| **Confirm destructive action?** | Alert / dialog | "Delete account?" Cancel / Confirm |

**Quick rules:**

```
Confirmation  →  Alert
Selection     →  Bottom Sheet
Success info  →  Toast
Validation    →  Inline Message
Undo action   →  Snackbar
Long operation → Loading feedback
```

---

<a id="tap-feedback-lifecycle"></a>

## 3 · 🔄 Universal Tap Feedback Lifecycle

Every tap should follow this pipeline — no exceptions.

```
User Tap
    │
    ▼
Immediate Visual Feedback
(Button pressed / ripple / scale)
    │
    ▼
Action Starts
(API / navigation / local state)
    │
    ▼
Loading Feedback
(Button disabled / spinner)
    │
    ▼
Operation Finished
    │
 ┌──┴───────────────┐
 │                  │
 ▼                  ▼
Success           Failure
 │                  │
 ▼                  ▼
Toast          Inline / Alert / Toast
```

| Stage | Purpose | Pattern |
|-------|---------|---------|
| **Press state** | Prove the tap registered | Opacity, ripple, scale |
| **Loading** | Show work in progress | Disabled button, spinner |
| **Success** | Confirm completion | Toast (non-blocking) |
| **Failure** | Explain what went wrong | Inline error or alert |

---

<a id="snackbar-undo-flow"></a>

## 4 · ↩️ Snackbar Lifecycle — The Undo Pattern

A **snackbar** extends a toast — perfect for **undoable actions**.

```
User Deletes Lesson
       │
       ▼
Lesson Removed Immediately     ← optimistic / instant
       │
       ▼
Snackbar Appears
"Lesson deleted"  [ Undo ]
       │
 ┌─────┴──────────────┐
 │                    │
 ▼                    ▼
Undo Pressed      Timeout Ends
 │                    │
 ▼                    ▼
Restore Lesson     Permanently Delete
```

| Why snackbar? | Why not alert? |
|---------------|----------------|
| Non-blocking — user keeps working | Alert blocks the whole screen |
| Undo fits temporary state | Overkill for reversible actions |
| Feels fast and modern | Feels heavy for "delete one item" |

---

<a id="bottom-sheet-flow"></a>

## 5 · 📋 Bottom Sheet Interaction Flow

Bottom sheets provide **options without leaving the current screen**.

```
User Presses Filter
        │
        ▼
Bottom Sheet Slides Up
──────────────────────
Sort by Price
Sort by Rating
Delivery Time
Offers
──────────────────────
        │
        ▼
User Selects Option
        │
        ▼
Sheet Dismisses
        │
        ▼
Content Updates
```

| Bottom sheet | Alert |
|--------------|-------|
| Multiple choices | Usually 2 buttons (Cancel / OK) |
| Original screen stays visible behind | Blocks entire screen |
| Good for filters, sort, share options | Good for confirmations |

**Rule:** The original screen never disappears — the sheet overlays it.

---

<a id="feedback-patterns-table"></a>

## 6 · 📊 Feedback Patterns — When to Use Each

| Pattern | When to Use | Blocks UI? | Example |
|---------|-------------|------------|---------|
| **Toast** | Temporary success / info | No | "Added to cart" |
| **Inline message** | Validation & contextual errors | No | Red text under email field |
| **Bottom sheet** | Multiple actions or rich interactions | Partially | Filter / sort options |
| **Alert / dialog** | Destructive or confirmation actions | Yes | "Delete account?" |
| **Snackbar** | Undoable actions | No | "Item deleted" + Undo |
| **Loading feedback** | Long-running operations | Depends | Disabled submit + spinner |

---

<div align="center">

📋 **Need a quick refresher?**

**[← Back to Summary — read.md](read.md)**

*React Native Foundation · Module 11*

</div>
