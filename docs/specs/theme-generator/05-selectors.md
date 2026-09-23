# 05 — Selectors

**Components** — `checkbox`, `radio`, `toggle`, `range`, `swatch`.
**Prefixes** — `selector`, `checkbox`, `radio`, `toggle`, `range`, `swatch`.
**Controls** — **13 in Basic**, 25 in Advanced.

From **67**. The name was confusing only because `tabs` was in here; it has
moved to Action, and what is left really is the five things you tick, drag and
pick. **The name `Controls` is forbidden** — it is the glossary's word for one
field of this form, and a project that deleted "family" over exactly this kind
of collision cannot introduce another.

## Where the 67 came from

The form exposed **both levels of the cascade**. The CSS already does
`var(--radio-checked-bg, var(--selector-checked-bg))`; the form asked the
section-level question *and* asked it again for radio, toggle, range and
swatch. Those per-component variables keep existing, keep being editable by
hand, and stop being questions.

A per-component control survives only where the component genuinely diverges:
`--range-trail-height` and `--toggle-corners`.

## Entries, in order

```
Size
▸ Unchecked   Background ▪ · Mark ▪
▸ Checked     Background ▪ · Mark ▪
▸ Corners     …                          ← shared
▸ Border      …                          ← shared
▸ Shadow      [None│Soft│Hard│Inset]
▸ Focus       …                          ← shared
▸ Slider      Track height · Track ▪ · Fill ▪
▸ Disabled    …                          ← shared
▸ Hand-drawn  …                          ← shared, LAST
```

### `selector-scale` — Size

number, `0.75`–`2`, step `0.05`, default `1`. Writes `--selector-scale`.

Grows the boxes you tick, the slider and the swatches. **Not the toggle's
travel**: its thumb needs room to move whatever the boxes do, so
`--toggle-size` stays derived and internal.

### ▸ Unchecked / ▸ Checked — both `layout: 'row'`

| Group | Control | Sources |
|---|---|---|
| Unchecked | `selector-bg` | `surface`, custom |
| Unchecked | `selector-mark` | `own`, `text` |
| Checked | `selector-checked-bg` | `semantic`, `own`, custom |
| Checked | `selector-checked-mark` | `own`, `text` |

Checked and unchecked are painted separately because most looks change
everything at once.

**bg vs mark**: `bg` is the box's fill, `mark` is the colour of the tick drawn
inside it. Two variables because daisy ticks in primary with a white mark and
sunflower ticks in white with a black one.

`mark` deriving from **Own** means the tick is legible without anyone setting
it: it reads the box's own fill and flips.

Each of these four writes the **section-level** variable only. `radio-*`,
`toggle-*`, `swatch-*` and `range-thumb-*` inherit through the cascade that
already exists, and go to `internal`.

### ▸ Shadow — type · not shared

Same as Field. `shadowVars('selector', …)`.

`--toggle-thumb-shadow`, `--range-thumb-shadow`, `--swatch-shadow` and
`--swatch-active-shadow` become `internal`, derived from this group.

### ▸ Slider — `layout: 'stack'`

| Control | | |
|---|---|---|
| `range-trail-height` | length, `0.1em`–`1em`, step `0.05` | the whole difference between daisy's fat bar and everyone else's thin rail |
| `range-track` | colour box, sources `text`, `surface` | |
| `range-fill` | colour box, sources `own`, `semantic` | |

**This is the proof the merge cost nothing structural.** The slider was the one
serious candidate for a structural variant — two geometries that looked like
different components — and it reduced to a single length. The trail is the
shadow the thumb casts; a `clip-path` cuts it to a band, and the band's height
is the entire difference.

Two classes ship alongside, so a project can hold both at once:

```scss
.range      { --range-trail-height: var(--range-default-trail); }
.range-thin { --range-trail-height: 0.25em; }
.range-fat  { --range-trail-height: var(--range-rail); }
```

The theme picks the project's default; the class overrides one instance. No
"default variant" mechanism to invent — the default **is** a variable, which is
how the whole kit already works.

**The track height is not shared with `progress`.** Feedback has its own Size,
and that is the per-section rule from `00-grammar.md`.

## internal

`selector-padding`, `selector-size`, `toggle-size`, `toggle-padding`,
`checkbox-mark-duration`, `range-rail`, `range-thumb-size`,
`range-thumb-halo`, `swatch-size`, `swatch-check-size`,
`swatch-transition-duration`, and the whole per-component second level.

Then run `node scripts/check-theme-vars.mjs` and paste what it still names.

## Traps

- **`.range` needs its own `border-radius`.** Without it, `overflow: hidden`
  cuts the trail into a rectangle and the rounded ends disappear. daisyUI
  rounds the trail through the control's own shape, and so must this.
- The trail's offset is
  `calc((var(--range-dir, 1) * -100cqw) - (var(--range-dir, 1) * var(--range-thumb-size) / 2))`.
  Drop the half-thumb term and a gap opens between the thumb and the trail.
- A radio's colour variant must paint the **ring**, not fill the box — a filled
  radio reads as unchecked.
