# Distribution is a downloadable bundle, not an npm package

_Partly superseded by [0012](./0012-a-package-alongside-the-bundle.md): the bundle stays, a package is added._

The kit is delivered by the app: you pick a family, tune its parameters, and
download a zip of plain files you drop into your own project wherever you like.
There is no published npm package, no `dist/`, and no `exports` map.

## Considered options

- **npm package** — the obvious path, and the repo was set up for it
  (`svelte-package`, `publint`, `exports`). Rejected: the product is
  *a family plus a theme you configured*, which is a per-user artifact. Shipping
  it as a package would mean either publishing every family in one dependency
  or making the user re-run a build to change a parameter. The app already has
  to render the configurator; letting it hand over the files removes the whole
  publish/version/upgrade axis.
- **Copy-paste only** — kept as a secondary path (single theme block), but a
  25-component kit is not a copy-paste artifact.

## Consequences

- The app is the product. It must stay deployable as a static site: the bundle
  is assembled client-side (JSZip) from precompiled assets, so no server ever
  compiles Sass.
- Files land in a layout the user chooses, so **nothing may depend on absolute
  paths**. Svelte wrappers import only their own component CSS, relatively.
- There is no version negotiation: a bundle is a snapshot. Upgrading means
  downloading again, which is why the README inside the bundle matters.
