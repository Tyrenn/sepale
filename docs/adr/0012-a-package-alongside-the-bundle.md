# A package alongside the bundle

_Partly superseded by [0014](./0014-two-packages.md): the package is now two, `@sepale/style` and `@sepale/components`. And by [0015](./0015-the-stylesheet-carries-its-types.md): the per-family entry points and the bundle's rewritten copies are gone; a family's stylesheet carries its types instead. What follows on semver stands._

Partly supersedes [0001](./0001-distribution-by-bundle-not-npm.md): the bundle
stays, and the kit is also published to npm as `sepale`. Some users want a
snapshot to own; others want the kit's evolution.

## The package

```ts
import { Button } from 'sepale/daisy';      // props narrowed to daisy
import 'sepale/daisy.css';                  // explicit, never automatic
import 'sepale/daisy/themes/light.css';     // a preset theme
```

- `sepale` — the generic components: every axis of every family, no CSS.
- `sepale/<family>` — an **entry point**: the same components, cast to
  `Component<Props>` where `Props` keeps only the axes, values and flags that
  family ships (read from its compiled CSS, as the registry is). An axis the
  family lacks is `Omit`ted. A generic component (`List<Row>`) cannot be
  inferred into a plain `Component<…>` without losing its parameters, so its
  signature is written out generic again from its `generics` attribute, the
  props read through `typeof all.List<Row>` — with a constructor signature as
  well as the call one, since svelte-check infers a generic's parameters from
  the constructor.
- `sepale/<family>.css`, `sepale/<family>/themes/<theme>.css`.
- A custom theme is tuned in the app and downloaded as a lone `theme.css`,
  laid after the family stylesheet.

## Considered options

- **Re-export the bundle's rewritten copies** (honest at run time) — rejected
  for the package: the cast keeps one runtime for every entry point, so
  switching `sepale/daisy` → `sepale/cosmos` is a type change only; the
  compiler lists what to fix and nothing breaks at run time.
- **Package replaces the bundle** — rejected: the snapshot is wanted too.
- **CSS imported by the entry point** — rejected: it would fix layer order
  and forbid using the types without loading the stylesheet.

## Consequences

- Two component deliveries are maintained: the bundle's rewritten copies
  (`scripts/family-component.mjs`) and the package's casts.
- The public API is parameters, classes and props. Renaming or removing one is
  a major version; adding is minor. A downloaded `theme.css` records the
  `sepale` version that produced it.
- 0001's "no `dist/`, no `exports` map" no longer holds for the package.
