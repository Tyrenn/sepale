# 03 — Action

**Components** — `button`, `link`, `join`, `tabs`, `breadcrumbs`.
**Prefixes** — `action`, `link`, `tabs`.
**Controls** — **17 in Basic**, 31 in Advanced.

Renamed from "Buttons": the section is everything you click. `join` is
deliberately unthemed — it is geometry that reads its neighbours' corners.

## Entries, in order

```
Size
▸ Fill              Background ▪ · Text ▪
▸ Corners           Radius                       ← shared, in Common
▸ Border            …                            ← shared, in Common
▸ Typography        …                            ← shared, in Common
▸ Shadow            [None│Soft│Hard│Inset│Relief]
▸ Hover             Colour ▪
▸ Link              Colour ▪ · Underline · Weight
▸ Tabs              Idle ▪ · Active ▪
▸ Focus             …                            ← shared, in Common
▸ Disabled          …                            ← shared, in Common
▸ Press animation   [None│Sink│Push│Scale] · Amount · Duration
▸ Hand-drawn        …                            ← shared, in Common, LAST
```

*Press animation* is second to last and *Hand-drawn* last, in Basic and in
Advanced alike.

### `action-scale` — Size

number, `0.75`–`2`, step `0.05`, default `1`. Writes `--action-scale`.

Grows every frame a button has — height, padding, icon gap — and **never its
text**. The formulas stay in `_defaults.scss` as `calc(Nem * var(--action-scale))`.
Nobody edits a formula in a form. **Never shared**: the scale diverges across
sections in every theme measured.

### ▸ Fill — `layout: 'row'`

| Control | Sources | Default |
|---|---|---|
| `action-bg` | `surface`, `semantic`, custom | Derived from `surface-4` |
| `action-fg` | `own`, `text`, custom | Derived from Own, contrast |

A plain button is surface‑4 with ink that contrasts against it. Deriving the
text from *Own* means the fill can move without anyone re-checking the text.

### ▸ Shadow — type · **not shared**

| Mode | Controls |
|---|---|
| **None** | — |
| **Soft** | Edges · Offset (`2px`) · Blur (`6px`) · Colour ▪ |
| **Hard** | Edges · Offset (`0.25em`) · Colour ▪ — no blur, so the colour is a flat block; pair it with the Push press and the button moves into its own shadow |
| **Inset** | Edges · Offset (`2px`) · Blur (`4px`) · Colour ▪ |
| **Relief** | Amount, `0`–`1` — a retro edge tinted with the button's own fill. It resolves on the element, so only its amount is here |

Keep `shadowLayers()` / `shadowVars()` / `sidesOf()` from the current schema
unchanged; they are correct.

Shadow is **not** shared: buttons and panels legitimately want different
shadows, and the data agrees (15 / 19).

### ▸ Hover

One colour box, `action-hover`, sources `own`, `text`, `semantic`.

- **Derived from Own** → the automatic darken-or-lighten, direction from the
  fill's own lightness. This is what every flat look does, and it is now one
  setting rather than a Darken / Lighten choice.
- **Derived from Text** → dahlia's tint: the fill moves towards the text colour
  and keeps the theme instead of going grey.

**The press state derives from the hover**, as it does today: `press = hover ×
1.6`. A press identical to its hover reads as nothing having happened.

### ▸ Link — `layout: 'stack'`

| Control | | |
|---|---|---|
| `link-color` | colour box | sources `text`, `semantic` |
| `link-underline` | `[ None │ Always │ On hover ]` | → `--link-decoration`, `--link-hover-decoration` |
| `link-weight` | number `300`–`800` step `100` | → `--link-weight` |

`--link-underline-width` and `--link-underline-offset` go to `internal`;
`--link-focus-*` are written by Common's Focus group.

`breadcrumbs` reads this group for its shape and declares **no decoration
variables of its own** (it reads only `--base`, `--fontsize` and a scale
today). Its colour variants — `.breadcrumbs-primary` and friends — are
**classes, not theme controls**: the theme decides what a breadcrumb looks
like, the page decides which colour this one is. They go through `gen:classes`
like `.btn-primary`.

### ▸ Tabs — `layout: 'row'`

| Control | Sources |
|---|---|
| `tabs-idle` | `text`, `surface` |
| `tabs-active` | `own`, `semantic`, `text` |

**`tabs.scss` reads `--action-*` for its shape** — corners, border width,
weight, motion, press — and keeps only these two colours. It goes from
**22 variables to 4**. Reading another component's namespace without owning it
is the pattern ADR 0009 sanctions, and `validator.scss` already does it.

**Never `--action-bg`.** If a tab took the button's fill, every tab would
become a filled button and `tabs-lift` would die. The shape, not the fill.

The five structural variants (`tabs-box`, `tabs-lift`, `tabs-border`,
`tabs-top`, `tabs-bottom`) are classes and stay classes. They were classes
before any of this started.

### ▸ Press animation — second to last

| Mode | Controls | What moves |
|---|---|---|
| **None** | — | — |
| **Sink** | Depth (`0.5px`–`2px`) | `translateY`, shadow flattened |
| **Push** | *none* | translate equals the shadow's own offset, shadow → 0. It reads the Shadow group, so it needs no control |
| **Scale** | Amount (`0.92`–`1`, default `0.97`) | `scale()`, the Material / iOS standard |

Plus, for the whole group: `action-transition-duration`, number, `0`–`400`ms,
default `150`.

**The one rule that makes any of them read well: releasing takes twice as long
as pressing.** An instant press that relaxes slowly is what every good
implementation does; the reverse feels broken. Write it into the transition,
not into a control.

This is the only motion setting left in the entire generator.

## Writers

Keep from `actions-writers.ts`: the border shorthand, `shadowLayers`, and
`press(x, y, rotate, shadowScale)` — all four press shapes are those four
numbers differently filled.

Replace: the four `action-hover:*` writers collapse into the colour box, which
also writes the press mix at `× 1.6`.

Delete: `action-corner:radius` / `action-corner:wobble` (Common's Radius and
Hand-drawn own them now), and every `action-transition-easing` reference.

## internal

`action-gap`, `action-height`, `action-padding-x`, `action-letter-spacing`,
`action-soft-mix`, `action-tint`, `action-variant-border-width`,
`link-underline-width`, `link-underline-offset`, and the ~15 `tabs-*` that the
merge with `--action-*` leaves behind.

Then run `node scripts/check-theme-vars.mjs` and paste what it still names.
Do not guess this list.

## Traps

- `max(var(--action-border-width), 1px)` is **invalid** when the width is a
  four-value shorthand. That is what `--action-variant-border-width` exists for.
- A writer that reads `action-border-width` instead of `action-border` writes
  nothing, and the value it falls back to may equal the neutral one — so the
  diff hides the bug. Check the rendering, not the diff.
