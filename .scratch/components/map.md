# Map: Choosing which missing components the kit adopts

Label: `wayfinder:map`

## Destination

A decided list: of the ~24 daisyUI components we do not have, which ones the
kit adopts, under which names, in which order — plus the transverse decisions
some of them force before any of them can be written. Writing the components is
a separate effort; this map stops at "we know what we are adding, and why".

## Notes

- Domain: this repo. Read `CONTEXT.md` first — **component**, **base**,
  **variant**, **plumbing variable** are used with their glossary meaning.
- Skills every session should consult: `grilling` + `domain-modeling`.
- The user is French; answer in French. Docs and code comments in English.
- **Names**: keep the daisyUI name by default; deviate only where the name is
  genuinely obscure, and justify each deviation in the glossary. The user calls
  the deviations.
- **Every accepted component costs N times**, N = number of families: it needs
  a shared `base` plus a rendering in each family. That is the argument for
  cutting hard.
- Missing components (~24 after the overlays were ruled out): `alert` `avatar`
  `card` `carousel` `chat` `collapse` `countdown` `diff` `divider` `filter`
  `footer` `hero` `indicator` `kbd` `mask` `menu` `navbar` `otp` `rating`
  `stack` `stat`/`stats` `status` `steps` `swap` `table` `timeline`.

## Decisions so far

- [Overlay components are out](#): `modal`, `dropdown`, `tooltip`, `drawer`,
  `toast`, `popover` are excluded — see Out of scope.
- [Names follow daisyUI by default](#): deviating is a permanent translation
  cost for anyone arriving from daisyUI, so each deviation must earn itself.
- [Inventory the missing components](issues/01-inventory-the-missing-components.md):
  all 26 described from daisyUI's compiled CSS with their cost in our
  vocabulary — see [the inventory](research/inventory.md). Headline: `card` is
  a shared primitive four other components are waiting on; `indicator` is
  already shipped as our `badge`; `filter` is half-written in `button.scss`;
  `menu` is largely covered by `list-suggestions`.

- [Cut and name the list](issues/02-cut-and-name-the-list.md): **12 accepted** —
  `box` (daisyUI's card, renamed) · `alert` · `divider` · `dot` · `avatar` ·
  `bubble` · `navbar` · `footer` · `float` · `table` · `carousel` · `swap` — in
  that write order. 14 rejected with reasons. `list` stops painting and gains an
  interactive-row variant, which is what replaces `menu`.
- [A family owns its own variables](issues/02-cut-and-name-the-list.md): the
  objective restated — a family is a set of opinionated classes **with its own
  set of variables**; the only constraint every family shares is intrinsic,
  font-size-driven sizing. Daisy's size coefficient is daisy's, not the kit's.
  Variable names are shared where convenient, not by obligation.

## Not yet specified

- **Per-component specs.** What each accepted component's parts, plumbing
  variables and variants are. Sharpens once the list is cut.
- **What each accepted component's parameters are.** Now that each family owns
  its variable set, "which variables does `box` expose in daisy?" is a real
  question per component, answered when it is written.

## Out of scope

- **Overlay components** — `modal`, `dropdown`, `tooltip`, `drawer`, `toast`,
  `popover`. Ruled out while charting: they sit a level above what the kit is
  for, they need mechanisms nothing else uses (top layer, anchor positioning at
  ~85% support — under our 90% floor, focus management), and the primitives we
  already ship let a user build them without much effort.
- **Writing the accepted components** — the build, past this map's destination.
- **Svelte wrappers for new components** — deferred with all the others.
