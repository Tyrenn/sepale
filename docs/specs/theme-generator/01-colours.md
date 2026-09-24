# 01 — Colours

**Components** — none. This section defines the tokens every other section
derives from.
**Prefix** — `color`.
**Controls** — 24, all colour boxes. No group has a type.

Plus, outside every section, at the top of the form: `[ Light │ Dark ]` as two
exclusive buttons writing `color-scheme`. It is not a section of its own.

## Entries

### ▸ Fills — `layout: 'row'`

Five colours **named for what they paint**, not numbered. A number answers no
question; `--color-panel` answers "what colour is a navbar".

| Control | Default mode | Default | Paints |
|---|---|---|---|
| `color-background` | **Custom** | `oklch(100% 0 0)` | the page |
| `color-card` | Derived from background, `0.04` | — | card, dropdown, list, menu |
| `color-panel` | Derived from background, `0.08` | — | navbar, dock |
| `color-action` | Derived from background, `0.12` | — | button, tab, chip |
| `color-field` | Derived from background, `0` | — | input, select, textarea, file-input |
| `color-on-background` | Derived from background, contrast | — | ALL text |
| `color-border` | Derived from background, `0.10` | — | hairlines, dividers |

The page is the seed: it has no source to derive from, so its box offers
**Custom only**. Every other tile ships Derived with the intensity above, shows
the resolved colour, and is overridable at any time.

`--color-field` looks redundant — it is the page in daisy and in dahlia. It has
a name because **sunflower tints the page with its primary and leaves the
fields white**: "a field is the background" is a default, not a truth. One look
in four needed it.

Container is the only section whose components do not all sit on one fill: a
card, a dropdown, a list and a menu are counted objects resting ON the page and
take `--color-card`; a navbar and a dock are chrome pinned to an edge and take
`--color-panel`. So it resolves two, `--container-box-bg` and
`--container-panel-bg`, and its own box overrides both at once — which is what
makes it one section rather than two.

### The inks

Each of the five fills has an automatic `--color-on-<fill>`, derived by
contrast and **never a control** — for the same reason `--color-on-primary` is
not one: nobody knows at authoring time what a theme's card will be, and a
control there would undo an automatic contrast check. They share the page
ink's shade, so "how soft is the text" stays ONE answer.

So a person sets exactly **one** ink. A coloured text is a **class** —
`.text-primary`, `.subtitle-accent`, `.title-error` — not a theme value,
because "this heading is blue" is a choice at the point of use and "in this
theme the titles are the accent" is a different question, answered by
Container's Title box.

The derivation is the automatic one from `00-grammar.md`: a light seed darkens,
a dark seed lightens. **The same line serves a light theme and its dark twin.**

```scss
/* _derived-content.scss */
--color-card: oklch(from var(--color-background)
  calc(l + clamp(-1, (0.66 - l) * 999, 1) * var(--color-card-shade)) c h);
```

`--color-on-background` keeps the existing full-contrast formula
(`clamp(0.145, (0.66 - l) * 999, 0.97)`), which is not the same thing as a
shade: it snaps to near-black or near-white rather than stepping by an amount.
Its box's intensity trims that result; `0` leaves it alone.

### ▸ Semantics — `layout: 'row'`

`color-primary` · `color-secondary` · `color-accent` · `color-neutral` ·
`color-info` · `color-success` · `color-warning` · `color-error`

All eight default to **Custom**. Each writes `color-<name>` and
`color-<name>-shade`.

`--color-on-<semantic>` stays **derived and never a control**, exactly as
`_derived-content.scss` does it today. A control there would be a control that
undoes an automatic contrast check.

## What a theme actually sets

**Nine colours** — the page and the eight semantics — instead of fifteen.
Surfaces 2–4, the ink and the border are tiles you open to override, not
questions you must answer.

## internal

Add `color-scheme` (written by the Light/Dark switch, which is not in this
section) and every `*-shade` companion whose box is reachable. Then run
`node scripts/check-theme-vars.mjs` and paste what it still names.

## Later

The OKLCH picker with lightness / chroma / hue sliders and a live AAA contrast
badge. See `98-later.md`. Until it lands, Custom mode uses the native
`<input type="color">` — with the fix already in the tree: `pointer-events:
none` on the letter drawn over the tile, or it swallows the click.
