# 01 — Colours

**Components** — none. This section defines the tokens every other section
derives from.
**Prefix** — `color`.
**Controls** — 14, all colour boxes. No group has a type.

Plus, outside every section, at the top of the form: `[ Light │ Dark ]` as two
exclusive buttons writing `color-scheme`. It is not a section of its own.

## Entries

### ▸ Surfaces — `layout: 'row'`

| Control | Default mode | Default | Writes |
|---|---|---|---|
| `color-surface-1` | **Custom** | `oklch(100% 0 0)` | `color-surface-1` |
| `color-surface-2` | **Derived** from surface‑1, `0.04` | — | `color-surface-2`, `color-surface-2-shade` |
| `color-surface-3` | **Derived** from surface‑1, `0.08` | — | `color-surface-3`, `color-surface-3-shade` |
| `color-surface-4` | **Derived** from surface‑1, `0.12` | — | `color-surface-4`, `color-surface-4-shade` |
| `color-on-surface` | **Derived** from surface‑1, contrast | — | `color-on-surface`, `color-on-surface-shade` |
| `color-border` | **Derived** from on‑surface, `0.10` | — | `color-border`, `color-border-shade` |

surface‑1 is the seed: it has no source to derive from, so its box offers
**Custom only**. Every other tile ships in Derived mode with the intensity
above, shows the resolved colour, and is overridable to Custom at any time.

The derivation is the automatic one from `00-grammar.md`: a light seed darkens,
a dark seed lightens. **The same line serves a light theme and its dark twin.**

```scss
/* _derived-content.scss */
--color-surface-2: oklch(from var(--color-surface-1)
  calc(l + clamp(-1, (0.66 - l) * 999, 1) * var(--color-surface-2-shade)) c h);
```

`--color-on-surface` keeps the existing full-contrast formula
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

**Nine colours** — surface‑1 and the eight semantics — instead of fifteen.
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
