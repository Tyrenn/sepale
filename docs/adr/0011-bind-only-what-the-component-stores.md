# Bind only what the component stores

A prop is `$bindable` when its value **is** the component's state: storing it is
the whole of applying it. `value` on an input, `checked` on a toggle, `open` on
a dialog, `page` on a pagination: write it and the markup follows, with no
action of the component's own.

A value that is a **projection of the DOM** — read off a scroll position, a
size, a measurement — is not bindable. Its owner exposes commands to change it
(`goto`, `prev`, `next`, through `bind:this`) and a callback to learn it
(`onIndex`). The carousel's `index` is the first case: the scroll position is
the truth, the index is read from it.

## Why

Applying a bound value that the DOM owns takes a reaction in the child: the
parent's write reaches the child only as a reactive read, and turning that read
into a `scrollTo` needs an `$effect` (or an attachment, the same thing). The
reaction then writes the value back from the scroll handler, so the pair needs
a guard against a loop, and the order of the two writes is subtle.

Neither of the obvious escapes exists. Svelte has no `bind:scrollLeft` on an
element — only `<svelte:window>` binds scroll, and its docs still send the
first scroll through an `$effect`. A function binding (`bind:index={get, set}`)
replaces where the *parent* stores the value; the child still has to react. A
writable `$derived` is lazy and must stay pure: it cannot touch the DOM.

The reference carousels settled the same way: Embla (`scrollTo` + `select`),
Swiper (`slideTo` + `slideChange`).

## Considered options

- **`bind:index` with one guarded `$effect`.** Works, one dependency, cheap.
  Rejected: it is the only reaction left in the carousel, and the guard is a
  correctness condition a later edit can quietly break.
- **Avoid `bind` everywhere.** Rejected: for stored state (`value`, `checked`,
  `open`) a binding costs nothing and reads best — there is nothing to
  synchronise.

## Consequences

- `index` on the carousel is the **initial** item only. Moving there later is a
  `goto` call; knowing where it rests is `onIndex`.
- A pagination outside the carousel holds a reference to it (`bind:this`)
  instead of sharing a bound variable.
- The rule is per prop, not per component: a component may bind one value and
  expose commands for another.
