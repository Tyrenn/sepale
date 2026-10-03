# The app, and the chain behind it

What is written by hand, what is generated, who generates it, and who reads it.
Nothing in `src/lib/generated/` or `src/generated/` is edited: those files are
output, git-ignored, and rebuilt by `npm run build:css`.

The rule the whole chain follows: **the compiled CSS is the source of truth.**
Not the SCSS sources — class names are interpolated there (`_mixins.scss` writes
`.#{$prefix}-#{$color}`), so `.btn-primary` exists in no source file. Anything
that needs to know what a family actually ships reads its compiled stylesheet.

## The chain

```
src/scss/families/<fam>/*.scss ─┬─ scripts/build-css.mjs (sass)
src/scss/themes/<fam>/*.scss ───┘        │
                                         ▼
                              static/families/<fam>.css
                              (+ the uu-params comment a family emits)
                              static/reset.css  — optional, on its own
                                         │
              ┌──────────────────────────┴───────────────────────────┐
              ▼                                                      ▼
   scripts/gen-registry.mjs                          scripts/gen-components.mjs
              │                                        │            │
              ▼                                        ▼            ▼
   src/lib/generated/registry.ts          src/generated/     src/lib/generated/
   families, themes, parameters,          components/<fam>/  components.ts
   family prose                           narrowed copies    class classification
              │                                                     │
              ▼                                                     ▼
    routes/+page (theme editor)                    routes/components/[id]
    routes/description                             (the CSS and Svelte tables)
```

### `scripts/build-css.mjs`

Runs Sass. One stylesheet per family into `static/families/`, plus
`static/reset.css` — compiled on its own because the reset is **optional**: a
page that already has one does not load it, and no family depends on it
(every component writes its own `box-sizing`). The app loads it from
`+layout.svelte` the way a consumer would. A family's
`index.scss` calls `params.emit($params)`, which writes both the CSS defaults
**and** a `/* uu-params [...] */` JSON comment — that comment is how a family
tells the app which variables it exposes.

### `scripts/gen-registry.mjs` → `src/lib/generated/registry.ts`

Reads `src/scss/families/` (the list of families and their header prose),
`src/scss/themes/<family>/` (the themes and their variable values), and the
`uu-params` comment out of each compiled stylesheet.

Read by `routes/playground.svelte.ts` (the family and theme pickers),
`routes/+page.svelte` (the theme editor) and `routes/description/+page.svelte`.

### `scripts/gen-components.mjs` → two outputs

Reads every `src/lib/components/*.svelte` — specifically its `<script module>`
block: `PREFIX`, `AXES`, `FLAGS`, `PARTS` — and intersects it with the classes
in each compiled stylesheet.

1. **`src/generated/components/<family>/<Name>.svelte`** — every component
   written out for that family as plain code (`scripts/family-component.mjs`):
   its props are unions of exactly the values the family ships, its classes a
   plain array, and it imports nothing local. No `AXES`, no `applyAxes`, no
   `AxisProps` — an axis or a flag the family does not ship is simply absent,
   and `background` only exists where the stylesheet reads `--<prefix>-bg`.
   Each copy goes through the Svelte compiler before it is written; types are
   checked by `npm run check`. Nothing in the app imports these yet: they are
   what the bundle hands over.

   The rewrite leans on hooks every source writes the same way — the
   `variants.js` import, `extends AxisProps<typeof AXES, typeof FLAGS>`,
   `...axes`, `let applied = $derived(applyAxes(…))`, `applied.classes`,
   `{...applied.rest}` — and fails the build on a component that departs from
   them. An axis value writes its class by two rules (`none` → `no<axis>`, a
   number → `<axis><n>`); see `src/lib/variants.ts`.
2. **`src/lib/generated/components.ts`** — the same intersection, as data:
   every class each family ships, classified (`root` / `axis` / `flag` /
   `part` / `unclassified`), plus the axis values and flags each component has
   left in that family. The component pages render this.

Both come out of one pass, deliberately: a page cannot describe a class the
generated component does not offer, because the same code decides both.

**Vendored code** goes with its component. `Calendar` imports air-datepicker
from `src/lib/vendor/air-datepicker/` (copied from its repository, see the
README there). When a source imports `../vendor/…`, its family copies get the
`vendor/` folder next to them and the import rewritten to `./vendor/…`, so a
copy still carries everything it needs. The library's own class names
(`air-datepicker*`) are external, like `.prose`: `calendar.scss` styles them
from under `.calendar`, it does not own them.

**It fails the build** when a family ships a `.prefix-*` class that the
component owning `prefix` classifies nowhere — that class is either a variant
nobody exposed or a part nobody draws, and both need a human.
**It only warns** when a class is classified by no component AND documented by
no page. That second half matters: `.text-*`, `.link-*` and `.validator-*` have
no Svelte wrapper by design, so "no component classifies it" is true of them and
says nothing. To tell the difference, the script reads the `namespaces` out of
`src/routes/components/docs/*.svelte` — the one place a build script reaches
into the app, and the reason the warning is a handful of real gaps rather than
four hundred false ones. Two class names it can never place are written down in
`EXTERNAL`: `.prose` and `.filter` belong to stylesheets we do not ship and are
only ever named to qualify our own selectors.

## The app

| Route | File | What it shows |
| --- | --- | --- |
| `/` | `+page.svelte` | The theme editor: parameters on the left, `ThemePreview` on the right |
| `/description` | `description/+page.svelte` | What the active family is, and every variable it exposes — all of it read from `registry.ts` |
| `/components/<id>` | `components/[id]/+page.svelte` | One component: description, the CSS and Svelte tables, then the examples |

`routes/+layout.svelte` owns the sidebar (family picker, theme picker,
component nav) and swaps the family stylesheet.
`routes/playground.svelte.ts` holds the shared reactive state — `family`,
`theme`, `scheme`, `tokens` — and the nav grouping.

### A component page

Two halves, joined in `routes/components/doc.ts`:

- **`routes/components/docs/<id>.svelte`** — hand-written. Its `<script module>`
  exports a `DOC`: `namespaces`, `description`, `classes` (class → what it
  does) and `props` (component → its props). The markup below is the examples,
  as `<Section>` blocks. One file per page; `import.meta.glob` picks them up, so
  adding a page is adding a file — the prerender list in `[id]/+page.ts` comes
  from the same glob.
- **`src/lib/generated/components.ts`** — derived. Which of those classes the
  **active family** actually ships, and how each is classified.

`namespaces` is the one structural fact that is written by hand, because
nothing can derive it: `.title` and `.subtitle-s1` belong to the `text` page,
and no naming rule says so. Everything else on the page is either prose (yours)
or read from the family (generated).

A class with no prose still gets a row, with a sentence derived from its
classification. Writing prose is optional, everywhere.

### Examples that a family cannot honour

`Section.svelte` reads the class names out of its own HTML sample. If the active
family ships none of them, it says so in place of the preview rather than
rendering an unstyled button labelled "soft". Nothing to declare: the list comes
from what the example itself writes.

## Adding things

| To add | Do |
| --- | --- |
| a family | `src/scss/families/<name>/` + `src/scss/themes/<name>/`, then `npm run build:css` |
| a theme | `src/scss/themes/<family>/<name>.scss` |
| a parameter | declare it in the family's `$params` map; the editor follows |
| a component | a file in every family that styles it (`structure` + `look`, ADR 0010) + (if a wrapper earns its keep) `src/lib/components/<Name>.svelte` with its `<script module>` block |
| a component page | `src/routes/components/docs/<name>.svelte` with a `DOC`. The sidebar finds it on its own; add its id to `GROUPS` in `playground.svelte.ts` only to place it in a group rather than under "Other" |

## Verification

`node scripts/shoot.mjs [family…]` screenshots the theme page per family into
`.shots/`, using the system Edge through Playwright. CSS that compiles is not
CSS that looks right. For a refactor meant to be visually neutral, diff the
sorted rules of the compiled CSS before and after — it catches cascade-order
regressions the eye misses.
