# Inventory of the missing components

Research for `.scratch/components/issues/01-inventory-the-missing-components.md`.
Nothing here decides what we adopt — that is the next ticket.

**Sources.** All daisyUI facts come from the compiled stylesheet, not the docs
site: `daisyui@5.7.32` (`https://cdn.jsdelivr.net/npm/daisyui@5/daisyui.css`,
local copy at `%TEMP%/daisyui.css`, `/*! 🌼 daisyUI 5.7.32 - MIT License */`).
Repo facts come from `CONTEXT.md`, `src/scss/components/*.scss`,
`src/scss/base/default.scss`, `src/scss/_mixins.scss`, `src/scss/families/_lib.scss`.

## How "cost" is measured here

Vocabulary is `CONTEXT.md`'s: **base** (family-agnostic half, paints nothing),
**skin** (what a family assigns), **plumbing variable** (the contract between
them), **variant** (opt-in class), **parameter** (what a theme may set).

Four things drive the number:

1. **Sizing fit.** The kit is intrinsic and em-based: geometric lengths are
   written `calc(Nem * var(--scale))` at their own site, size variants only set
   `--fontsize`, and text-natured components are exempt from `--scale`
   entirely. daisyUI is *rem*-based and leans on Tailwind utilities for
   dimensions it does not ship. Every absolute length in a daisyUI rule is a
   decision we have to re-make: keep it (only if it answers to the screen),
   or convert it to `em × --scale`. **This conversion, not the line count, is
   the real porting work.**
2. **Plumbing variables.** How many, and whether the existing helpers apply —
   `m.seed-color-variants($prefix, $seed, $fg)` (button/chip shape),
   `m.field-color-variants($prefix)` (input shape), `m.size-variants($prefix)`.
   A component whose colour variants fit `seed-color-variants` costs one line;
   one that does not needs its own `@each` loop.
3. **New mechanism.** Already in the kit: CSS masks (`loading`,
   `radial-progress`), `@property` (`base/properties.scss`), `:has()`,
   `color-mix()`, grid stacking, `appearance: none` on inputs, the
   "hidden radio reveals a sibling panel" trick (`tab`). **Not** in the kit:
   CSS counters, scroll snap, `<details>`/`::details-content`,
   container queries, `transition-behavior: allow-discrete`, `field-sizing`,
   `<table>` semantics.
4. **N times the family cost.** Every accepted component needs a rendering in
   each family (2 today: `daisy` flat, `poppy` material). "Restyle" below is
   how much of the family's look actually shows up on this component. A
   component that paints nothing costs a family **zero**.

Cost buckets: **trivial** (< 30 base lines, no family work), **low**,
**medium**, **high** (new mechanism, or a big surface a family must own).

Colour vocabulary is ours, not daisyUI's: `--color-surface-1` /
`--color-surface-2` / `--color-surface-3`, `--color-border`,
`--color-on-surface`, `--color-on-{semantic}`. Every `--color-base-100/200/300`
and `--color-*-content` quoted from daisyUI below maps onto those.

---

## The table

| Component | What it is | Cost for us | Already covered? | Name flag |
|---|---|---|---|---|
| `alert` | Coloured message box, icon + text, one grid row | **Low** — `chip`'s plumbing at box scale; its 3 variants map 1:1 onto `chip`'s existing `outline`/`dash`/`soft` mixins | No — but it is `chip` with `--radius-box`, block width and wrapping text | OK |
| `avatar` | Square-ratio image frame, + presence dot, + group | **Low-medium** — needs a size system daisyUI does not ship (it expects Tailwind `w-24`) | No. Its `::before` dot *is* `status`; corner placement *is* our `badge` | OK |
| `card` | The surface container: figure + body + title + actions | **Medium**, highest leverage — it is the shared primitive `list`, `stats`, `timeline-box` and the app all hand-roll | No, but `list` is already 80% of it (`--radius-box` + `--color-surface-1`) | OK |
| `carousel` | Horizontally scrolling snap strip | **Trivial** base, **zero** family — paints nothing | No. Arguably a utility, not a component | OK |
| `chat` | Chat bubble list with tail, header/footer, start/end | **Medium** — bubble is a painted surface; the tail is a fixed-px SVG mask that fights em sizing | No | OK |
| `collapse` | Accordion: title + revealed content | **High** — 3 actuation modes, 4 mechanisms we don't have, 2 of them under the 90% floor | Partly — `tab` already ships the checkbox-reveals-sibling trick | OK (`accordion` is the commoner word) |
| `countdown` | Rolling digits driven by `--value` | **Low** lines, **high** weirdness; zero family cost | No | OK |
| `diff` | Before/after image comparison slider | **Medium-high**, fragile — container queries + `resize` abused as a drag handle; iOS needs a hack | No | ⚑ **`diff` reads as text/git diff.** `compare` / `before-after` |
| `divider` | Rule with an optional centred label | **Trivial**, near-zero family cost | No, nothing close | OK |
| `filter` | Radio group that collapses to the checked option + reset | **Low** — *the coupling is already paid for*: our `button.scss` base already carries `:not(.filter .btn)` in 5 places | Half-written already (button side) | OK-ish (it is "a radio group that hides unchecked options") |
| `footer` | Grid of link columns | **Trivial**, paints nothing | No. Page furniture | OK |
| `hero` | Full-bleed centred banner with overlay | **Trivial** (4 rules) — but renders nothing until the consumer supplies height + background | No | OK |
| `indicator` | Positions a badge in a corner of a wrapper | **Zero — we already ship it, as `badge`** | ✅ **Yes, exactly.** Same mechanism, same 6 position classes, same 6 offset variables | ⚑ Name *collision*: daisyUI `badge` = our `chip`; daisyUI `indicator` = our `badge` |
| `kbd` | A keycap | **Trivial** | Nearly — `chip` + a heavier bottom border + square min-width | OK (matches `<kbd>`) |
| `mask` | ~15 clip shapes via `mask-image` data URIs | **Low** effort, **~4 KB** of data URIs, **zero** family cost | No. It is a *utility* like `utilities/radius.scss`, not a component | ⚑ Mild — reads "hides content", means "cut to shape". `shape` |
| `menu` | Vertical nav list: active/disabled, nesting, submenus | **High** — the largest rule set of the batch by far | **Substantially** — `list` + `list-suggestions` cover rows + hover + active; `dock` covers horizontal icon nav; `tab` covers tab nav | OK |
| `navbar` | Top bar, start / center / end thirds | **Trivial** (~15 lines), paints nothing | No. Three flex boxes | OK |
| `otp` | One-time-code input: N boxes over one hidden `<input>` | **High**, and it **breaks the 90% floor** (`field-sizing: content`, Chromium-only) | No — but `join` + `input` gets there today with better markup | ⚑ Mild — term of art. `code-input` |
| `rating` | Radio group drawn as N star masks | **Low-medium** — but it *depends on `mask`* for the star shape | No | OK |
| `stack` | Overlap children into a deck-of-cards pile | **Low** lines, but 5×5 grid with hard-coded px tracks | No | ⚑ **Worst collision in the list.** Everywhere else `Stack` = a flex column with a gap — the opposite. `pile` / `deck` |
| `stat` / `stats` | KPI tile + its container | **Low-medium** — `.stats` is *again* the `card` surface; `.stat` is a typography grid | `.stats` is covered by whatever surface primitive `card` produces | OK (singular/plural pair is a known daisyUI wart) |
| `status` | A small coloured dot | **Trivial** (~15 lines + 2 loops) | No, nothing close — and it is the atom `avatar-online` wants | ⚑ Mild — vague alone. `dot` |
| `steps` | Numbered progress stepper | **Medium** — needs **CSS counters** (new), and a sibling-pair colour loop that does not fit `seed-color-variants` | No | OK |
| `swap` | Toggle between two/three icons on a checkbox | **Low** (~50 lines), paints nothing | No, but it is a `label`-wrapped checkbox with grid-stacked children | ⚑ **Says nothing.** `icon-swap` / `switch-icon` (`toggle-icon` collides with our `toggle`) |
| `table` | Styled `<table>`: zebra, pinned rows/cols, sizes | **Medium-high** — the only one needing **`<table>` semantics** | `list` covers "rows with separators", not tabular data (headers, column alignment, sticky) | OK (matches `<table>`) |
| `timeline` | Events along a line, alternating sides | **Medium-high** — 3×3 grid per `<li>`, `<hr>` as connectors, 4 variants | No | OK |

---

## Per-component detail

### `alert`

**What it is.** A coloured box carrying an icon and a message. One element,
`display: grid`, `grid-auto-flow: column`; children are laid out by
`:has(> :nth-child(2))` switching `grid-template-columns` from `auto` to
`auto minmax(auto, 1fr)`. No JS.

**daisyUI.** `--alert-color` is the seed, `--alert-border-color` the resolved
border; `background-color: var(--alert-color, var(--color-base-200))`. Colour
variants set the seed plus `color: var(--color-{c}-content)`. Three look
variants — `alert-soft` (`color-mix(… 8%, base-100)`), `alert-outline`,
`alert-dash` — all of which zero `box-shadow` and `background-image`. Radius
`--radius-box`, padding `.75rem/1rem`, font `.875rem`. `alert-vertical` /
`alert-horizontal` flip the flow.

**Cost.** Fits our sizing cleanly: it draws a frame, so `.75rem/1rem` become
`calc(0.75em * var(--scale))` / `calc(1em * var(--scale))` and the size
variants set `--fontsize` only. Plumbing: `--alert-color` (seed),
`--alert-bg`, `--alert-fg`, `--alert-border`, `--alert-shadow` — the same
five-name shape as `--btn-*` and `--chip-*`, so `m.seed-color-variants('alert',
--alert-color, --alert-fg)` is a one-liner. No new mechanism. **~50 lines
base + ~35 for the three variants.** Family restyle is genuinely small: the
skin assigns bg/border/shadow the way `skin-flat` does for `.btn`, and the
`soft`/`outline`/`dash` variants are almost literal copies of `chip`'s.

**Covered?** No. But structurally it is `chip` promoted from
`--radius-selector` to `--radius-box`, from `height: 1.6em` to block padding,
and from `nowrap` to wrapping. If a shared "painted box" skin is extracted
(see `card`), `alert` is that skin plus a semantic seed.

### `avatar`

**What it is.** An inline wrapper around a square image. `.avatar > div` sets
`aspect-ratio: 1; overflow: hidden`, `.avatar img` does `object-fit: cover`.
Three add-ons: `.avatar-placeholder` (centres initials instead of an image),
`.avatar-online` / `.avatar-offline` (a `::before` dot at `top: 7%; right: 7%`,
`width: 15%`), and `.avatar-group` (a flex row where each child gets a
`4px solid var(--color-base-100)` ring to cut the overlap). No JS.

**daisyUI.** Notably, **daisyUI ships no size at all** — the docs examples all
say `<div class="w-24 rounded-full">`, i.e. the dimension comes from Tailwind,
which we do not have. Radius likewise.

**Cost.** This is the "daisyUI in name only" case: to be usable we must supply
what daisyUI delegates to Tailwind. That means a real size system —
`--avatar-size: calc(3em * var(--scale))` plus `m.size-variants('avatar')` —
and a shape decision (circle vs `--radius-box`). Plumbing: `--avatar-size`,
`--avatar-ring` (the group cut-out colour, `--color-surface-1`),
`--avatar-status` (dot colour). No new mechanism. **~45 lines base**, family
restyle low (the ring colour and whether the frame carries a shadow).

**Covered?** No. But two of its three add-ons duplicate things: the online dot
*is* `status`, and "put a small thing in the corner of a bigger thing" *is*
our `badge`. An honest reading is that `avatar` = a sized square image frame,
and the rest is composition.

### `card`

**What it is.** The surface container. `.card` is a flex column with
`--radius-box`; `.card-body` holds the padding and the text scale;
`.card-title`, `.card-actions`, and a `figure` child whose corners inherit the
card's. Variants: `card-border`, `card-dash`, `card-side` (row layout, figure
corners swap to leading/trailing), `image-full`, five size variants. No JS —
though it does support being a selectable tile (`.card:has(> :checked)` sets
the outline, `.card > [type=checkbox]` gets `appearance: none`).

**daisyUI.** `--card-p` (padding) and `--card-fs` (font size) are the plumbing;
size variants set both, plus `--cardtitle-fs`. **`.card` itself paints
nothing** — no background, no shadow. daisyUI expects `bg-base-100 shadow-sm`
from Tailwind. `card-border`/`card-dash` are the only painted variants and
they set `border: var(--border) solid var(--color-base-200)`.

**Cost.** Medium in lines (~90 base + ~50 variants), but **this is the
transverse one** — `map.md` already flags it under "Not yet specified: whether
any accepted component needs a new shared primitive". Three things in the kit
hand-roll a surface today: `list` (`background-color: var(--color-surface-1)` +
`--radius-box` + join-aware corners), daisyUI's `.stats`, and daisyUI's
`.timeline-box`. Because daisyUI leaves `.card` unpainted, we cannot copy it —
we have to *decide* what a card looks like in each family, and that decision is
the single largest new surface a family owns. Plumbing: `--card-bg`,
`--card-fg`, `--card-border`, `--card-shadow`, `--card-p`. Sizing fits (it is
a frame: `1.5rem` padding → `calc(1.5em * var(--scale))`, sizes set
`--fontsize`). No new mechanism; the figure-corner rules are just
`border-*-radius: inherit`. Family restyle **high** — this is where poppy's
`--light-depth` elevation and daisy's flat hairline actually read.

**Covered?** No, but `list` is most of the way there. The cheap version of this
whole ticket is: extract the surface half of `list` into a shared skin, and let
`card`, `stats` and `timeline-box` consume it.

### `carousel`

**What it is.** A scrolling strip with snap points. `.carousel` is an
`inline-flex` with `overflow-x: scroll`, `scroll-snap-type: x mandatory`,
`scrollbar-width: none` (+ the `::-webkit-scrollbar` counterpart);
`.carousel-item` is `flex: none; scroll-snap-align: start`.
`carousel-vertical` / `-horizontal` and `carousel-start` / `-center` / `-end`
change axis and alignment. `scroll-behavior: smooth` under
`prefers-reduced-motion: no-preference`. No JS (navigation is `<a href="#slide2">`).

**Cost.** **~25 lines, and zero family cost** — it paints nothing at all.
No plumbing variables. New mechanism: scroll snap, which the kit does not use
yet, but it is universally supported and needs no fallback. Sizing is
*deliberately* the consumer's: item widths come from the markup, so it never
touches `--fontsize` or `--scale`.

**Covered?** No. The honest question is whether it is a component or a utility —
it has no look, only behaviour, which puts it closer to `utilities/radius.scss`
than to `button`.

### `chat`

**What it is.** One message. `.chat` is a grid with `grid-auto-rows: min-content`
and three named rows (header / bubble / footer) plus an avatar column;
`.chat-start` and `.chat-end` swap the column order and the tail side. No JS.

**daisyUI.** The bubble tail is a `::before` with a **fixed 13×13 SVG data URI
as a `mask-image`**, sized `.75rem`, `background-color: inherit` (so the tail
follows the bubble colour automatically — nice), flipped with `rotateY(180deg)`
for the other side. `.chat-bubble` uses `--radius-field`, `background-color:
var(--color-base-300)`, `min-width: 2.5rem`, `max-width: 90%`, `min-height: 2rem`.
Eight `chat-bubble-{color}` variants set background + `-content` foreground
directly (no seed variable).

**Cost.** Medium. Plumbing to add: `--chat-bubble-bg`, `--chat-bubble-fg` —
then `m.seed-color-variants` applies. The mask mechanism is already in the kit
(`loading`, `radial-progress`). The friction is sizing: the tail is
`.75rem`/`.8125rem` mask geometry that will not follow `--fontsize`, so either
it is rewritten in `em` (and the mask re-authored) or it visibly desyncs at
`chat-lg`. **~90 lines base + ~20 for colours.** Family restyle low-medium:
the bubble is a small painted surface and `background-color: inherit` makes the
tail free.

**Covered?** No. Also worth weighing: this is the narrowest component in the
batch — it is useful in a chat app and nowhere else.

### `collapse`

**What it is.** A title that reveals content. **This is the mechanism-heaviest
component of the whole set**, because daisyUI ships *three* actuation modes
under one class:

1. `<details>` + `<summary>` (animated via `::details-content`),
2. a hidden `<input type=checkbox|radio>` sibling (`:checked ~ .collapse-content`),
3. `tabindex` + `:focus` / `:focus-within`.

Plus `.collapse-open` / `.collapse-close` to force state, and `.collapse-arrow`
/ `.collapse-plus` indicators.

**daisyUI.** The open/close animation is `grid-template-rows: max-content 0fr`
→ `max-content 1fr`. The content is hidden with `content-visibility: hidden`
(+ a `@supports not (content-visibility: hidden)` → `visibility: hidden`
fallback) and transitioned with a long
`transition: … allow-discrete` list. The `<details>` path additionally uses
`::details-content` with `interpolate-size: allow-keywords` and
`transition: height .2s`.

**Cost. High, and partly over our floor.** Four mechanisms the kit does not
have:
- `grid-template-rows: 0fr → 1fr` — fine, ~96%.
- `transition-behavior: allow-discrete` — ~92%, passes.
- `::details-content` — Baseline 2025, the newest thing in the batch; likely
  under our 90% minimum today. Same call as `::picker(select)`, which was
  rejected on exactly this basis.
- `interpolate-size: allow-keywords` — worse than `::details-content`.

The affordable subset is real and worth naming: **mode 2 only** (hidden
checkbox + `grid-template-rows`) is ~96% supported, needs nothing new, and
`tab.scss` already ships the identical trick (`.tab:checked + .tab-content`).
That version is ~60 lines. Full daisyUI parity is ~200. Plumbing:
`--collapse-p`, and a `--collapse-title-bg` if a family wants the header
painted. Family restyle low-medium.

**Covered?** Partly — the checkbox-reveals-sibling pattern is already written
in `tab.scss` and could be generalised rather than rewritten.

### `countdown`

**What it is.** Rolling digits. `<span class="countdown"><span
style="--value:42"></span></span>`. Each child renders its number by scrolling
a `::before`/`::after` whose `content` is the literal string
`"00\a 01\a 02\a … 99\a "` (a ~300-character declaration) and offsetting it
`top: calc(var(--value-ones) * -1em)`. **JS is required** — something must set
`--value`.

**daisyUI.** Digit extraction is pure CSS arithmetic:
`--value-hundreds: calc(round(to-zero, var(--value-v) / 100, 1))`,
`--value-tens`, `--value-ones`, with `mod()` and `clamp()` deciding how many
digit columns are visible; width is `calc(1ch + … * 1ch)` and transitions.

**Cost.** Low in lines (~25) and **zero family cost** — it paints nothing,
it inherits colour. It is text-natured, so exempt from `--scale` by our own
rule. New mechanism: CSS `round()` / `mod()` (~92%, passes) and `ch` units.
Note the digit-strip trick means the "00…99" string is emitted twice, so the
byte cost is disproportionate to the line count.

**Covered?** No. Weigh against: it needs JS anyway to set `--value`, and at
that point `el.textContent = n` does the same job — the CSS buys only the
rolling animation.

### `diff`

**What it is.** Before/after image comparison with a draggable divider.
`.diff` is a 3-row grid (`1fr 1.8rem 1fr`) containing `.diff-item-1`,
`.diff-item-2` and `.diff-resizer`. No JS — the drag is real.

**daisyUI.** The trick: `.diff-resizer` is an element with
`resize: horizontal`, made invisible and stretched with
`transform: scaleY(5) translate(...)` and `clip-path`, so **the browser's native
resize grip becomes the slider handle**. Widths are in `cqi` against
`container-type: inline-size` on `.diff`. There is an explicit
`@supports (-webkit-overflow-scrolling: touch) and (overflow: -webkit-paged-x)`
block — an iOS-Safari sniff — that removes the handle pseudo-element and swaps
the focus behaviour, because `resize` does not work there.

**Cost. Medium-high, and the highest fragility in the batch.** New mechanisms:
container queries + `cqi` (~93%), `resize` used off-label, `clip-path`. It is
inherently dimension-driven (`100cqi`, `1.8rem` rows) — it has no relationship
to `--fontsize` or `--scale` at all, so it sits outside our sizing model
rather than fitting badly into it. Plumbing is small (`--diff-handle-bg`,
`--diff-handle-border`); family restyle **low** — the handle is one pill.
**~110 lines** including the iOS branch.

**Covered?** No.

**Name. ⚑ Flag.** `diff` to a developer means a text or git diff. This is an
image comparison slider. `compare`, `before-after`, or `image-compare` all say
it; `diff` actively misleads.

### `divider`

**What it is.** A horizontal (or vertical) rule with an optional centred label:
`<div class="divider">OR</div>`. `::before` and `::after` are two
`flex-grow: 1` bars; `:not(:empty)` adds a gap around the label.
`divider-start` / `divider-end` hide one side to push the label. No JS.

**daisyUI.** `--divider-color` defaults to
`color-mix(in oklab, var(--color-base-content) 10%, transparent)`;
`--divider-m` is the margin, flipped by `divider-horizontal` /
`divider-vertical`. Bars are `.125rem`. Eight colour variants set the
`::before`/`::after` background directly.

**Cost. Trivial and near-zero family cost.** ~30 lines base + a small colour
loop. One caveat: the colour variants paint `::before`/`::after` backgrounds,
so `m.seed-color-variants` does **not** apply as-is — either write a
7-line `@each` of its own, or (better, and consistent with the kit) have the
variants set `--divider-color` and let the base read it, at which point the
existing helper shape does apply. Sizing: it draws a frame, so `1rem` margin
and `.125rem` thickness become `calc(1em * var(--scale))` and a hairline.

**Covered?** No, and nothing in the kit is close. Highest utility-per-line in
the batch.

### `filter`

**What it is.** A row of radio buttons that, once one is checked, hides all the
others and reveals a reset control — so it reads as a filter chip bar. Markup
is a `<form class="filter">` of `<input type="radio" class="btn">` plus an
`<input type="reset" class="btn filter-reset">`. No JS.

**daisyUI.** Pure `:has()` state:
`.filter:not(:has(:checked:not(.filter-reset))) … { visibility: hidden }` hides
the reset when nothing is chosen, and
`.filter:not(:has(:focus-visible)):has(:checked:not(.filter-reset,[type=checkbox])) :is(input,button):not(:checked,…)` collapses the
unchecked ones to `width: 0; scale: 0; opacity: 0`. The transition includes
`visibility .1s allow-discrete`.

**Cost. Low — and the expensive half is already written.** Our
`src/scss/components/button.scss` already carries the counterpart hook in five
places: `input:checked:not(.filter .btn)` appears in `base`, `variant-ghost`,
`variant-outline`, `variant-dash` and `variant-soft`. That exclusion exists
precisely so a checked radio inside `.filter` does *not* get the generic
checked-button look. So the coupling cost has been paid; what is missing is a
~30-line `filter.scss`. New mechanism: `transition: visibility … allow-discrete`
(~92%, passes) — degrades to an instant hide without it. Family restyle **zero**
(it paints nothing; `.btn` does all the painting). No plumbing variables of its
own.

**Covered?** Half-written already. This is the cheapest "finish what we
started" item on the list.

### `footer`

**What it is.** A grid of link columns with `.footer-title` headings.
`.footer` is `display: grid; grid-auto-flow: row; gap: 2.5rem 1rem`, and
`.footer > :not(script,style,template)` makes each column a nested grid.
`footer-horizontal` / `footer-vertical` / `footer-center` change the flow. No JS.

**Cost. Trivial, zero family cost** — it paints nothing except
`.footer-title { opacity: .6; text-transform: uppercase }`. ~35 lines. Sizing:
it is a frame, so the gaps become `em × --scale`; the font size becomes
`--fontsize`.

**Covered?** No. But it is page furniture, not a control — `map.md` already
groups it with `navbar`/`hero`/`stack`/`divider` under "whether layout
components belong here at all", and `footer` is the clearest instance of the
question: three grid declarations that any consumer writes in a minute.

### `hero`

**What it is.** A full-width centred banner. `.hero` is a `display: grid;
place-items: center` with `background-size: cover`; every child is forced to
`grid-row-start: 1; grid-column-start: 1` so `.hero-overlay` (a translucent
`--color-neutral` wash) stacks under `.hero-content`. No JS.

**Cost. Trivial — 4 rules, ~20 lines**, one plumbing variable
(`--hero-overlay`, currently `color-mix(… var(--color-neutral) 50%, transparent)`).
Family restyle essentially zero.

**Covered?** No — but the trap is worth naming: **out of the box it renders
nothing visible.** daisyUI's own examples all supply `min-h-screen`, a
`background-image`, and the content sizing from Tailwind. Without those
utilities, `.hero` on its own is a `place-items: center` grid of zero height.
We would be shipping the 20 lines *and* an opinion about height that daisyUI
never had to take.

### `indicator`

**What it is.** Positions a small element in a corner of a bigger one.
`.indicator` is `position: relative; display: inline-flex; width: max-content`;
`.indicator-item` is absolutely positioned by six custom properties
(`--indicator-t/-b/-s/-e/-x/-y`) that nine position classes reassign.

**Cost. Zero. ✅ We already ship this, as `badge`.**
`src/scss/components/badge.scss` is the same component, variable for variable:

| daisyUI | u.u |
|---|---|
| `--indicator-t/-b/-s/-e/-x/-y` | `--badge-t/-b/-s/-e/-x/-y` |
| `.indicator-start/-center/-end` | `.badge-start/-center/-end` |
| `.indicator-top/-middle/-bottom` | `.badge-top/-middle/-bottom` |
| `.indicator :where(.indicator-item)` | `.badge :where(.chip)` |

Both include the `[dir=rtl]` mirror rules. The only difference is that ours
hard-codes the positioned child as `.chip` where daisyUI accepts any
`.indicator-item`.

**Name. ⚑ This is a two-way collision, and it is the one naming decision in
this ticket that is already made and needs to be *documented*, not re-taken:**

- daisyUI `badge` (a small pill: `--radius-selector`, `height: --size`,
  `padding-inline: calc(var(--size)/2 - var(--border))`) = **our `chip`**.
- daisyUI `indicator` (a corner positioner) = **our `badge`**.

Adopting the daisyUI name would mean renaming two existing components. Not
adopting it means anyone arriving from daisyUI has two words to relearn. Either
way it belongs in the glossary as an explicit deviation with its justification,
per `map.md`.

### `kbd`

**What it is.** A keycap: `<kbd class="kbd">K</kbd>`. One element,
`inline-flex`, `height: var(--size)`, `min-width: var(--size)` (so single
characters render square), `--radius-field`.

**daisyUI.** The whole look is one asymmetric border —
`border: var(--border) solid color-mix(in srgb, var(--color-base-content) 20%, #0000)`
with `border-bottom: calc(var(--border) + 1px)` — over
`background-color: var(--color-base-200)`, with `box-shadow: none`. Five size
variants set `--size` *and* `font-size` in rem.

**Cost. Trivial.** ~25 lines + one `m.size-variants('kbd')` call (which sets
`--fontsize` only — the `--size` follows because it is written
`calc(1.6em * var(--scale))`). Plumbing: `--kbd-bg`, `--kbd-fg`, `--kbd-border`.
No new mechanism.

**Covered?** Very nearly — it is `chip` with a thicker bottom border and a
square minimum. Whether that is "covered" depends on whether we are willing to
say `<kbd class="chip">`, which loses the keycap's whole visual point. Family
restyle is low but genuinely non-zero: a keycap is a small elevation statement,
and a neumorphic or material family would want its own take.

### `mask`

**What it is.** Not a component — a set of ~15 clip shapes:
`mask-squircle`, `-circle`, `-hexagon`, `-hexagon-2`, `-decagon`, `-diamond`,
`-heart`, `-pentagon`, `-star`, `-star-2`, `-triangle` (×4), plus `mask-half-1`
/ `mask-half-2` which show one half of a shape (used by `rating` for half-stars).

**daisyUI.** Each is one declaration: `mask-image: url("data:image/svg+xml,…")`
with an inline SVG path. `.mask` itself sets `mask-size: contain;
mask-repeat: no-repeat; mask-position: 50%`.

**Cost. Low effort, notable bytes, zero family cost.** The mechanism is already
in the kit (`loading.scss` and `radial-progress.scss` both use `mask-image`).
It paints nothing and has no plumbing variables — a family restyles it not at
all. The real cost is ~4 KB of data URIs in every bundle that includes it,
which matters because the bundle is the product (ADR 0001).

**Covered?** No. But the classification question matters more than the cost:
this is a **utility**, like `utilities/radius.scss`, not a component with a
base/skin split. It has no look for a family to own.

**Name. ⚑ Mild.** `mask` is the CSS property name, so it is discoverable, but
it reads as "hide something" rather than "cut this element into a shape".
`shape` is clearer and does not collide with anything.

### `menu`

**What it is.** A vertical nav list: `<ul class="menu">` of `<li>` wrapping
`<a>`. Supports nested `<ul>` (with a vertical guide line via `li ul::before`),
`<details>`-based collapsible submenus, `.menu-title` headings, separators
(`li:empty` becomes a 1px rule), `.menu-active` / `.menu-disabled` /
`.menu-focus` states, and a `.menu-horizontal` mode whose submenus become
absolutely-positioned dropdowns.

**daisyUI.** By far the largest rule set of the batch (~400 lines even after
stripping responsive duplicates), and the most selector-heavy: the item look is
matched by
`.menu :where(li:not(.menu-title) > :not(ul,menu,details,.menu-title,.btn)), .menu :where(li:not(.menu-title) > details > summary:not(.menu-title))`
and every state re-states that whole thing with more `:not()`s.
Plumbing is small: `--menu-active-bg` / `--menu-active-fg`
(default `--color-neutral` / `--color-neutral-content`). The submenu animation
uses `details::details-content` + `interpolate-size: allow-keywords` —
the same below-floor mechanisms as `collapse`.

**Cost. High**, and the selector machinery is the part that does not shrink:
those `:where(li:not(…) > :not(…))` chains are what let the component work
against unannotated markup, and simplifying them changes the contract.

**Covered? Substantially — this is the strongest "already covered" after
`indicator`.** Three existing components split the job:
- `list` + `.list-row` gives the row container and grid;
- `.list-suggestions` + `.suggestion-item` already ships exactly the
  interactive-row look: `border-radius: var(--radius-field)`, `cursor: pointer`,
  `user-select: none`, a `@media (hover: hover)` hover wash, and an active state
  keyed on both `.suggestion-item-active` and `[aria-selected="true"]`;
- `dock` covers horizontal icon navigation, `tab` covers tab navigation.

What `menu` genuinely adds over that is nesting, `<details>` submenus, and
disabled items. The affordable framing is "make `list` rows interactive",
not "port `menu`".

### `navbar`

**What it is.** A top bar with three regions. `.navbar` is
`display: flex; align-items: center; width: 100%; min-height: 4rem; padding: .5rem`;
`.navbar-start` and `.navbar-end` are `width: 50%` inline-flex boxes,
`.navbar-center` is `flex-shrink: 0`. No JS.

**Cost. Trivial (~15 lines), zero family cost** — it paints nothing (daisyUI's
examples add `bg-base-100 shadow-sm` themselves). `min-height: 4rem` is one of
the few absolutes our own rule *permits*, since a bar height answers to the
screen rather than to its content — the same exemption `dock` already uses.

**Covered?** No, but it is three flex declarations. Same "is this page
furniture?" question as `footer` and `hero`.

### `otp`

**What it is.** A one-time-code field: N visible boxes with one real `<input>`
laid transparently across them. Markup is `.otp` containing `<input>` plus one
`<span>` per digit.

**daisyUI.** The most contorted implementation in the batch. The `<input>` is
transparent with `letter-spacing: calc(var(--stride) - var(--otp-ch))` so its
characters land in the boxes; the boxes are `position: absolute` at
`left: calc(var(--stride) * n)` via **eight hard-coded `:nth-child` rules**,
each with its own `transition-delay`; the container width comes from eight more
`.otp:has(> span:nth-child(n))` rules. The caret is faked by an `::after`
outline. It carries **three browser sniffs**:
`@supports (font: -apple-system-body)` (twice, adjusting `--otp-ch` and a
`left` offset) and `@supports (-moz-appearance: none)`.

**Cost. High — and it is the one component here that breaks a
non-negotiable.** It depends on `field-sizing: content`, which is Chromium-only
(~72% global) and well under the kit's 90% floor. Beyond that: absolute
`1.75rem`/`2.5rem` font sizes in the size variants (against our
`--fontsize`-only rule), `ch`-unit geometry that does not follow `em`,
and a `--otp-*` plumbing set (`--otp-ch`, `--otp-gap`, `--otp-w`, `--otp-size`,
`--stride`) that partly duplicates `--input-color`. ~200 lines.

**Covered?** Not identically — but `join` + `input` already produces a joined
row of single-character fields today, with real per-digit inputs (better for
paste, autofill, and screen readers) and zero new CSS.

**Name. ⚑ Mild.** `otp` is a term of art; `code-input` or `one-time-code`
reads better to someone who has not met it. Not the worst offender here.

### `rating`

**What it is.** A radio group drawn as N stars.
`<div class="rating"><input type="radio" class="mask mask-star" /> …</div>`.
No JS.

**daisyUI.** `.rating input { appearance: none }`, `.rating *` gets
`background-color: var(--color-base-content); opacity: .2` and a square
`--size`; the fill comes from
`.rating :checked, .rating :has(~ :checked)` → `opacity: 1`, which also
accepts `[aria-checked=true]` / `[aria-current=true]` for read-only display.
`.rating-half *` halves the width, `.rating-hidden` is the "zero" option.
`@keyframes rating` gives a pop on selection.

**Cost. Low-medium — but note the dependency.** The star shape is *not* in
`rating`: it comes from `mask-star` / `mask-half-1` in the `mask` component.
**Adopting `rating` without `mask` means baking one star into `rating.scss`**;
adopting both means paying `mask`'s data-URI bytes. Plumbing: `--rating-color`
(seed, so `m.seed-color-variants` applies), `--size`. Sizing: daisyUI uses
`calc(var(--size-selector, .25rem) * 6)`, ours would be
`calc(1.5em * var(--scale))` with `m.size-variants('rating')`. Mechanism is
already in the kit (masks, `appearance: none`, `:has()`). ~70 lines. Family
restyle low.

**Covered?** No.

### `stack`

**What it is.** Overlap children into a deck-of-cards pile, with the ones
behind peeking out and fading.

**daisyUI.** An `inline-grid` with a fixed 5×5 template —
`grid-template-rows: 3px 4px 1fr 4px 3px` and the same for columns — where the
first three children are placed on overlapping `grid-area`s
(`1/1/4/6`, `2/2/5/5`, `3/3/6/4`) with descending `z-index` and
`opacity: .9` / `.7`. `stack-top` / `-bottom` / `-start` / `-end` swap which
edge the pile peeks from.

**Cost. Low lines (~45), zero family cost** (it paints nothing but `opacity`),
**but it does not fit our sizing model as written**: those `3px`/`4px` tracks
are the visible peek offsets, and they answer neither to the screen nor to
content — so by our own rule they must become `calc(Nem * var(--scale))` or a
`--stack-offset` parameter. Doing that means recomputing all four directional
variants, which is most of the file.

**Name. ⚑ The worst collision in the list.** In essentially every other design
vocabulary — CSS layout writing, Radix, Chakra, MUI, SwiftUI — a `Stack` is *a
flex container with a gap*, i.e. things in a row or column, not overlapping.
daisyUI's `stack` means the opposite: things piled on top of each other.
Someone who has never used daisyUI will read `class="stack"` and predict a
column. `pile` or `deck` says what it does.

### `stat` / `stats`

**What it is.** KPI tiles. `.stats` is the container (`inline-grid`,
`grid-auto-flow: column`, `--radius-box`, `overflow-x: auto`); `.stat` is one
tile, a grid of `.stat-title` / `.stat-value` / `.stat-desc` / `.stat-actions`
in column 1 with `.stat-figure` spanning three rows in column 2.
`.stats-horizontal` / `.stats-vertical` change flow and move the dashed
separator between axes. No JS.

**daisyUI.** Separator is
`border-inline-end: var(--border) dashed color-mix(in oklab, currentColor 10%, #0000)`
on `:not(:last-child)`. Typography is absolute: `.stat-value` is `2rem/800`,
`.stat-title` and `.stat-desc` are `.75rem` at 60% opacity. `.stats` itself
sets a radius but **no background** — again a Tailwind expectation.

**Cost. Low-medium, with one structural note:** `.stats` is *another*
unpainted surface container that we would have to decide the look of — the
third instance of the `card` primitive question, after `list` and
`timeline-box`. `.stat` itself is cheap: a 3-row grid plus four typography
rules, and the absolute font sizes become em ratios off `--fontsize`
(`2rem` → `2em`, `.75rem` → `.75em`), which actually suits the intrinsic model
well since a whole tile then scales from one `--fontsize`. Plumbing:
`--stat-separator`, plus whatever the surface primitive exposes.
**~70 lines** for both. No new mechanism.

**Covered?** `.stats` is covered by whatever comes out of the `card` decision.
`.stat` is not covered by anything.

**Name.** Fine, but the singular/plural pair is a known daisyUI wart —
`.stat` inside `.stats` is a one-character typo away from silently doing
nothing, and neither name hints that one contains the other.

### `status`

**What it is.** A small coloured dot: `<span class="status status-success">`.
One element, `aspect-ratio: 1`, `--radius-selector`, `display: inline-block`.

**daisyUI.** Beyond the dot itself it carries a little depth:
`background-image: radial-gradient(circle at 35% 30%, oklch(1 0 0 / calc(var(--depth) * .5)), #0000)`
and `box-shadow: 0 2px 3px -1px color-mix(in oklab, currentColor calc(var(--depth) * 100%), #0000)`.
Eight colour variants set `background-color` **and** `color` (the shadow reads
`currentColor`). Five size variants are absolute: `.125rem` → `1rem`.

**Cost. Trivial** — ~15 lines base, one colour loop, one size scale. Two
adjustments for us: the sizes should be `calc(0.5em * var(--scale))` etc. so a
dot sits correctly beside text at any `--fontsize`; and the colour variants
should seed one variable (`--status-color`) rather than setting
`background-color` and `color` separately, so `m.seed-color-variants` applies.
Family restyle is small but real — the highlight gradient and the shadow are a
family's call, and both already read `--depth`, a parameter `daisy` exposes.

**Covered?** No, and nothing is close. Worth noting it is also the atom that
`avatar-online` reimplements and that a large share of `badge` usage wants.

**Name. ⚑ Mild.** `status` alone does not say "a dot" — status of what, shown
how? `dot` is unambiguous and just as short. Against that: `status` is the
daisyUI name and short names are cheap to relearn.

### `steps`

**What it is.** A numbered progress stepper. `<ul class="steps">` of
`<li class="step">`; each step draws its own number bubble and the connector
leading back to the previous one. No JS.

**daisyUI.** Two mechanisms worth calling out:
1. **CSS counters** — `counter-reset: step` on `.steps`, and the bubble is
   `content: counter(step); counter-increment: step` on the `::after`, so
   numbering is automatic. `[data-content]` overrides it with
   `content: attr(data-content)` (for a ✓ or an icon); `.step-icon` replaces it
   with a real element. **The kit uses no counters today.**
2. **A sibling-pair colour loop** —
   `.steps .step-primary + .step-primary::before, .steps .step-primary::after, .steps .step-primary > .step-icon`
   sets `--step-bg` / `--step-fg`. The `+` is the point: the *connector* only
   takes the colour when both steps it joins are coloured. This shape does
   **not** fit `m.seed-color-variants` and needs its own `@each`.

**Cost. Medium.** Sizing needs real work: `grid-template-rows: 40px 1fr`,
the `2rem` bubble, the `.5rem` connector and the `4rem` min-width are all
absolute and all frame geometry, so all four become `em × --scale`. Plumbing:
`--step-bg`, `--step-fg`. **~90 lines base + ~25 for the colour loop + ~40 for
horizontal/vertical.** Family restyle low-medium (the bubble is a small painted
surface; the connector is a bar).

**Covered?** No. `progress` and `radial-progress` cover continuous progress,
not discrete labelled stages.

### `swap`

**What it is.** Toggle between two icons on a hidden checkbox.
`<label class="swap"><input type="checkbox"><div class="swap-on">…</div><div class="swap-off">…</div></label>`.
`.swap` is an `inline-grid` with `place-content: center`; all children land on
`1/1` and visibility is driven by `opacity`. `swap-rotate` adds a 45°
`rotate`, `swap-flip` a `rotateY(180deg)` with `backface-visibility: hidden`
and `perspective: 20rem`. Also handles `input:indeterminate` for a third state
(`.swap-indeterminate`) and `.swap-active` to force it. No JS.

**Cost. Low (~50 lines), zero family cost** — it paints nothing, it only moves
things. No plumbing variables. Mechanisms all already used (grid stacking,
`appearance: none`, transitions). Sizing: intrinsic already, since it wraps
whatever icons you give it.

**Covered?** No, but it is thin: a `label`-wrapped checkbox with two
grid-stacked children and an opacity swap. The `rotate`/`flip` variants are the
only part that is not obvious.

**Name. ⚑ Flag.** `swap` says nothing about what is swapped or when — read
cold it could be drag-to-reorder, a theme switcher, or an image hover. It is an
*icon toggle tied to a checkbox*. `icon-swap` or `switch-icon` are honest;
`toggle-icon` would collide with our existing `toggle`.

### `table`

**What it is.** A styled `<table>`. `.table` on the table element;
`.table-zebra` stripes even rows; `.table-pin-rows` makes `thead`/`tfoot`
sticky; `.table-pin-cols` makes `th` sticky horizontally; `.row-hover` on a
`<tr>` adds a hover ground; five size variants. No JS.

**daisyUI.** `border-collapse: separate` with zero `border-spacing` (so the
`--radius-box` on the table actually clips), row separators as
`border-bottom` on `thead tr :is(td,th)` and `tbody tr:not(:last-child) :is(td,th)`,
`thead`/`tfoot` at 60% `base-content`. Zebra uses `--color-base-200`, hover
`--color-base-300`. Size variants set both `font-size` and absolute padding.

**Cost. Medium-high**, and it is **the only component in the batch needing
`<table>` semantics** — `border-collapse`, `border-spacing`, sticky
`th`/`thead`, and styling that must reach `td`/`th` it does not own. Nothing in
the kit does this today. The good news: the sizing model actually fits *better*
than daisyUI's — our variants set `--fontsize` only, and the cell padding
derives from it in `em`, so a table scales as one unit instead of needing
paired font/padding declarations per size. Plumbing: `--table-bg`,
`--table-separator`, `--table-zebra-bg`, `--table-hover-bg`, `--table-pin-bg`.
**~130 lines.** Family restyle medium — separators, zebra ground and pinned-cell
ground all read from the surface set, and a family with elevation has to decide
whether a table is a raised object or a hole in the page.

**Covered?** `list` covers "rows of data with hairline separators" for the
non-tabular case and is genuinely the better answer for a list of items. It
does not cover real tabular data: column alignment across rows, headers,
footers, sticky cells.

### `timeline`

**What it is.** Events strung along a line, alternating above/below (or
left/right). `<ul class="timeline">` of `<li>`, each containing
`.timeline-start`, `.timeline-middle` (the marker), `.timeline-end`, and
`<hr>` elements as the connector segments. No JS.

**daisyUI.** Each `<li>` is a 3×3 grid whose tracks are plumbing variables:
`grid-template-rows: var(--timeline-row-start, minmax(0,1fr)) auto var(--timeline-row-end, minmax(0,1fr))`
and the column equivalent. Variants work by reassigning those:
`.timeline-compact` sets `--timeline-row-start: 0`, `.timeline-snap-icon` sets
`--timeline-col-start: .5rem`, `.timeline-vertical` restores both and rotates
the `<hr>` geometry. The `<hr>`s get `background-color: var(--color-base-300);
height: .25rem` and a set of `:has()` rules round off the first and last
segments. `.timeline-box` is a bordered card
(`--radius-box`, `--color-base-100`, `border-color: --color-base-300`,
`box-shadow: 0 1px 2px oklch(0% 0 0/.05)`).

**Cost. Medium-high.** ~200 lines across base + four variants. The
`--timeline-*` track variables are a clean plumbing contract and translate
directly. Two frictions: `<hr>` as a structural connector is unusual markup
that our Svelte wrappers would eventually have to reproduce faithfully; and
`.timeline-box` is a **fourth** instance of the unpainted-surface question
(`card`, `list`, `stats`, here), which is another argument for settling that
primitive first. Sizing: `.25rem` connectors and `.25rem` margins are frame
geometry → `em × --scale`. Family restyle medium — the connector colour, the
marker, and `.timeline-box` are all family decisions.

**Covered?** No, and `steps` is not a substitute (steps are a linear process
with numbers; a timeline is dated events with content on both sides).

---

## Cross-cutting observations

Three things recur and are worth deciding once rather than 24 times.

**1. The unpainted-surface primitive.** daisyUI's `card`, `stats`,
`timeline-box` and (in its examples) `navbar` and `hero` all expect a
background, radius and shadow to arrive from Tailwind utilities we do not ship.
Our `list` already hand-rolls exactly that surface. Whatever we decide for
`card` sets the answer for at least three others — `map.md` flags this under
"Not yet specified" and the evidence here supports it being the first
transverse decision, not a per-component one.

**2. The 90% floor filters this list on its own.** `otp` needs
`field-sizing: content` (~72%, Chromium only). `collapse`'s `<details>` path
and `menu`'s submenus need `::details-content` + `interpolate-size:
allow-keywords` — the newest mechanisms in the batch, in the same territory as
the `::picker(select)` transitions we already rejected. `diff` needs container
queries plus a documented iOS-Safari workaround. Everything else clears the
bar; `allow-discrete` (`filter`, `collapse` mode 2) at ~92% is the only other
borderline case, and it degrades to an instant state change rather than
breaking.

**3. Absolute lengths are the porting work, not the line count.** daisyUI is
rem-based and delegates dimensions to Tailwind; we are em-based with
`calc(Nem * var(--scale))` at each site and `--fontsize`-only size variants.
Every component above needs that conversion, and for a few — `stack`'s
`3px`/`4px` peek tracks, `steps`' `40px` row and `2rem` bubble, `otp`'s
`ch` geometry, `chat`'s `.75rem` tail mask — the conversion *is* the rewrite.
Conversely, `table` and `stat` come out **better** under our model than under
daisyUI's, because one `--fontsize` drives the whole block instead of paired
font/padding declarations per size.
