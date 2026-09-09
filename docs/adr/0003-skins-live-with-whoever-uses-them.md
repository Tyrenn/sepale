# Skins and variants live with whoever uses them

One mechanical rule, no case-by-case judgement: **a skin or variant used by two
or more families lives in `components/`; one used by a single family lives in
that family's file.** A family is therefore a single self-contained file, and
adding or deleting one touches nothing else.

## Why this is worth recording

The repo did the opposite, and it is the natural thing to reach for: everything
about a component in one file. The counts showed what it cost —

| mixin | component files | families using it |
|---|---|---|
| `skin-flat` | 9 | 3 (daisy, iris, poppy) |
| `skin-neu` | 11 | **1** (magnolia) |
| `skin-glass` | 8 | **1** (iris) |
| `skin-material` | 1 | **1** (poppy) |

Twenty of those files carried a look no second family would ever read, while
magnolia's identity — about fifty lines in total — was spread across eleven
files none of which mentioned magnolia. Grouping by component optimised for a
question nobody asks ("what does button look like everywhere?") and penalised
the one that is asked constantly ("what is this family, and how do I write
another?").

**Applied 2026-09-02.** `iris` and `magnolia` were dropped from the project
(the restart keeps only `daisy` and `poppy`), taking `skin-glass` and
`skin-neu` with them, and `skin-material` moved into `poppy.scss`. What is
left in `components/` is exactly what the rule says should be there: `base`,
`skin-flat` (daisy + poppy), and the variant machinery.

## Consequences

- A family file grows (magnolia: ~265 → ~325 lines) and is the better place for
  it: those lines now describe one thing.
- `components/` shrinks to what it should be — structure (`base`), the shared
  flat skin, and family-agnostic variant machinery (colour loops, size scales).
- A look becoming shared is a **move**, not a fork: the second family to want it
  promotes it into `components/` and adds it to the registry.
- The rule is mechanical on purpose. "Does this feel reusable?" invites the same
  speculative sharing that produced the table above.
