---
status: accepted
---

# A class prefix is a bundle-time rename, deferred

_Continued by [0017](./0017-the-prefix-is-a-vite-plugin.md): for a project that installs the
packages, the rename is applied by a Vite plugin of `@sepale/components`. The module is now
`src/lib/prefix.js`, not `scripts/prefix.mjs`._

Class names are unprefixed (`btn`, `btn-primary`) and identical across
families. A configurable prefix is wanted eventually; when it lands it will be
a **rename applied while the bundle is assembled** — a substitution over the
compiled CSS and over the `class=` attributes of the Svelte wrappers — not a
Sass-level concern.

Threading a prefix variable through every selector of 25 components
(`.#{c.$p}btn`) would damage the readability of every file the project is meant
to be read for, to serve a feature nobody has asked for yet, and would force one
compiled build per prefix.

## Consequences

- Selectors must stay **renameable**: a class name is always a plain token in
  the selector, never assembled from fragments or hidden inside a construct a
  substitution cannot see.

## How it landed (2026-10-23)

A consumer met the collision (its own `.title` and `.chip` picked up the
kit's), so the rename exists now — still as a delivery step, never in the
source: `prefix.js` exports `prefixCss` and `prefixComponent`, and
whoever copies a family calls them on what it copies. No prefix asked, nothing
is called and the delivery is the unprefixed kit, as before. Sepale itself —
the app, the docs, the package — stays unprefixed.

- **Classes only.** Custom properties, keyframes, element selectors and
  attributes keep their names: they never collided.
- **The stylesheet is renamed token by token**, the way the app's chrome is
  (`prefixChrome` in `build-css.mjs`); comments, strings and `url()` untouched,
  external classes (`prose`, `filter`, `air-datepicker-*`) left to their owner.
- **A component is renamed through its syntax tree**, not by substitution: the
  same word is a class in one place and something else in the next
  (`role="alert"`, `type="checkbox"`, `as === 'dialog'`). Renamed: `class`
  attributes and `class:` directives, whatever flows into them in value
  position (back to the declaration a `class={classes}` reads), classes tested
  or toggled (`classes.includes`, `classList.*`) and classes in DOM selectors
  (`querySelector('.…')`, `closest('.…')`). A template building a class
  (`` `btn-${color}` ``) is renamed on its head.
- **The constraint above gets a second half:** a component writes its classes
  where the rename can see them — a string in a class attribute, or in what it
  reads. A class reached any other way (built in a helper the attribute does
  not reference, read back from `className`) would be missed.
- Props that take classes from the consumer (`class`, `chipClass`, `field`)
  take them prefixed: the consumer writes `sp-input-ghost`, not `input-ghost`.
