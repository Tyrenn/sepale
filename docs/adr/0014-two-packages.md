# Two packages: the style and the components

Partly supersedes [0012](./0012-a-package-alongside-the-bundle.md): what its
single `sepale` package held is split in two. The entry points, the casts and
the semver rule stand; only the names and the delivery change.

Someone using only the CSS had the whole Svelte layer in their dependencies, and
more than as dead files: `svelte` was a required peer, which npm and pnpm install
on their own. The classes are meant to be usable without Svelte (the component
comes first, the wrapper is the quick way in), so the package should not say
otherwise.

## The packages

```ts
import { Button } from '@sepale/components/daisy';  // props narrowed to daisy
import '@sepale/style/daisy.css';                   // explicit, never automatic
import '@sepale/style/daisy/themes/light.css';      // a preset theme
```

- `@sepale/style`: the compiled family stylesheets, their themes and the optional
  reset. No dependency, no JavaScript.
- `@sepale/components`: the Svelte layer. `@sepale/style` is an **optional peer**.
  The components work with any copy of the stylesheet, a downloaded one
  included, and loading CSS was never theirs (0012). When it is installed, the
  peer range keeps it at a version whose classes the types were read from.

They live in `packages/`, which holds manifests and READMEs only: the sources stay
in `src/`, and `pnpm run package` writes each `dist/`. The root package is the
site, and private.

## Considered options

- **One package, `svelte` as an optional peer**: one line, and it removes the
  forced install. Rejected: the CSS user still downloads the components, and the
  name still promises Svelte.
- **`@sepale/style` as a regular dependency of the components**: one install
  command instead of two. Rejected: under pnpm a transitive dependency cannot be
  imported from the app, and `import '@sepale/style/daisy.css'` is what a user
  writes.
- **Shipping the SCSS**: rejected. Customisation goes through parameters, and
  published sources would become an API to keep.
- **A workspace**: not needed. Neither package installs the other during
  development, and the site imports `src/lib` directly.

## Consequences

- The two are versioned together, from the root `package.json`:
  `scripts/package.mjs` writes that version into both manifests. To release, bump
  the root, run `pnpm run package`, then `pnpm publish ./packages/style` and
  `pnpm publish ./packages/components`, in that order.
- Publishing needs the `sepale` organisation to exist on npm.
- The unscoped name `sepale` is not used.
