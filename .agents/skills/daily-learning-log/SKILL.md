---
name: daily-learning-log
description: >-
  Write daily learning logs from topics the user studied or implemented.
  Use when the user asks for a daily log, learning log, task log, status report,
  "what I learned today", training summary, or wants output in Task Done / Status /
  Remarks format for React Native training or project work.
---

# Daily Learning Log

Turn what the user learned in a day into a structured log. Match the templates below exactly.

## When to Use

- User shares bullet points of what they learned today
- User asks to analyze codebase/README for today's learnings
- User wants a log in **Task N** format or **table** format
- User references their daily status sheet or training log

## Workflow

1. **Collect topics** — Use the user's bullet list. If missing, infer from:
   - Recent git commits and diffs for today
   - README notes, comments, or new/changed files
   - Screens the user mentions
2. **Split into tasks** — One task per distinct topic (feature, concept, or bug fix).
3. **Write fields** — Follow naming and remark rules below.
4. **Pick format** — Use the format the user asked for. Default to **Task N** format.

## Field Rules

| Field | Rule |
|-------|------|
| **Date** | `DD-MMM-YYYY` (e.g. `10-Sep-2026`). Use today's date unless user gives another. |
| **Resource Name** | Leave blank unless the user provides a name. |
| **Time Taken** | Leave blank unless the user provides it. |
| **Task Done** | Short title. For React Native training: `React Native Training — [Topic]`. For other work, use `[Area] — [Topic]` (e.g. `Track Order — UI Improvements`). |
| **Status** | Default `Completed`. Use `In Progress` or `Blocked` only if the user says so. |
| **Remarks** | One sentence. What was built or learned, with 1–2 concrete technical details (API, pattern, file, or concept). No fluff. |

## Output Templates

### Template A — Task list (default)

Use when the user asks for Task 1 / Task 2 format or does not specify a format.

```markdown
**Task 1**
- **Task Done:** React Native Training — [Topic]
- **Status:** Completed
- **Remarks:** [One concise technical sentence.]

---

**Task 2**
- **Task Done:** React Native Training — [Topic]
- **Status:** Completed
- **Remarks:** [One concise technical sentence.]
```

Separate each task with `---`.

### Template B — Table (spreadsheet)

Use when the user asks for table format or shows a sheet with Date / Resource Name / Task Done / Status / Remarks columns.

```markdown
| Date | Resource Name | Task Done | Status | Remarks |
|------|---------------|-----------|--------|---------|
| DD-MMM-YYYY | | React Native Training — [Topic] | Completed | [One concise technical sentence.] |
| DD-MMM-YYYY | | React Native Training — [Topic] | Completed | [One concise technical sentence.] |
```

Leave **Resource Name** empty unless provided.

## Quality Checklist

Before responding, verify:

- [ ] One task per learning topic
- [ ] Task Done titles are short and consistent
- [ ] Remarks are one sentence with concrete detail (not generic "learned X")
- [ ] Resource Name and Time Taken omitted unless user supplied them
- [ ] Format matches what the user requested

## Examples

**Input:**
```
Today's log:
- Address management from local storage and form save
- Lottie animation
- FlatList to FlashList
- Pull to refresh
- Infinite scroll and pagination
- Shimmer and fade-in animation
```

**Output (Task list):**

**Task 1**
- **Task Done:** React Native Training — Address Management with Local Storage
- **Status:** Completed
- **Remarks:** Implemented address save/load using AsyncStorage, form validation, and hydration pattern in AddressContext.

---

**Task 2**
- **Task Done:** React Native Training — Lottie Animation Implementation
- **Status:** Completed
- **Remarks:** Integrated Lottie JSON animations in offer banners using `lottie-react-native` with autoPlay and loop.

*(Continue for remaining topics.)*

**Output (Table):**

| Date | Resource Name | Task Done | Status | Remarks |
|------|---------------|-----------|--------|---------|
| 10-Sep-2026 | | React Native Training — Address Management with Local Storage | Completed | Implemented address save/load using AsyncStorage, form validation, and hydration pattern in AddressContext. |
| 10-Sep-2026 | | React Native Training — Lottie Animation Implementation | Completed | Integrated Lottie JSON animations in offer banners using `lottie-react-native` with autoPlay and loop. |

## Boundaries

**Will:**
- Format learnings into Task or table logs
- Analyze the project for accurate remarks when topics are vague
- Keep remarks concise and technical

**Will not:**
- Invent tasks the user did not mention or imply
- Fill Resource Name or Time Taken without user input
- Write long paragraphs in Remarks
