---
"@sepale/components": minor
"@sepale/style": minor
---

Callbacks are lowercase and native events pass through (ADR 0018). Breaking: every `onXxx` callback is renamed — value changes are `onvalue` (`onChange`, `onValue`, `Combobox`/`Tabs` `onSelect`, `Dialog` `onClose`; `Tabs` now `(value, index)`), `Menu` `onSelect` → `onpick`, `Combobox` `onInput` → `onquery`, `Collapse`/`Dropdown` `onToggle` → `onopen`, `Sidebar` `onToggle` → `oncollapsed`, `FileExplorer` `onSelect`/`onDrag`/`onDrop` → `onselection`/`ondragitems`/`ondropitems`, `Toast` `action.onClick` → `action.onclick`, the others lowercased. Native handlers (`onclose`, `oninput`, `onchange`, drag events, `onclick`…) given to a component now reach the caller instead of being replaced. Bindable props no longer have a fallback, so `bind:` to an `undefined` variable no longer throws `props_invalid_value`.
