# A theme belongs to its family

Themes are stored per family (`themes/<family>/<name>.scss`) and may set only
the parameters that family exposes. There is no cross-family theme and no
shared colour palette.

## Why this is worth recording

It looks like duplication and a future reader will want to "fix" it: `coffee`
exists for daisy and for poppy, and the two files differ by three lines. Both
sharing options were considered and rejected:

- **One theme applied to any family** — breaks as soon as parameter sets
  diverge. `--nm-bg` is meaningless to daisy, `--depth` meaningless to magnolia.
  A shared theme could only ever carry the intersection, which freezes every
  family's parameter set to the lowest common denominator. The entire point of
  a family is that it exposes its own knobs and can evolve them alone.
- **Shared colour palettes imported by per-family themes** — keeps the freedom
  above and removes the duplication, but adds an indirection to every theme
  file for a cost that is paid by a script, not a human.

## Consequences

- A new family costs its themes. Producing ~35 of them is a scripted, one-off
  job, not hand-copying.
- A colour correction to a named theme has to be applied per family. Accepted:
  themes change rarely, parameter sets change often, and only the second kind
  of change is expensive to get wrong.
