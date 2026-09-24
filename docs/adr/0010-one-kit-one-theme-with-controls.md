# One kit, one theme, controls instead of families

There is no longer a "family" — no opinionated visual direction shipped as its
own stylesheet. There is **one** set of component stylesheets, one set of
variables with neutral defaults, and a **theme** deep enough to reach any of
the looks the families used to hold. The theme generator becomes the product:
a form, organised in sections, whose controls expand into variables.

`daisy`, `dahlia`, `sunflower` and `cosmos` survive as **themes**, not as code.

## Why

The families were never as different as the directory layout claimed. Diffing
them component by component (longest common subsequence over the SCSS, so the
figure is shared lines in order, not coincidence):

```
badge 93%  breadcrumbs 93%  button 81%  checkbox 80%  chip 93%  dock 96%
file-input 72%  input 83%  list 95%  progress 93%  range 93%  select 89%
skeleton 97%  tabs 98%  text 98%  textarea 80%  toggle 87%
```

The identity of a family is the remainder. For `button` — the most divergent
component after `menu` and `navbar` — that remainder is about thirty lines,
and every one of them is a value: a border, a corner, four paint slots, a
shadow, a press motion, and between zero and two variants of its own. Across
all four families **five** classes exist that daisy does not have:
`.btn-surface`, `.btn-classic`, `.btn-noshadow`, `.btn-reverse`,
`.child-borders`.

The deleted ADR 0008 had already measured the same thing from the other side,
and its number is worth keeping now that its rule is gone: families filled the
paint slots `base` offered them **1.4× (aster) to 2.8× (sunflower) less often
than they re-declared raw CSS properties**. That was read at the time as a
failure of the slot contract. It reads better as this: the shared mechanism was
already doing the work, and the divergence was mostly families restating it in
their own words.

Meanwhile the cost of a family was paid in full every time: its own file per
component, its own themes (the deleted ADR 0005 forbade sharing one), its own
narrowed copy of all 26 Svelte components, and — the part that actually hurt —
its own chance of being wrong, since a family is judged by rendering and nobody
renders seven of them.

## What makes it possible

Two things that were already true, and one that was not.

- **The paint slots are the default look.** `base` writes
  `background-color: var(--btn-bg)`, and `--btn-bg: var(--btn-color,
  var(--color-primary))` *is* neo-brutalism while `var(--color-card)` is
  daisyUI. The "default variant" — the one thing that looked like it could only
  be decided by a stylesheet — is a value.
- **The big departures are already variants.** `tabs` is 98% shared across
  families and ships `.tabs-box`, `.tabs-lift`, `.tabs-border`, `.tabs-top`,
  `.tabs-bottom` in all of them. A look that cannot be a value is a variant,
  and the kit was already written that way without anyone deciding it.
- **Motion was not a slot, and becomes one.** sunflower's press (`translate`
  plus a shadow collapsing to nothing) and cosmos's tilt (`rotate` at rest, 0
  on hover, inverted on press) were written directly in the family file. They
  become `--btn-press-x`, `--btn-press-y`, `--btn-press-rotate`,
  `--btn-press-shadow`. Three families reduce to four numbers.

## Considered options

- **Keep the families, add parameters to the survivors.** The previous plan:
  `dahlia` was to gain enough knobs to read like Ant or Carbon. Rejected
  because it answers the same need — finer control — while still paying for
  four stylesheets, four theme sets and four generated component trees. If the
  knobs are the answer, the stylesheets are the cost.
- **Two theme layers, a palette × a style.** Composable: `kraft` as a palette
  over `cosmos` as a style, 34 palettes × 6 styles for the price of 40 files.
  Rejected **for now**, deliberately: it is a second mechanism to understand
  before writing a theme, and the flat theme has to prove it is painful before
  we add one. The cost is known and accepted — the 13 daisy themes carry 13
  identical copies of the daisy decoration block.
- **Shared SCSS partials behind flat output.** The same saving, paid at compile
  time rather than at runtime. Rejected on the same ground, and recorded here
  because it is what a future reader will propose first.
- **Group-level variables only** (`--field-border-width`, nothing per
  component). Kept as the shape of the theme, but written as
  `var(--input-border-width, var(--field-border-width))` at the point of use,
  so one component can be desolidarised later without a migration.

## Consequences

- **ADR 0003, 0005 and 0008 are deleted, not superseded.** A stale rule that
  still reads as a rule constrains the next decision. Their numbers stay unused
  so nothing is silently renumbered. What was worth keeping from 0008 — its
  measurement, and its point that a mechanism nobody can break beats a default
  nobody replaces — is above.
- **The default is absence.** `_defaults.scss` declares every variable once, on
  `:where(:root)`, with a neutral value: no border, no shadow, no radius, no
  motion. Absence has to be *written* — a `var()` with no value poisons the
  whole declaration — and it covers decoration only. Colours and geometry keep
  sane defaults, because a button with no foreground is not neutral, it is
  invisible.
- **A theme is the difference from that default**, plus sentinel variables
  (`--btn-press: push`) that the CSS never reads and the generator uses to
  reopen a theme it wrote.
- **The generator is not generated.** It is a Svelte form with its schema in
  TypeScript, editing `:root` live, with a switch to stop painting the app's
  own chrome when a theme in progress makes the form unusable. The old path — a
  Sass map serialised to JSON inside a CSS comment and read back by the build —
  assumed one control per variable, which is exactly what stops being true. A
  build check compares the variable names the schema writes against the names
  `_defaults.scss` declares and fails on an orphan either way; without it a
  renamed variable breaks nothing visible, it is simply ignored.
- **`gen-components.mjs` and `src/generated/` disappear.** Their only job was
  narrowing each component to a family's class list. One kit, one list: the
  hand-written component is what ships, and `Button.svelte`'s
  `shadow: { none: 'noshadow', reverse: 'reverse' }` axis — sunflower-only
  until now — becomes everyone's.
- **`base/` and `families/` merge** into `src/scss/components/<name>.scss`.
  The mechanism/value split existed so a family could be written without
  reading `base`. There is no family to write.
- **19 themes ship**: 13 daisy (`light`, `dark`, `bumblebee`, `retro`,
  `halloween`, `forest`, `lofi`, `autumn`, `business`, `night`, `nord`,
  `coffee`, `caramellatte`), 2 dahlia (`light`, `jade`), 2 cosmos (`paper`,
  `slate`), 2 sunflower (`light`, `mint`). The other 23 daisy themes only ever
  changed colours and can come back as fourteen-line files whenever wanted.
- **The reference was captured before anything moved, and cannot be retaken.**
  `.shots/baseline/` holds 251 renderings — the theme page for all 19 themes,
  every component page for eight of them — plus `.shots/baseline-css/`, the
  sorted declarations of each compiled family. `families/` is gone now;
  `scripts/shoot-baseline.mjs --out .shots/after` reruns the same matrix
  against the rebuilt app.

- **Done, and what it cost.** All 29 components migrated, eight sections, 339
  variables. **No structural variant was needed anywhere.** The one serious
  candidate — the slider, whose two geometries looked like different
  components — reduced to a single length, `--range-trail-height`: the trail is
  a shadow the thumb casts, a clip-path cuts it to a band, and the band's
  height is the whole of the difference. The real breaks in form — an
  underline, a lifted folder, a boxed pill — were already `.tabs-*` classes
  before this started, shipped by every family, decided by nobody.

  Two components turned out to want no controls at all, and both earn it:
  `join`, which reads its neighbours' radii and squares the corners where they
  meet, and `badge`, which positions a `.chip` and paints nothing.
- **An npm package becomes conceivable** and stays out of scope. ADR 0001 ruled
  it out because there was nothing stable to publish — four incompatible
  stylesheets. One stylesheet plus variables is publishable; it is not
  publishable while 29 components are being rewritten.
