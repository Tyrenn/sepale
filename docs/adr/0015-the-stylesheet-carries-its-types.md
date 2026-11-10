# 0015 — The stylesheet carries its types

Status: accepted (2026-11-10)

Supersedes the entry points of [0012](./0012-a-package-alongside-the-bundle.md)
(`@sepale/components/<family>`) and its first consequence (two component
deliveries). 0014's two packages stand.

## Context

The components are generic: every axis of every family, resolved at run time
(`variants.ts`). Two things narrowed them to one family, both generated from the
compiled CSS:

- a **per-family entry point** in the package, `@sepale/components/daisy`: the
  same components, cast to props that keep only what daisy ships;
- **rewritten copies** in the app's bundle (`family-component.mjs`): one file per
  component, its props written out as plain unions for that family alone.

Both put the family in the components' package or download. Three costs followed:

- **Switching family meant switching imports** in every file, and a project that
  wanted to stay switchable had to use the generic entry and its too-wide types.
- **A family the package does not know had no types.** A family loaded in the
  app, or written elsewhere, got the generic components; a private family
  (kept out of the public repo) could only be narrowed by copying a generated
  entry point by hand, and publishing from a machine that had one would have
  shipped it.
- Two deliveries to maintain, and a source rewrite that broke whenever a
  component strayed from the hooks it relied on.

## Decision

**The family's stylesheet carries its types.** Next to `daisy.css` the build
writes `daisy.css.d.ts`, which registers what daisy ships in a global interface:

```ts
declare global {
	namespace Sepale {
		interface Families {
			daisy: { btn: { axes: { color: 'primary' | 'secondary' /* … */ }; flags: 'active'; background: false } /* … */ };
		}
	}
}
export {};
```

The components read that interface (`AxisProps` in `variants.ts`) and nothing
else:

- **no family registered**: the generic, wide props — the behaviour before;
- **one or more**: the union of what they ship. An axis no registered family
  ships has no prop;
- **`Sepale.Config { portable: true }`**: the intersection instead — only what
  every registered family ships, so switching between them never fails to compile.

A family registers by being imported. `import '@sepale/style/daisy.css'` in any
file of the project — a layout, typically — loads `daisy.css.d.ts` through the
package's `types` condition, and every component in every file narrows. Switching
family is one line, and `svelte-check` lists what the new family lacks. A family
registered for its types only, without loading its CSS, is
`import type {} from '@sepale/style/cosmos.css'`.

The `.d.ts` is **derived, never written**: one function
(`src/lib/family-types.ts`) turns a family's classification into its text, and
the build, the app (for a family loaded from disk) and anyone holding only a CSS
file go through it. A hand-written declaration could claim a variant the CSS
does not draw.

The interface is **global**, not a module augmentation of `@sepale/components`:
`@sepale/style` does not depend on the components (0014), and under pnpm a
`declare module '@sepale/components'` written inside it might not resolve. A
global namespace merges across files whatever their package.

## Considered options

- **Keep the entry points, add the `.d.ts` for others**: two ways to narrow, and
  the entry points keep tying a family to the components' package. Rejected.
- **A registration line in `app.d.ts`** (`interface Register { family: 'daisy' }`):
  explicit, but a second line to change when switching, which can disagree with
  the stylesheet actually loaded. The import is the registration. Rejected.
- **Module augmentation of `@sepale/components`**: see above. Rejected.
- **Intersection by default**: safer for switching, but a page that loads two
  families on purpose (scoped by `data-theme`) would lose half its props. Union
  by default, intersection on request.
- **Waiting for TypeScript to type CSS imports**: it would know class names at
  best, not which axis a class belongs to. The classification step stays ours.

## Consequences

- `src/lib/families/` (the entry points), `src/generated/components/` (the
  copies) and `scripts/family-component.mjs` are removed. `gen-components`
  still classifies every family's classes, still fails on an unclassified one,
  and now writes `static/families/<family>.css.d.ts`.
- `@sepale/components` has one entry, the root. `@sepale/style` maps
  `./*.css` to the stylesheet with a `types` condition; the themes and the reset
  get an empty declaration, so `noUncheckedSideEffectImports` stays quiet.
- The app's bundle carries the generic components and the family's `.d.ts`,
  for a built family and a family loaded from disk alike; the "Create a family"
  page also offers the `.d.ts` alone, and says that a family works without it.
- `sepale-types` (`src/lib/sepale-types.js`, the bin of `@sepale/components`,
  and `lib/sepale-types.js` in a bundle) writes it for a stylesheet that never
  went through Sepale, reading the AXES of the package's components or of
  copies the user changed (`--components`). Plain JavaScript, no dependency.
- **The file is named `<family>.css.d.ts`**, found beside an imported
  `<family>.css` under `bundler` resolution (Vite and SvelteKit's default) with
  no option. Not also `<family>.d.css.ts` (TypeScript's arbitrary-extension
  name): `bundler` tries it first and then requires `allowArbitraryExtensions`,
  so shipping both breaks the default setup. Under `nodenext` a loose file is
  registered with `/// <reference path>`; the package maps `types` explicitly
  and works under both.
- **Private families.** A family directory holding a `.private` file is built for
  the local app but left out of everything public: `build:css --public` (used by
  `build` and `package`) skips it and clears what an earlier local build wrote,
  and `package.mjs` refuses to run if a private family's CSS is in `static/`.
- The types follow whatever family the project imports. A project that imports
  none still compiles exactly as before.
