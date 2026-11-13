# @sepale/components

## 0.2.0

### Minor Changes

- 85f43ea: Callbacks are lowercase and native events pass through (ADR 0018). Breaking: every `onXxx` callback is renamed — value changes are `onvalue` (`onChange`, `onValue`, `Combobox`/`Tabs` `onSelect`, `Dialog` `onClose`; `Tabs` now `(value, index)`), `Menu` `onSelect` → `onpick`, `Combobox` `onInput` → `onquery`, `Collapse`/`Dropdown` `onToggle` → `onopen`, `Sidebar` `onToggle` → `oncollapsed`, `FileExplorer` `onSelect`/`onDrag`/`onDrop` → `onselection`/`ondragitems`/`ondropitems`, `Toast` `action.onClick` → `action.onclick`, the others lowercased. Native handlers (`onclose`, `oninput`, `onchange`, drag events, `onclick`…) given to a component now reach the caller instead of being replaced. Bindable props no longer have a fallback, so `bind:` to an `undefined` variable no longer throws `props_invalid_value`.

### Patch Changes

- Updated dependencies [85f43ea]
  - @sepale/style@0.2.0

## 0.1.1

### Patch Changes

- 13d24f1: A class prefix, as a Vite plugin: `import { sepale } from '@sepale/components/vite'` and
  `sepale({ prefix: 'sp', family: '@sepale/style/peony.css' })` rename the kit's classes while the project
  builds (ADR 0017). `@sepale/components/prefix` exports `classesIn`, `prefixCss` and `prefixComponent` for another build tool.
  
  `prefixCss` now renames a class glued to another (`.toast.toast-top`) or to an element (`a.btn`), which it skipped.
  
  The index exports the `GetQuery`, `UpdateQuery` and `DeleteQuery` types of the data handler and `colorToHex`, which were
  in the build but not reachable.
- Updated dependencies [13d24f1]
  - @sepale/style@0.1.1

## 0.1.0

### Minor Changes

- First public release: five families (daisy, dahlia, sunflower, cosmos, peony) and their themes, 56 styled components plus `DataHandler` and `DatePicker`, typed by the family stylesheet you import (ADR 0015).

### Patch Changes

- Updated dependencies
  - @sepale/style@0.1.0
