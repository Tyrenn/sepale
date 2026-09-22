> **Reading note (ADR 0010).** Where this text says "family" and "the family
> file", read "theme" and `_defaults.scss`. The decision below is unchanged and
> now covers the whole kit rather than one family's formulas — every shadow,
> corner and motion a control writes is a custom property for exactly the
> reason given here.

# Look recipes are CSS custom properties, not Sass mixins

A family's look formulas — neumorphic relief, directional shadow, glass fill —
are declared as CSS custom properties in the family file. Sass is used only for
what CSS cannot express: structure (`base`), repeated selector machinery
(colour loops, size scales), and the selection of what gets emitted.

## Why this is worth recording

"Write a big library of style mixins and let each family pick from it" is the
obvious design, and it was proposed. It is wrong here for a mechanical reason:
**a Sass mixin resolves at build time, a custom property resolves per element
and per state.** Magnolia's relief depends on the element's own `font-size` and
changes on `:hover` and `:active`:

```scss
:where(*) {
  --nm-offset: calc(var(--nm-distance, .18) * 1em);   /* per element */
}
.btn:hover {
  --nm-offset: calc(var(--nm-distance, .18) * 1.35em); /* per state */
}
```

The whole recipe recomputes from that one reassignment. Sass cannot do this: it
would have to emit every combination ahead of time.

The evidence was already in the code. The eleven `skin-neu` mixins are not
recipes — they are three-to-five line **bindings** ("the input is a carved
well", "the button is an extruded puck") on top of recipes that already lived
in the family file as custom properties. A Sass recipe library would have
duplicated, less capably, a layer that existed.

## Consequences

- Adding a look means writing custom properties, then binding components to
  them — not extending a mixin library.
- Recipes are declared on `:where(*)`, not `:root`, precisely so they resolve
  against each element's font size and state overrides. Pseudo-elements are not
  matched by `*`; a recipe needed inside `::before` / `::after` is rebuilt there.
- Sass mixins remain the right tool for `base` and for variants, where the
  output genuinely is fixed at build time.
