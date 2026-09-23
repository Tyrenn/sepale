# Two grains of the same form

The theme generator is shown at two grains. In **Basic**, the settings that a
theme almost always keeps consistent — how focus looks, how disabled fades,
how borders are drawn, how round things are, whether the look is hand-drawn —
are gathered in one **Common** section and answered once. In **Advanced**, the
Common section disappears and each of those groups is rendered inside every
section that has it, answered per section.

**The switch is visual.** Nothing is migrated when you flip it, no value is
bound in two directions, and nothing is written until a control is moved.

## Why two grains at all

The generator's job is to make a coherent look reachable, and coherence is the
majority case: a theme whose checkboxes focus differently from its text inputs
is a mistake, not a style. Asking the same question once per section is how
the form got to 208 controls, and most of those repetitions had the same
answer in every shipped theme.

Measured across the nineteen themes the repo ships, do the sections agree?

```
hand-drawn (the mode)   19 / 19 agree
border width            17 / 19
shadow                  15 / 19
radius                   2 / 19 — but always at a constant ratio
scale                    0 / 19
```

So the majority case is real and it is large. But it is not universal: dahlia
carries a different border on its buttons than on its fields, and cosmos
carries three independent radii. A form that only offered the coarse grain
would make those two themes unreachable, and the whole point of ADR 0010 is
that every look the families held stays reachable.

Hence two grains rather than one, and a default of Basic — which is clean for
thirteen of the nineteen themes.

## Why the distinction is only visual

The obvious implementation is a global variable with a per-section override:
`--focus-width` at the root, `--action-focus-width` shadowing it. It was
proposed and rejected, for a reason that came from the person who has to use
the form: **when two levels are editable at once, nobody can tell what moving
either one will do.** You set the global, nothing happens, because a section
override you set twenty minutes ago is still winning. The mechanism is sound
and the experience is not.

So instead, the state of a theme is its **variables**, and a control is a view
onto them. A control has no value of its own: it reads one out of the
variables to show, and writes variables when it is moved. Basic and Advanced
are two sets of controls over one set of variables.

Given `--a --b --c`, Basic offers one control that writes all three and
Advanced offers three that write one each. Switching changes which controls
are on screen and nothing else:

```
Basic    move A1 → --a: 1  --b: 1  --c: 1
         switch to Advanced — nothing is written
Advanced move B  → --a: 1  --b: 2  --c: 1
         switch back to Basic — nothing is written
Basic    A1 still reads 1, and --b is still 2 until A1 is moved
```

This costs nothing new. "A control may write several variables" is the
founding freedom of this schema (ADR 0010); a shared control simply writes
more of them. And it is what `CONTEXT.md` has always said a theme is — a
complete, flat set of variable values — rather than a record of what each
control was set to, which was one layer too many.

It also falls out of this that **the mode leaves no trace in the exported
file**. A theme built in Basic and the same theme built in Advanced produce the
same CSS, so there is nothing to detect when one is reopened: the form always
opens in Basic, and a control whose variables disagree renders a `≠` marker.
Touching it realigns them.

The one thing this costs is that a control which folds several answers into
one variable has to be able to read its own answer back out of it. Border
width and edges share a shorthand, so the width recovers itself as the
shorthand's first non-zero part — which is exactly the number that was typed.
Where even that is impossible, the answer is written to a **sentinel**: a
variable no stylesheet reads, which the generator does. That mechanism already
existed for group modes and needed no change.

## What this does not decide

**It does not forbid a global variable.** If a future need is better served by
a real root-level value with per-section overrides — a design token layer, an
inherited scale, something not yet on the table — that is a decision to take
then, on its merits. What this ADR settles is that *the Basic/Advanced split*
does not require one, and that the two grains must never be simultaneously
editable. A proposal that keeps those two properties and introduces a global
variable for its own reasons is welcome.

Nor does it fix which groups are shared. That list was measured, and it should
be re-measured when the set of shipped themes changes. `Shadow` is out today
because a button and a panel legitimately want different ones; `Size` is out
because no two sections have ever agreed on it.

## Consequences

- `src/lib/theme/schema.ts` gains `shared?: boolean` on `Group` and nothing
  else. No new writer machinery.
- The **Common** section exists only in Basic and owns no variable prefix.
- `check:theme` is unaffected: a shared control's `vars` array names every
  variable it can write, in every section, which is exactly what the check
  reads.
- `gen:themes` is unaffected: the round trip sees values, not grains.
- The full control set is specified in
  [`docs/specs/theme-generator/`](../specs/theme-generator/); `00-grammar.md`
  is the binding half of this decision.
