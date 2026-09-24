# 02 — Common

Answered once for every section. Each group below is ALSO rendered at the end
of every section listed in its *Spreads to* row, behind a tick — and moving it
there writes that section alone.

**Components** — none of its own.
**Prefixes** — none. Every control here writes into the other sections'
namespaces.
**Controls** — 14, over four groups.

Help text, shown under the section title:

> Answered once for every section. Each section can take any of these over at
> the end of its own list — and a theme that already disagrees arrives with
> those marked.

## How a shared control writes

A shared control is an ordinary control with a longer `vars` array. There is no
global variable and no second level of cascade. `Border width` in Common writes
six variables; the same control inside Action writes one.

## How Common knows which sections still follow it

It is **not stored**. Bucket the sections by the answer they hold, and the
biggest bucket IS Common's answer — every other section has drifted from it.
Two sections agreeing are enough to set the reference; all of them disagreeing
means each is an override and Common has nothing to say.

So Common shows the majority answer, moving it writes only the sections that
hold it, and a theme written by hand — by someone who never opened the form —
opens with its overrides already marked. There is no state to be out of date
(ADR 0011).

A section's tick can also be set by hand, for the one moment the values cannot
speak: between ticking it and moving its control, the two still agree. That
tick lives in `generator.detached`, TypeScript beside `generator.open` — not a
variable, not exported, cleared when a theme loads. Unticking copies Common's
answer back in, which is what makes it reversible.

### What the nineteen shipped themes say

Per control, do the sections agree?

```
Muted / Fade             19 / 19
Muted / Colour           19 / 19
Hand-drawn / Strength    19 / 19
Hand-drawn / Tilt        19 / 19
Focus / Width            45 / 45
Focus / Colour           45 / 45
Border / Radius           0 / 19
```

Every shared control is genuinely shared **except the radius**:

```
action + field                        19 / 19
+ container, divided by its ×2 factor  10 / 19
+ selectors, markers, feedback          0 / 19
```

So Common's Radius writes Action, Field and Container. Selectors, Markers and
Feedback keep their own — and need no flag saying so: their answers differ, so
they arrive detached. A chip is a pill (999px) in eighteen of nineteen themes.

## Entries

### ▸ Border — `shared` · type

*Spreads to* — Action, Field, Selectors, Container, Markers.

| | |
|---|---|
| **type** | `[ None │ Solid │ Dashed │ Dotted ]` → `--<p>-border-style`, and `None` sets every width to `0` |
| `border-width` | length, `0`–`6`, step `0.5`, units px/em/rem → `--<p>-border-width` |
| `border-edges` | sides, four non-exclusive tiles → folded into the width shorthand |
| `border-color` | **colour box**, sources `own`, `text`, `surface`, `semantic` → `--<p>-border-color` + `--<p>-border-shade` |

Width and edges feed one shorthand, as the existing `action-border` writer
already does: all four on → one length; otherwise
`top right bottom left` with `0` where the edge is off.

`own` is what makes a `.btn-primary` take a primary-tinted edge while a plain
button takes a grey one — it is the whole difference between daisy's border and
a flat look's. Offer it only where a `--_` slot exists (Action, Field,
Selectors).

### ▸ Radius — `shared`

*Spreads to* — all six drawing sections.

| | |
|---|---|
| `radius` | length, `0`–`3`, step `0.05`, units rem/px/em, default `0.25rem` |

Writes one base value. Each section multiplies it by a **factor fixed in
`_defaults.scss`**, never by a control:

```scss
--action-radius:    calc(var(--radius) * 1);
--field-radius:     calc(var(--radius) * 1);
--selector-radius:  calc(var(--radius) * 1);
--container-corners:calc(var(--radius) * 2);
--marker-corners:   999px;   /* a chip is a pill, always */
--feedback-corners: calc(var(--radius) * 2);
```

Measured again, per control rather than per group: Action and Field agree on
the radius in **19 of 19**; Container agrees once its ×2 is divided out in 10
of 19 — daisyUI's own `--radius-field` against `--radius-box`; Selectors,
Markers and Feedback agree in **0 of 19**, because each has a radius of its
own. A chip is a pill.

So the factor is real and it is set — `sharedFactor: 2` on Container's Border.
It had been declared in the schema and set by nobody, and a comment claimed it
held in all thirteen daisy themes where it holds in ten.

### ▸ Typography — `shared` · `layout: 'row'`

*Spreads to* — Action, Markers, Selectors, Container.

| | |
|---|---|
| `font-weight` | number, `300`–`800`, step `100`, default `400` → `--<p>-font-weight` |
| `text-transform` | `[ None │ Uppercase │ Capitalize ]` → `--<p>-text-transform` |

### ▸ Focus — `shared` · type

*Spreads to* — Action, Field, Selectors.

| | |
|---|---|
| **type** | `[ None │ Ring │ Outline │ Glow ]` |
| `focus-width` | length, `0`–`6`, step `0.5`, px |
| `focus-color` | **colour box**, sources `own`, `text`, `semantic` |

- **Ring** — a `box-shadow` spread, no blur.
- **Outline** — a real `outline` with `--focus-offset`.
- **Glow** — the same shadow with blur ≈ `width × 3`.
- **None** — every width to `0`. *An invisible focus ring is an accessibility
  bug, not a look*; None is for looks that focus another way, not for looks
  that do not focus.

The old **Push** mode is deleted: a field that moves on focus shifts the layout
while you type.

This replaces **thirteen** `--field-focus-*` variables. They become the
writer's output, not questions.

### ▸ Disabled — `shared` · type

*Spreads to* — Action, Field, Selectors, Container.

| | |
|---|---|
| **type** | `[ Computed │ Custom ]` |
| Computed → `disabled-fade` | percent, `0`–`100`, default `20` → `--<p>-disabled-mix` and `--<p>-disabled-fg-mix` |
| Custom → `disabled-color` | **colour box**, sources `surface`, `text` |

Computed is what every shipped theme does. Custom exists for a look that paints
its disabled state rather than fading it.

The disabled fill mixes from the **opaque** ink, never from `--_fld-fg` — that
one is translucent and redefined two lines later, which is what gave the fields
a pink cast the last time this was wired.

### ▸ Hand-drawn — `shared` · checkbox on the header row · **last**

*Spreads to* — Action, Field, Selectors, Container, Markers.

| | |
|---|---|
| **on/off** | checkbox in the group header. Off ⇒ nothing below is rendered |
| `handdrawn-strength` | number, `0`–`1`, step `0.05`, default `1` |
| `handdrawn-tilt` | length, `0`–`3`, step `0.1`, deg, default `0.4deg` |

Unanimous in the data: **19 of 19 themes agree** across sections on whether the
look is hand-drawn. It is one decision, and cosmos is the only theme that turns
it on.

**Strength alone drives both wobble variables.** The base radius comes from the
Radius group, so the writer is:

```ts
const c = (px: number) => `calc(var(--<p>-radius) + ${strength} * ${px}px)`;
'<p>-corners': `${c(0)} ${c(240)} ${c(210)} ${c(0)} / ${c(240)} ${c(0)} ${c(0)} ${c(210)}`
'<p>-wobble': strength
```

**Tilt** writes `--<p>-angle` and is spread by each section's writer over what
that section actually rotates — a menu leans one way and gives every other row
the opposite half-lean, so a column reads as written rather than printed.

Tilt moves here from Action's *Press* group, where it used to be a press mode.
The split is clean: rest-rotate is drawn by hand, press-rotate is an animation.

## The trap to avoid

`.btn` must write **one** `border-radius`, never four longhands. An invalid
`var()` resets a property to its **initial** value rather than falling back to
the shorthand, so four longhands reading `var(--join-ss)` silently zero the
radius and kill the wobble. `join.scss` writes the four longhands itself; that
is its job and nobody else's.
