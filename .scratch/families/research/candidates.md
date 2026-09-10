# Survey: candidate design languages for a u.u family

> Answers `.scratch/families/issues/01-survey-candidate-design-languages.md`.
> Twelve candidates, deliberately spread across visibly different styles.
> **No winner is picked here** — that is ticket 03, and it is the user's call.
>
> Every parameter set below was read from the library's own source or token
> files, not from a write-up about it. Links are to the exact file quoted.
> Nothing is copied: per `map.md`, a family is re-implemented from the look.

---

## What "fit" is measured against

Five tests, taken from what the code actually does today — not from an idea of
what it should do.

**1. Intrinsic sizing.** `button.scss` sets `--size: calc(2.5em * var(--scale))`
and `--btn-p: calc(1em * var(--scale))`; `size-variants` sets **only**
`--fontsize`; `base/default.scss` never sets a root font-size and there are no
breakpoints. So the test is not "is the library in px" — nearly all of them are
— but *"is the identity a **ratio** to the text, or an **absolute** number?"*
A 32px control on 14px text is 2.29em and converts cleanly. A 2px bevel stair,
a `- 3px` border compensation or a 1px hairline is absolute and does not.

**2. Colour vocabulary.** A theme supplies exactly three grounds
(`--color-surface-1` / `-high` / `-peak`), `--color-on-surface`, eight semantics
(`primary, secondary, accent, neutral, info, success, warning, error` —
`_config.scss`) and three radii (`--radius-field/box/selector`). Every
`--color-on-*` and `--color-border` is **derived** in `_derived-content.scss`
via `oklch(from …)` and `color-mix`, and is never themed. The test: does the
candidate fit in three grounds, and does it want per-state colours we derive
instead of store?

**3. Class names and variants.** Core class names are identical across families
(ADR 0007 keeps them renameable). Today's button variants are
`outline · dash · soft · ghost · link` plus colour, size and shape. A family
**may** add its own variant classes — but the mechanism is explicitly *not yet
specified* (`map.md`, "Not yet specified"). So "needs a family-specific
variant" is a real cost, not a free move.

**4. Painting through plumbing.** A skin assigns `--btn-bg` / `--btn-fg` /
`--btn-border` / `--btn-shadow`; it never re-declares `background-color`
(README rule 1). Recipes live on `:where(*)` as custom properties so they
recompute per element and per state (ADR 0006). State feedback — hover, press,
checked — belongs to the family; `base` owns only focus ring, disabled and
checked→seed.

**5. Primitives and the 90% floor.** We have `color-mix`, relative `oklch(from)`,
`box-shadow`, `@layer`, `translate`. We have no images, no bundled fonts, no
`filter: url()`, no JS. `::picker(select)` was already rejected on the 90% bar.

### The cost buckets, measured

`src/scss/components/` holds **25 component files** (the ticket says 23 — the
list has since grown; the numbers below are from the tree as it stands).

| bucket | count | components |
|---|---|---|
| **Needs a real skin** — carries a `skin-flat` mixin a new family must replace | **8** | button, input, select, textarea, file-input, checkbox, radio, toggle |
| **Rides the shadow/depth parameters** — reads `--shadow-light` / `--depth` directly, restyles for free when the family retunes them | **12** (4 not in the row above) | + chip, list, range, tab |
| **Parameters only** — colour and radius, nothing else | **13** | badge, breadcrumbs, dock, fieldset, join, label, link, loading, progress, radial-progress, skeleton, text, validator |

**Every candidate pays one cost in common.** `join`, `dock`, `radial-progress`,
`validator`, `skeleton` and the `chip`/`badge` split are DaisyUI-isms; *none*
of the twelve libraries below has an equivalent for all of them. Per `map.md`
("Every accepted component exists in every family"), the family must extend its
own art direction to cover them. Treat that as a flat ~6-component invention
tax on every row of the table, and stop using it to separate candidates.

---

## Comparison table

Legend — ✅ clean · ⚠️ possible with a decision · ❌ fights the contract.

| # | Candidate | Style | Identity in one phrase | Intrinsic | 3 grounds | Variants map | Primitives | Skins to write |
|---|---|---|---|---|---|---|---|---|
| 1 | [Material Design 3](#1-material-design-3) | Material, tonal | Tonal surface tint + state-layer overlay, 40dp pill buttons | ✅ | ⚠️ wants 5 | ⚠️ +1 (`elevated`) | ✅ | 8 |
| 2 | [Fluent 2](#2-fluent-2-microsoft) | Layered, soft depth | 4px radius, 1px stroke, tiny ambient/key shadow pair | ✅ | ❌ wants 8 | ✅ 4/5 | ✅ | 8 |
| 3 | [Carbon (IBM)](#3-carbon-ibm) | Industrial / editorial | **Radius 0**, 48px button with the label left and a 64px right gutter | ⚠️ | ✅ near-exact | ⚠️ +1 (`tertiary`) | ⚠️ font | 8 |
| 4 | [Ant Design 5](#4-ant-design-5) | Enterprise flat | 6px radius, 1px line, algorithmic token derivation | ✅ | ✅ | ✅ **5/5** | ✅ | 8 (thin) |
| 5 | [Radix Themes](#5-radix-themes) | Modern neutral | 12-step colour scales, 7 button variants, a global `scaling` knob | ✅ | ⚠️ 12 steps | ⚠️ +2 (`classic`, `surface`) | ✅ | 8 |
| 6 | [Geist (Vercel)](#6-geist-vercel) | Minimal monochrome | Achromatic 4-stop grey, 6px radius, one blue accent | ✅ | ✅ | ⚠️ −semantics | ⚠️ font | 8 (thin) |
| 7 | [Neobrutalism](#7-neobrutalism) | Neo-brutalist | 2px black border + `4px 4px 0 0` hard shadow that the hover *pushes into* | ✅ | ⚠️ wants 2 | ❌ +2, −3 | ✅ | 8 |
| 8 | [98.css / 7.css](#8-98css--7css) | Skeuomorphic retro OS | Two-tone inset bevel stair, no radius, 11px bitmap font | ❌ | ⚠️ fixed palette | ❌ has none | ❌ font | 8 (heavy) |
| 9 | [WebTUI](#9-webtui) | Terminal / TUI | Character-cell layout in `ch`/`lh`, borders drawn as box characters | ✅✅ | ⚠️ wants 4+3 | ❌ +2, −4 | ⚠️ font | 8 |
| 10 | [PaperCSS](#10-papercss) | Hand-drawn | Six asymmetric elliptical border-radii + a marker-pen 2px border | ⚠️ | ⚠️ wants 2 | ⚠️ +1, −2 | ⚠️ font | 8 |
| 11 | [Glassmorphism / Liquid Glass](#11-glassmorphism--apple-liquid-glass) | Glass | Translucent fill + `backdrop-filter: blur()` + 1px specular rim | ✅ | ⚠️ alpha grounds | ⚠️ −2 | ⚠️ real refraction ❌ | 8 |
| 12 | [Claymorphism](#12-claymorphism) | Soft inflated plastic | Huge radius + one big outer shadow + two opposed inner shadows | ✅ | ✅ | ❌ −3 | ✅ | 8 |

"Skins to write" is 8 for every candidate by construction — that is the count of
components carrying a `skin-flat`. What differs is how *thin* each one is, and
that is called out per candidate.

---

## 1. Material Design 3

**Source.** [`material-components/material-web/tokens`](https://github.com/material-components/material-web/tree/main/tokens)
— `_md-sys-shape.scss`, `_md-sys-elevation.scss`, `_md-sys-state.scss`, and
the generated values under `tokens/versions/v0_192/`.

**The look in one screenshot.** Fully-rounded 40dp pill buttons on a page whose
panels are *tinted with the accent colour* rather than shadowed; a soft
translucent wash appears under the cursor rather than a colour change.

### What carries its identity

- **Tonal elevation.** M3 raises a surface by moving it up a *tonal* ramp, not
  by casting a shadow — hence `surface-container-lowest / low / (default) /
  high / highest`, five neutral grounds each carrying a trace of the accent hue.
  Shadow is secondary and often absent.
- **The state layer.** Hover, focus and press are a translucent overlay of the
  *content* colour at fixed opacities — verbatim from `_md-sys-state.scss`:
  `hover 0.08`, `focus 0.12`, `pressed 0.12`, `dragged 0.16`.
- **The shape scale**, from `_md-sys-shape.scss` (v0.192): `none 0px`,
  `extra-small 4px`, `small 8px`, `medium 12px`, `large 16px`,
  `extra-large 28px`, `full 9999px`. Buttons take `full`; cards take `medium`.
- Elevation is six named levels, `level0`…`level5`, and the source notes that
  *"elevation levels on web should use the level number, not the dp value."*

### Its parameter set

Seed colour (+ optional secondary/tertiary) → a generated tonal palette → the
`md-sys-color` roles; a shape scale; six elevation levels; four state-layer
opacities; a typescale; motion easing/duration tokens.

### Fit against our family contract

- **Sizing — ✅.** A filled button is 40dp on a 14sp label ≈ **2.86em**, against
  our current `2.5em`. Nothing in M3's identity is an absolute pixel: the shape
  scale is the only px table and buttons use `full` anyway. Converts cleanly.
- **Colours — ⚠️.** M3 wants five neutral grounds; we ship three. Two honest
  ways out: map `surface-container-low/high/highest` onto our three and derive
  the two extras with `color-mix`, or expose a family parameter
  `--m3-tint` and generate all five from `--color-surface-1` + `--color-primary`.
  The second is the more M3-faithful and is pure `color-mix` — cheap. Our
  derived `--color-on-*` is *ideologically identical* to M3's `on-*` roles, so
  that half is free.
- **Variants —** `filled` → default `.btn` + colour; `filled-tonal` →
  **`.btn-soft`** (near-exact); `outlined` → **`.btn-outline`**; `text` →
  **`.btn-ghost`**. `elevated` has no equivalent and needs a family class.
  `.btn-dash` and `.btn-link` have no M3 counterpart and should be dropped —
  and per README §2 that omission gets justified in the file header.
- **Primitives — ✅.** The state layer is `color-mix(in oklab, currentColor 8%,
  …)` on `--btn-bg`; no pseudo-element required, so it composes with every
  variant. `button.ripple` already exists as an opt-in mixin.

### Rough cost

Cheapest of the twelve on paint. `poppy` is already a Material *flavour*, so
much of the elevation work is done. The real work is (a) the tonal ramp, and
(b) replacing hover-darkens-by-7% with state-layer opacities across the 8
skinned components. **Caveat: this is the slot `poppy` occupies.** Retaining it
means replacing poppy with a stricter version of poppy, which buys the least
architectural stress of any candidate here.

---

## 2. Fluent 2 (Microsoft)

**Source.** [`microsoft/fluentui/packages/tokens/src`](https://github.com/microsoft/fluentui/tree/master/packages/tokens/src)
— `global/borderRadius.ts`, `global/strokeWidths.ts`, `global/spacings.ts`,
`global/curves.ts`, `alias/lightColor.ts`.

**The look in one screenshot.** Quiet, low-contrast panels with 4px corners, a
1px neutral stroke, and a shadow so small you read it as a crease rather than a
lift.

### What carries its identity

- **Restraint in the radius**: `borderRadiusMedium: '4px'` is the workhorse of
  an eleven-step scale (`None 0`, `Small 2px`, `Medium 4px`, `Large 6px`,
  `XLarge 8px`, `2XLarge 12px` … `6XLarge 40px`, `Circular 10000px`).
- **Stroke as a first-class token**: `strokeWidthThin 1px`, `Thick 2px`,
  `Thicker 3px`, `Thickest 4px` — the 2px underline on a focused field is a
  Fluent signature.
- **Paired shadows**: an *ambient* and a *key* shadow, each with its own colour
  token (`colorNeutralShadowAmbient`, `colorNeutralShadowKey`, plus `Lighter`
  and `Darker` pairs) — a two-light model, not one.
- **A nine-curve motion table** (`curveAccelerateMax/Mid/Min`,
  `curveDecelerate*`, `curveEasyEase`, `curveLinear`).

### Its parameter set

A brand ramp of 16 stops feeding a generated alias set; the 11-step radius
scale; 4 stroke widths; an 11-step spacing scale (`2, 4, 6, 8, 10, 12, 16, 20,
24, 32px` + none, split into Horizontal/Vertical); durations; 9 curves.

### Fit against our family contract

- **Sizing — ✅.** A medium Button is 32px on 14px text ≈ **2.29em**. The
  spacing table is a fixed px ladder but it is *scale*, not identity.
- **Colours — ❌ the sticking point.** `alias/lightColor.ts` declares **184
  distinct colour tokens** before the shared/status ramps in other files, and
  the neutral grounds alone run `colorNeutralBackground1`…**`8`**, each with
  `Hover` / `Pressed` / `Selected` siblings, and foregrounds `1`…`5`. Fluent
  *stores* every state colour; we *derive* them (`_derived-content.scss`) and
  the whole point of that is that "contrast cannot drift out of sync"
  (CONTEXT.md). Porting Fluent honestly means either abandoning eight grounds
  for three, or asking a theme author for ~30 more values — which ADR 0005
  makes a per-family, ~35-theme cost.
- **Variants —** `primary` → colour variant; `outline` → **`.btn-outline`**;
  `subtle` → **`.btn-ghost`**; `transparent` → a quieter ghost (fold into it);
  `secondary` is the default `.btn`. Four of five map with no new class. No
  `dash`, no `soft` — drop both.
- **Primitives — ✅.** Two-light shadows are exactly what `--shadow-light`
  already models (it is already a two-shadow recipe); the nine curves reduce to
  the two or three we would actually use.

### Rough cost

Paint is trivial — Fluent is 4px radius, 1px stroke, tiny shadow, which our
existing parameters express almost as-is. The cost is entirely in the colour
model, and it is the *only* candidate where the colour model, rather than the
look, is the reason to say no.

---

## 3. Carbon (IBM)

**Source.** [`carbon-design-system/carbon`](https://github.com/carbon-design-system/carbon)
— `packages/styles/scss/components/button/_vars.scss`,
`packages/themes/src/dtcg/white.json`, `packages/themes/src/tokens/layout.ts`.

**The look in one screenshot.** Absolutely square corners, IBM Plex, and a
button whose label sits hard against the left edge with a wide empty gutter on
the right where an icon may or may not be.

### What carries its identity

Read straight off `_vars.scss`:

```
$button-border-radius: 0;
$button-height:        3rem;      /* 48px */
$button-font-size:     0.875rem;  /* 14px */
$button-padding: calc(0.875rem - 3px) calc($spacing-10 - 1px)
                 calc(0.875rem - 3px) calc($spacing-05 - 1px);
$button-font-weight: 400;
```

- **Radius 0.** Not "small" — zero, everywhere.
- **The asymmetric button.** 16px of padding on the leading side, **64px** on
  the trailing side. The label is left-aligned, never centred. This single rule
  is the most recognisable thing in the system.
- **A 2px focus inset**, and the `- 3px` / `- 1px` compensations above exist
  purely so borders and focus rings do not change the box size.
- **IBM Plex Sans** at 400 weight, on a strict 8px grid (`spacing-01` …
  `spacing-13`).

### Its parameter set

A layered token set — `white.json` gives `background`, `layer-01/02/03` (each
with `hover-`, `active-`, `selected-`), `field-01/02/03`,
`border-subtle-00…03`, `border-strong-01…03`, plus four shipped themes
(`white`, `g10`, `g90`, `g100`). Layout tokens are `spacing-01…13`,
`container-01…05`, `icon-size-01/02`.

### Fit against our family contract

- **Sizing — ⚠️.** The dimensions convert (48/14 = **3.43em**), but the identity
  does not live in the dimensions: it lives in the *ratio between two spacing
  steps* (16px vs 64px) and in px-precise `- 3px` compensations. Made em-based,
  the 4:1 gutter survives; the pixel compensations become meaningless and would
  have to be re-derived against `--border`. Doable, and it is the one candidate
  where "does it survive intrinsic sizing" needs a real answer rather than a
  shrug.
- **Colours — ✅, the best match of the twelve.** Carbon's `background` /
  `layer-01` / `layer-02` / `layer-03` **is** our
  `surface` / `-high` / `-peak` model with one spare level; and Carbon keeps a
  separate `field-01`, which is precisely CONTEXT.md's *"the inside of fields —
  a field is a hole cut in the page"*. Two systems arrived at the same idea
  independently. `border-subtle` / `border-strong` maps onto `--color-border`
  plus one family variable.
- **Variants —** kinds are `primary, secondary, tertiary, ghost, danger,
  danger--primary, danger--ghost, danger--tertiary`
  (`packages/react/src/components/Button/Button.tsx`). `tertiary` is an
  outline-with-inverting-hover → close to **`.btn-outline`** but the hover
  inverts fill and text, which our outline does not do — either restyle outline
  in-family or add `.btn-tertiary`. `ghost` → **`.btn-ghost`**. `danger*` are
  our `error` colour variant crossed with the others, so they cost nothing.
  `dash` and `soft` have no Carbon counterpart — drop.
- **Primitives — ⚠️.** Nothing exotic in CSS. But **IBM Plex is load-bearing**;
  Carbon in a system font stack reads as generic. See the typeface finding below.

### Rough cost

Paint is genuinely cheap — radius 0, one hairline, no shadows at all means many
of the 8 skins collapse to two or three lines. The expense is elsewhere: the
button geometry has to be re-derived em-first, and the family header has to
explain how it ships without Plex.

---

## 4. Ant Design 5

**Source.** [`ant-design/ant-design`](https://github.com/ant-design/ant-design)
— `components/theme/themes/seed.ts`, `components/button/buttonHelpers.tsx`,
and [the theme customisation docs](https://ant.design/docs/react/customize-theme).

**The look in one screenshot.** Dense enterprise forms: 6px corners, 1px
`#d9d9d9` lines, one saturated blue, and a wave that pulses outward from a
clicked button.

### What carries its identity

Less the pixels than **the derivation**. Ant is the only candidate here whose
theming is an *algorithm*: Seed → Map → Alias. Change `colorPrimary` and ten
palette steps and dozens of alias tokens recompute. Three shipped algorithms —
`defaultAlgorithm`, `darkAlgorithm`, `compactAlgorithm` — and they compose.

Seed defaults, verbatim from `seed.ts`:

```
colorPrimary: '#1677ff'   fontSize: 14      lineWidth: 1
borderRadius: 6           sizeUnit: 4       sizeStep: 4
controlHeight: 32         wireframe: false  focusOutline: true
motionUnit: 0.1           motion: true
```

### Its parameter set

The richest and best-documented of the twelve: colour seeds, `fontSize`,
`borderRadius`, `controlHeight`, `sizeUnit` / `sizeStep`, `lineWidth`,
`motionUnit`, plus two identity switches — **`wireframe`** (flat vs outlined
rendering) and **`motion`** (all animation off).

### Fit against our family contract

- **Sizing — ✅.** `controlHeight: 32` over `fontSize: 14` = **2.29em**, and
  Ant's own size steps are `controlHeight ± 8`, i.e. a ratio, not a table. This
  is the most naturally intrinsic of the mainstream systems.
- **Colours — ✅.** Two grounds in practice (`colorBgContainer`,
  `colorBgLayout`) plus an elevated popup ground; three is enough. Ant *derives*
  its state colours from the seed (`colorPrimaryHover` etc.) exactly the way
  `_derived-content.scss` derives ours — same philosophy, so a theme stays at
  our three-grounds budget.
- **Variants — ✅ 5/5, and this is the survey's biggest single finding.**
  `buttonHelpers.tsx` declares the variant axis as:
  ```
  ['outlined', 'dashed', 'solid', 'filled', 'text', 'link']
  ```
  Against ours — `outline`, `dash`, (default solid), `soft`, `ghost`, `link` —
  that is a one-to-one match including **`dashed`**, the variant that looks most
  arbitrary in our set. Ant's shapes (`default, circle, round, square`) also
  land on `btn-circle` / `btn-square`. Zero family-specific classes needed.
- **Primitives — ✅.** The click wave is `button.ripple`, already opt-in.
  `wireframe` and `motion` would be genuine u.u *parameters*, which is exactly
  what README §1 asks a family to look for.

### Rough cost

The lowest-risk port of the twelve, and the one that most exercises the
*parameter* lever rather than the skin lever — `wireframe` alone restyles all
8 skinned components from one boolean. The counter-argument is aesthetic, not
technical: Ant sits in the same visual band as `daisy` (flat, hairline, 6px
radius), so retaining it may not buy the "visibly different" spread the map
asks for.

---

## 5. Radix Themes

**Source.** [`radix-ui/themes`](https://github.com/radix-ui/themes) —
`src/components/theme.props.tsx`, `src/props/radius.prop.ts`,
`src/styles/tokens/radius.css`, `src/styles/tokens/scaling.css`,
`src/components/_internal/base-button.props.ts`.

**The look in one screenshot.** Balanced, low-chroma panels where the same
button appears in seven perceptibly different weights, and everything sits on a
12-step colour scale that stays legible in both themes.

### What carries its identity

- **The 12-step scale.** Every colour is a ramp with fixed semantic steps
  (backgrounds 1–2, interactive 3–5, borders 6–8, solid 9–10, text 11–12).
  Identity lives in *which step* an element takes, not in a hex value.
- **Seven button weights** — see below — which is more graded than any other
  candidate here.
- **A global geometry multiplier.** `scaling.css` maps `90% → --scaling: 0.9`
  through `110% → 1.1`, and `radius.css` writes every radius as
  `calc(Npx * var(--scaling) * var(--radius-factor))`.

### Its parameter set

From `theme.props.tsx`, verbatim:

```
appearance:       'inherit' | 'light' | 'dark'
accentColor:      (27 scales)                grayColor: (+ 'auto')
panelBackground:  'solid' | 'translucent'    default 'translucent'
radius:           'none' | 'small' | 'medium' | 'large' | 'full'   default 'medium'
scaling:          '90%' | '95%' | '100%' | '105%' | '110%'         default '100%'
```

and `radius.css` implements the radius prop as a single `--radius-factor`
(`none 0`, `small .75`, `medium 1`, `large 1.5`, `full 1.5 + --radius-full 9999px`)
over a six-step base ladder `3, 4, 6, 8, 12, 16px`.

### Fit against our family contract

- **Sizing — ✅, with a warning worth reading twice.** Radix's `--scaling` is
  our `--scale` — the same idea, the same name, arrived at independently. But
  the prop doc says it *"sets a scaling multiplier for values like spacing,
  **font sizes**, line heights"*, and our non-negotiable is the opposite:
  "**`--scale` grows frames, never text**". Radix scales the text; we refuse to.
  The port therefore keeps the *mechanism* and rejects the *scope* — and a
  reader who knows Radix will try to "fix" that. Worth a line in the family
  header if this one is retained.
- **Colours — ⚠️.** Twelve steps versus our three grounds + derivation. Steps
  1–2 are our `surface`/`-high`, 3–5 are hover/active states we compute with
  `color-mix`, 6–8 are `--color-border`, 9–10 are the semantic solid, 11–12 are
  `--color-on-*`. The mapping is clean *conceptually*; the risk is that Radix's
  quality comes from those steps being hand-tuned per hue, and our `color-mix`
  approximation will be visibly flatter.
- **Variants — ⚠️ +2.** `base-button.props.ts` declares
  `['classic', 'solid', 'soft', 'surface', 'outline', 'ghost-offset', 'ghost']`.
  **`soft`, `outline`, `ghost` are ours by name**; `solid` is our default.
  `classic` (a subtle top-highlight/bottom-edge 3D) and `surface` (tinted fill
  *plus* border) need family classes. `ghost-offset` is a layout nicety, fold
  into ghost. `dash` and `link` have no Radix counterpart. Net: +2 new, −2 dropped.
- **Primitives — ✅.** `panelBackground: translucent` is `color-mix` + an
  optional `backdrop-filter`; nothing exotic.

### Rough cost

Middling and predictable. The interesting part is that Radix is the candidate
that most *validates* our architecture — a radius factor, a global scale, a
variant axis — while disagreeing with us on the one rule (`--scale` and text)
we wrote a non-negotiable about.

---

## 6. Geist (Vercel)

**Source.** [Geist design system](https://vercel.com/geist/introduction) and
[Colors](https://vercel.com/geist/colors).

**The look in one screenshot.** Near-monochrome. Black on white, one blue, 6px
corners, thin hairlines, and the Geist typeface doing most of the work.

### What carries its identity

- **Achromaticity as a rule.** The interface operates in a 4-stop grey
  (`#FAFAFA → #F2F2F2 → #EBEBEB → #171717`) with a single interactive blue
  (`#0072F5`) reserved for links, focus rings and the skip-link — *and nowhere
  else*.
- **6px on functional UI, 12px on cards, `9999px` only on badges and tags.**
  The pill is rationed, which is what stops it reading as generic.
- **Two backgrounds only**, and the docs say Background 2 is for use "sparingly".
- **The Geist typeface** (Sans + Mono), designed for developer tooling; a 4px
  gap grid from 4px to 256px.

### Fit against our family contract

- **Sizing — ✅.** Nothing here is absolute; the whole system is thin lines and
  a small radius, both of which we already parameterise.
- **Colours — ✅ but subtractive.** Two grounds fits inside three trivially.
  The friction is the opposite of everyone else's: Geist's identity is that it
  **refuses** eight semantics. A `.btn-secondary` in accent pink is not Geist.
  Retaining it means either shipping the eight semantics and watching a theme
  destroy the look, or documenting that this family expects near-neutral themes
  — which collides with ~35 shipped themes per family (ADR 0005).
- **Variants — ⚠️.** Vercel's buttons are `primary / secondary / tertiary /
  error / warning` — a *colour* axis, not a fill axis. Our `outline` and `ghost`
  fit; `soft` and `dash` have no place. Nothing new is needed, but three of ours
  become dead weight.
- **Primitives — ⚠️.** Geist Sans is a large part of the recognition, same
  problem as Carbon.

### Rough cost

The cheapest paint of all twelve — arguably a two-hour port. But it is also the
smallest *distance* from `daisy`: hairline, small radius, flat, no elevation.
Judged against the map's "three unlike art directions are what stress the
architecture", this candidate stresses nothing. Its real value here is as a
control: it shows what "cheap" looks like, so the others can be priced against it.

---

## 7. Neobrutalism

**Source.** [`ekmas/neobrutalism-components`](https://github.com/ekmas/neobrutalism-components)
(~5.4k stars) — `src/styling/globals.css`, `src/components/ui/button.tsx`.

**The look in one screenshot.** Saturated flat blocks with a thick black
outline and a solid black shadow offset down-right with no blur, as if the
element were a sticker peeling off the page.

### What carries its identity

Verbatim from `globals.css`:

```
--border-radius: 5px;
--box-shadow-x: 4px;   --box-shadow-y: 4px;
--shadow: var(--box-shadow-x) var(--box-shadow-y) 0px 0px var(--border);
--border: oklch(0% 0 0);        /* black — in the dark theme too */
--base-font-weight: 500;        --heading-font-weight: 700;
```

- **A 2px border and `4px 4px 0 0` shadow** — zero blur, zero spread, pure
  black. That is the whole identity.
- **The press.** From `button.tsx`: the default variant is
  `shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY
  hover:shadow-none` — on hover the element *slides into its own shadow*. The
  `reverse` variant does the inverse: it starts flat and grows the shadow.
- **Only two grounds**: `--background` and `--secondary-background`.
- **The border is black in both themes.** Not "derived from the surface" —
  literally `oklch(0% 0 0)` in `:root` and in `.dark`.

### Fit against our family contract

- **Sizing — ✅ for the frame, ⚠️ for the shadow.** Heights are Tailwind's
  `h-9/h-10/h-11`, incidental. But is a 4px offset a ratio or an absolute? Both
  readings are defensible: `0.25em 0.25em` scales with the text and keeps the
  proportion; a flat `4px` keeps the "sticker" reading at every size. This is a
  genuine art-direction decision, not a mechanical conversion, and it is the
  clearest example in this survey of a look where **the family must choose**.
- **Colours — ⚠️ and pointed.** Two grounds, fine. The problem is
  `--color-border`: ours is *derived* as a 10% wash of `--color-on-surface`
  (`_derived-content.scss`), and neobrutalism needs it opaque black regardless
  of theme. That is legal — the derivation lives on `:where(:root)` precisely so
  "a family like wireframe can still set `--color-border` outright" — but it
  means this family overrides a *derived* value, which no current family does.
  Worth confirming that is intended before it ships.
- **Variants — ❌ the worst mapping here.** `button.tsx` gives
  `default / noShadow / neutral / reverse`. `noShadow` and `reverse` are both
  family-specific classes with no analogue. `neutral` is our default `.btn`.
  Meanwhile **`soft`, `dash` and `link` are meaningless** in a language built on
  a hard black outline, and even `outline` is degenerate — everything already
  has a 2px border. Realistically: −3 dropped, +2 new, 1 redefined.
- **Primitives — ✅.** `translate` is already used by `skin-flat`'s press; the
  shadow is one `box-shadow`; no gradients, no textures, no fonts.

### Rough cost

Paint is *trivially* cheap — arguably the cheapest CSS in the survey, since
there are no gradients, no blurs and no elevation maths. The cost is entirely
in the variant question: this candidate, more than any other, forces the map's
deferred decision ("How a family declares its own variant classes") to be made
before it can ship. That may be a reason to retain it rather than avoid it.

---

## 8. 98.css / 7.css

**Source.** [`jdan/98.css`](https://github.com/jdan/98.css) — `style.css`
(same author ships `XP.css` and `7.css`).

**The look in one screenshot.** Windows 98. Grey `#c0c0c0`, square corners, and
every control drawn as a two-tone bevel — light on the top-left, dark on the
bottom-right — that inverts when pressed.

### What carries its identity

The bevel, and it is built entirely out of nested `inset` shadows:

```
--border-raised-outer: inset -1px -1px var(--window-frame),
                       inset  1px  1px var(--button-highlight);
--border-raised-inner: inset -2px -2px var(--button-shadow),
                       inset  2px  2px var(--button-face);
--border-sunken-outer: … (the same, flipped)
--border-field:        inset -1px -1px var(--button-highlight),
                       inset  1px  1px var(--button-shadow),
                       inset -2px -2px var(--button-face),
                       inset  2px  2px var(--window-frame);
```

and the button itself:

```
border: none;  border-radius: 0;
box-shadow: var(--border-raised-outer), var(--border-raised-inner);
min-width: 75px;  min-height: 23px;  padding: 0 12px;  font-size: 11px;
color: transparent;  text-shadow: 0 0 var(--text-color);
```

Note the last line: the label is drawn as a *text-shadow* on transparent text,
a trick to defeat sub-pixel antialiasing. And `-webkit-font-smoothing: none`
with a bundled `Pixelated MS Sans Serif` woff.

### Fit against our family contract

- **Sizing — ❌, and this is the one clear failure in the survey.** 23px on 11px
  text is 2.09em, so the *box* converts. The **bevel does not**. A 1px/2px inset
  stair is an absolute four-step ramp; at `0.09em` it produces sub-pixel bands
  that blur, and at `--scale: 2` it becomes a chunky frame that is no longer
  Windows 98. The identity is pinned to device pixels. A family could ship the
  bevel in fixed px while sizing the box in em — the README explicitly allows a
  value to "stay absolute when it answers to the screen" — but four nested
  hairlines is a strained reading of that clause.
- **Colours — ⚠️.** Three grounds is fine (`surface`, `button-face`,
  `button-highlight` map neatly), but the palette is *not themeable* in any real
  sense: `#c0c0c0` **is** the design. Eight semantics are meaningless; Windows 98
  had no `.btn-warning`.
- **Variants — ❌ none exist.** There is one button, plus a `default` (thicker
  outline) state. `outline`, `dash`, `soft`, `ghost`, `link` all have to go, and
  nothing replaces them.
- **Primitives — ❌.** The bitmap font is not decoration: without
  `Pixelated MS Sans Serif` and `-webkit-font-smoothing: none`, the look is
  gone. Our bundle ships CSS, not font files.

### Rough cost

High and *strange* rather than merely high — the 8 skins are small but each is a
hand-tuned inset ramp, and the parameter-only components stop being
parameter-only (a `progress` bar in this language is a row of segmented blocks,
not a rounded track). Include it in the survey because it is the sharpest test
of "does intrinsic sizing hold" — and the honest answer for this one is *no*.

---

## 9. WebTUI

**Source.** [`webtui/webtui`](https://github.com/webtui/webtui) (~2.4k stars) —
`packages/css/src/base.css`, `packages/css/src/components/button.css`.

**The look in one screenshot.** A terminal. Monospace everywhere, borders drawn
from box-drawing characters, no radius, no shadow, and controls that snap to a
character grid.

### What carries its identity

- **The character cell.** Padding is `0 2ch`, heights are `1lh` and `3lh`. Not
  em, not px — *character widths and line heights*. Every measurement is a count
  of glyphs.
- **Borders as text.** The `[box-]` attribute draws a frame out of box-drawing
  characters rather than `border`.
- **Inversion as feedback.** Press swaps foreground and background
  (`&:active { --mapped-primary: var(--mapped-secondary); … }`); focus is
  `font-weight: bold` plus `text-decoration: underline`; disabled is
  `text-decoration: line-through`. No colour ramps, no shadows, no motion.
- A four-ground / three-foreground palette: `--background0…3`,
  `--foreground0…2`, plus first-party `theme-catppuccin`, `theme-gruvbox`,
  `theme-everforest` packages.

### Fit against our family contract

- **Sizing — ✅✅, the only candidate that is *more* intrinsic than we are.**
  `ch` and `lh` are font-relative in exactly the way `em` is, and stricter: they
  follow the *metrics* of the chosen face. This one does not need converting; it
  needs *un*-converting, since our `--scale` (grow the frame, not the text)
  makes no sense on a grid where the frame is *made of* text. Expect
  `--scale` to be inert or dropped for this family, which is itself a useful
  stress test of the architecture.
  One conflict to note: `base.css` sets `--font-size: 16px` on `:root` and
  applies it to `html, body` — our non-negotiable is that "`base.css` never sets
  a root font-size". That is a re-implementation choice, not a blocker.
- **Colours — ⚠️.** Four grounds and three foregrounds against our three and
  one. `--background3` can be `color-mix`ed; `--foreground1/2` are exactly what
  a "muted" derivation gives. The eight semantics survive as the ANSI colours,
  which is arguably a *better* fit than most candidates here (terminals have had
  eight colours since 1979).
- **Variants — ❌ +2, −4.** WebTUI's axes are `[box-]` (framed vs filled),
  `[variant-='foreground0'…]` (which palette slot) and `[size-=small|default|large]`.
  `[box-]` is close to **`.btn-outline`** and would map onto it.
  `soft`, `dash`, `ghost`, `link` have no terminal analogue. A `.btn-box` style
  for character-drawn frames is a genuine family class.
- **Primitives — ⚠️.** Needs a monospace face — but unlike Carbon or Geist,
  `font-family: monospace` is a *system* stack and costs the bundle nothing.
  Box-drawing characters are Unicode, not assets. So this is the one
  typeface-dependent candidate that does not need a font file.

### Rough cost

Moderate, and unusually *even* — nearly every component is rethought (a
`radial-progress` becomes a spinner of `|/-\`, a `toggle` becomes `[ ]`/`[x]`),
but each rethink is five lines of CSS with no shadow or gradient maths. This is
the candidate furthest from `daisy` in appearance while remaining almost
trivial in CSS, and the one whose sizing model would most sharply interrogate
our own.

---

## 10. PaperCSS

**Source.** [`papercss/papercss`](https://github.com/papercss/papercss)
(~4.2k stars) — `src/core/_mixins.scss`, `src/core/_config.scss`,
`src/components/_buttons.scss`.

**The look in one screenshot.** A napkin sketch. Every box is a slightly wonky
hand-drawn rectangle with a marker-pen outline, set in a handwriting face.

### What carries its identity

**Six hardcoded asymmetric elliptical radii.** From `_mixins.scss`:

```scss
@mixin border-style($style: 1) {
  @if $style == 1 {
    border-bottom-left-radius:  15px 255px;
    border-bottom-right-radius: 225px 15px;
    border-top-left-radius:     255px 15px;
    border-top-right-radius:    15px 225px;
  }
  /* …styles 2–6, each a different set of ratios */
}
```

Each corner gets a *two-value* radius with wildly different horizontal and
vertical components; the huge value flattens that corner to near-straight while
its neighbour curves, and the asymmetry across the four corners is what reads as
"drawn by hand". Rotating between six variants is what stops every box on the
page looking identically wonky.

Plus: `border-width: 2px` in the primary ink colour (`#41403e` — a warm
near-black, not `#000`), a soft skewed drop shadow, and
**Neucha + Patrick Hand SC** loaded from Google Fonts.

### Fit against our family contract

- **Sizing — ⚠️.** `font-size: 1rem; padding: 0.75rem` and size variants that
  change *both* font-size and padding (`btn-large`: `2rem` / `1rem`) — our size
  variants change only `--fontsize`, so padding must become `em`. Fine. The
  elliptical radii are the interesting case: the effect depends on one axis
  being far larger than the element, so scaling both numbers with `em` actually
  *preserves* the wobble. Converts better than it looks.
- **Colours — ⚠️.** Two grounds and a fixed ink colour. The eight semantics
  exist (`$primary`…`$muted`, each with `-light` and `-dark` derivations), which
  matches our shape; but Paper's palette is muted-by-construction and a
  saturated theme will look wrong.
- **Variants — ⚠️.** Paper has filled/outline/`btn-block`/`btn-large|small`.
  `outline` maps; `ghost` roughly maps; `soft` maps to the `-light` fills;
  `dash` and `link` are meaningless. The one real family class is a
  **`.paper-shape-1…6`** selector (or an `:nth-child()` rotation) to vary the
  wonk — a variant *mechanism* nothing else in this survey needs.
- **Primitives — ⚠️.** `_config.scss` `@import`s Google Fonts by URL. Our bundle
  cannot do that without adding a network dependency to a CSS kit that has none.
  Handwriting is not optional to this look.

### Rough cost

Paint is moderate; the honest blocker is typography, and it is worse here than
for Carbon or Geist because there is no acceptable system fallback for
"handwriting". A family header would have to say: *this family assumes you load
Patrick Hand yourself*, which is a first for the project.

---

## 11. Glassmorphism / Apple Liquid Glass

**Source.** MDN/BCD for
[`backdrop-filter`](https://github.com/mdn/browser-compat-data/blob/main/css/properties/backdrop-filter.json);
[CSS-Tricks, "Getting Clarity on Apple's Liquid Glass"](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/);
[w3c/svgwg#1142](https://github.com/w3c/svgwg/issues/1142) on interoperable
backdrop displacement.

**The look in one screenshot.** Frosted panels that let a blurred, brightened
version of the page show through, edged with a 1px light rim.

### What carries its identity

Two very different things wear the same name, and the difference decides this
candidate:

- **Classic glassmorphism** — a semi-transparent fill, `backdrop-filter:
  blur() saturate()`, a 1px `rgba(255,255,255,.5)` rim and an inset top
  highlight. All plain CSS.
- **Apple's actual Liquid Glass** — *refraction*: the backdrop is spatially
  displaced through an SVG `<feDisplacementMap>` (red channel = horizontal
  offset, green = vertical, `color-interpolation-filters="sRGB"` mandatory),
  often with three staggered passes recombined via `feBlend mode="screen"` for
  chromatic aberration at the rim, plus a baked specular highlight.

### Fit against our family contract

- **Sizing — ✅.** Blur radius and rim are the only geometry, and both scale.
- **Colours — ⚠️.** Glass needs its grounds to carry *alpha*
  (`color-mix(in oklab, var(--color-surface-1) 60%, #0000)`), which our three
  grounds can express, but it also needs the page behind them to be visually
  interesting or the effect is invisible. A glass family on a flat white theme
  looks like a flat white family. That is a *showcase* problem as much as a CSS
  one — `iris` was deleted once already.
- **Variants — ⚠️.** `outline` and `ghost` survive; `soft` collapses into the
  default (everything is already translucent); `dash` and `link` are noise.
- **Primitives — the decisive point.** `backdrop-filter` itself is fine:
  Chrome 76, Edge 79, Firefox 103, Safari (earlier prefixed) — comfortably past
  our 90% floor. But **`backdrop-filter: url(#filter)` — the SVG-filter
  reference that produces actual refraction — is Chromium-only**; Safari and
  Firefox silently ignore that value and fall back to the previous declaration.
  There is no interoperable spec yet (svgwg#1142 is open). So the 90% rule
  admits classic glassmorphism and **excludes Liquid Glass proper**. Anything
  advertised as "Liquid Glass" would in practice ship as frosted glass with a
  Chromium-only bonus, which is precisely the kind of claim the `::picker(select)`
  decision already rejected.

### Rough cost

Low-to-moderate paint; the 8 skins are one translucent fill recipe and one rim.
The risk is not cost, it is *disappointment*: this family reads as flat on the
neutral themes that make up most of the ~35 we ship, and the version of the look
that is currently exciting is the version we cannot ship.

---

## 12. Claymorphism

**Source.** [`codeAdrian/clay.css`](https://github.com/codeAdrian/clay.css) —
`src/clay.scss`; the style was coined at
[hype4.academy](https://hype4.academy/articles/design/claymorphism-in-user-interfaces).

**The look in one screenshot.** Fat, rounded, pastel shapes that look inflated —
like extruded plasticine lit from the upper left.

### What carries its identity

Three shadows on one element, from `clay.scss`:

```scss
$default-border-radius:          32px;
$default-shadow-outset:           8px  8px 16px 0 rgba(0,0,0,.25);
$default-shadow-inset-primary:   -8px -8px 16px 0 rgba(0,0,0,.25);
$default-shadow-inset-secondary:  8px  8px 16px 0 rgba(255,255,255,.2);

box-shadow: $shadow-outset,
            inset $shadow-inset-primary,
            inset $shadow-inset-secondary;
```

One large offset outer shadow for depth, plus **two opposed inner shadows** —
dark from one corner, light from the other — which is what produces the
inflated read. And the radius is deliberately extreme: "rounded beyond 50%
roundness possible for the size of the rectangle."

### Fit against our family contract

- **Sizing — ✅.** Offsets and blur are proportional to the element; written as
  `calc(0.5em * var(--scale))` they behave correctly, and the extreme radius is
  just a large `--radius-field`.
- **Colours — ✅.** One ground plus tinted objects; three is plenty. The inner
  highlight is `oklch(100% 0 0 / …)` and the inner shade is `color-mix` — both
  primitives we already use in `skin-flat`.
- **Variants — ❌ −3.** A soft inflated material has no `outline`, no `dash`,
  and `ghost` fights the whole premise. The README anticipates exactly this
  case — its worked example is literally
  `button: (drop: (outline, dash, soft))` for a family called `clay`. Nothing
  new is needed, so the mapping is subtractive but cheap.
- **Primitives — ✅.** Everything is `box-shadow` + `color-mix`. This is the
  textbook case for ADR 0006: the relief must recompute per element and per
  state, which is what a `:where(*)` recipe does and a Sass mixin cannot.

### Rough cost

Low. And note the precedent: `magnolia` (neumorphism, a close cousin) was
implemented once in about fifty lines of recipe plus eleven three-to-five-line
bindings (ADR 0003's table), then deleted for restart simplicity, not because it
was expensive. If the user wants a soft-3D slot, the shape of the work is known.

---

## Cross-cutting findings

**1. Our five button variants are Ant Design's variant axis, verbatim.**
`['outlined','dashed','solid','filled','text','link']` against our
`outline / dash / (default) / soft / ghost / link`. That explains `dash`, which
looks arbitrary in isolation. The consequence is uncomfortable: the candidates
that map cleanly onto our existing variants (Ant, Fluent, Geist) are the ones
in `daisy`'s visual band, and **every candidate that is visibly different needs
1–2 family-specific classes** — M3 `elevated`, Radix `classic` + `surface`,
neobrutalism `noShadow` + `reverse`, WebTUI `box`, PaperCSS shape rotation.
So `map.md`'s deferred item — *"How a family declares its own variant classes…
Revisit once a retained candidate actually needs one"* — is on the critical
path for essentially any interesting choice, not an edge case.

**2. Three grounds is the binding constraint, not intrinsic sizing.** The
sizing test that the ticket puts first is passed by ten of twelve: control
heights are ratios (2.29em Ant/Fluent, 2.86em M3, 3.43em Carbon, 2.09em 98.css)
and convert mechanically. What actually fails is the colour budget. Fluent wants
`colorNeutralBackground1…8` and 184 colour tokens in its light alias file alone;
Carbon wants `background` + `layer-01/02/03` + `field-01/02/03`; M3 wants five
`surface-container` steps; WebTUI wants `--background0…3`. Only Ant, Geist and
Claymorphism sit comfortably at three. Carbon is the striking exception in the
other direction — its `background / layer-01 / layer-02` **is** our
`surface / -high / -peak`, and it keeps a separate `field-01` for the same
reason CONTEXT.md calls a field "a hole cut in the page".

**3. Half the candidates carry a typeface, and the bundle has nowhere to put
one.** Carbon *is* IBM Plex; Geist *is* Geist Sans; PaperCSS `@import`s Patrick
Hand from Google Fonts inside `_config.scss`; 98.css bundles a `.woff` bitmap
face and turns antialiasing off; M3 assumes Roboto; Fluent assumes Segoe.
`map.md` lists "per-component typography" under *Not yet specified*; this survey
says it is not a per-component question but a per-**family** one, and it is
decisive for four candidates. WebTUI is the useful counter-example: its
identity needs monospace, and `font-family: monospace` is free.

**4. The 90% floor eliminates the interesting half of "glass".**
`backdrop-filter` passes comfortably. `backdrop-filter: url(#svg-filter)` — the
displacement-map refraction that makes Liquid Glass look like Liquid Glass — is
Chromium-only with no interoperable spec (svgwg#1142 open). A glass family can
ship 2021 frosted glass, not 2025 Apple glass.

**5. `--scale` has an independent precedent, and it disagrees with us on one
point.** Radix Themes ships `scaling: '90%' … '110%'` → `--scaling: 0.9 … 1.1`,
multiplied into every radius and spacing token. Same mechanism, same name,
arrived at separately — good evidence the idea is sound. But Radix scales font
sizes too, and our non-negotiable is "`--scale` grows frames, never text". If
Radix is retained, that divergence needs a line in the family header, because a
reader who knows Radix will read our version as a bug.

**6. Every candidate pays the same ~6-component invention tax.** `join`, `dock`,
`radial-progress`, `validator`, `skeleton` and the `chip`/`badge` split are
DaisyUI-isms with no equivalent in any of the twelve. Since `map.md` requires
every component to exist in every family, that cost is constant and should be
struck from the comparison rather than counted against individual candidates.

---

## Sources

Primary sources read for this survey (file-level where the claim is a value):

- Material Design 3 — [`tokens/versions/v0_192/_md-sys-shape.scss`](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-shape.scss), [`_md-sys-state.scss`](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-state.scss), [`tokens/_md-sys-elevation.scss`](https://github.com/material-components/material-web/blob/main/tokens/_md-sys-elevation.scss), [m3.material.io — Color roles](https://m3.material.io/styles/color/roles)
- Fluent 2 — [`packages/tokens/src/global/borderRadius.ts`](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/borderRadius.ts), [`strokeWidths.ts`](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/strokeWidths.ts), [`spacings.ts`](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/spacings.ts), [`curves.ts`](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/curves.ts), [`alias/lightColor.ts`](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts), [`Button.types.ts`](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-button/library/src/components/Button/Button.types.ts)
- Carbon — [`components/button/_vars.scss`](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/components/button/_vars.scss), [`components/button/_mixins.scss`](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/components/button/_mixins.scss), [`themes/src/dtcg/white.json`](https://github.com/carbon-design-system/carbon/blob/main/packages/themes/src/dtcg/white.json), [`themes/src/tokens/layout.ts`](https://github.com/carbon-design-system/carbon/blob/main/packages/themes/src/tokens/layout.ts), [`react/src/components/Button/Button.tsx`](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Button/Button.tsx)
- Ant Design 5 — [`components/theme/themes/seed.ts`](https://github.com/ant-design/ant-design/blob/master/components/theme/themes/seed.ts), [`components/button/buttonHelpers.tsx`](https://github.com/ant-design/ant-design/blob/master/components/button/buttonHelpers.tsx), [Customize Theme](https://ant.design/docs/react/customize-theme)
- Radix Themes — [`components/theme.props.tsx`](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/theme.props.tsx), [`props/radius.prop.ts`](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/props/radius.prop.ts), [`styles/tokens/radius.css`](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/radius.css), [`styles/tokens/scaling.css`](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/scaling.css), [`_internal/base-button.props.ts`](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-button.props.ts)
- Geist — [vercel.com/geist/introduction](https://vercel.com/geist/introduction), [vercel.com/geist/colors](https://vercel.com/geist/colors)
- Neobrutalism — [`src/styling/globals.css`](https://github.com/ekmas/neobrutalism-components/blob/main/src/styling/globals.css), [`src/components/ui/button.tsx`](https://github.com/ekmas/neobrutalism-components/blob/main/src/components/ui/button.tsx)
- 98.css — [`style.css`](https://github.com/jdan/98.css/blob/main/style.css)
- WebTUI — [`packages/css/src/base.css`](https://github.com/webtui/webtui/blob/master/packages/css/src/base.css), [`packages/css/src/components/button.css`](https://github.com/webtui/webtui/blob/master/packages/css/src/components/button.css)
- PaperCSS — [`src/core/_mixins.scss`](https://github.com/papercss/papercss/blob/master/src/core/_mixins.scss), [`src/core/_config.scss`](https://github.com/papercss/papercss/blob/master/src/core/_config.scss), [`src/components/_buttons.scss`](https://github.com/papercss/papercss/blob/master/src/components/_buttons.scss)
- Glass — [MDN BCD `backdrop-filter`](https://github.com/mdn/browser-compat-data/blob/main/css/properties/backdrop-filter.json), [CSS-Tricks on Liquid Glass](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/), [w3c/svgwg#1142](https://github.com/w3c/svgwg/issues/1142)
- Claymorphism — [`codeAdrian/clay.css` `src/clay.scss`](https://github.com/codeAdrian/clay.css/blob/master/src/clay.scss), [hype4.academy](https://hype4.academy/articles/design/claymorphism-in-user-interfaces)

Repo sources for the contract: `CONTEXT.md`, `docs/adr/0003`, `0005`, `0006`,
`0007`, `src/scss/families/README.md`, `src/scss/families/daisy.scss`,
`src/scss/families/poppy.scss`, `src/scss/families/_lib.scss`,
`src/scss/families/_derived-content.scss`, `src/scss/components/button.scss`,
`src/scss/base/default.scss`, `src/scss/_config.scss`.
