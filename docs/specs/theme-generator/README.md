# Theme generator — development specs

The full control set of the theme generator, decided before any of it was
written. An implementer follows these files in order and takes no design
decisions: every one has already been made, and the reasoning is in the file
beside the rule.

**Built, and amended since.** These files are the design; where the code and a
spec disagree, the code is what shipped and the spec is what was intended. The
amendments of 2026-09-24 are folded in: one grain instead of Basic/Advanced,
five colours named for what they paint instead of four numbered surfaces, and
five checks instead of three.

Read [`00-grammar.md`](./00-grammar.md) first. It is binding — a section file
picks from what the grammar offers and never invents alongside it.

| File | |
|---|---|
| [`00-grammar.md`](./00-grammar.md) | `Group`, the colour box, Common and the tick, layout, motion, the checks |
| [`01-colours.md`](./01-colours.md) | the five fills, one ink, the eight semantics |
| [`02-common.md`](./02-common.md) | 14 · Border, Focus, Muted, Hand-drawn — and how detachment is read |
| [`03-action.md`](./03-action.md) | 12 own + 18 shared · button, link, join, tabs, breadcrumbs |
| [`04-field.md`](./04-field.md) | 6 + 18 · input, textarea, select, file-input, label, fieldset, validator |
| [`05-selectors.md`](./05-selectors.md) | 9 + 18 · checkbox, radio, toggle, range, swatch |
| [`06-container.md`](./06-container.md) | 9 + 12 · card, dropdown, navbar, dock, menu, list |
| [`07-markers.md`](./07-markers.md) | 4 + 10 · badge, chip |
| [`08-feedback.md`](./08-feedback.md) | 5 + 7 · progress, radial-progress, loading, skeleton |
| [`98-later.md`](./98-later.md) | the OKLCH picker, and what is parked |
| [`99-migration.md`](./99-migration.md) | what the 19 themes lose, and the procedure |

**69 controls a section owns, 83 shared** — against 208 flat before. The count
is not the point: a closed section used to show 67 rows and now shows three to
seven groups.

## The four ideas, if you read nothing else

1. **One colour control for the whole form.** A box with a source and an
   intensity. Its direction is automatic — light sources darken, dark ones
   lighten — so one setting serves a theme and its dark twin. It writes two
   variables, always, and a pair's source defaults to `initial` so the
   component's own fallback can win.
2. **A group is the only grouping.** `effect` leaves the vocabulary; it was a
   group with a type.
3. **Shared controls write N sections at once, and there is ONE grain.** No
   global variable, no second cascade level, no mode switch. A shared group is
   answered in Common and repeated at the end of each section behind a tick,
   and **whether a section still follows Common is read off the values** — the
   biggest bucket of agreeing sections is Common's answer. Nothing about the
   form is stored, so a hand-written theme opens with its overrides marked.
4. **The form is not derived from the CSS, and five checks keep them honest.**
   `check:theme` for the names, `check:defaults` for the neutral, `check:scope`
   for where a variable is declared. Build every `internal` list by running
   `check:theme` and pasting what it names — never from memory.

## The rule that costs the most when broken

A variable is an **input** the form writes — `:root`, literal value — or a
**resolution** that reads others — `:where(*)`, substituted per element. Never
both. Get it backwards and nothing throws, nothing looks broken, and the theme
silently stops working in any scope but the root. See ADR 0012; it had bitten
four times before the check existed.

## Order of work

`00` → `02` (the schema and the shared groups, without which no section can be
written) → `03` as the template → `04`, `05`, `06`, `07`, `08` → `01` →
`99`.

After each section: the five checks, and **render it**. A look is judged by
rendering.
