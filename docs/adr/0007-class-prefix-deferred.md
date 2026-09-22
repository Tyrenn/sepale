---
status: proposed
---

# A class prefix is a bundle-time rename, deferred

Class names are unprefixed (`btn`, `btn-primary`). A configurable prefix is wanted eventually; when it lands it will be
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
  substitution cannot see. This is a constraint on today's SCSS even though the
  feature does not exist.
- Nothing else is required now.
