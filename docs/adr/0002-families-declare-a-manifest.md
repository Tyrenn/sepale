# A family declares a manifest instead of listing includes

A family file hands one map to `lib.family(...)` — default skin, per-component
additions and removals, parameters — and an emitter walks the **registry** in
`_lib.scss` to include the right mixins in a guaranteed order, dispatching by
name with Sass first-class mixins (`meta.get-mixin` / `meta.apply`, Sass ≥ 1.76;
the repo is on 1.99).

## Considered options

- **Explicit `@include` lists** (what the code did) — `magnolia.scss` opened
  with 25 `@use` lines and ~60 `@include` lines. Rejected because it made
  adding a family depend on five conventions the compiler never checked: the
  `@use` boilerplate, knowing which mixins exist (only discoverable by
  grepping), the include order *being* the cascade, the two-tier variable
  ownership, and recipes having to sit on `:where(*)`. Getting one wrong
  produced a wrong rendering, not an error.
- **Introspection without a registry** (`meta.mixin-exists` only) — works, but
  the registry is also the answer to "what can I pick from?", which is exactly
  what was missing. A generated list would do; a written one is documentation.
- **External JSON/YAML manifest compiled to SCSS** — an extra generation step
  for something Sass maps already express.

## Consequences

- Asking for a skin a component does not have is an `@error` with a name, not a
  silently unpainted component.
- The emitter owns cascade order, so `base → shared skin → variants` can no
  longer be broken by hand.
- The manifest governs **selection only**. A family's own look is ordinary SCSS
  written after the include (see ADR 0003) — the emitter never stands between
  the author and their own rules.
