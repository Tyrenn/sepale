# 06 — Container

**Components** — `navbar`, `dock`, `menu`, `list`. `card` joins later.
**Prefixes** — `container`, `navbar`, `dock`, `menu`, `list`.
**Controls** — **12 in Basic**, 24 in Advanced.

From **90 variables**, forty of them `menu` alone. This is the worst place in
the form today and the biggest single win.

The section is named after the prefix it owns, like every other section:
Action owns `--action-*`, Field owns `--field-*`, Container owns
`--container-*`. "Layout" would own nothing.

`tabs` and `breadcrumbs` have moved to Action.

## Entries, in order

```
Size
▸ Surface     Background ▪ · Text ▪
▸ Corners     …                          ← shared (×2 factor)
▸ Border      …                          ← shared
▸ Shadow      [None│Soft│Hard│Inset]
▸ Item        Hover ▪ · Active ▪
▸ Divider     Width · Colour ▪
▸ Disabled    …                          ← shared
▸ Hand-drawn  …                          ← shared, LAST
```

### `container-scale` — Size

number, `0.75`–`2`, step `0.05`, default `1`. Writes `--container-scale`.

Grows the padding and the spacing of every box: menus, lists, the bars.

### ▸ Surface — `layout: 'row'`

| Control | Sources | Default |
|---|---|---|
| `container-bg` | `surface`, custom | Derived from `surface-1` |
| `container-fg` | `own`, `text`, custom | Derived from Own, contrast |

`--navbar-bg`, `--dock-bg`, `--list-bg`, `--menu-bg` and their `-fg` twins all
inherit from these two and go to `internal`. A bar, a dock, a menu and a list
are the same surface; a theme that wants a darker navbar sets `--navbar-bg` in
the file.

### ▸ Shadow — type · not shared

Same four modes. `--navbar-shadow`, `--menu-shadow` and
`--list-suggestions-shadow` derive from it.

### ▸ Item — `layout: 'row'` — **the pivot of this section**

| Control | Sources | Default |
|---|---|---|
| `container-item-hover` | `own`, `text` | Derived from Own, `0.07` |
| `container-item-active` | `semantic`, `own` | Derived from `primary` |

Today these two answers are asked **eleven times**: `menu-hover-bg`,
`menu-hover-fg`, `menu-active-bg`, `menu-active-fg`, `list-hover-bg`,
`list-active-bg`, `list-active-fg`, `menu-item-bg`, `menu-item-fg`,
`menu-disabled-*`, `dock-*`.

A hover is a wash of ink over the surface — **one box in Derived mode**,
direction automatic. An active row is the accent colour — **one box**. The
foreground of each follows by contrast, derived, never asked.

Deliberately dropped: the item's own radius (it follows the section's), and
`--menu-item-weight` / `--menu-item-active-weight`. A menu whose rows need
their own radius is one line in the file, not a question in a form.

### ▸ Divider — `layout: 'stack'`

| Control | | |
|---|---|---|
| `container-divider-width` | length `0`–`4` px | → `--menu-divider-size`, `--list-divider-width`, `--dock-border-width` |
| `container-divider-color` | colour box, sources `text`, `surface` | → the three matching colours |

### `menu`, specifically

`menu` was the clearest single piece of evidence for ADR 0010: **forty slots
that every family was already filling** — a theme's worth of declarations
sitting in a family file. After this section it has **two** controls' worth of
decisions and thirty-eight internal variables.

`--menu-title-*` (4), `--menu-sub-*`, `--menu-item-px/py`, `--menu-p`,
`--menu-gap`, `--menu-divider-gap`, `--menu-divider-inset` all follow
`--container-scale` and go to `internal`.

### `dock`

Four variables, and its items draw nothing of their own. It needs no control
beyond this section's Surface and Divider.

## internal

Everything under `navbar-*`, `dock-*`, `menu-*` and `list-*` except what the
groups above write, plus `container-item-corners`.

Then run `node scripts/check-theme-vars.mjs` and paste what it still names.

## Trap

`tabs.scss` must not be derived without a structural base — the last time it
was, it shipped with no structure at all. And a hard-coded
`--tab-bg: var(--color-surface-1)` shadows `--tabs-active-bg` silently. Neither
belongs here any more (tabs is in Action), but the same shape of bug is
available to `menu`: a hard-coded colour in a component file beats every theme
variable and nothing warns you.
