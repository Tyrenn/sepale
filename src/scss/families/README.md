# Writing a family

A **family** is one opinionated look, and it is the only place a value is ever
written. `base/` gives you the mechanism — structure, states, intrinsic sizing,
accessibility, and named slots — and **no values at all** (ADR 0008). You never
override `base`; you fill it.

```
families/dahlia/
  index.scss     parameters, root tokens, the include order
  button.scss    everything dahlia decides about .btn, variants included
  input.scss
  range.scss
  …              one file per component this family paints
```

`base` paints nothing, so a component with no family file renders unstyled.
That is deliberate: an omission is visible, never a silent grey.

## The index

```scss
@use 'sass:map';
@use '../../params';
@use '../../base';
@use '../derived-content';   // optional: derives --color-on-* from the seeds
@use 'button';
@use 'input';

/* 1. What this family exposes to a theme. Declared once, here; the build
      reads it back out of the compiled CSS and the configurator follows. */
$params: map.merge(
  params.colors((
    'color-surface-1': #ffffff,
    'color-primary': #1677ff,
    // as many or as few as this family needs — dahlia declares four surfaces
  )),
  (
    'radius-field': (
      label: 'Field radius', group: 'Shape', type: length,
      default: 0.375rem, min: 0, max: 1.5, step: 0.025, unit: rem, units: (px rem em),
      help: 'Corner radius of buttons, inputs and selects.'
    ),
  )
);

@include params.emit($params);

/* 2. Family-owned values a theme must not touch. */
:root {
  --depth: 0;
  --light-intensity: 0;
}

/* 3. The shared mechanism, then this family's files — in that order. */
@include base.components;

@include button.emit;
@include input.emit;
```

## A component file

```scss
/* dahlia — button. */
@mixin emit {
  .btn {
    --size: calc(2.5em * var(--scale));
    --btn-p: calc(1em * var(--scale));
    --btn-bg: var(--btn-color, var(--color-surface-1));
    --btn-fg: var(--color-on-surface);
    --btn-border: var(--color-border);
  }

  /* Variants are this family's. Declare the ones this look wants, drop the
     ones it has no opinion about. */
  @each $color in c.$color-list {
    .btn-#{$color} { --btn-color: var(--color-#{$color}); }
  }
}
```

## The rules that matter

1. **Fill slots, do not re-declare paint.** `base` writes
   `background-color: var(--btn-bg)`. Setting `--btn-bg` composes with every
   variant; writing `background-color:` directly starts a specificity war and
   breaks `join`, which injects its children's radii through their slots.
2. **An omission is invisible, not neutral**, and `var()` with no value poisons
   the whole declaration: `border: var(--border) solid var(--btn-border)` with
   `--border` unset gives **no border at all**, not a thin one.
3. **Sizes are yours, the mechanism is not.** `base` guarantees em-based sizing
   driven by the element's own font-size and reactive to `--scale`. You write
   the numbers.
4. **Nothing is shared between families.** `src/scss/_mixins.scss` is a toolbox
   — colour loops, size scales — that saves typing and emits nothing until you
   call it. Two families wanting the same look copy it; we group later if it
   ever proves worth it.
5. **Recipes go on `:where(*)`**, zero specificity, resolved per element —
   custom properties, not Sass, so they recompute on `:hover` (ADR 0006).
   Family-wide recipes live in `index.scss`, above the includes.
6. **A thin rail with a filled trail needs `m.railed-fill`.** The trail is a
   100cqw box-shadow cast by the thumb, and WebKit gives it the thumb's height;
   the mixin clips the thumb's painting to a band of `--rail` plus the knob, so
   a 2px Carbon rail and a 14px knob can coexist. Set `--range-fill: 1`, define
   `--rail`, and offset the fill by `--range-thumb-size + --range-halo`.
7. **Class names stay renameable**: always a plain token in the selector, never
   assembled from fragments (ADR 0007).

## Adding one

1. `families/<name>/index.scss` — header paragraph (what the look is, what it
   departs from and why), `$params`, `:root`, `@include base.components;`.
2. A file per component you paint.
3. `themes/<name>/*.scss` — at least one theme, setting exactly the parameters
   this family declares (ADR 0005).
4. `npm run build:css` — a family is discovered by having an `index.scss`.
5. **Look at it**: `node scripts/shoot.mjs <name>`. Every family shipped
   without that step had to be redone.

## Reading the source you are porting

Read the library's compiled CSS, not its documentation. The gap between them is
where every mistake in this project has come from: WebTUI's button is filled by
default, Carbon's slider rail is `.125rem` in the *same* near-black as its
thumb, neobrutalism's inputs carry **no** shadow, PaperCSS rotates **six**
corner recipes across siblings rather than using one. None of that is in the
docs; all of it is in the stylesheet.

## Checklist

- [ ] `index.scss` with a header, `$params`, `:root`, and the include order
- [ ] A file per component the family paints
- [ ] At least one theme
- [ ] `npm run build:css` green, the family in the picker
- [ ] Screenshot walked: every component, light and dark, hover / focus /
      disabled / checked
