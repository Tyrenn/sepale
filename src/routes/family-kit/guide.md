# Writing a Sepale family

You are writing a **family** for Sepale: one CSS file that styles every
component of the kit in one visual direction, tuned through **parameters** a
theme sets. The components already exist: their DOM and their classes are
fixed. Your file paints them. Nothing you write changes the markup.

This document is self-contained and written for an AI assistant. It holds the
steps, the **contract** the file must meet, and links to one page per
component. Links are relative to this file's address.

- Every component in one file, for an upload: [full.md](full.md)
- The page that loads your file and reports on it: `{{APP}}new-family`

## Steps

### 1. Agree the direction

Ask the user, in one message, for:

- the **name**: one lowercase word (the built families are flowers: daisy,
  dahlia, sunflower, cosmos, peony);
- the **direction**: what the look is, in a sentence or two, and the design
  system or site it follows, if any;
- the **parameters** they want to tune: colours at least, then the family's own
  knobs (radius, border width, shadow depth, blur…);
- the **light/dark** stance: both themes, or one.

Done when the user has confirmed a name and a direction. Write the direction
into the header comment (see *The file*), it is the brief for every step after.

### 2. Write the root

The header comment, the `uu-params` declaration, the defaults on
`:where(:root)`, then everything outside a component: the type scale,
`--scale`, the colours the family derives (inks written on each colour), the
recipes on `:where(*)`.

Done when the file loads on the app's page and the report shows the
parameters, with no error.

### 3. Style the components, one page at a time

Work through the [component index](#components) in its order: form controls
lean on buttons and inputs, layouts lean on everything. For each page:

1. Read its page here. It lists the component's classes (root, parts, axes,
   flags), the states the built families draw, the custom properties the
   component writes for you to read, and the DOM it renders.
2. Read the reference SCSS it links, for the **mechanism**: how the built
   families lay the component out, position its indicator, draw its fill. Its
   `structure` mixin is the mechanism to keep; its `look` mixin is the part you
   rewrite in your direction.
3. Write the component's rules.

Done for a page when every class it lists is styled or deliberately left out,
and every listed state has a visible answer: hover, focus-visible, disabled,
checked, open, current. Done for the step when the app's report lists no
missing component you meant to style.

### 4. Hand over and iterate

Give the user the whole file, every time: the app loads a file, not a patch.
They load it on the app's page (loading a file under the same name replaces the
family) and walk the component pages in a light and a dark theme.

Each round, the user names what is wrong: a component, a state, a theme. Answer
with the smallest change that fixes it, in that component's rules only, and
say which rules you changed. When the report shows a class no component
classifies, rename or remove it before anything else: such a class is a typo or
an invention, and the build of a real family rejects it.

## The contract

### The file

One stylesheet, plain CSS, UTF-8. No `@import` of another stylesheet of the kit:
a family reads nothing from another family. A web font may be loaded with an
`@import` at the very top or left to the page.

It opens with a header comment, which the app reads for the family's name and
prose. Keep its shape:

```css
/* ============================================================
   STYLE FAMILY — « orchid »  (after Some Design System)

   One or two paragraphs: what the look is, what it follows.

   Changes made to fit our contract:
     - Each place where the source design had to be read rather
       than copied, one bullet each.
   ============================================================ */
```

The `(after …)` part is the short label the family picker shows. The
"Changes made" list is optional.

### Parameters

A parameter is a custom property a theme sets. Declare each one twice: its
default on `:where(:root)` (zero specificity, so any theme wins), and its
description in one `uu-params` comment, a JSON array on a single line, which the
theme editor reads:

```css
:where(:root) {
	--color-surface-1: #ffffff;
	--color-primary: #4f46e5;
	--radius-field: 0.5rem;
}

/*! uu-params [{"name":"color-surface-1","label":"Surface 1","group":"Colors","type":"color","value":"#ffffff","kind":"surface","on":"color-on-surface"},{"name":"color-primary","label":"Primary","group":"Colors","type":"color","value":"#4f46e5","kind":"accent","on":"color-on-primary"},{"name":"radius-field","label":"Field radius","group":"Shape","type":"length","value":"0.5rem","min":0,"max":2,"step":0.05,"unit":"rem","units":["px","rem","em"],"description":"Corner radius of buttons, inputs and selects."}] */
```

Fields: `name` (without `--`), `label`, `group`, `type`, `value` (the default),
and optionally `description`, `min` / `max` / `step` (a slider), `unit` and
`units` (a unit picker). `type` is one of:

- `color`;
- `length`, `number`;
- `edge-width`: a `border-width` shorthand, edited as a width and four edge
  toggles (`"1px 0 1px 0"` draws top and bottom);
- `shadows`: a whole `box-shadow` value, edited as layers.

A colour also carries `kind`, which is `surface` (a ground things rest on),
`accent` (a colour things are painted with) or `ink` (text and lines over both),
and `on`, the variable holding the ink written on it. Groups the editor orders
first: `Colors`, `Typography`, `Shape`, `Size`, `Effects`, `Elevation`.

The parameter set is the family's own: five surfaces or one, fifteen knobs or
none. The names the built families share (and that the colour axes expect) are
`--color-surface-1` … `-3`, `--color-border`, `--color-on-surface`, and the
eight accents `--color-primary`, `secondary`, `accent`, `neutral`, `info`,
`success`, `warning`, `error`, each with its ink `--color-on-<accent>`. An ink
may be a parameter or derived by the family in its root rules
(`color-mix`, `oklch`): derived inks make every theme legible.

A theme is a `:root { … }` block of parameter values and a `color-scheme`. The
family reads only its parameters, so a dark theme is a set of dark values, and
the same rules draw it.

### Sizing

Every component is **intrinsic**: its lengths are `em`, resolved against its
own font size, so a component grows with its text and needs no breakpoint.

- A **size** axis value only sets `--fontsize`. The type scale is fixed, ratio
  1.125 on `1rem`; declare it in the root as `--default-xxs` … `--default-xxxl`
  (`0.7023rem`, `0.7901rem`, `0.8889rem`, `1rem`, `1.125rem`, `1.2656rem`,
  `1.4238rem`, `1.6018rem`, `1.802rem`) and write
  `.btn-lg { --fontsize: var(--lg, var(--default-lg)); }`. The component reads
  `font-size: var(--fontsize, var(--default-base))`.
- **`--scale`** (default `1`, on `:where(:root)`) grows the frame and never the
  text: write each height, padding and gap as `calc(Nem * var(--scale))`. Text,
  icons, radii and hairlines stay out of it.
- Inline SVG sits on the text: `svg { height: 1em; }`.
- The root font size is the page's. The family leaves it alone.

### Slots and recipes

- **Fill slots.** A component's base rule paints from its own custom
  properties (`background-color: var(--btn-bg)`, `color: var(--btn-fg)`), and
  every variant sets those properties. Variants then compose, and integrations
  keep working: `join` rounds the outer corners of its children through
  `--join-ss`, `--join-se`, `--join-es`, `--join-ee`, which a field or a button
  reads as `border-start-start-radius: var(--join-ss, var(--radius-field))`.
- **Give every `var()` a value.** A `var()` that resolves to nothing voids the
  whole declaration: `border: var(--border) solid red` with `--border` unset
  draws no border at all.
- **Recipes on `:where(*)`.** A formula built from other custom properties (a
  shadow from a depth, a relief from an offset) is declared on `:where(*)`, so
  it resolves on each element and recomputes when a state changes one input. On
  `:root` it would resolve once, for the whole page.
- **Write class names whole** in selectors (`.btn-primary`), never assembled.

### Classes and states

- Write the classes the component pages list, under their namespaces: `btn`
  owns `.btn` and every `.btn-*`. A class outside every list is one no
  component writes, and the app reports it.
- A family may ship part of an axis (four colours instead of eight) or leave a
  component out: the components then offer only what the family ships, and the
  app reports what is missing. Ship whole components rather than half of one.
- Reach into another component where the two meet (`join` sets `.btn`'s
  corners, `validator` colours a field): that is integration, and it lives in
  the file of the component doing the reaching.
- Draw the **states** each page lists: they are how the DOM says what it is
  (`[aria-selected=true]`, `[data-state=peek]`, `:checked`, `[open]`). Draw
  `:focus-visible` on everything focusable.
- Read the **custom properties the component writes**, listed on each page:
  the tab indicator's position (`--tabs-x` …), a range's fill (`--range-pct`),
  a one-off fill set by the `background` prop (`--<namespace>-bg`).

### Browser support

Target at least 90% of browsers in use: `color-mix`, `oklch`, `:has()`,
`:where()`, container queries and `@layer` qualify. Give anything newer a
fallback declared before it.

## Reference

The five built families, as SCSS, one file per component:
`reference/<family>/<page>.scss`, where `<family>` is `daisy` (after DaisyUI),
`dahlia` (after Radix), `sunflower` (neo-brutalist), `cosmos` (hand-drawn) or
`peony` (soft dashboard). Each family's `reference/<family>/index.scss` holds its
parameters and include order, `reference/<family>/_root.scss` its page layer.
The Sass helpers they call are in `reference/_mixins.scss`, `_config.scss`
(the axis lists) and `_params.scss` (the `uu-params` emitter). Each file has a
`structure` mixin (the mechanism) and a `look` mixin (the values): read them for
how a component works, then write your own CSS.

## Components

{{COMPONENTS}}
