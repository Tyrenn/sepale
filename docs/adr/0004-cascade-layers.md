# Emitted CSS is wrapped in cascade layers

Every generated file declares the same layer order on its first line and puts
its rules in the matching layer:

```css
@layer uu.reset, uu.base, uu.components, uu.theme;
```

The bundle is a pile of loose files the user arranges themselves, and the
Svelte wrappers import their own component CSS. Nothing guarantees `base.css`
reaches the browser before `button.css` — that order belongs to the user's
bundler. Layers make the outcome independent of it.

## Consequences

- **The order statement is repeated in every emitted file.** Layer order is
  fixed by first appearance and a later statement cannot reorder existing
  layers, so whichever file lands first must establish the full order. Repeated
  identical statements are idempotent.
- **`uu.family` is gone** (ADR 0010). It sat between `uu.components` and
  `uu.theme` to let a family's own look beat the shared rules it selected.
  There is one set of component rules now and nothing between them and the
  theme, so the layer had no content left to hold.
- **Unlayered CSS beats every layer**, so a user overriding a component in their
  own stylesheet wins with no specificity fight and no `!important`. This is a
  feature of the bundle, and the README says so.
- Support is ~95% (Chrome/Edge 99+, Firefox 97+, Safari 15.4+), above the
  project's 90% floor.
