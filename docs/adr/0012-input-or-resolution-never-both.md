# A variable is an input or a resolution, never both

A custom property is substituted **where it is declared**. So where a variable
is declared is not a tidiness question, it is the whole of whether a theme
works in any scope but the root — and there are exactly two right answers.

An **input** is a variable the generator writes. It is declared on `:root` with
a **literal** value, so a theme scoped to anything — the preview, a
`[data-theme]` block, one panel of a page — can set it and have it inherit.

A **resolution** reads other variables. It is declared on `:where(*)`, so each
element substitutes it for itself.

A variable that is both cannot be declared correctly anywhere. That is a design
fault, not a placement one, and the fix is to split it: the generator writes the
input, the stylesheet resolves the rest from it.

`scripts/check-scope.mjs` fails the build on all three cases.

## Why it needed writing down

Because it bit four times, invisibly, and twice in opposite directions.

```
1  the 35 geometric lengths, calc(Nem * var(--<section>-scale)), on :root
      a Size slider you could move that moved nothing
2  every colour resolved from a pair, on :root
      a scoped preview painted in the app's colours while every input
      said otherwise
3  88 more found by looking, including --<section>-scale: var(--scale),
   which re-froze the size that (1) had just been moved to set free
4  the fix for (3) moved 36 INPUTS onto :where(*), where a declaration is
      re-made on every element and therefore blocks inheritance —
      a scoped --selector-scale: 2 now moved nothing
```

None of the other four checks can see any of it. The variable is declared, it
is reachable from a control, the theme round-trips byte for byte, and its
literal agrees with the form. It renders wrong, and only in a scope nobody
tests by default.

This is the same rule as the `--_` slot non-negotiable in `CLAUDE.md`, stated
once for every variable instead of once for slots.

## Consequences

- A theme may only ever write scalars, colours and lengths. A formula is a
  resolution, and a resolution in a `:root` block freezes.

  This is why the hand-drawn corner moved out of the form: it used to be
  written into the theme file as
  `calc(var(--x-radius) + 1 * 240px) …`, which made `--x-corners` both an
  input and a resolution. The stylesheet builds it now, reading
  `var(--x-wobble)` — and because a wobble of 0 leaves every term equal to the
  radius, **one declaration serves a plain rounded look and a hand-drawn one**,
  so the Off mode has nothing to say.

- `:where(*)` costs a rule with ~200 declarations, re-substituted per element.
  Measured: `kit.css` went from 199 KB to 238 KB across this work, most of it
  here. That is the price of a theme that works in a scope, and it is worth it.

- Zero specificity on both sides, so the cascade does not change. Anything at
  all still overrides either.
