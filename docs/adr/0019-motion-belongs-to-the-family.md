---
status: accepted
---

# Motion belongs to the family

A component never decides how something moves. It writes a state, a custom
property or a phase; the family's CSS decides the motion — duration, easing,
what moves, or nothing at all — and so can anyone who restyles it.

## Decision

**Continuous state is written, not played.** An indicator that follows a
selection (`Tabs`, `Switch`) gets its place in custom properties
(`--tabs-x/y/w/h`, `--switch-x/w`), measured to the subpixel in the layout
*as it is after the change*. When the selection changes, the indicator is
first put back, without transition, under the item it leaves as that item now
stands — a selection can move the items (a heavier weight widens the chosen
one) — so the family's transition starts from where the eye sees it.

**Coming, going and moving are marked, then waited for** (`src/lib/motion.ts`):
`data-motion="enter" | "leave" | "move"` on the element, `--motion-w/h` (its
size) and `--motion-dx/dy` (where a moved element came from). The component
reads how long the family's transitions and animations on the element last
from the computed style, and removes it, or finishes the change of state, after
exactly that: at once when the family draws nothing. Svelte's `in:motion`,
`out:motion` and `animate:moved` carry this; `settle()` waits for a change of
state (`Drawer`), `use:settled` for an element that only lives for its motion
(the ripple wave).

**No Svelte transition plays motion of its own** (`fly`, `scale`, `slide`,
`flip`). The motions they played (`Dialog`, `Dropdown`, `Toast`, `Alert`,
`DataControl`) are now written in every family, with the same values, under
`prefers-reduced-motion: no-preference`.

**Every coming and going is marked, drawn or not.** Wherever a component
inserts or removes an element — a list that opens (`Combobox`, `Select`), a
chip (`ChipsInput`), a card (`Kanban`), a branch (`FileExplorer`) — it marks
the phases, even where no family draws them yet: a family that draws nothing
costs nothing (it is instant), and the mechanism is there for the family, or
the app, that wants it.

**The app may take a motion back, the Svelte way.** Every component that marks
a coming and going takes a `transition` prop (`Dialog`, `Dropdown`, `Toast`,
`Alert`, `DataControl`, `Combobox`, `Select`, `ChipsInput`, `Kanban`,
`FileExplorer`), and `Toast` and `ChipsInput` an `animate` prop for the move. Left out:
the family. `false`: instant. A Svelte transition or animation — `fly`,
`{ fn: fly, params: { y: 8 } }`, `{ in: fade, out: fly }`, `flip` — plays
instead, and the phase is not marked, so the family's CSS stays out of it: the
two never play at once. The default stays the family's; the override is the
app's decision, made where the component is placed, never inside it.

## Consequences

- A family can restyle or drop any motion, and an app can override it in CSS
  or, element by element, with a Svelte transition.
- A family that draws no motion for a phase makes it instant — never a
  component left waiting (the former 500ms fallback of `Drawer`) or an element
  left in the DOM (a ripple wave waiting for an `animationend` that a
  reduced-motion family never fires).
- The wait is the longest transition *declared* on the element, whether or
  not it is triggered by the phase: keep unrelated transitions off elements
  that leave.
- A state change on an element that stays (hover, press, focus) is not a
  phase: it is a CSS transition, the family's, overridden in CSS.
- A keyed item hands its key to the app's transition (`withKey`): Svelte's
  `crossfade()` pair, given as `transition`, then pairs a leaving card with
  the one entering another column, or another component sharing the pair.
- `Kanban` wraps each item in an entry (`.kanban-entry`), the sole child of
  its keyed block, which holds the drop marker too: Svelte's `animate:`
  reaches it, so with a `crossfade()` transition and `animate={flip}` the
  board moves exactly as a plain Svelte one — Svelte takes the leaving card
  out of the flow while it flies, and the others slide at once.
- The family's counterpart, where `animate:` cannot reach — an item that
  changes list, which Svelte destroys in one and creates in the other — is
  measured by the component (`Reflow`, FLIP): an element standing elsewhere
  after a change is marked `move` from where it stood, the phase
  `animate:moved` marks, and an item that changed list neither leaves nor
  enters. No family draws it on `.kanban-item` yet.
- `gen-components` lists the phases in each component's *Motion* and the
  `--motion-*` properties in its hooks.
