# A class namespace has one owner

A **namespace** is the root token a component's classes are built on: `btn`
gives `.btn`, `.btn-primary`, `.btn-ripple-wave`. A namespace belongs to
exactly one component, and every class under it is that component's to name,
paint, document and ship. Owning more than one namespace is reserved for a
**utility** — classes with no structure, no state and no variant, `text` being
the only one today.

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

`text` keeps `text`, `title` and `subtitle`, because it is not a component: it
draws no frame, holds no state, exposes no variant, and has no wrapper. It is a
typographic scale delivered as classes. That is what a utility is, and it is
the only exception the rule admits.

## Considered options

- **Let a component declare several namespaces** — `OWNS = ['tabs', 'tab']`,
  with the build checking them all. Rejected for `tabs`: it teaches the
  detector to accept the anomaly it correctly found. The idea survives for
  utilities, where several namespaces are the point rather than an accident.
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
