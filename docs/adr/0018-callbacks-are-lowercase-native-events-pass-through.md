---
status: accepted
---

# Callbacks are lowercase, native events pass through

Completes [0011](./0011-bind-only-what-the-component-stores.md), which decides
*what* is bound; this decides how a component talks back, and how a bound prop
behaves when nothing is given.

## Decision

**One spelling.** Every callback prop is lowercase: `onvalue`, `onpage`,
`onopen` — the way native events are written (`onclick`, `oninput`). No
`onXxx`.

**A native event is never taken.** A component's own callback never wears the
name of a DOM event (`change`, `input`, `select`, `toggle`, `close`, `drag`,
`drop`…). Those stay native: given to the component, they reach the element
with their `Event`, even when the component listens to the same event itself —
it calls the caller's handler, it does not replace it (`Dialog`'s `onclose`,
`Combobox`'s `oninput`, `FileDropzone`'s drag events, `Drawer`'s `onkeydown`…).
No `Omit` of a native handler from the props.

**What the component adds is named after what it hands over:**

- `onvalue(value)` — the value changed, given as a value, not an event:
  `Select`, `NumberInput`, `Combobox`, `Calendar`, `DatePicker`, `ColorPicker`,
  `ChipsInput`, `Rating`, `Switch`, `Editable`, `Tabs` (`(value, index)`),
  `Dialog` (the return value, once closed).
- `on<prop>(next)` for any other state the component changes: `onpage`,
  `onindex`, `onopen` (`Collapse`, `Dropdown`), `oncollapsed` (`Sidebar`),
  `onstate` (`Drawer`).
- A plain lowercase verb or noun for what happens: `onpick` (`Menu`),
  `onquery` (`Combobox`'s search), `onselection`, `onnavigate`, `onopen`,
  `ondragitems`, `ondropitems` (`FileExplorer`), `onmove`, `onsort`, `onedit`,
  `onstep`, `onadd`, `onremove`, `ondismiss`, `onfiles`.

So both accesses exist side by side: `onchange` for the event, `onvalue` for
the value.

**A bindable prop has no fallback.** `value = $bindable()`, never
`$bindable('')`: the component reads its empty state itself (`page ?? 1`,
`values ?? []`, `!!open`). Svelte refuses, at runtime, a `bind:` to
`undefined` on a prop with a fallback (`props_invalid_value`), and an
`undefined` start is what a caller writes first (`let x = $state()`).

## Why

- A native name with a value inside reads like the DOM and does not behave like
  it: `<Rating onchange>` receiving a number where `<input onchange>` receives
  an `Event`. Keeping native names native removes the guess.
- Taking a native name also took the event away from the caller: a handler
  placed after the spread silently replaced theirs.
- The fallback error only shows at runtime, crashes the whole subtree, and is
  reported against the component that renders the snippet, not the one that
  wrote the binding.

## Consequences

- Breaking for every caller of a renamed callback. The mapping, from the old
  names: `onChange`/`onValue` → `onvalue`; `Combobox` `onSelect` → `onvalue`,
  `onInput` → `onquery`, `add.onAdd` → `add.onadd`; `Tabs` `onSelect(index,
  value)` → `onvalue(value, index)`; `Menu` `onSelect` → `onpick`;
  `FileExplorer` `onSelect` → `onselection`, `onDrag` / `onDrop` →
  `ondragitems` / `ondropitems`; `Dialog` `onClose` → `onvalue`;
  `Collapse` / `Dropdown` `onToggle` → `onopen`; `Sidebar` `onToggle` →
  `oncollapsed`; `Toast` `action.onClick` → `action.onclick`; every other one
  lowercased as is.
- Native handlers given to a component now fire where they were swallowed
  before.
