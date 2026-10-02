# Map: Finding two or three families worth porting

Label: `wayfinder:map`

## Destination

A studied list of candidate design languages, and **two or three retained** —
in visibly different styles — each with its art direction described, its
parameter set identified, and its fit against our family contract judged. One
of them is meant to replace `poppy`. Porting them is a separate effort; this
map stops at "we know which ones, and why".

## Notes

- Domain: this repo. Read `CONTEXT.md` first — **family**, **parameter**,
  **theme**, **surface**, **on-color** are used with their glossary meaning.
  "DA" / "art direction" in conversation means **family**.
- Skills every session should consult: `grilling` + `domain-modeling`.
- The user is French; answer in French. Docs and code comments in English.
- **Family contract** (settled while charting): a family keeps our intrinsic
  em-based sizing, our colour vocabulary (`--color-surface-1*` / `--color-on-*`),
  and the **same core class names** as every other family. It **may** add
  variant classes of its own, which then exist only while that family is
  selected.
- Licensing is not a selection criterion: nothing is copied, every family is
  re-implemented from the look. Each family file still cites its source.
- `poppy` stays until a retained family actually replaces it — it is currently
  the only proof that the architecture supports more than one family.

## Decisions so far

- [Two or three families, deliberately different](#): the target is 2–3 retained
  candidates in visibly different styles (flat, material, editorial…), because
  three unlike art directions are what stress the architecture; beyond that we
  collect without learning.
- [Every accepted component exists in every family](#): a component missing from
  a family would break "swap the CSS, the app still stands". Where a candidate
  library has no equivalent component, the family extends its own art direction
  to cover it.
- [Survey candidate design languages](issues/01-survey-candidate-design-languages.md):
  twelve candidates described with their art direction, parameter set and fit —
  see [the survey](research/candidates.md). Headline: the sizing contract is
  passed by ten of twelve; what binds is the **colour budget** (three grounds),
  the need for **family-specific variant classes** in every visually distinct
  candidate, and a **typeface** that four of them cannot be recognised without.

- [A family owns its own variables](../components/issues/02-cut-and-name-the-list.md)
  (decided in the components map): a family is a set of opinionated classes with
  **its own set of variables**. The only constraint every family shares is
  intrinsic, font-size-driven sizing — daisy's size coefficient is daisy's, not
  the kit's. Names are shared where convenient, not by obligation. This settles
  the colour-budget half of *What a family may add*: yes, a family may go beyond
  three grounds.
- [Structural vs painted was tried and dropped](../components/issues/02-cut-and-name-the-list.md):
  splitting components by whether they paint broke on families needing to change
  layout components too, and on typography being neither layout nor surface.

- [Seven families built](../../src/scss/families/): `aster` (Ant Design),
  `snowdrop` (Geist), `gladiolus` (Carbon), `dahlia` (Radix), `sunflower`
  (neo-brutalist), `foxglove` (WebTUI), `cosmos` (PaperCSS) — each named after
  a flower that matches its look, each declaring its own parameters, each with
  two to four themes taken from its source. `poppy` deleted. The map's
  destination is reached and overshot: the user chose to build rather than to
  shortlist.

## Not yet specified

- **What a family costs to port.** The survey gives the shape (8 components
  carry a `skin-flat` to replace, 4 ride the shadow system, 13 are
  parameters-only) but not the hours. Sharpens on the first real port.
- **How a retained family's themes get produced.** Each family owns its themes
  (ADR 0005), and `daisy` has 35. Whether a new family ships 2 or 35, and
  whether they are scripted, is unasked.

## Out of scope

- **Porting a retained family** — writing the SCSS, its themes, its preview.
  That is the build, past this map's destination.
- **Replacing `poppy`** — the consequence of a port, not a decision on the route.
