# 00 — Grammar

The shape of every control in the theme generator. Read this before any
section file. It is binding: a section file may pick from what is here, never
invent alongside it.

Prerequisites, in order: [`CONTEXT.md`](../../../CONTEXT.md) for the
vocabulary, [`docs/adr/0010`](../../adr/) for why there are no families, and
[`src/routes/README.md`](../../../src/routes/README.md) for the three build
checks.

## What this replaces

Today `src/lib/theme/sections/*.ts` holds **208 top-level controls** in flat
lists, and the only grouping that exists is `effect`. The target is **95
controls in Basic mode, 143 in Advanced**, in ~35 groups.

The count is not the point. A closed section today shows 67 rows; after this
it shows six.

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
	/** See "Basic and Advanced". */
	shared?: boolean;
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

## Basic and Advanced

A checkbox at the top of the form, beside the `[ Light │ Dark ]` switch.

- **Basic** — groups marked `shared: true` are hidden from every section and
  rendered once in the **Common** section. Each of their controls writes **the
  variables of every section at once**.
- **Advanced** — the Common section disappears, and each shared group is
  rendered inside every section that has it, writing only that section's.

**The switch is visual. Nothing is migrated, nothing is bound in both
directions, and the impact happens only when a control is moved.** Moving a
Basic control overwrites all N sections. Moving an Advanced control writes one.

This works because **the state of a theme is its variables**, not a record of
what each control was set to. A control has no value of its own: it reads one
out of the variables to show, and writes variables when it is moved.

```
Basic    move A1 → --a: 1  --b: 1  --c: 1
         switch to Advanced — nothing is written
Advanced move B  → --a: 1  --b: 2  --c: 1
         switch back to Basic — nothing is written, --b is still 2
```

When sections disagree, the Basic control shows the first section's value and
is marked `≠`; touching it realigns them. There is **no global variable and no
second level of cascade** — a shared control is an ordinary control with a
longer `vars` array, which this schema has always allowed.

The cost is that a control folding several answers into one variable must read
its answer back out of it. Border width recovers itself as the shorthand's
first non-zero part. Where that is impossible, the answer goes to a
**sentinel**: a variable no stylesheet reads, which the generator does.

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

Radius is shared as a base value, each section multiplying it by a factor fixed
in `_defaults.scss` (`Container ×2`, everything else ×1) — exactly how
`--<section>-scale` already works for geometry. Every daisy theme is clean in
Basic; dahlia and cosmos need Advanced, as they already do for border and
shadow.

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

## The three checks still gate the build

`gen:classes`, `check:theme`, `gen:themes`, all three in `npm run build:css`.
A section that does not pass them is not done.

## Verification

A look is judged by rendering, not by compiling (`CLAUDE.md`). After each
section: `npm run dev`, then walk the components in a light and a dark theme
with hover / focus / disabled / checked. `node scripts/shoot-baseline.mjs
--out .shots/<name>` for the whole app.
