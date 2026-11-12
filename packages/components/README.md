# @sepale/components

Sepale's Svelte 5 components, typed by the family stylesheet you import.

```sh
npm install @sepale/components @sepale/style
```

```svelte
<script>
	import { Button } from '@sepale/components';
	import '@sepale/style/daisy.css';             // explicit, never automatic: and it types the props
	import '@sepale/style/daisy/themes/light.css';
</script>

<Button color="primary">Save</Button>
```

## A class prefix

The classes are plain (`btn`, `chip`, `title`). When your own classes would
meet them, a Vite plugin renames the kit's while your project builds:

```ts
// vite.config.ts
import { sepale } from '@sepale/components/vite';

plugins: [sepale({ prefix: 'sp', family: '@sepale/style/peony.css' }), sveltekit()]
```

`sp` writes `sp-btn`, `sp-btn-primary`: the stylesheet and the components are
renamed from the same list, custom properties and themes are left as they are.
Your own markup, and the classes you hand to a component, take the prefixed
names. Without `prefix` the plugin does nothing. Any other build tool calls
`prefixCss` and `prefixComponent` from `@sepale/components/prefix`. The site's
[class prefix page](https://tyrenn.github.io/sepale/prefix) has the details.

## Types that follow the family

Each family's stylesheet carries its types: `daisy.css` comes with
`daisy.css.d.ts`, which registers what daisy draws. Import the stylesheet from
any file of your project — a layout, typically — and every component's props
narrow to it, in every file: a variant daisy lacks is a compile error.

- **Switching family** is changing that one import; `svelte-check` lists what
  the new family lacks. The runtime never changes.
- **No family imported**: the props are generic, every variant of every family,
  with no guarantee that one renders.
- **Several families imported** (scoped by `data-theme`): a prop accepts what
  any of them draws.
- **Staying portable** across families: register them all — for its types
  only, `import type {} from '@sepale/style/cosmos.css'` — and declare

  ```ts
  declare global {
  	namespace Sepale {
  		interface Config { portable: true }
  	}
  }
  ```

  Props then accept only what every registered family draws, so switching
  between them never breaks the build.

A family that is not in `@sepale/style` — written by hand or by an assistant,
loaded into the site's "Create a family" page, kept private — works the same:
keep its `<family>.css.d.ts` beside its `<family>.css` and import the
stylesheet. Never write that file by hand; derive it from the stylesheet:

```sh
npx sepale-types my-family.css                          # -> my-family.css.d.ts
npx sepale-types --components src/lib/components my.css # components you changed
```

The site gives the same file ("Download types" on the "Create a family" page,
or in a bundle). Regenerate it whenever the stylesheet changes. A family works
without it: the props are then generic. Under `"moduleResolution": "nodenext"`, TypeScript does not look for a
loose `.d.ts` beside a stylesheet: register it with
`/// <reference path="./<family>.css.d.ts" />` in a `.d.ts` of yours. (The
package's own stylesheets map their types explicitly and need nothing.)

The components load no CSS. `@sepale/style` is an optional peer, because the
stylesheet may come from elsewhere: a family and a `theme.css` downloaded from
the site's theme generator work the same.
