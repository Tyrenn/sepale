# base owns the mechanism, families own the values

**Superseded by [0010](./0010-a-family-is-self-contained.md)** (2026-10-02):
`base/` is gone; each family writes its components whole.

`src/scss/base/` holds one file per component containing structure, states,
accessibility and plumbing — and **no values at all**. It writes
`height: var(--size)` and `background-color: var(--btn-bg)`, and it never
writes `--size:` or `--btn-bg:`. Every colour, every dimension, every variant
lives in `src/scss/families/<family>/<component>.scss`.

A family is therefore not "the base rules plus corrections". It is the only
place a value is ever written. `base` cannot be used without a family, by
design.

## Why

Before this, `base` shipped neutral defaults — 149 painting declarations across
25 components — and a family was written by overriding them. Two things went
wrong with that, measurably:

- **You had to know `base` before you could write a family.** Every family file
  was a conversation with rules living in another directory, and writing one
  meant reading twenty-five other files first.
- **The intended mechanism was the minority.** Families filled paint slots
  1.4× (aster) to 2.8× (sunflower) less often than they re-declared raw CSS
  properties. The slot contract existed; almost nobody used it, because
  overriding a default was easier than finding the slot.

The split is not "structure versus look" — that distinction was tried and
abandoned earlier, because a family must be able to change layout too. It is
**mechanism versus value**: `base` guarantees that a component sizes itself
from its own font-size, reacts to `--scale`, handles focus and disabled, and
exposes named slots. The family decides what goes in them, including the
numbers.

## Considered options

- **Neutral defaults in `base`** (what we had). A family that says nothing
  still renders something. Rejected: a default that works is a default nobody
  replaces, and families end up inheriting greys no one chose.
- **`base` as a bare reset**, families restating structure. Rejected on
  measurement: 83% of `base` is structure, states and accessibility. Making
  seven families restate 750 declarations buys nothing.
- **`base` mentions no paint properties at all**, families writing ordinary CSS.
  Rejected because it breaks mechanisms that have nothing to do with looks:
  `join` injects its children's corner radii *through their slots*, and
  `validator` drives a neighbouring field's `--input-color`. Without slots,
  neither has a grip.

## Consequences

- **A custom property in `base` is allowed when it is geometry, not a look**
  (added 2026-09-22). `base/join.scss` writes `--join-ss: 0` sixty times to say
  which corner of which child is square inside a group. That is not a value a
  family decides — no family would ever write a different one — and the proof
  is that `join`'s seven family files held the same 125 rules byte for byte
  until they were merged into `base`. The test is one question: *would any
  family ever write something else here?* If yes, it is a value and it belongs
  to the family.

- **`var()` with no value poisons the whole declaration.** `border: var(--border)
  solid var(--btn-border)` with `--border` unset does not fall back to a thin
  border — it produces **no border at all**. An incomplete family renders
  visibly broken rather than gracefully degraded. That is the intended test,
  and it bites hardest during migration.
- **`daisy` stops being the reference.** `skin-flat` and every `variant-*`
  mixin moved into `families/daisy/`, and `flat-components` is gone. daisy is a
  family like any other; it was only ever the default because it was first.
- **Each family writes its own variants.** Nothing is centralised for now.
  `src/scss/_mixins.scss` stays as a toolbox — colour loops, size scales — that
  saves typing without sharing a look; it emits nothing until a family calls it.
- **The term "skin" left the glossary.** It named a mixin that lived in a
  component file beside three competing looks. One file, one family, one
  component: the situation it described no longer exists.
- A family only has a file for the components it has something to say about.
  Silence is now visible information rather than an empty file.
