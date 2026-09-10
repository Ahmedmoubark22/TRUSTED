# TRUSTED

**Everyone knows something.**

A premium mobile-first social mystery game for 3–6 players sharing one physical
device. Pass-and-play private information, real-world discussion, evidence-driven
investigation, private sequential voting, and a layered truth reveal.

**Status:** four cases. 002 — *«الدور»* and 003 — *«الفويس»* are authored
Egyptian Arabic content, played in the original **reveal** mode: one
investigation, one vote, a layered truth. 004 — *«آخر واحد شافه»* is the trial
for the competitive **interrogation** mode — rounds of evidence, questions, a
vote and an elimination, against a culprit who knows they are one — with final
structure and provisional prose. 001 remains placeholder content. No artwork or
audio yet.

---

## Installation

Requires Node.js 20 or newer.

```bash
npm install
```

## Commands

Start the development server (http://localhost:5173):

```bash
npm run dev
```

The dev server binds to all interfaces, so a phone on the same Wi-Fi can load it
from the network URL Vite prints. That is for testing the real touch experience —
it is not the multiplayer feature.

Production build (typechecks first, then bundles to `dist/`):

```bash
npm run build
```

Run the test suite:

```bash
npm test
```

Typecheck only, or preview a production build:

```bash
npm run typecheck
```

```bash
npm run preview
```

---

## Development / test mode

A dev bar is pinned to the bottom of the screen. It is present in exactly two
places, and **never on production**:

- during `npm run dev`, and
- on a deployed build made with `VITE_ENABLE_DEV_BAR=true`.

The gate is build-time on purpose. It used to also accept `?dev=1` on any
production build — which meant the phase jumper, a control that rewrites game
state to whatever you pick, was reachable on the live site by anyone who
guessed the query string. Turning the tools on is now a deploy, by somebody
with access to the build environment, rather than a URL. `?dev=1` no longer
does anything.

### Testing a branch on a real device

Railway builds a **PR Environment** per pull request. Set
`VITE_ENABLE_DEV_BAR=true` as a service variable **on that PR environment
only** — never on the production environment — and redeploy. The preview URL
then carries the dev bar; production is unaffected, because the value is baked
in at build time and production was not built with it.

- **◀ / ▶** step through the approved phases one at a time
- the **dropdown** jumps straight to any phase
- **reset** clears the saved game and returns to HOME

Jumping does not just set the phase — it loads a coherent seeded 4-player game
(`src/app/dev/devSeed.ts`) with the players, roles, evidence, and votes that
phase would plausibly have arrived with. So every screen is reviewable in one
tap without playing through to it.

---

## Architecture

> Content defines what is true.
> Engine defines what can happen.
> UI defines how it feels.

There is **one authoritative game state**. Views read from it and dispatch
events; they never mutate it, and they never decide their own next phase.

```
src/
  app/          application shell, phase router, React ↔ engine wiring
    dev/        development phase stepper and seed data
  engine/       game state, events, transition table, pure reducer, store
  content/      authored case definitions
    cases/
      case-001/ The Last Guest (placeholder content)
      case-002/ «الدور» — reveal mode
      case-003/ «الفويس» — reveal mode
      case-004/ «آخر واحد شافه» — interrogation mode (trial)
    culprits.ts who did it, kept off the public case definition
  features/     one folder per area of play
    rounds/     interrogation and elimination, for cases played in rounds
    setup/      player setup, character assignment
    briefing/   private pass-and-play briefings
    table/      the shared investigation hub
    evidence/   shared evidence reveal
    discussion/ out-loud discussion
    voting/     decision gate and private sequential voting
    reveal/     vote reveal, layered truth reveal, case complete
    home/       home and case intro
  components/   shared presentational pieces
  audio/        audio bus (stub — no sound files yet)
  persistence/  local storage of the authoritative state
  styles/       design tokens and global styles

tests/          engine, store, persistence, and render smoke tests
public/assets/  static case assets (empty)
```

### Game phases

`HOME → CASE_INTRO → PLAYER_SETUP → CHARACTER_ASSIGNMENT → PRIVATE_BRIEFINGS →
TABLE ⇄ EVIDENCE / DISCUSSION → DECISION_READY → VOTING → VOTE_REVEAL →
TRUTH_REVEAL → CASE_COMPLETE`

A case in **interrogation** mode runs a loop instead of a single pass:
`EVIDENCE → INTERROGATION → DECISION_READY → VOTING → VOTE_REVEAL →
ELIMINATION`, and `ELIMINATION` returns to `EVIDENCE` or goes on to
`TRUTH_REVEAL`. Which way it goes is decided by the reducer, from the authored
culprits, before the screen renders. See
[`docs/case-design/FORMAT_INTERROGATION_ROUNDS.md`](docs/case-design/FORMAT_INTERROGATION_ROUNDS.md).

The legal moves between phases live in one table — `PHASE_TRANSITIONS` in
[`src/engine/phases.ts`](src/engine/phases.ts). The reducer rejects anything
that is not in it, returning the state unchanged.

### State transitions

`reduce(state, event, ctx)` in [`src/engine/reducer.ts`](src/engine/reducer.ts)
is a pure function. Everything impure — the clock, the RNG used to deal roles,
and case lookup — is injected through `EngineContext`, which is what makes role
dealing reproducible in tests.

A rejected event returns the **same state reference**. The store treats an
unchanged reference as "nothing happened" and skips both the subscriber
notification and the persistence write, so illegal taps are genuinely free.

### Private information

Private briefings are deliberately kept out of both the case definition and the
game state:

- A `CaseDefinition` is handed to every view, so anything on it is effectively
  public. Briefings live in [`src/content/briefings.ts`](src/content/briefings.ts),
  reachable only through a narrow `getPrivateBriefing(caseId, characterId)` lookup.
- `GameState` records **who** is being briefed and **how far they have read** —
  never what it said. No secret is ever serialised, persisted, or handed
  wholesale to a component.

The engine owns the gate. `revealableCharacterId` returns the one character
whose briefing may be shown right now, or nothing — and it returns an *id*, not
content, so a careless caller still cannot leak anything. The single bridge
between the two halves is the `useCurrentBriefing` hook.

While the step is `LOCKED` no briefing is fetched at all, so the gate and the
pass screen have nothing on them to hide. A refresh always lands back on the
gate: the phone may be in different hands by then.

### Persistence

The authoritative state is written to `localStorage` after every change, so a
locked screen or an accidental refresh mid-case does not cost the table its
progress. Storage failures (private browsing, quota) degrade to an in-memory
store rather than taking the game down, and payloads that fail validation are
discarded rather than partially trusted.

### Design tokens

Typography, spacing, color, and motion all come from CSS custom properties in
[`src/styles/tokens.css`](src/styles/tokens.css). These are a foundation, not a
finished visual language — but every screen already reads from one place.

---

## Not built yet

Deliberately out of scope at this stage: final Case 001 and Case 004 prose,
artwork and audio; online or same-Wi-Fi multiplayer; any backend, accounts, or
payments; analytics; and AI gameplay.

One gap is known and recorded in `src/content/cases/case-004/truth.ts`: an
interrogation case's *truth text* still ships on the public case definition and
names the culprit. The engine no longer reads it — adjudication goes through
`getCulprits`, which is private — so nothing leaks during play, but a player
with devtools could read it out of the bundle ahead of the reveal.
