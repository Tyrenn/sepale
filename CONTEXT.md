# u.u

A collection of components, each one a DOM structure and a set of well-defined
classes — and, in Svelte, a wrapper that makes a functional piece (an input, a
menu, a carousel) quick to put in a page. The components come first; the CSS
comes after.

To style them you pick an opinionated **family**, then tune it lightly through
its **parameters**. The web app is the distribution channel — it previews the
result and hands you the files.

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
_Avoid_: prefix (that is the eventual bundle-time rename, ADR 0007), scope

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
to its children, or directly as an object. Table, grid and list know nothing
of it: they receive its rows as if they were static.
_Avoid_: visualizer, store, data source, provider

**Data control**:
The component that puts a data handler's controls on the page: filters, sort,
search, page size, pagination, and the actions on the selection or the whole
resource (save, reset, delete, add, export, plus the caller's own). Every one
of them is optional. It wraps the table, grid or list showing the rows, so a
family can draw it as a container whatever sits inside.
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
CSS + Svelte mode — the component wrappers.
_Avoid_: package (there is no npm package), export, build
