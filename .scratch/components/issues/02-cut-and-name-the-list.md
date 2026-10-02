# Cut and name the list

Type: grilling
Status: resolved
Blocked by: 01

## Question

Which of the missing components does the kit adopt, under which names, in which
order?

Present the inventory as a **priority-ordered** list — most valuable first,
with the reason for the rank stated — and let the user accept or reject each,
and rename the ones whose daisyUI name is bad. The order matters as much as the
membership: it is what a later build effort will follow.

Rank on:
- how often a real interface needs it (a `card` is in every screen; a `diff` is
  in almost none);
- whether our existing components already cover it;
- what it costs across N families, not once;
- whether it unlocks others (a surface container would serve `card`, `alert`,
  `stat`, `hero`, and the app's own hand-rolled blocks).

Two naming facts from the inventory must be settled here, not left implicit:

- **daisyUI `badge` is our `chip`, and daisyUI `indicator` is our `badge`.**
  The deviation already exists in the shipped code and is not in the glossary.
  Adopting `indicator` under its daisyUI name would mean renaming two shipped
  components; keeping ours means documenting the collision so the next reader
  arriving from daisyUI is not misled.
- The obscure names the inventory flagged: `diff`, `stack` (the worst — `Stack`
  means the opposite everywhere else), `swap`, `mask`, and mildly `status` and
  `otp`.

Record, for each: accepted or rejected, the name we use, the rank, and the
one-line reason. A rejection with a written reason is worth as much as an
acceptance — it is what stops the same component being re-proposed in six
months.


## Answer

**Accepted — 12, in the order they get written**

| # | name | note |
|---|---|---|
| 1 | `box` | daisyUI's `card`, renamed. Surface + `box-title` + `box-actions`. No `figure` / `image-full` — the user rejected them. |
| 2 | `alert` | `chip`'s plumbing at box scale |
| 3 | `divider` | ~30 lines, nothing in the kit is close |
| 4 | `dot` | daisyUI's `status`, renamed |
| 5 | `avatar` | |
| 6 | `bubble` | daisyUI's `chat`, renamed. Uses `avatar`. |
| 7 | `navbar` | chrome, painted with `--color-surface-3` |
| 8 | `footer` | |
| 9 | `float` | new, no daisyUI equivalent — see below |
| 10 | `table` | |
| 11 | `carousel` | indicators/pagination come from composing other components inside it |
| 12 | `swap` | keeps its daisyUI name |

**Rejected — 14, with reasons**

- `menu` — covered by `list` plus a new interactive-row variant (`.list-suggestions` / `.suggestion-item` already ships the hover wash, the `[aria-selected]` active state and the pointer affordance). Its submenus need `::details-content` + `interpolate-size`, both under the 90% floor.
- `indicator` — **we already ship it, as `badge`**: same six position classes, variable for variable.
- `filter` — no current interest, despite `button.scss` already carrying `:not(.filter .btn)` in five places.
- `otp` — needs `field-sizing: content` (~72%, Chromium-only), under the floor.
- `diff` — `resize` abused as a drag handle, plus a documented iOS-Safari workaround.
- `hero` — renders nothing until the consumer supplies height and background.
- `countdown` — CSS arithmetic that still needs JS to set `--value`.
- `kbd` `mask` `rating` `stack` `stat`/`stats` `steps` `timeline` — no interest expressed; `mask` is a utility, not a component.

**Two changes to shipped components**

- **`list` stops painting.** Its background and `--radius-box` move out: a painted list is `class="list box"`. The user's reason, and it needs no theory: *`list` painted while its name promises structure*. `list` is a structure helper, and it does **not** depend on `box`.
- **`list` gains an interactive-row variant**, promoted from `.list-suggestions` — this is what replaces `menu`.

**`float` — the one component with no daisyUI ancestor.** Places content over the
rest of the page: left / horizontal-centre / right × top / vertical-centre /
bottom. Fixed to the viewport by default, absolute in a positioned parent
(`position: var(--float-position, fixed)`). Stacks its children. Intended for
snackbars, toasts, floating buttons — it is what gives back the toast use case
that the overlay components were ruled out for, without their machinery.

**Naming collision, recorded rather than fixed:** daisyUI's `badge` is our
`chip`, and daisyUI's `indicator` is our `badge`. The deviation already exists
in shipped code; documenting it beats renaming two components.

**`--color-surface-3` = daisy's chrome surface** — `dock` and `navbar` share
it. It had a single consumer only because `navbar` had not been written yet.

**A taxonomy was tried and abandoned.** Splitting components into *structural*
(places, never paints) and *painted* (has a look) looked promising — `join` and
`badge` already behave that way — but it broke on the fact that a family must be
able to change a structural component too (a family may want its own footer
layout), and on typography, which is neither layout nor surface. Dropped:
it was generating problems rather than solving them. The restated objective it
was violating: **a family is a set of opinionated classes with its own set of
variables; the only shared constraint is intrinsic, font-size-driven sizing.**
