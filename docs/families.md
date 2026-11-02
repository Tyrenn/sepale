# Writing a family

A **family** is one opinionated look, and it is **self-contained** (ADR 0010):
its directory holds the whole of every component it styles — structure and
look — and reads nothing from another family. There is no shared base. Two
families that want the same structure each write it.

```
families/dahlia/
  index.scss            parameters, root tokens, the include order
  _root.scss            everything outside a component: the page (root
                        colour and scroll, svg, @property), the type scale,
                        --scale, the light shadow, and whatever colours
                        the family derives instead of exposing them
  button.scss           everything dahlia draws for .btn
  input.scss
  join.scss
  …                     one file per component this family styles
```

The only shared SCSS is tooling that emits nothing until called:
`_mixins.scss` (colour loops, size scales, `railed-fill`), `_config.scss` (the
axis lists) and `_params.scss` (the parameter emitter).

## The index

```scss
@use 'sass:map';
@use '../../params';
@use 'root';             // everything outside a component, emitted first
@use 'button';
@use 'input';

/* 1. What this family exposes to a theme. Declared once, here; the build
      reads it back out of the compiled CSS and the configurator follows. */
$params: map.merge(
  params.colors((
    'color-surface-1': #ffffff,
    'color-primary': #1677ff,
    // as many or as few as this family needs — fifteen, or none
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

/* Colour names and inks are the family's call. `colors()` adds labels and
   two hints the editor needs: `kind` (surface / accent / ink) and `on`, the
   variable holding the text written on a colour. Accents follow the
   family's ink convention:
     params.colors((…))                 → --color-on-primary  (derived by
                                          the family, in _root.scss)
     params.colors($ink: content, …)    → --color-primary-content (daisy:
                                          a parameter, as in daisyUI)
   The colour axis (`.btn-primary`, `.btn-secondary`…) is
   `_config.$color-list`. A family that ships fewer colours configures it
   on its first line: `@use '../../config' with ($color-list: (…));`
   (sunflower ships four). */

/* 2. Family-owned values a theme must not touch. */
:root {
  --depth: 0;
  --light-intensity: 0;
}

/* 3. Every structure, then every look. */
@include button.structure;
@include input.structure;

@include button.look;
@include input.look;
```

## A component file

```scss
@use '../../_config' as c;
@use '../../_mixins' as m;

/* dahlia — button. */

/* The mechanism: layout, states, intrinsic sizing, accessibility, and the
   slots the look fills. */
@mixin structure {
  .btn {
    display: inline-flex;
    height: var(--size);
    padding-inline: var(--btn-p);
    background-color: var(--btn-bg);
    color: var(--btn-fg);
  }
  .btn:disabled { pointer-events: none; }
}

/* The values and the variants. */
@mixin look {
  .btn {
    --size: calc(2.5em * var(--scale));
    --btn-p: calc(1em * var(--scale));
    --btn-bg: var(--btn-color, var(--color-surface-1));
    --btn-fg: var(--color-on-surface);
  }
  @each $color in c.$color-list {
    .btn-#{$color} { --btn-color: var(--color-#{$color}); }
  }
}
```

Both mixins are the family's to change. They are two only for the cascade:
the index emits every `structure` before any `look`, so a look always wins over
any structure — including another component's, which matters to `join` and
`validator`.

## The rules that matter

1. **Fill slots, do not re-declare paint.** A `structure` writes
   `background-color: var(--btn-bg)`; the `look` sets `--btn-bg`, which composes
   with every variant; writing `background-color:` directly starts a specificity war and
   breaks `join`, which injects its children's radii through their slots.
2. **An omission is invisible, not neutral**, and `var()` with no value poisons
   the whole declaration: `border: var(--border) solid var(--btn-border)` with
   `--border` unset gives **no border at all**, not a thin one.
3. **Intrinsic sizing is not optional.** Every length is em-based, driven by
   the element's own font-size and reactive to `--scale`. No breakpoints.
4. **Nothing is shared between families.** `src/scss/_mixins.scss` is a toolbox
   — colour loops, size scales — that saves typing and emits nothing until you
   call it. Two families wanting the same structure or look copy it, and a fix
   to one is applied to the others by hand.
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

1. Copy the closest family's directory — it already works — and rename it.
2. `index.scss` — header paragraph (what the look is, what it departs from and
   why), `$params`, `:root`, then every `structure` and every `look`.
3. Rewrite each component file: its `look` always, its `structure` when the
   look needs a different mechanism.
4. `themes/<name>/*.scss` — at least one theme, setting exactly the parameters
   this family declares (ADR 0005).
5. `pnpm run build:css` — a family is discovered by having an `index.scss`.
6. **Look at it**: `node scripts/shoot.mjs <name>`. Every family shipped
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
- [ ] `_root.scss`, and a file per component the family styles
- [ ] At least one theme
- [ ] `pnpm run build:css` green, the family in the picker
- [ ] Screenshot walked: every component, light and dark, hover / focus /
      disabled / checked
