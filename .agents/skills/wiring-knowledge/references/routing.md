# Routing and the ledger

Two jobs here: decide which of the four folders owns a concept, and record that decision so no
later file can quietly re-explain it.

## The routing ladder

Ask these four questions **in order**. First "yes" wins. Order matters — it is what makes routing
deterministic instead of a matter of taste, and it is what stops the same idea landing in two
folders.

**1. Does understanding this require knowing what the runtime, the OS, or the build does?**
→ `01-internals/`

The test: the reader could write working code without this, but would not know *why* it works,
and would be helpless when it breaks. Mechanism below your code.

Typical members: the JS engine, how JS talks to native, the render pipeline and its threads, thread
model, app lifecycle and process death, build artifacts and signing, the reload/rebuild loop, how
permissions are actually granted by the OS, density and physical pixels, what the platform does
*not* give you (no DOM, no cascade, no hover).

**2. Is it a specific API, component, or library you call to build a feature?**
→ `02-implementations/`

The test: there is an import statement and a call site. Answering it means showing wiring — install,
configure, call, handle the result.

Typical members: list rendering components, navigation, persistent storage, animation APIs,
geolocation, notifications, deep linking, HTTP clients, state containers, image components.

**3. Is it a repeatable shape of a solution that survives swapping the API underneath?**
→ `03-patterns/`

The test: you could change the library and keep the pattern. It answers "how should this be
structured", not "which function do I call".

Typical members: the four screen states, optimistic update then reconcile, debounce/throttle,
extracting a custom hook, controlled vs uncontrolled input, hydration gating, provider composition,
splitting container from presentation, forwarding a ref through a wrapper, pagination loops,
feedback selection (inline vs toast vs sheet vs alert).

**4. Is it about layout, spacing, or visual appearance?**
→ `04-style-patterns/`

Typical members: the flexbox model and its defaults, absolute/relative positioning, safe area and
notch handling, style composition with arrays, conditional and platform-specific styles, shadow vs
elevation, touch-target sizing, skeleton/shimmer construction, spacing scales and design tokens,
the styling constructs that replace the cascade.

If nothing matched, it is probably not a concept — it is an anecdote or a tooling note. Put it in
the report as "not carried over" rather than forcing it into a folder.

## Tiebreakers

Many good concepts feel like they belong in two folders. Split them by **first principle**: the
mechanism is owned by the earlier folder, the application by the later one, and the later one links
back rather than re-explaining.

| Concept that straddles | Internals owns | The other folder owns |
|---|---|---|
| Density / dp / @2x | why a physical pixel ≠ a dp, how the scale factor is chosen | `04` — sizing and asset choices that follow from it |
| Safe areas | why the notch and system bars exist, who reports the insets | `04` — the layout pattern that consumes the insets |
| Permissions | the OS grant lifecycle and its states | `02` — the API call, `03` — the request/denial flow shape |
| Native modules | how JS reaches native code | `02` — using a specific native package |
| Re-render behaviour | how reconciliation and commit work | `03` — memoization and state-shape patterns |
| No CSS cascade | what the platform genuinely lacks | `04` — the composition pattern used instead |

When two candidate owners are both in the *same* folder, the owner is the file where the concept is
load-bearing rather than incidental — usually the lower-numbered one, since the higher one can then
link backwards.

## Ordering within a folder

Number files so that dependencies only ever point backwards: a note may assume concepts owned by
lower-numbered files in its own folder, or by any earlier folder. If you find a forward dependency,
either renumber or move the shared concept earlier.

That constraint is what turns the folder into a reading path instead of a pile. When it cannot be
satisfied — two notes genuinely need each other — that is a signal they are one note.

## The ledger

`wiring-knowledge/.wiring/ledger.json` is the single source of truth for "who owns what". Build it
in Phase 2, update it as each file is written, and consult it before every sentence you write.

```json
{
  "version": 1,
  "concepts": [
    {
      "id": "jsi",
      "title": "JSI — the JavaScript Interface",
      "aliases": ["JavaScript Interface", "bridgeless", "synchronous native calls"],
      "owner": "01-internals/03-jsi-and-the-bridge.md",
      "anchor": "#what-jsi-replaced",
      "sources": ["learning-docs/foundation/15/readme.md:L120", "README.md:L640"],
      "depends_on": ["hermes", "thread-model"],
      "status": "written"
    }
  ],
  "files": [
    {
      "path": "01-internals/03-jsi-and-the-bridge.md",
      "title": "JSI and the death of the bridge",
      "owns": ["jsi", "old-bridge", "turbomodules"],
      "prereqs": ["01-internals/02-hermes-and-the-js-engine.md"],
      "status": "written"
    }
  ],
  "dropped": [
    { "source": "run.txt", "reason": "shell commands, no concept" }
  ]
}
```

Field notes:

- **aliases** are the workhorse. Before explaining anything, search the ledger's aliases for the
  phrase you are about to define. A hit means the concept is already owned — link instead.
- **sources** keep the note auditable and make re-runs diffable. `path:Lnn` is enough.
- **depends_on** feeds both the file numbering and the "prerequisites" line in each note.
- **status** is `planned` → `written`. Checkpointing per file is what makes a long run resumable.
- **dropped** is not optional. It is how the coverage claim stays honest: anything in the source
  that produced no concept is listed here with a reason, and that list goes into the final report.
