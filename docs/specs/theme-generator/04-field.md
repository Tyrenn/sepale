# 04 — Field

**Components** — `input`, `textarea`, `select`, `file-input`, `label`,
`floating-label`, `fieldset`, `validator`.
**Prefixes** — `field`, `input`, `textarea`, `select`, `file-input`, `label`,
`floating-label`, `fieldset`, `validator`.
**Controls** — **10 in Basic**, 24 in Advanced.

From 26 top-level controls and 58 `--field-*` variables. The two-level cascade
— `var(--input-x, var(--field-x))` — stays in the CSS and **leaves the form**:
asking the same question once per component is what made this section heavy.

## Entries, in order

```
Size
▸ Fill        Background ▪ · Text ▪ · Placeholder ▪
▸ Corners     …                                    ← shared
▸ Border      …                                    ← shared
▸ Shadow      [None│Soft│Hard│Inset]
▸ Focus       …                                    ← shared
▸ Label       Floating background ▪
▸ Disabled    …                                    ← shared
▸ Hand-drawn  …                                    ← shared, LAST
```

### `field-scale` — Size

number, `0.75`–`2`, step `0.05`, default `1`. Writes `--field-scale`.

Grows every frame a field has — its height, its padding, its inner gap — and
never its text. Never shared.

### ▸ Fill — `layout: 'row'`

| Control | Sources | Default |
|---|---|---|
| `field-bg` | `surface`, custom | Derived from `surface-1` |
| `field-fg` | `own`, `text`, custom | Derived from Own, contrast |
| `field-placeholder` | `own`, `text` | Derived from Own, `0.35` |

The placeholder replaces `--field-placeholder-mix`: same variable, now reached
through the box like every other colour.

### ▸ Shadow — type · not shared

Same four modes as Action minus **Relief** (a field has no retro edge), same
controls, same `shadowVars('field', …)` machinery.

### ▸ Label — `layout: 'row'`

| Control | Sources |
|---|---|
| `floating-label-bg` | `surface`, custom |

**This one stays a control and does not go internal.** A floating label sits on
top of the field's edge and paints over it; if its background does not match
the field's, you see a seam through the border. It is the one label variable a
person genuinely has to be able to set.

`--label-mix`, `--label-divider-width`, `--floating-label-size`,
`--select-chevron-size` and `--file-input-button-size` all go to `internal`.

**The chevron is the size of the text.** Not a control, not a variable worth
asking about: `select` sizes its chevron from `1em` and that is the end of it.

### `validator`

Lives here now. It drives a field's accent to signal validity — referencing the
field namespace without owning it, which ADR 0009 allows. It reads the semantic
colours directly and needs **no control of its own**.

### `fieldset`

A frame with a legend around fields. `--fieldset-legend-fg` and
`--fieldset-label-fg` derive from the section's Text and go to `internal`.

## Writers

The Focus writer is the interesting one, and it lives in Common. It turns three
answers (style, width, colour) into the thirteen `--field-focus-*` variables
that exist today:

```
Ring    → field-focus-ring-width = width,  field-focus-ring-color = colour
Outline → field-focus-outline-width = width, -offset = --focus-offset
Glow    → field-focus-cast-* with blur = width × 3
None    → every width to 0
```

All thirteen keep their names and their places in `_defaults.scss`. Only the
number of questions changes.

## internal

`field-padding-x`, `field-disabled-mix`, `field-disabled-fg-mix` (Common's
Disabled writes them), `field-box-wobble`, `label-*`, `floating-label-size`,
`select-chevron-size`, `file-input-button-size`, `fieldset-*`, and the whole
per-component second level (`input-*`, `textarea-*`, `select-*`,
`file-input-*`).

Then run `node scripts/check-theme-vars.mjs` and paste what it still names.

## Traps

- `.textarea:where(textarea)` matches the element itself and strips its frame.
  The selector must target the class on a wrapper, not the element.
- The disabled fill must mix from the **opaque** ink. `--_fld-fg` is
  translucent and redefined two lines down; mixing from it gives every disabled
  field a pink cast.
