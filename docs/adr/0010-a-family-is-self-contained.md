# A family is self-contained

Supersedes [0008](./0008-base-owns-the-mechanism-families-own-the-values.md).

The project is a collection of **components** first — a DOM structure and a
set of well-defined classes, and in Svelte a wrapper that makes a functional
piece quick to use. Families are how those components get styled: each one an
opinionated look, lightly tunable through its own parameters.

So a family is **self-contained**. `src/scss/families/<name>/` holds the whole
of every component it styles — structure and look — plus its page layer
and derived colours (`_root.scss`), its parameters
and its index. There is no `src/scss/base/` any more. The only shared SCSS is
tooling that emits nothing on its own: `_mixins.scss` (colour loops, size
scales, the railed fill), `_config.scss` (the axis lists) and `_params.scss`
(the parameter emitter).

Each component file has two mixins, `structure` and `look`. Both belong to the
family. They are two only for the cascade: `index.scss` emits every structure,
then every look, which is the order `base` + family produced, so the move
changed no compiled rule (verified by diffing the four stylesheets, comments
stripped).

## Why

- **Reading.** To understand how a family draws a button you read one file.
  Under 0008 it took two directories and a contract between them.
- **Adding a family.** A new family is a copied directory, edited. Nothing
  outside it can break it, and it breaks nothing outside it.
- **Independence.** Families differ in what they expose — fifteen background
  colours or none — and increasingly in how they build a component. A shared
  mechanism every family had to agree with was a constraint on all of them.

## Considered options

- **Keep `base`** (0008). Rejected: it optimises for writing less, at the cost
  of every reader and every new family.
- **One mixin per file**, structure and look together. Rejected for now: it
  interleaves the cascade per component, and nothing proves that is neutral
  (`join` and `validator` reach into other components' namespaces).

## Consequences

- **Duplication is accepted.** The structure of a component is repeated in each
  family. A fix to one does not reach the others — that is the point, and the
  cost. When a fix is general, apply it to every family by hand.
- **A family may now change structure freely.** It was already allowed under
  0008 in principle; now there is nothing to negotiate with.
- **What 0008 learned still holds inside a family**: fill slots rather than
  re-declaring paint (`join` and `validator` drive neighbours through them),
  and `var()` with no value poisons the whole declaration.
