# u.u

A pure-CSS component kit with two levels of customisation: you first pick an
opinionated **family**, then tune it through its **parameters**. The web app is
the distribution channel — it previews the result and hands you the files.

## Language

### The two customisation levels

**Family**:
An opinionated visual direction, shipped as compiled CSS — a directory of
`src/scss/families/<name>/`, one file per component plus an index. It owns every
value in the kit: colours, dimensions, variants, state feedback. Changing family
is changing a stylesheet, never the markup.
_Avoid_: collection, kit, style pack, preset

**Parameter**:
A CSS custom property a family exposes for tuning — colors, radii, and the
family's own knobs (relief distance, glass blur…). Each family decides its own
set; two families do not have to expose the same one.
_Avoid_: token, knob, setting, variable (too broad — every value here is a
CSS variable; only the exposed ones are parameters)

**Theme**:
A named set of parameter values for one family. A theme belongs to its family:
it can only set parameters that family exposes.
_Avoid_: palette, skin, preset, scheme

### Inside a family

**Component**:
One nameable UI element with its own class namespace and its own stylesheet —
`button` → `.btn`, `.btn-primary`, `.btn-sm`. One stylesheet, one namespace,
one Svelte wrapper where a wrapper earns its keep. Class names are identical
across families so markup stays interchangeable.

**Namespace**:
The root token a component's classes are built on — `btn` yields `.btn`,
`.btn-primary`, `.btn-ripple-wave`. A namespace has exactly one owner, and every
class under it is that component's to name, paint, document and ship (ADR 0009).
A file may *reference* another component's namespace without owning it:
`validator.scss` styles `.input`, `join.scss` reaches into `.btn`. That is
integration, not ownership.
_Avoid_: prefix (that is the eventual bundle-time rename, ADR 0007), scope

**Utility**:
Classes that paint without being a UI element — no structure, no state, no
variant, no wrapper. `text` is the only one: `.text-s2-b1`, `.title`,
`.subtitle-s1` are a typographic scale delivered as classes. A utility is the
one thing allowed to own several namespaces.
_Avoid_: helper, atomic class, component (it is precisely not one)

**Base**:
The shared half of a component, in `src/scss/base/<component>.scss`: structure,
states, intrinsic sizing, accessibility, and the named slots a family fills. It
owns the **mechanism and no values** — it writes `height: var(--size)` and never
`--size:`. Base alone renders nothing usable, by design.

**Surface**:
A neutral ground a family paints on, numbered by elevation: `surface-1` is the
lowest (the page, and the inside of fields — a field is a hole cut in the page),
`surface-2` the objects resting on it (plain buttons, chips, skeletons),
`surface-3` the chrome pinned to the edge of the screen (dock, navbar). Three is
what daisy needs, not a ceiling: a family declares as many levels as its look
requires. A light theme makes the higher numbers darker, a dark theme lighter.
_Avoid_: base, background, base-100/200/300, surface-high, surface-peak

**On-color**:
The color of whatever is drawn *on* a surface or on a semantic color —
`on-surface` for text on the surfaces, `on-primary` for the label of a primary
button. Never themed: every family derives it from the color it sits on, so
contrast cannot drift out of sync with the color it belongs to. One
`on-surface` covers every level; a family whose grounds diverge may declare
`--color-on-surface-2` and so on for the levels that need their own.
_Avoid_: content color, foreground, text color

**Paint slot**:
A variable a component reads instead of declaring a value — `--btn-bg`,
`--btn-fg`, `--btn-border`, `--btn-shadow`. The component paints from the slot
(`background-color: var(--btn-bg)`); skins and variants fill it. Painting a
component means filling its slots, never re-declaring `background-color`.
_Avoid_: plumbing variable, hook, token

**Menu**:
A set of navigation links with one active item, optional section titles and
optional nested sub-menus — the app's own sidebar. It owns its frame: a family
paints the block, not just the items. Distinct from **list**, which holds rows
of *data* in a painted box, and from **tab**, which selects which panel is
visible. Three components, three jobs: going somewhere, reading something,
switching what is shown.
_Avoid_: nav, sidebar, navigation (a `navbar` is a different component — a bar
pinned across the top, placement only)

**Swatch**:
A sample of one colour, optionally carrying a letter or a short label drawn on
it. The colour is passed in as `--swatch-color` — it is data, not a theme
value, so it is written by the author at the call site, never by the family. A
transparent colour shows a checkerboard behind it. What is written on it is an
**on-color** (`--swatch-on-color`), derived from the sample the same way
`--color-on-*` is derived from a surface.
_Avoid_: chip (that is our badge-like component), colour box, tile, nuance

**Variant**:
An opt-in class a family declares for one of its components —
`.btn-outline`, `.btn-sm`, `.chip-primary`. Part of the design language, not a
customisation layer bolted on top. Every variant belongs to an **axis** or is a
**flag**.

**Axis**:
A group of mutually exclusive variants of one component, named after what it
impacts — `color`, `size`, `shape`, `width`. At most one variant of an axis
applies at a time. An axis belongs to a component, not to a family: `badge` has
none at all, `progress` has colour but no size, and a family may ship only part
of one. `variant` is the name kept for an exclusive group with no better one.
_Avoid_: group (a parameter has a group, which is a different thing), category,
kind, type

**Flag**:
A variant that excludes nothing, and therefore belongs to no axis —
`.btn-active`, `.menu-sub-closed`. Two flags at once are a legal state; two
variants of one axis are not.

**Part**:
A class naming a piece a component draws inside itself rather than something
its caller opts into — `.list-row`, `.menu-title`, `.btn-ripple-wave`. A part
is not a variant: nothing is opted into.

**Recipe**:
A CSS custom property holding a look formula rather than a value —
`--nm-inset`, `--shadow-light`. Recipes are custom properties, not Sass, so
they re-resolve per element and per state.

### Authoring

**Registry**:
What the build reads back out of the SCSS and hands to the app: the families,
their themes, the parameters each one declares, and the classes each one ships.
Generated, never written by hand — a family renames a variable and the
configurator follows; a family drops a variant and the page documenting it
stops offering it.

### Distribution

**Bundle**:
The zip the app produces: the chosen family's per-component CSS, `base.css`,
the generated `theme.css`, an optional `reset.css`, a README, and — in
CSS + Svelte mode — the component wrappers.
_Avoid_: package (there is no npm package), export, build

**Showcase**:
The app's rendering of every component in the active family and theme —
description, class table, prop table and examples. It is what the family is
judged on. The prose is hand-written; what exists in the active family is read
from the registry, so a page cannot offer what its stylesheet has never heard
of.
