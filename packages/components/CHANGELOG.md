# @sepale/components

## 0.3.0

### Minor Changes

- 5bef9c8: Motion belongs to the family (ADR 0019). No component plays an animation of its own any more: `Dialog`, `Dropdown`, `Toast`, `Alert` and `DataControl` dropped Svelte's `scale`, `fly`, `slide` and `flip`, and mark their elements instead — `data-motion="enter" | "leave" | "move"`, with `--motion-w/h` (the element's size) and `--motion-dx/dy` (where a moved toast came from). The component waits exactly as long as the family's CSS transitions and animations on the element last, read from the computed style, and at once when the family draws none. Every family now writes those motions, with the former values, under `prefers-reduced-motion: no-preference`. A toast's wrapper gets a class, `.toast-item`.
  
  `Drawer` closes its `<dialog>` once the hidden state's transition has run, as long as the family says — no more 500ms cap, and no more closing early on a `transitionend` bubbling up from its content. The ripple wave of `Button` is removed once its animation has run, and at once when the family draws none (it stayed in the DOM under reduced motion). `Switch`'s indicator gets the fix `Tabs` got: it starts from where the item it leaves stands now, measured to the subpixel.
  
  An app can still hand its own Svelte transitions over: `Dialog`, `Dropdown`, `Toast`, `Alert` and `DataControl` take a `transition` prop — left out, the family plays it; `false`, nothing does; a Svelte transition (`fly`, `{ fn: fly, params: { y: 8 } }`, `{ in: fade, out: fly }`) plays instead of the family's CSS, never with it. `Toast` takes `animate` the same way for the move (`flip`).
  
  The same mechanism is now ready where nothing moved before: the list of `Combobox` and `Select`, a chip of `ChipsInput`, a card of `Kanban` and a branch of `FileExplorer` are marked `data-motion` as they come and go, and take `transition` (and `animate` for `ChipsInput`). No family draws these yet, so they stay instant until one does — or until the app hands a Svelte transition over. Svelte's `crossfade()` works as is: its pair `[send, receive]` is a `transition`, and `Kanban`, `ChipsInput` and `Toast` hand it each item's key (`withKey`, exported), so a card moved to another column — or an item moved to another component sharing the pair — flies there. `key` on `Kanban`, `Grid`, `List`, `Table` and `Combobox` also takes a field's name: `key="id"`.
  
  `Kanban` changes its DOM: each item now stands in a `<li class="kanban-entry">` — the element that comes, goes and moves — and the item itself is a `<div class="kanban-item">` inside it; the drop marker is a `<div class="kanban-marker">` in the entry it would land before (or after the last one), and an empty column's content stands outside the `<ul>`. The body holds nothing but entries, so Svelte's `animate:` reaches them: `animate` takes a Svelte animation, and `transition={crossfade(…)} animate={flip}` moves the board exactly as a plain Svelte one. Left to the family, the moves are measured by the component (`Reflow`, exported, a FLIP): a card that stands elsewhere after a change — in its column or another — is marked `data-motion="move"` with `--motion-dx/dy`; no family draws it on `.kanban-item` yet. `animate={false}` turns it off.
  
  `ChipsInput` keys its chips by value instead of by index, so removing one no longer re-creates the ones after it. `Dialog` and `Dropdown`'s `animated` prop is replaced: `animated={false}` becomes `transition={false}`.
  
  `motion`, `moved`, `settle`, `settled` and `motionTime` are exported, for an app that wants the same contract, with the types `Motion`, `Move`, `TransitionFunction` and `AnimationFunction`.
- 5bef9c8: `Switch` takes an optional `option` snippet that draws what an item shows (an icon, an icon and its text…) in place of its label, given `{ value, label, disabled, checked }`. The label stays the item's accessible name (`aria-label` on its radio), so an icon-only choice is still announced.

### Patch Changes

- 5bef9c8: Families no longer size every `svg` of the page. The `svg { height: 1em }` rule of each family's root leaked into the application (an illustration lost its `height` attribute). It is now limited to the svg placed inside the components that take icons (button, chip, badge, input, select, combobox, tab, menu, alert, dropdown, collapse, breadcrumbs, navbar, dock, list, stat), at zero specificity, and skips any svg that states its own `height`. The dialog's close cross gets its own size.
- 5bef9c8: The tab indicator no longer jerks when the selection changes. It travelled from the place it was measured at before the change, but a new selection can move the tabs (a heavier weight widens the chosen tab and its neighbours shift): it now first stands, without transition, under the tab it leaves as that tab is laid out now, then travels as the family says. Positions are read to the subpixel (`getBoundingClientRect`) and written on the indicator itself, and on mount the indicator appears in place instead of sliding in from the corner. The family still owns the motion: `--tabs-x/y/w/h` and whatever transition it puts on `.tabs-indicator`.
- Updated dependencies [5bef9c8]
- Updated dependencies [5bef9c8]
  - @sepale/style@0.3.0

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
