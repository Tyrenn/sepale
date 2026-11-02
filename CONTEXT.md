# Sepale

A collection of components, each one a DOM structure and a set of well-defined
classes — and, in Svelte, a wrapper that makes a functional piece (an input, a
menu, a carousel) quick to put in a page. The components come first; the CSS
comes after.

To style them you pick an opinionated **family**, then tune it lightly through
its **parameters**. Two ways to get it: the **packages**, which follow the
kit's evolution, or a **bundle** downloaded from the web app, a
snapshot of the files.

## Language

### The two customisation levels

**Family**:
An opinionated visual direction, shipped as compiled CSS — a directory of
`src/scss/families/<name>/` that is **self-contained** (ADR 0010): it writes
the whole of every component it styles, structure and look, and reads nothing
from another family. Its parameters are its own — one family may expose fifteen
background colours, another none. Changing family is changing a stylesheet,
never the markup.
_Avoid_: collection, kit, style pack, preset

**Parameter**:
A CSS custom property a family exposes for tuning — colours, radii, and the
family's own knobs (shadow offset, wobble, blur…). Each family decides its own
set; two families do not have to expose the same one.
_Avoid_: token, knob, setting, variable (too broad — every value here is a
CSS variable; only the exposed ones are parameters)

**Theme**:
A named set of parameter values for one family. A theme belongs to its family:
it can only set parameters that family exposes.
_Avoid_: palette, skin, preset, scheme

### A component

**Component**:
Usually a DOM structure with a style applied to it. The style is described by
classes, all of them rooted in the component's own name. A component may
contain other components.

A component may also draw nothing at all and bring only behaviour: the
**data handler** renders no element of its own and exists only to hand its
children a live resource. Such a component has no namespace and nothing for a
family to style.

Nothing ties a component to a file: `text.scss` holds three of them (`text`,
`title`, `subtitle`) because separating them would buy nothing, and a component
large enough to need several stylesheets is free to have them. What a component
owns is its **namespace**, not a file.

There are levels among components — a button is not a datatable — and the
levels are felt rather than defined. No line between them survived contact with
the counter-examples: `join` exists only to glue other components together,
`navbar` paints almost nothing and embeds buttons, `text` draws no frame at
all. They are all components.
_Avoid_: widget, element, block, primitive/layout (both were tried and dropped)

**Namespace**:
The root token a component's classes are built on — `btn` yields `.btn`,
`.btn-primary`, `.btn-ripple-wave`. A namespace has exactly one owner, and
every class under it is that component's to name, paint, document and ship
(ADR 0009). A file may *reference* another component's namespace without owning
it: `validator.scss` styles `.input`, `join.scss` reaches into `.btn`. That is
integration, not ownership.
_Avoid_: prefix (that is the delivery-time rename, ADR 0007: `sp-btn` is still the `btn` namespace), scope

**Part**:
A class for a piece the component is made of, put on the element that plays
that piece — `.list-row`, `.menu-title`, `.card-body`. A part is not opted
into: it belongs to the structure.

**Variant**:
An opt-in class that changes how a component — or one of its parts — is drawn:
`.btn-outline`, `.btn-sm`, `.chip-primary`. Part of the design language, not a
customisation layer bolted on top. Every variant belongs to an **axis** or is a
**flag**.

**Axis**:
A group of mutually exclusive variants, named after what it impacts — `color`,
`size`, `shape`, `width`. At most one variant of an axis applies at a time. An
axis belongs to a component, not to a family: `badge` has none at all,
`progress` has colour but no size, and a family may ship only part of one.
`variant` is the name kept for an exclusive group with no better one.
_Avoid_: group (a parameter has a group, which is a different thing), category,
kind, type

**Flag**:
A variant that excludes nothing, and therefore belongs to no axis —
`.btn-active`, `.menu-sub-closed`. Two flags at once are a legal state; two
variants of one axis are not.

### Working with data

**Data handler**:
The live state of one remote resource: the rows of the current page, the
total, the search, the sort, the filter values, the selection, the pending
edits and their history. It fetches, updates, deletes and exports the
resource. Each row it hands out carries its own actions (select, update,
save, reset, delete). It is usable either as a component, which passes itself
to its children, or directly as an object. Table, grid, list and kanban know
nothing of it: they receive its rows as if they were static.
_Avoid_: visualizer, store, data source, provider

**Data control**:
The component that puts a data handler's controls on the page: filters, sort,
search, page size, pagination, and the actions on the selection or the whole
resource (save, reset, delete, add, export, plus the caller's own). Every one
of them is optional. It wraps the table, grid, list or kanban showing the rows,
so a family can draw it as a container whatever sits inside.
_Avoid_: controls, toolbar

**Filter**:
A typed criterion the data handler sends with every fetch — text, number,
date, select, boolean, or entity (a reference to another resource, picked
from suggestions). A filter is available, shown, or immutable (set by the
page and never offered to the user).

**Dialog**:
A component laid over the page that asks for the user's attention — a
confirmation, a form. Named after the HTML element it is built on.
_Avoid_: modal, popup

**Pagination**:
The component that shows where one stands among numbered pages and moves
between them — under a table, a grid, a carousel. Its kinds (numbers, dots,
bars, a "3 / 8" count) are variants of one component, not components of their
own: they share its parts and its props, and only the drawing changes. A kind
that needed another structure would be another component.
_Avoid_: pager, dots (a variant, not the component)

### Carousel

**Item**:
One entry of a carousel, drawn in one `.carousel-item`. Several may be
visible at once, and they need not share a size; the carousel snaps from item
to item.
_Avoid_: slide, page

**Index**:
The position of the item the carousel rests on, counted from 0 over the
caller's items — duplicates drawn for an infinite carousel are never counted.
_Avoid_: page, current slide

### Fields that pick

**Combobox**:
A text field whose value comes from a list of options it looks up while
typing — a fixed list, a function, or an address answering JSON. **Strict**:
the value is a picked option, never the typed text. **Free**: the value is the
text, the options only complete it (autocompletion). Only a combobox suggests;
an input does not.
_Avoid_: autocomplete, suggest input

**Chips input**:
An accumulator: it collects several values, each shown as a chip, from a field
it is given — an input, a select or a combobox. The field picks one value; the
chips input keeps them.
_Avoid_: tags input, multi-combobox

### Drawer

**Drawer state**:
One of three: **hidden** (out of view), **peek** (overflowing into view by a
set amount) and **open** (fully in view by a set size). A drawer sits on one
of the four sides.
_Avoid_: collapsed, expanded

### Steps

**Step** / **Sub-step**:
A stage of a journey. A step may hold sub-steps, one level deep only; a step
without sub-steps is a stage of its own. Each has an optional label.

**Step state**:
One of four: **current** (where the user is), **visited** (reached before),
**complete** (declared done by the app — visiting is not completing) and
**unknown** (not reached). A step is current when one of its sub-steps is, and
complete when all of them are.
_Avoid_: done, active

### Authoring

**Structure** / **Look**:
The two mixins of a family's component file. `structure` is the mechanism —
layout, states, intrinsic sizing, accessibility, the slots; `look` is the values
and the variants. Both are the family's; they are two mixins only because a
family's `index.scss` emits every structure before any look, so a look always
wins the cascade over any structure.

**Registry**:
What the build reads back out of the compiled CSS and hands to the app: the
families, their themes, the parameters each one declares, and the classes each
one ships. Generated, never written by hand — a family renames a variable and
the configurator follows; a family drops a variant and the page documenting it
stops offering it.

### Distribution

**Bundle**:
The zip the app produces: the chosen family's stylesheet, the generated `theme.css`, an optional `reset.css`, a README, and — in
CSS + Svelte mode — the component wrappers, rewritten for that family alone.
A snapshot: it never updates. A bundle may also be just a `theme.css`, a
custom theme laid over the package's family stylesheet.
_Avoid_: export, build

**Package**:
What is published on npm for those who want the kit's evolution (ADR 0014), in
two: `@sepale/style` holds each family's stylesheet, its preset themes and the
reset, and needs nothing; `@sepale/components` holds the generic components and
one entry point per family. A custom theme is in neither: it comes from the app, as
a bundle. Its public API — parameters, classes, props — follows semver.
_Avoid_: library, bundle

**Entry point**:
`@sepale/components/<family>`: the generic components re-exported with their props
narrowed, by type alone, to what that family ships. Switching family changes
the types, never the runtime. The root `@sepale/components` is the generic entry: every
axis of every family, no guarantee any renders. Neither loads CSS:
`@sepale/style/<family>.css` is imported explicitly.
_Avoid_: export, narrowed copy (that is the bundle's rewritten wrapper)
