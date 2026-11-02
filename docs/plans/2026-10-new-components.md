# Plan — new components (2026-10-16)

Self-contained: someone who never saw the design session can resume from here.
Decisions were taken with the user in a grilling session; vocabulary is in
`CONTEXT.md` (sections *Fields that pick*, *Drawer*, *Steps* were added for this
plan). Read `CLAUDE.md`, `docs/families.md`, `src/routes/README.md` first.

Progress is tracked by the checkboxes below — tick them as you go.

---

## 0. How a component is added (recipe, applies to every item)

For component `<id>` (kebab) / `<Name>` (Pascal) / namespace `<ns>`:

1. **SCSS, in all 5 families** — `daisy`, `dahlia`, `sunflower`, `cosmos`,
   `peony`: `src/scss/families/<fam>/<id>.scss` with `@mixin structure` and
   `@mixin look`. Then in `src/scss/families/<fam>/index.scss`: `@use '<id>';`,
   `@include <id>.structure;` in the structure block, `@include <id>.look;` in
   the look block. A family reads nothing from another (ADR 0010): copy, do not
   share.
   - Structure: layout and mechanism, paints through slots
     (`background-color: var(--<ns>-bg)`). Look: sets the slots, variants.
   - em-based, `calc(… * var(--scale))` for frames, `font-size: var(--fontsize,
     var(--base, var(--default-base)))`, no breakpoints.
   - Colour axis: `@each $color in c.$color-list { .<ns>-#{$color} {…} }`
     (sunflower ships only primary/neutral/success/error — its list is already
     configured, the loop adapts by itself).
2. **Token names differ per family** (check `index.scss` `$params`):

   | role             | daisy                      | dahlia / cosmos / peony | sunflower |
   | ---------------- | -------------------------- | ----------------------- | --------- |
   | page/surface     | `--color-base-100`         | `--color-surface-1`     | `--color-surface-2` |
   | raised surface   | `--color-base-200`         | `--color-surface-2`     | `--color-surface-2` |
   | edge             | `--color-base-300`         | `--color-border`        | `--color-border` |
   | ink              | `--color-base-content`     | `--color-on-surface`    | `--color-on-surface` |
   | ink on colour X  | `--color-X-content`        | `--color-on-X`          | `--color-on-X` |
   | radii            | `--radius-field/box/selector` | same (cosmos: none, uses wobble — use `0.5em`-ish values) | `--radius-field/box` |
   | shadow           | `--shadow-light`           | `--shadow-light`        | `--shadow-light` (hard offset) |

   Copy the nearest existing component of that family for idiom (chip,
   dialog, menu, card…). Sunflower = neobrutalist: black border, ink text,
   hard shadow. Cosmos: hand-drawn wobble. Peony: soft tint/glow.
3. **Svelte wrapper** `src/lib/components/<Name>.svelte` with the module block
   `PREFIX`, `AXES`, `FLAGS`, `PARTS` and the exact hooks `gen-components`
   rewrites (`import { applyAxes, cx, type AxisProps } from '../variants.js'`,
   `extends AxisProps<typeof AXES, typeof FLAGS>`, `...axes`,
   `let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes))`,
   `applied.classes`, `{...applied.rest}`). Copy `Chip.svelte` / `Badge.svelte`.
   Every class the families ship under `<ns>-*` must be classified in AXES /
   FLAGS / PARTS or the build fails.
4. **Export** from `src/lib/index.ts`.
5. **Doc page** `src/routes/(app)/components/docs/<id>.svelte` with `DOC`
   (`namespaces`, `description`, `classes`, `props`) and `<Section>` examples;
   add `<id>` to a group in `GROUPS` (`src/routes/playground.svelte.ts`).
6. **Verify**: `pnpm run check` (builds CSS, regenerates, type-checks), then
   `node scripts/shoot.mjs` / `pnpm run dev` and look at it in a light and a
   dark theme. CSS that compiles is not CSS that looks right.

### Conventions decided in the session

- **Event props**: non-native callbacks are `onXxx` camelCase (`onSelect`,
  `onDrop`, `onStep`, `onDismiss`, `onState`). Native handlers forwarded to an
  element stay lowercase (`onclick`, `onchange`).
- **No `bind:` that needs an `$effect`** (see ADR 0011): prefer methods exposed
  through `bind:this` (`drawer.open()`) plus a notification callback.
- English in code and docs. User speaks French.
- 90 % browser support minimum (anchor positioning, `::details-content`,
  `hidden=until-found` do NOT pass — progressive enhancement only).

---

## 1. Pass 0 — renames and moves

- [x] **1.1 Rename component event props to `onXxx`.** Current lowercase
  non-native callbacks: `onselect` (Input, Select, +1), `onsort`, `onpage`,
  `onvalue`, `onadd`, `ontoggle`, `onclose`. Find them:
  `grep -ohE "\bon[a-z]+\?:" src/lib/components/*.svelte`. For each, check it is
  not a native attribute passed straight to an element (`onchange`,
  `onpointerdown` probably native — keep). Rename prop, its uses inside
  components (e.g. DataControl → Table/List), doc pages, `src/routes/**`.
  `onIndex` already conforms.
- [x] **1.2 Move suggestions from Input/Select to Combobox** (see §4.4). Do it
  when Combobox lands; Input and Select lose `suggest`, `selected`,
  `suggestion` snippet, `onSelect`. Their doc pages lose the suggest examples.
  Write ADR `docs/adr/0013-only-a-combobox-suggests.md`.

---

## 2. Simple components

### 2.1 Divider — `.divider` · `<Divider>`
- Element: `<hr class="divider">` without content; with content
  `<div class="divider" role="separator" aria-orientation=…><span class="divider-content">…</span></div>`.
- Axes: `direction: horizontal|vertical`, `align: start|center|end` (content
  position), `color` (family list). Families may add their own shape axes
  (e.g. `variant: dashed|dotted|thick`) — each family decides; classify them in
  AXES only if at least one family ships them.
- Structure: flex row, two `::before/::after` lines (`flex: 1`, height
  `var(--divider-thickness)`, background `var(--divider-color)`); `align-start`
  shrinks the before line to a stub. Vertical: column flex, `align-self: stretch`.
- Slots: `--divider-color`, `--divider-thickness`, `--divider-gap`, `--divider-m`.

### 2.2 Alert — `.alert` · `<Alert>`
- `<div class="alert alert-<kind>" role="alert|status">` with parts
  `alert-icon`, `alert-body` (`alert-title` optional), `alert-actions`,
  `alert-close` (button ×).
- Axis `kind: info|success|warning|error` — implemented via the colour axis
  names (`alert-info`…), so name the axis `color` and restrict to those four?
  **Decision**: axis `color` with the family colour list (info/success/warning/
  error being the usual ones); sunflower ships its four. Axis `variant:
  soft|outline|solid` optional per family.
- Props: `title?`, `icon?: Snippet`, `actions?: Snippet`, `dismissible`,
  `onDismiss?`. Dismissing hides itself (internal `$state`) and calls
  `onDismiss`. `role="alert"` for error/warning, `status` otherwise.

### 2.3 Toast — `.toaster` / reuses `.alert` · `<Toaster>` + `toast()` store
- `src/lib/components/toast.svelte.ts`: `toasts` (reactive array),
  `toast(message | { message, title?, color?, duration?, action? }) → id`,
  `dismiss(id)`. `duration` ms, default 5000, `0` = persistent. Hover pauses
  the timer (Toaster tracks remaining time).
- `<Toaster>` placed once: `<section class="toaster toaster-<side> toaster-<align>" aria-live="polite">`
  each toast an `<Alert dismissible>`. Axes `side: top|bottom`,
  `align: start|center|end`. Fixed position, gap, max-width, stacking.
- Exports: `Toaster`, `toast`, `dismissToast`.

### 2.4 Tooltip — `.tooltip` · `<Tooltip>`
- Pure CSS, no repositioning. `<span class="tooltip tooltip-top">trigger<span class="tooltip-content" role="tooltip" id>text</span></span>`;
  trigger gets `aria-describedby` (wrapper sets it on the first focusable
  child? simpler: content id + `aria-describedby` on wrapper with tabindex
  if the child is not focusable — keep: wrapper is `display:inline-block`,
  content shown on `:hover` and `:focus-within`).
- Axis `side: top|right|bottom|left`, `color`. Prop `text` or snippet `tip`.
- Anchor positioning later, when > 90 %.

### 2.5 Collapse + Accordion — `.collapse` · `<Collapse>`, `<Accordion>`
- Not `<details>`. `<div class="collapse" data-open>` with
  `<button class="collapse-trigger" aria-expanded aria-controls>` and
  `<div class="collapse-panel" id role="region">` → inner
  `<div class="collapse-inner">` (needed for the `grid-template-rows: 0fr→1fr`
  animation, inner `min-height: 0; overflow: hidden`).
- Collapse props: `title` / `trigger` snippet, `open` (initial), `onToggle(open)`,
  methods `open() / close() / toggle()` via bind:this. Flag `arrow` (chevron
  that rotates). Optional `hidden="until-found"` not used (support < 90 %).
- Accordion: `<div class="accordion">` of Collapses, `items: {title, content snippet}`
  or children; prop `exclusive` (one open at a time). Namespace `accordion`
  just the group spacing/joined borders.
- Menu: later reuse Collapse for collapsible submenus (do NOT do in this pass
  unless cheap; note in Menu).

### 2.6 Rating — `.rating` · `<Rating>`
- Radios: `<div class="rating" role="radiogroup">` of
  `<input type="radio" class="rating-item" name value aria-label>`; the
  icon is a `mask`/background on the input (default star SVG as mask) so
  the style is pure CSS; a snippet `icon` replaces it by wrapping labels.
- Integer values, `max` (5), `value` bindable (it is the form's own value —
  ADR 0011 allows bind of what the component stores), `readonly`, `name`.
- Fill: items up to the checked one are filled — `:has(~ :checked)` and
  `:checked` → filled; hover preview with `:hover` / `:has(~ :hover)`
  (`.rating:hover .rating-item` dims then `:hover` and previous filled).
- Axes: `size`, `color`.

### 2.7 Segmented — `.segmented` · `<Segmented>`
- Radios in a row, `<div class="segmented" role="radiogroup">`
  `<label class="segmented-item"><input type="radio" class="segmented-input">text</label>`.
  Its own namespace (does not reuse Join: a joined pill track with an
  active fill). Axes `size`, `color`. Props `options: {value,label}[] | string[]`,
  `value` bindable, `name`, `onChange`… (native `onchange` passthrough).

### 2.8 NumberInput — `.number-input` · `<NumberInput>`
- `<div class="number-input"><button class="number-input-dec">−</button><input type="number" class="number-input-field"><button class="number-input-inc">+</button></div>`.
  Own namespace; look copies the field look of the family's input. Props
  `value` bindable, `min`, `max`, `step`, `name`, `disabled`. Buttons call
  `stepUp/stepDown` then dispatch `input`. Hide native spinners. Axis `size`.

### 2.9 EmptyState — `.empty` · `<EmptyState>`
- `<div class="empty"><div class="empty-icon">…</div><p class="empty-title"></p><p class="empty-body"></p><div class="empty-actions"></div></div>`.
  Centered column. Props `title`, `icon` / `actions` / children snippets.
  Use it as the default `empty` rendering of Table/Grid/List if they have an
  empty slot (check; do not break their API).

### 2.10 Hero — `.hero` · `<Hero>`
- `<section class="hero"><div class="hero-content"><h1 class="hero-title"><p class="hero-body"><div class="hero-actions"></div><div class="hero-media">`.
  Axis `align: start|center`, flag `reverse` (media first). Intrinsic: a
  flex-wrap row with min sizes, no breakpoints. Background: surface or
  `color` axis.

### 2.11 Footer — `.footer` · `<Footer>`
- `<footer class="footer">` grid of `footer-section` columns
  (`grid-template-columns: repeat(auto-fit, minmax(12em, 1fr))`),
  `footer-title`, `footer-bottom` (copyright row). Props: `sections` snippet
  or children; `bottom` snippet. Axis `color` (surface default).

### 2.12 Frames — `.mobile-frame`, `.window-frame`, `.laptop-frame`
Three components (decided), pure CSS drawings around `children`:
- **MobileFrame**: `<div class="mobile-frame"><div class="mobile-frame-screen">…</div></div>`,
  rounded thick bezel, notch via `::before`, side buttons via `::after`
  box-shadows. `--mobile-frame-width` (default `20em`), aspect 9/19.5.
  Flag `landscape`? — skip.
- **WindowFrame**: `<div class="window-frame"><div class="window-frame-bar"><span class="window-frame-controls">(3 dots)</span><span class="window-frame-title">{title}</span><span class="window-frame-actions">{actions}</span></div><div class="window-frame-body">…</div></div>`.
  Snippets `title` (or string prop) and `actions`.
- **LaptopFrame**: `<div class="laptop-frame"><div class="laptop-frame-lid"><div class="laptop-frame-screen">…</div></div><div class="laptop-frame-base"></div></div>`,
  base wider than lid, hinge notch. `--laptop-frame-width`.
- Colours from family surfaces/ink; no colour axis needed.

---

## 3. Drawer — `.drawer` · `<Drawer>`

- `as: 'div' | 'aside' | 'nav' | 'dialog'` (default `div`). Rendered with
  `<svelte:element this={as}>`.
- Axis `side: top|right|bottom|left` (default `left`).
- Three **drawer states** (CONTEXT.md): `hidden | peek | open`, written as
  `data-state` on the element. CSS translates it:
  `--drawer-size` (open extent, default `20em`), `--drawer-peek` (default
  `3em`). Left: `transform: translateX(calc(-100% + var(--drawer-peek)))` for
  peek, `-100%` hidden, `0` open; similar per side. Transition on transform.
  Position `fixed` by default; flag `inline`? — use `position: var(--drawer-position, fixed)`
  so it can be `absolute` inside a container (doc examples need that).
- `as="dialog"`: `open()` → `showModal()` (backdrop, Escape closes, backdrop
  click closes); `peek()` → `show()` non-modal (after `close()` if modal);
  `hide()` → `close()`. Escape/backdrop resolve to the **rest state**: `peek`
  if the drawer has a peek (`peekable` prop, default true when initial state
  is peek), else `hidden`.
- Not dialog: Escape when focus inside an `open` drawer → rest state.
- API: `state` prop = initial only; methods `open()`, `peek()`, `hide()`,
  `toggle()` (open ↔ rest), getter `state`; `onState(state)` callback.
- Part `drawer-handle` (optional button, snippet `handle` or flag) toggles
  peek ↔ open. Clicking the peeking part (when in peek) opens.
- Slots: `--drawer-bg`, `--drawer-fg`, `--drawer-shadow`, `--drawer-radius`,
  `--drawer-backdrop`.

## 4. Steps — `.steps` · `<Steps>`

Model (CONTEXT.md *Step*, *Step state*):
```ts
type Step = { id: string | number; label?: string; steps?: Step[]; // sub-steps, one level
              complete?: boolean; error?: string; warning?: string };
```
Props: `steps: Step[]`, `current` (id of a leaf), `explored` (id of the first
leaf never reached; leaves before it are visited) — or derive order from the
flattened leaf list, `clickable = true`, `disabled`, `compact` flag,
`onStep(step)`, snippet `heading({ step, parent, index, total })` with a
default `label · index/total` (no language).

States per leaf: `current` (id === current), `complete` (declared), `visited`
(index < index(explored), or explicit), else `unknown`. Parent: current if a
child is, complete if all children are, visited if any child is.

Clickable when visited|complete|current and `clickable && !disabled`; parent
click → its first leaf. Error/warning shown only once visited.

DOM (from the user's example, renamed to the namespace):
```
<nav class="steps [steps-vertical] [steps-compact]" aria-label>
  [compact] <div class="steps-heading">{heading}</div>
  <ol class="steps-list">
    <li class="steps-item" data-state=…>
      <div class="steps-track">
        [!compact] <button class="steps-marker">✓</button>
        <button class="steps-segment" data-state aria-current="step"><span></span></button> × leaves
      </div>
      [!compact] <p class="steps-label">label [issue icon]</p>
      [current & has sub-steps] <p class="steps-sublabel">current sub label</p>
```
Axes: `direction: horizontal|vertical`, `color`. Flag `compact`.
States as `data-state="current|visited|complete|unknown"` + `data-issue="error|warning"`
(attributes, not classes — no classification needed).

## 5. DatePicker — `.date-picker` · `<DatePicker>`

Input + Dropdown + Calendar (Calendar already supports `range` and
`multiple`). Props: `value` (Date | null, or [Date, Date] with `range`),
`range`, `name`, `placeholder`, `format(date) → string`, `onChange(value)`,
plus Calendar's own options passed through. Input readonly showing the
formatted value, opens a Dropdown holding a Calendar; closes on pick (single)
or second pick (range). Hidden `<input type="hidden" name>` with ISO date(s).
Namespace `date-picker` only for the wrapper layout (probably no styles but
the root); check Dropdown and Calendar APIs before writing.

## 6. Combobox — `.combobox` · `<Combobox>`

Takes over Input's `Suggest` machinery (`src/lib/components/Input.svelte`,
section "Suggestions": types `SuggestCommon`, `Suggest`, `show`, `strict`,
fetch/function sources, debounce, keyboard handling). Move, don't rewrite.

- Options from: array, `(query) => Promise<T[]> | T[]`, or URL string
  answering JSON (same as Input's suggest today).
- **Strict** (default): value is a picked option. DOM:
  `<div class="combobox"><input role="combobox" aria-expanded aria-controls aria-autocomplete="list" class="combobox-input"><select name hidden class="combobox-select">(picked option(s))</select><ul role="listbox" class="combobox-list"><li role="option" class="combobox-option" aria-selected>…</li></ul></div>`.
- **Free** (`strict={false}`): value is the text, the `<input>` carries
  `name`, no `<select>` — autocompletion.
- **Multiple** (implies strict): input shows a summary ("3 selected" or the
  labels joined when they fit — `summary(values)` overridable), the list stays
  open while toggling, options carry a check, `<select multiple hidden>`.
- Props: `options`, `strict`, `multiple`, `show(item) → string`,
  `key(item)`, `value` (initial), `onSelect(value)`, `onInput(text)`,
  snippet `option(item)`, `empty` snippet, `minChars`, `debounce`.
- ARIA combobox 1.2 pattern: arrow keys move `aria-activedescendant`,
  Enter picks, Escape closes, Tab closes.
- Then remove `suggest` from Input & Select (§1.2), migrate doc examples.

## 7. ChipsInput — `.chips-input` · `<ChipsInput>`

Accumulator, separate from the field (CONTEXT.md *Chips input*).
- `field({ add })` snippet: the field calls `add(value)` on commit (Enter on
  Input, `onSelect` of Combobox, `change` of Select). Default field: a plain
  `<input>` adding on Enter / comma.
- Renders `<div class="chips-input">` with `.chip` per value (removable ×),
  Backspace on an empty field removes the last, one
  `<input type="hidden" name="{name}[]" value>` per value.
- `values` bindable (it stores them — ADR 0011), `onChange(values)`,
  `unique` (default true), `chip(value)` snippet.

## 8. FileExplorer — `.file-explorer` · `<FileExplorer>`

Google Drive inspired. Three zones:
1. Tree (folders, lazy) — left, optional (`tree` flag, default true).
2. Content of the current folder — `view: list|grid` (toggle in toolbar),
   list = table with sortable columns name / modified / size.
3. Details pane — snippet `details(items)`, shown when a selection exists.

Plus a toolbar (Breadcrumbs path + `toolbar` snippet for actions + view
toggle), multi-selection (click, Ctrl/Cmd toggle, Shift range), double-click
or Enter opens a folder or calls `onOpen(file)`, right-click → `menu(items)`
snippet inside a positioned Dropdown-like popover, keyboard arrows.

Node: `{ id, name, kind: 'folder' | 'file', size?, modified?: Date, icon?, … }`.
Source: `children(folder | null) → Node[] | Promise<Node[]>` (lazy) or
`root: Node & { children?: Node[] }` static tree.
Drag & drop: `onDrag(items, event)` (return false to cancel), `onDrop(items, target, event)`
— `items` are Nodes from inside, or `File[]` from the OS. The component moves
nothing; the app reloads (method `refresh(folder?)`).
Also `onSelect(items)`, `onNavigate(folder)`.

---

## 9. Order and status

1. [x] Pass 0.1 renames
2. [x] Divider
3. [x] Alert
4. [x] Toast (Toaster + toast.svelte.ts)
5. [x] Tooltip
6. [x] Collapse / Accordion
7. [x] Rating
8. [x] Segmented
9. [x] NumberInput
10. [x] EmptyState
11. [x] Hero
12. [x] Footer
13. [x] MobileFrame / WindowFrame / LaptopFrame
14. [x] Drawer
15. [x] Steps
16. [x] DatePicker
17. [x] Combobox (+ pass 0.2, ADR 0013)
18. [x] ChipsInput
19. [x] FileExplorer
20. [x] Update CLAUDE.md status (component count) when done.

Each item: 5 family SCSS files + index includes, wrapper, export, doc page,
GROUPS entry, `pnpm run check` green.

---

## 10. Implementation notes (gotchas found while building)

- **Line endings**: `gen-components` regexes need LF. Writing files from
  Python on Windows produces CRLF and the rewrite then fails with "no `let
  applied = …`". Write with Node / the editor, or convert to LF.
- **Never read `axes.<name>` in a wrapper**: the family copy has no `axes`
  object. Read a resolved axis back from the class list instead:
  `classes.includes(\`${PREFIX}-vertical\`)` (works on the string and on the
  copy's array).
- **`cx` is a reserved word for the rewrite**: an SVG `<circle cx=…>` in a
  wrapper fails the build ("`cx` is still referenced"). Use `<path>`.
- **A Section shows "nothing to show"** as soon as one class it names is
  missing from the family: give each family-specific variant its own Section.
- **Store-fed colours** into an axis prop need `as never` (the family copy's
  union is narrower) — see Toaster.
- Screenshots per component were taken with a throwaway Playwright script
  (system Edge, `page.selectOption('.side-select select', family)` then
  screenshot each `.section`); it was deleted, `scripts/shoot.mjs` is the model.
- **A flag's prop name is taken** in the family copy (`readonly` flag → `readonly` prop): never declare a local with a flag's camel name.

## 11. Done — what differs from the plan above

- **FileExplorer**: the source prop is `load(folder)`, not `children` (that
  name is Svelte's children snippet).
- **Combobox** has no frame of its own: it renders the family's `.input` and
  `.list-suggestions`; `combobox.scss` only adds the multiple checks and the
  sizes. Extra frame classes go through its `field` prop. ADR 0013 written.
- **ChipsInput** root is `.input.chips-input` (the family's field frame, grown).
- **DatePicker** has no namespace and no SCSS (like DataHandler): Input +
  Dropdown + inline Calendar.
- **Rating** icon is a CSS mask; a `mask` prop replaces it (no icon snippet).
- **Collapse** state is the trigger's `aria-expanded` (CSS uses `:has()`), no
  state class. Methods are `show() / hide() / toggle()`.
- **Drawer** methods: `open() / peek() / hide() / toggle() / getState()`.
- **Toast**: `toast()`, `dismissToast()`, `toasts` from
  `src/lib/components/toast.svelte.ts`, drawn by one `<Toaster>`.
- **Menu and Collapse**: Menu keeps its own sub-menu (same 0fr → 1fr
  mechanism; embedding Collapse would bring Collapse's frame into `menu`,
  ADR 0009). What it took from Collapse: a closed sub-menu is `inert` and
  its toggle has `aria-controls`.
- **Tooltip `float` flag**: anchor positioning as progressive enhancement
  under `@supports (anchor-name: --a)` — fixed to its trigger, out of
  clipping ancestors, flipped when out of room, no arrow. Opt-in, so the
  90 % rule holds; elsewhere it is the plain tooltip.
