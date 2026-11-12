---
status: accepted
---

# The class prefix is a Vite plugin of the components package

Completes [0007](./0007-class-prefix-deferred.md): the prefix stays a rename
applied to a delivery, never to the source. What changes is the delivery.

0007 landed the rename for **bundles** and for whoever copies a family and its
generated components: they call `prefixCss` and `prefixComponent` on what they
copy. With [0014](./0014-two-packages.md) and
[0015](./0015-the-stylesheet-carries-its-types.md) there is nothing to copy
any more: a project installs `@sepale/components` and `@sepale/style` and gets
the unprefixed kit. A project whose own classes meet the kit's (`.title`,
`.chip`, `.label`…) had no way to prefix it short of renaming its own.

## Decision

`@sepale/components` ships the rename, applied while the project builds:

```ts
// vite.config.ts
import { sepale } from '@sepale/components/vite';

plugins: [sepale({ prefix: 'sp', family: '@sepale/style/peony.css' }), sveltekit()]
```

- **Opt-in.** Without `prefix` the plugin does nothing: the default is still
  the unprefixed kit.
- **Where it lives.** In the components package (`@sepale/components/vite`),
  not a third package: it is a few dozen lines around `prefix.js`, which moves
  from `scripts/` to `src/lib/` and is exported too (`@sepale/components/prefix`:
  `classesIn`, `prefixCss`, `prefixComponent`) for any other build tool. The
  plugin imports nothing, so the package gains no dependency.
- **`family`** names the stylesheet(s) the project imports, by package path or
  relative path. The classes to rename are the ones it ships (`classesIn`), so a
  component only renames what its family draws, and the stylesheet and the
  components cannot disagree. A family that is not Sepale's (a private one) is
  named the same way. A theme carries no class and is not listed.
- **Both sides, one set.** The family stylesheet is renamed token by token; the
  components of `@sepale/components` are renamed through their syntax tree, in
  node_modules, before the Svelte compiler reads them (`enforce: 'pre'`).

## What the components had to give

The tree rename of 0007 read generated components, where a class is a string.
The published components build theirs: `cx(PREFIX, applied.classes, …)`, where
`applied` comes from `applyAxes(PREFIX, …)` in `variants.ts`, so a class never
appears whole in the file. Three rules cover them, and a fourth thing moved:

- `PREFIX` is renamed where it is declared (`'checkbox'` → `'sp-checkbox'`) when
  it flows into `cx(…)` or a class attribute, and as the **head** of a class
  when it is only given to `applyAxes` (`.text` is not a class, `.text-s1` is).
  Every class the component builds from it follows.
- What `applyAxes` writes from a prefix that is not a class — the custom
  property of the `background` prop, `--checkbox-bg` — must not follow: a custom
  property is never renamed. `variants.ts` exports `CLASS_PREFIX` (empty), which
  the plugin sets, and strips it back off before writing the property.
- `prefixCss` renamed a class only when no word character came before it, which
  skipped the second class of `.toast.toast-top` and the class of `a.btn`: the
  rule is gone, a class is a class wherever it stands.
- The constraint of 0007 holds, and now has a test: a component writes its
  classes where the rename can see them. The check that backs it renders every
  component, every axis value and every flag through the plugin and fails on any
  class of the family that comes out unprefixed.

## Consequences

- Props that take classes from the consumer (`class`, `chipClass`, `field`)
  take them prefixed: `sp-input-ghost`. The types do not know the prefix; they
  narrow what a family draws, not how it is spelled.
- Custom properties, keyframes, element selectors and attributes keep their
  names, as in 0007: a theme, a `--btn-bg` or a reset needs no change.
- No source map: a rename moves columns, never lines.
- The unprefixed kit and the prefixed one are the same package: the prefix is a
  choice of the project, made in one line of its Vite config.
- Only Vite is served. Another bundler calls `prefixCss` on the stylesheet and
  `prefixComponent` on the components it compiles, with the same `classesIn` set.
