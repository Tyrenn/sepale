# u.u

A pure-CSS component kit with **one** visual mechanism and a theme deep enough
to reshape it — border, corner, shadow, state and motion, not only colour. The
web app is the distribution channel: it edits a theme, previews the result and
hands you the files.

## Language

### Customisation

**Variable**:
A CSS custom property the kit reads. There is one set of them, declared once
with a neutral default, and a theme is nothing but a list of their values.
The set is the whole contract between the kit and what you do to it: a look
that cannot be reached by setting variables is a look the kit is missing a
variable for.
_Avoid_: token, parameter (it named this back when each opinionated direction
owned its own set), knob

**Control**:
One field in the theme generator. A control is not a variable. It may write
several — "press effect: push" writes an offset, two translations and a
shadow — and several controls may write one: "shadow sides" and "shadow
offset" both feed a single `box-shadow`. What a control guarantees is that a
person can answer it without reading CSS.
_Avoid_: setting, option, field (a field is a component here)

**Effect**:
A control that is off by default and reveals its own controls when turned on —
a wobble, a hard shadow, a press motion. Some effects exclude each other: a
corner is a radius **or** a wobble, never both. An effect exists only in the
generator. The CSS never hears its name, only the numbers it expands to, and
an effect that is off is a number at zero.

**Section**:
A group of controls, and the only structure the generator has. Five are
global — Colours, Typography, Sizing, Focus, Transitions. Seven gather the
components that are tuned together: Fields, Actions, Selectors, Containers,
Markers, Feedback, Text. A section is an editorial judgement about what a
person tunes in one sitting; it is not a fact about the CSS, and a component
that fits two sections is placed in one of them by hand.

**Theme**:
A complete, flat set of variable values, written as `:root { … }`. It carries
everything — colours, shapes, shadows, states, motion — and it shares nothing
with any other theme. Two themes that look alike are two files saying the same
thing, which is the price of being able to read one on its own.
_Avoid_: palette (a theme is not only colours), skin, preset, scheme

### A component

**Component**:
A DOM structure with a style applied to it. The style is described by classes,
all of them rooted in the component's own name. A component may contain other
components.

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
every class under it is that component's to name, paint, document and ship. A
file may *reference* another component's namespace without owning it:
`validator.scss` styles `.input`, `join.scss` reaches into `.btn`. That is
integration, not ownership.
_Avoid_: prefix (that is the eventual bundle-time rename, ADR 0007), scope

**Part**:
A class for a piece the component is made of, put on the element that plays
that piece — `.list-row`, `.menu-title`, `.card-body`. A part is not opted
into: it belongs to the structure.

**Variant**:
An opt-in class that changes how a component — or one of its parts — is drawn:
`.btn-outline`, `.btn-sm`, `.chip-primary`. Part of the design language, not a
customisation layer bolted on top. A variant is how a look that cannot be a
value is offered: `.tabs-box` and `.tabs-lift` draw different objects, and no
amount of variables turns one into the other. Every variant belongs to an
**axis** or is a **flag**.

**Axis**:
A group of mutually exclusive variants, named after what it impacts — `color`,
`size`, `shape`, `width`. At most one variant of an axis applies at a time. An
axis belongs to a component: `badge` has none at all, `progress` has colour but
no size. `variant` is the name kept for an exclusive group with no better one.
_Avoid_: group, category, kind, type

**Flag**:
A variant that excludes nothing, and therefore belongs to no axis —
`.btn-active`, `.menu-sub-closed`. Two flags at once are a legal state; two
variants of one axis are not.

### Authoring

**Registry**:
What the build reads back out of the compiled kit and hands to the app: every
class the stylesheet ships, and how the component that owns it classifies each
one. Generated, never written by hand, and the build FAILS on a class no
component accounts for — so a documentation page cannot describe a class that
does not exist, and no class exists that no page can describe.

The themes are not in it. They are drafts in `src/lib/theme/presets.ts`,
serialised by the same code the download button uses.

### Distribution

**Bundle**:
The zip the app produces: the per-component CSS, `base.css`, the generated
`theme.css`, an optional `reset.css`, a README, and — in CSS + Svelte mode —
the component wrappers.
_Avoid_: package (there is no npm package), export, build
