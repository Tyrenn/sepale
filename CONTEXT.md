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
several — "press animation: push" writes an offset, two translations and a
shadow — and several controls may write one: "shadow sides" and "shadow
offset" both feed a single `box-shadow`. What a control guarantees is that a
person can answer it without reading CSS.
_Avoid_: setting, option, field (a field is a component here)

**Group**:
A named, visually enclosed set of controls inside a section — Border, Shadow,
Press animation. A group may have a **type**: its own exclusive setting,
rendered as tabs, which decides how many controls appear under it. A group
whose type is the whole group is what used to be called an *effect*: turn it
on and its controls appear, and the CSS never hears its name — only the
numbers it expands to, an effect that is off being a number at zero.
_Avoid_: effect (it left on 2026-09-23; it was a group with a type), panel,
fieldset (a fieldset is a component here)

**Shared**:
Said of a group whose answer is the same in every section that has it — Focus,
Disabled, Border, Radius, the hand-drawn look. In **Basic** mode a shared
group is shown once and each of its controls writes the variables of every
section at once; in **Advanced** it is shown inside each section and writes
only that one's. There is no global variable and no second level of cascade: a
shared control is an ordinary control with a longer list of variables. The
switch between the two modes is visual; nothing is written until a control is
moved.

**Box**:
The one colour control. It offers a fixed colour or a colour **derived** from
another — a token of the theme, or the element's own fill — by an intensity,
and it writes exactly two variables: the source and the shade. Its direction
is never asked: a light source darkens and a dark one lightens, so one answer
serves a theme and its dark twin.

**Section**:
A set of groups and controls, and the only top-level structure the generator
has. Colours and Common hold no components; Action, Field, Selectors,
Container, Markers and Feedback gather the components that are tuned together.
A section is an editorial judgement about what a person tunes in one sitting;
it is not a fact about the CSS, and a component that fits two sections is
placed in one of them by hand. A section owns a variable prefix, and is named
after it.

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
