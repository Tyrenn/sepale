# 00 — Grammar

The shape of every control in the theme generator. Read this before any
section file. It is binding: a section file may pick from what is here, never
invent alongside it.

Prerequisites, in order: [`CONTEXT.md`](../../../CONTEXT.md) for the
vocabulary, [`docs/adr/0010`](../../adr/) for why there are no families, and
[`src/routes/README.md`](../../../src/routes/README.md) for the three build
checks.

## What this replaces

`src/lib/theme/sections/*.ts` held **208 top-level controls** in flat lists,
and the only grouping was `effect`. It now holds **69 a section owns and 83
shared**, in ~30 groups.

The count is not the point. A closed section used to show 67 rows; it now shows
three to seven groups.

## The three words, unchanged

`variable`, `control` and `section` keep the meanings `CONTEXT.md` gives them.
**`effect` leaves the vocabulary** — it meant "a control that reveals its own
controls", which is a `Group` with a `type` and nothing else. One concept
fewer, not one more.

## `Group`

```ts
export interface Group {
	id: string;
	label: string;
	help?: string;
	/**
	 * The group's own setting, rendered as an exclusive row of tabs above its
	 * controls. Picking a mode reveals that mode's controls in addition to the
	 * group's own. `none` is a mode like any other; it reveals nothing.
	 */
	type?: {
		default: string;
		modes: { id: string; label: string; help?: string; controls: Control[] }[];
	};
	/** Shown whatever the type. Empty when the type is the whole group. */
	controls: Control[];
	/** The NAME of the shared answer — `border`, `focus`, `disabled`,
	    `handdrawn`. Every group carrying the same name is an instance of one
	    answer. See "Common and the tick". */
	shared?: string;
	/** How many times this section's length is the shared one. Container is the
	    only 2: a box is twice the radius of what sits inside it, so 0.5rem and
	    0.25rem are the SAME answer said at two scales. */
	sharedFactor?: number;
	/** See "Layout". */
	layout?: 'row' | 'stack';
	/** Every variable the group can write, its type's modes included. */
	vars: string[];
}

export type Entry = Control | Group;
export interface Section {
	/* … unchanged … */
	controls: Entry[];
}
```

An old `EffectControl` becomes a `Group` whose `controls` is `[]`. Delete the
type. Nothing else about `expand()` changes, except that it walks groups —
including the existing rule that **a mode's writer runs last**, after the
controls that mode reveals.

## The colour box — the only colour control

There is **one** colour control in the form, used for all ~34 colours. Write
the Svelte component once, make it good, and the whole generator inherits it.

```
Label      ▪            ← closed: a tile showing the resolved colour
           ↓ click
   ┌──────────────────────────────┐
   │  [ Derived │ Custom ]        │  ← tabs
   │  Derived → Source ▪▪▪▪▪▪     │  ← tiles: the theme's tokens, + Own fill
   │            Intensity ──●──   │  ← 0–100
   │  Custom  → OKLCH picker      │  ← no intensity: it IS the colour
   └──────────────────────────────┘
```

```ts
export interface ColorControl extends Base {
	type: 'color';
	default: string;
	/** Which sources the component's CSS can actually mix from. */
	sources: ('own' | 'text' | 'surface' | 'semantic')[];
	/** The variable pair. Always exactly two. */
	vars: [source: string, shade: string];
}
```

It writes **two variables, always**: `--<slot>-color` (the source) and
`--<slot>-shade` (a number in points of OKLCH lightness, 0 to 0.5).

### Direction is automatic, never a control

`color-mix` towards black or white desaturates — a lightened primary drifts to
washed pink. The relative colour syntax keeps chroma and hue, and the sign
comes from the source's own lightness:

```scss
oklch(from var(--action-border-color, var(--_btn-bg))
      calc(l + clamp(-1, (0.66 - l) * 999, 1) * var(--action-border-shade))
      c h)
```

Light source → darker. Dark source → lighter. **One setting works in a light
theme and in its dark twin**, which is why the 19 themes can share their
derivations instead of duplicating them. The `0.66` threshold and the `999`
ramp are the constants `_derived-content.scss` already uses. Do not invent
others, and do not soften the ramp: a gentle slope makes the derivation vanish
for a mid-grey source, which is the one case that must not fail.

### `Own fill` and the `initial` trick

A theme may never write a formula naming a `--_` slot: those resolve on the
element, and a `:root` rule reading one freezes it at root (`CLAUDE.md`,
non-negotiable). So the source of an *Own* derivation is **not written at
all** — the component's `var()` fallback supplies it:

```scss
/* _defaults.scss — declared once, like every other variable */
--action-border-color: initial;
```

`initial` on a custom property makes it *guaranteed-invalid*, so
`var(--action-border-color, var(--_btn-bg))` **uses the fallback** and the slot
resolves on the element. Both rules hold at once: every variable is declared
in `_defaults.scss`, and no `:root` rule mentions a `--_` slot.

Therefore:

| Mode | What the theme writes |
|---|---|
| Derived + Own | the shade only |
| Derived + token | `var(--color-<token>)` and the shade |
| Custom | the colour, and shade `0` |

`sources` lists only what that component's stylesheet can mix. `own` is
offered exactly where a `--_` slot exists to fall back to.

## No selects

`type: 'select'` is removed from the schema. Every finite choice is a row of
exclusive buttons:

- a group's **type** → `.tabs`, or a `.join` of `.btn` where a tab strip is too
  heavy for the row;
- a control's finite values → a `.join` of `.btn-xs`;
- **sides** → the four edge tiles that already exist, non-exclusive;
- **on/off** → a checkbox on the group's own header row. *Hand-drawn* is the
  only case.

## Layout

`layout: 'row'` lays a group's controls side by side, `'stack'` one per line.
Default: `row` when every control is a colour box, `stack` otherwise.

A row of colour boxes is what makes a group read as **one** setting rather than
three. Each tile carries its name small underneath; the value appears when you
open it. That is the space this buys.

## Common and the tick

There is ONE grain. A group marked with a `shared` name is rendered:

- once in the **Common** section, where each of its controls writes **the
  variables of every section that still follows Common**;
- again at the END of each section that has it, behind a tick, where moving it
  writes that section alone.

This works because **the state of a theme is its variables**, not a record of
what each control was set to. A control has no value of its own: it reads one
out of the variables to show, and writes variables when it is moved.

```
Common   move A → --a: 1  --b: 1  --c: 1
section  move B → --a: 1  --b: 2  --c: 1     (b has left Common)
Common   move A → --a: 3  --b: 2  --c: 3     (and stays out of it)
```

### Whether a section still follows Common is DERIVED

Not stored. Bucket the sections by the answer they hold; the biggest bucket IS
Common's answer, and every other section has drifted from it. Two agreeing are
enough to set the reference; all disagreeing means each is an override and
Common has nothing to say.

Compare after dividing by `sharedFactor`, or Container reads as detached in
every theme — it is the same arithmetic the fan-out does in the other
direction.

There is **no global variable, no second level of cascade and no sentinel for
this** — a shared control is an ordinary control with a longer `vars` array,
which this schema has always allowed. And a theme written by hand opens with
its overrides already marked, because there is no state to be out of date.

The user's own tick lives in `generator.detached`: TypeScript, never a
variable, cleared when a theme loads. It covers the one moment the values
cannot speak — between ticking a section and moving its control, when the two
still agree. Unticking copies Common's answer in, which is what makes it
reversible.

The remaining cost is that a control folding several answers into one variable
must read its answer back out of it. Border width recovers itself as the
shorthand's first non-zero part. Where that is impossible, the answer goes to
a **sentinel**: a variable no stylesheet reads, which the generator does.

See ADR 0011.

What is shared, measured over the 19 shipped themes rather than assumed:

| Group | Sections agree | Shared |
|---|---|---|
| Hand-drawn (the mode) | 19 / 19 | yes |
| Border | 17 / 19 | yes |
| Radius | 2 / 19, but at a **fixed ratio** | yes, with per-section factors |
| Weight / Case | — | yes |
| Focus, Disabled | — | yes |
| Shadow | 15 / 19 | **no** — a button and a panel want different shadows |
| Size (scale) | 0 / 19 | **no** — never |

Radius is shared as a base value, each section multiplying it by its
`sharedFactor` (`Container ×2`, everything else ×1). Measured per control:
Action and Field agree in 19 of 19, Container once divided in 10 of 19, and
Selectors, Markers and Feedback in 0 of 19 — each has a radius of its own, and
a chip is a pill. So Common's Radius writes the first three, and the other
three arrive detached without needing a flag to say so.

## Motion

`--transition-duration` and `--transition-easing` are deleted, and so are their
eight per-section copies. **Only four components read a themeable duration
today**; everything else hard-codes its own (`dock` `0.2s ease-out`, `list`
`0.1s`, `radial-progress` `0.3s linear`, `skeleton` `15s`) and keeps doing so.

One duration survives, inside Action's *Press animation* group. A motion
setting belongs to the effect that needs it, or it does not exist.

## Section ownership

Unchanged: a section declares `prefixes`, and `check:theme` audits exactly the
variables under them. Every declared variable is either reachable from a
control or named in the section's `internal` list — never silently neither.

**Building an `internal` list is not guesswork.** Run
`node scripts/check-theme-vars.mjs`; it names every variable no control
reaches. Paste that list into the section. That is the procedure, and it is
the reason the check exists.

## The five checks gate the build

`gen:classes`, `check:theme`, `gen:themes`, `check:defaults`, `check:scope` —
all five in `npm run build:css`. A section that does not pass them is not done.

The last two were added after the first three passed green over a repo in
which one theme shipped the wrong selector radius, seven carried
`--color-scheme: [object Object]`, thirteen had lost their radii, and 88
declarations were frozen at the root. **This design's failure mode is
silence**: nothing throws, nothing looks broken, the theme simply stops having
an effect — or has it everywhere except where you scoped it.

- `check:defaults` — the form's neutral and `_defaults.scss` must agree on
  every literal. A theme carries only what DIFFERS from the neutral, so a
  disagreement means a theme that wants X writes nothing and renders as Y.
- `check:scope` — a variable is an **input** the form writes (`:root`, a
  literal) or a **resolution** reading others (`:where(*)`, substituted per
  element). Never both. See ADR 0012.

## Verification

A look is judged by rendering, not by compiling (`CLAUDE.md`). After each
section: `npm run dev`, then walk the components in a light and a dark theme
with hover / focus / disabled / checked. `node scripts/shoot-baseline.mjs
--out .shots/<name>` for the whole app.
