# A class namespace has one owner

A **namespace** is the root token a component's classes are built on: `btn`
gives `.btn`, `.btn-primary`, `.btn-ripple-wave`. A namespace belongs to
exactly one component, and every class under it is that component's to name,
paint, document and ship.

The rule has no exception. `text.scss` looked like one — it holds `text`,
`title` and `subtitle` — but that is three components sharing a file, not one
component owning three namespaces. Nothing ties a component to a file
(2026-09-22): the file is a convenience, the namespace is the ownership.

## Why

The rule was implicit, and two places quietly broke it.

`base/tab.scss` owned two namespaces: `tabs` (the strip) and `tab` (one tab in
it). That reads like a design decision; it is daisyUI's naming inherited whole.
An item belongs to its strip, so it takes the strip's namespace —
`.tab` → `.tabs-item`, `.tab-active` → `.tabs-item-active`,
`.tab-disabled` → `.tabs-item-disabled`, `.tab-content` → `.tabs-item-content`
— and the stylesheet becomes `base/tabs.scss`.

`base/label.scss` owned `label` and `floating-label`. Those are not two
settings of one thing: `.label` is inline and lives *inside* a field
(`.input > .label`), `.floating-label` is a container that *wraps* one. Two
roles, two components — two stylesheets, two wrappers, and the `floating` prop
disappears.

`text.scss` keeps `text`, `title` and `subtitle` in one file. They are three
components — three namespaces, three owners — and separating the files would
buy nothing: each is a handful of declarations, applicable to any tag, and none
of them draws a frame.

## Considered options

- **Let a component declare several namespaces** — `OWNS = ['tabs', 'tab']`,
  with the build checking them all. Rejected: it teaches the detector to accept
  the anomaly it correctly found.
- **Rename the strip instead of the item** (`.tabs` → `.tab-strip`). Identical
  cost, and it would cost the three variants people actually type — `.tabs-box`,
  `.tabs-border`, `.tabs-lift` — their daisyUI names.
- **Leave `tab` alone and document the exception.** Rejected: an exception that
  exists only because a rename felt expensive is a rule nobody trusts.

## Consequences

- **`daisy` loses daisyUI's `.tab` and `.tab-content`.** The family is
  advertised as "same classes, same look"; this is the second deliberate
  divergence after the colour variables were renamed. One component's naming,
  traded for a rule that then holds everywhere.
- **A component's `PREFIX` stays a single string.** With `tabs` merged and
  `label` split, no Svelte wrapper owns two namespaces, so the generator keeps
  its simplest possible declaration and gains no new concept.
- **A namespace needs a claimant to be documented.** A component page lists the
  classes of the namespaces it claims, and claims them in its own file; a
  namespace nobody claims appears on no page. That is the price of having no
  central registry, and it is why the claim lives next to the prose rather than
  in a table someone must remember to update.
