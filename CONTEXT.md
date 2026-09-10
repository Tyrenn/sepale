# u.u

A pure-CSS component kit with two levels of customisation: you first pick an
opinionated **family**, then tune it through its **parameters**. The web app is
the distribution channel — it previews the result and hands you the files.

## Language

### The two customisation levels

**Family**:
An opinionated visual direction, shipped as compiled CSS. It commits to one
look (flat, neumorphic, glass, material) and owns every decision a parameter
cannot express: shadow recipes, borders, state feedback. Changing family is
changing a stylesheet, never the markup.
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
`button` → `.btn`, `.btn-primary`, `.btn-sm`. Class names are identical across
families so markup stays interchangeable.

**Base**:
The family-agnostic half of a component: layout, intrinsic sizing, states,
accessibility, and the paint slots. It paints nothing.

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

**Skin**:
The look half of a component: what a family fills the paint slots with,
plus its hover/press/checked feedback. A skin lives with whoever uses it — in
`components/` when two or more families share it, in the family file otherwise.
_Avoid_: style, variant, look

**Variant**:
An opt-in class that modifies a component without changing its family —
`.btn-outline`, `.btn-sm`, `.badge-primary`. Part of the design language, not a
customisation layer bolted on top.

**Recipe**:
A CSS custom property holding a look formula rather than a value —
`--nm-inset`, `--shadow-light`. Recipes are custom properties, not Sass, so
they re-resolve per element and per state.

### Authoring

**Registry**:
The written list, in `_lib.scss`, of every component and the shared mixins it
offers. It answers "what can I pick from?" and is what the emitter dispatches
against.

**Manifest**:
The map at the heart of a family file, declaring what that family emits: its
default skin, per-component additions and removals, its parameters and their
defaults. The emitter turns it into CSS in a guaranteed cascade order.

### Distribution

**Bundle**:
The zip the app produces: the chosen family's per-component CSS, `base.css`,
the generated `theme.css`, an optional `reset.css`, a README, and — in
CSS + Svelte mode — the component wrappers.
_Avoid_: package (there is no npm package), export, build

**Showcase**:
The app's rendering of every component in the active family and theme. It is
what the family is judged on.
