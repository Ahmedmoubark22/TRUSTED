# TRUSTED

**Everyone knows something.**

A premium mobile-first social mystery game for 3–6 players sharing one physical
device. Pass-and-play private information, real-world discussion, evidence-driven
investigation, private sequential voting, and a layered truth reveal.

**Status:** application foundation only. Case 001 — *The Last Guest* exists as
structurally valid placeholder content so the flow can be exercised end to end.
No final writing, artwork, or audio yet.

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

A dev bar is pinned to the bottom of the screen during `npm run dev`, and on a
production build when the URL carries `?dev=1`.

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
  features/     one folder per area of play
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

Deliberately out of scope at this stage: final Case 001 content, character
writing, evidence, artwork, audio, and reveal text; online or same-Wi-Fi
multiplayer; any backend, accounts, or payments; analytics; AI gameplay; and
Cases 002 and 003.
