# 0013 — Only a combobox suggests

Status: accepted (2026-10-16)

## Context

Suggestions lived in `Input` as a `suggest` prop: a source (function or
address), a strict mode where only a picked suggestion is a value, an "add"
row, keyboard handling. A field that picks a value from a list is a different
thing from a text field, and the DOM did not say so: a strict pick was held in
JavaScript only, with nothing in the form to show what had been chosen.

## Decision

`Combobox` is its own component and the only one that suggests. `Input` and
`Select` have no suggestion machinery any more.

- **Strict** (default): the value is a picked option. A hidden `<select name>`
  carries it, so a form submits it and the DOM shows what was chosen.
- **Free** (`strict={false}`): the value is the text, the options only
  complete it — autocompletion. The `<input>` carries `name`.
- **Multiple** implies strict and shows a summary ("3 selected"). Collecting
  free values as chips is a different job: `ChipsInput`, which takes any field.

Options come from a list, a function of the query, or an address answering
JSON. The frame is the family's `.input`, the list its `.list-suggestions`:
`combobox.scss` only adds the multiple check and the size scale (ADR 0009 —
referencing another namespace is integration).

## Consequences

- `Input` is a plain field again; its `suggest`, `selected`, `onSelect`,
  `suggestion` and `noresult` props are gone. Code using them moves to
  `<Combobox>` (DataControl's entity filter did).
- One place to fix keyboard and ARIA behaviour for every picking field.
