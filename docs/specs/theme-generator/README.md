# Theme generator — development specs

The full control set of the theme generator, decided before any of it was
written. An implementer follows these files in order and takes no design
decisions: every one has already been made, and the reasoning is in the file
beside the rule.

Read [`00-grammar.md`](./00-grammar.md) first. It is binding — a section file
picks from what the grammar offers and never invents alongside it.

| File | |
|---|---|
| [`00-grammar.md`](./00-grammar.md) | `Group`, the colour box, Basic/Advanced, layout, motion, the checks |
| [`01-colours.md`](./01-colours.md) | 14 tiles · the nine colours a theme actually sets |
| [`02-common.md`](./02-common.md) | 14 · Border, Radius, Typography, Focus, Disabled, Hand-drawn |
| [`03-action.md`](./03-action.md) | 17 / 31 · button, link, join, tabs, breadcrumbs |
| [`04-field.md`](./04-field.md) | 10 / 24 · input, textarea, select, file-input, label, fieldset, validator |
| [`05-selectors.md`](./05-selectors.md) | 13 / 25 · checkbox, radio, toggle, range, swatch |
| [`06-container.md`](./06-container.md) | 12 / 24 · navbar, dock, menu, list |
| [`07-markers.md`](./07-markers.md) | 8 / 14 · badge, chip |
| [`08-feedback.md`](./08-feedback.md) | 6 / 10 · progress, radial-progress, loading, skeleton |
| [`98-later.md`](./98-later.md) | typography, the OKLCH picker, `card` |
| [`99-migration.md`](./99-migration.md) | what the 19 themes lose, and the procedure |

**95 controls in Basic, 143 in Advanced**, against 208 flat today. The count is
not the point: a closed section today shows 67 rows, and after this it shows
six.

## The four ideas, if you read nothing else

1. **One colour control for the whole form.** A box with `[ Derived │ Custom ]`,
   a source and an intensity. Its direction is automatic — light sources
   darken, dark ones lighten — so one setting serves a theme and its dark twin.
   It writes two variables, always.
2. **A group is the only grouping.** `effect` leaves the vocabulary; it was a
   group with a type.
3. **Shared controls write N sections at once.** No global variable, no second
   cascade level. Basic and Advanced are the same form showing the same
   variables at two grains, and the switch itself changes nothing.
4. **The form is not derived from the CSS, and `check:theme` is what keeps them
   honest.** Build every `internal` list by running the check and pasting what
   it names.

## Order of work

`00` → `02` (the schema and the shared groups, without which no section can be
written) → `03` as the template → `04`, `05`, `06`, `07`, `08` → `01` →
`99`.

After each section: `check:theme`, `gen:themes`, and **render it**. A look is
judged by rendering.
