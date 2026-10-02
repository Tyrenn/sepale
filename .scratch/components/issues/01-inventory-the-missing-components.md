# Inventory the missing components

Type: research
Status: resolved
Blocked by: —

## Question

For each of the ~24 daisyUI components we do not have, what is it exactly, and
what would it cost us?

Overlay components are out of scope — skip `modal`, `dropdown`, `tooltip`,
`drawer`, `toast`, `popover`. The list to cover:

`alert` `avatar` `card` `carousel` `chat` `collapse` `countdown` `diff`
`divider` `filter` `footer` `hero` `indicator` `kbd` `mask` `menu` `navbar`
`otp` `rating` `stack` `stat` / `stats` `status` `steps` `swap` `table`
`timeline`

For each, record:

1. **What it is**, in one sentence, and the markup shape it expects (how many
   elements, what nesting, whether it needs JS at all).
2. **How daisyUI implements it** — read the local copy of its CSS rather than
   its docs where possible; a fresh copy is at
   `https://cdn.jsdelivr.net/npm/daisyui@5/daisyui.css`.
3. **Cost for us**, in these terms:
   - Does it fit our intrinsic em-based sizing, or is it dimension-driven?
   - Which plumbing variables it would need.
   - Does it need a mechanism no current component uses (`<details>`, scroll
     snap, `<table>` semantics, counters, CSS masks, `@property`)?
   - Roughly how many lines of `base`, and how much a family has to restyle.
4. **Whether our existing components already cover it** — several of these may
   be a `list` with a border, or a `chip` in a corner. Say so plainly: the
   cheapest component is the one we do not add.
5. **Name check**: is the daisyUI name understandable to someone who has never
   used daisyUI? Flag the obscure ones (`swap`, `mask`, `diff`, `stack`) with a
   suggested alternative, without deciding.

Write it to `.scratch/components/research/inventory.md`, grouped so a human can
cut the list quickly: one table with a row per component (what / cost / already
covered? / name flag), then a short section per component for the detail.

Read `CONTEXT.md`, `src/scss/components/list.scss` and
`src/scss/components/button.scss` first, so "cost" is expressed in the
vocabulary the kit actually uses.


## Answer

Written to [`.scratch/components/research/inventory.md`](../research/inventory.md)
(824 lines): one table with a row per component, then a section each. Source is
daisyUI 5.7.32's **compiled CSS**, parsed into a rule tree — not the docs site.
Cost is expressed in the kit's own vocabulary (base / skin / plumbing variable
/ variant, `--fontsize`-only size variants, `calc(Nem * var(--scale))`).

**Most valuable five**

1. `card` — the missing shared primitive. `list`, `stats`, `timeline-box` and
   the app's own blocks each hand-roll an unpainted surface today; deciding it
   once settles four components.
2. `alert` — universally needed, and it is `chip`'s plumbing at box scale: its
   `soft` / `outline` / `dash` variants are near-literal copies of ours.
3. `table` — the only way to render real tabular data, and our `--fontsize`-only
   sizing model fits it *better* than daisyUI's paired font/padding sizes.
4. `divider` — highest utility per line in the batch: ~30 lines, no family cost,
   nothing in the kit is close.
5. `status` — ~15 lines, and it is the atom that `avatar-online` reimplements
   and that half of `badge`'s uses want.

**Least valuable five**

1. `indicator` — **we already ship it, as `badge`**: same six position classes,
   variable for variable (`--badge-t/-b/-s/-e/-x/-y` vs `--indicator-*`).
2. `otp` — needs `field-sizing: content` (~72%, Chromium-only), under our 90%
   floor. `join` + `input` already gets there, with better markup.
3. `diff` — image comparison built on `resize` abused as a drag handle plus
   container queries, with a documented iOS-Safari workaround.
4. `hero` — 20 lines that render nothing until the consumer supplies height and
   background, both of which daisyUI took from Tailwind utilities.
5. `countdown` — a ~300-character `content` string plus CSS `mod()`/`round()`
   arithmetic, and it still needs JS to set `--value`.

**Three findings beyond the ticket**

- **A two-way name collision already exists in the tree**: daisyUI's `badge` is
  our `chip`, and daisyUI's `indicator` is our `badge`. Undocumented in the
  glossary. Feeds directly into the naming half of the next ticket.
- **`filter` is half-written**: `button.scss` already carries `:not(.filter .btn)`
  in five places (base, ghost, outline, dash, soft). The coupling is paid for;
  only a ~30-line `filter.scss` is missing.
- **`menu` is substantially covered**: `.list-suggestions` / `.suggestion-item`
  already ships the interactive-row look, and `dock` / `tab` cover the
  horizontal and tabbed cases.

**Obscure names flagged** (suggestions, not decisions): `diff` → `compare` /
`before-after`; `stack` → `pile` / `deck` (the worst collision — everywhere else
`Stack` means a flex column, the opposite of what daisyUI means); `swap` →
`icon-swap`; `mask` → `shape`, and it is a *utility*, not a component. Milder:
`status` → `dot`, `otp` → `code-input`.
