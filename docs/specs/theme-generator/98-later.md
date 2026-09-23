# 98 — Later

Decisions deliberately postponed. Nothing here blocks the rework; each was
raised, understood and parked.

## Typography

**There is no font variable anywhere in the kit.** `grep -- '--font'` over
`src/scss/` returns nothing. A theme generator with no font choice is a real
gap, and it is the first lever of a design's personality.

The shape, when it lands — a **Typography** section after Colours:

| Control | |
|---|---|
| Font | exclusive buttons over five safe stacks (System / Sans / Serif / Mono / Rounded) + Custom |
| Display font | the headings' stack, default "same as body" |
| Base size | `--base`, which already exists |
| Ratio | the type scale, hard-coded at `1.125` today |

**Ratio touches a non-negotiable.** `CLAUDE.md` says the type scale is fixed,
*not* fluid. A theme-settable ratio is still fixed — it does not vary with the
viewport — but the call is the owner's. If it stays out, it stays `internal`
and the other three ship without it.

## The OKLCH picker

`01-colours.md` specifies the colour box's *model*. Its Custom mode currently
falls back to the native `<input type="color">`, which behaves poorly.

The target is daisyUI's picker: lightness / chroma / hue sliders with live
gradient tracks, the value shown in a text field in a chosen notation, and a
contrast badge (AAA / AA / fail) against the surface the colour will sit on.

Two facts for whoever builds it:

- `colorToHex` resolves a `var()` by probing an element and reading a 1×1
  canvas pixel, which is sRGB by definition. **Do not regex the computed
  value** — the browser keeps `oklch(1 0 0)` verbatim, and a naive parse reads
  `1, 0, 0` ≈ black. Every daisy swatch was black for exactly this reason.
- The letter drawn over an ink tile must carry `pointer-events: none`, or it
  swallows the click meant for the picker underneath.

## Components

- **`card`** joins the Container section when it exists.
- **`breadcrumbs`** may deserve a second look as a component. For now it reads
  Action's *Link* group and declares no decoration of its own.

## Out of scope until asked

- The zip export (JSZip) and `/lab`.
- An npm package. ADR 0001 ruled it out because there was nothing stable to
  publish; that is no longer obviously true, but it stays out of scope.
- Svelte wrappers as a published artefact.
