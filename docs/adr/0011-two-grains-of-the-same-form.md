# The state is the variables

*Filed as `0011-two-grains-of-the-same-form.md`, which was the original
framing. **Amended 2026-09-24**: the two grains are gone. What they were built
to protect — that a theme is its variables and a control is a view onto them —
is what survives, and it now does more work than before. The amendment is at
the bottom; the record of the first decision is kept because the reasoning is
still the reasoning.*

---

## The decision

The state of a theme is its **variables**. A control has no value of its own:
it reads one out of the variables to show, and writes variables when it is
moved.

A setting that every section shares is answered once in a **Common** section,
where moving it writes every section at once, and appears again at the end of
each section that has it, where moving it writes that section alone. Whether a
section has taken one over is **read off the values**, not stored.

## Why not a global variable

The obvious implementation is a global with a per-section override:
`--focus-width` at the root, `--action-focus-width` shadowing it. It was
proposed and rejected, for a reason that came from the person who has to use
the form: **when two levels are editable at once, nobody can tell what moving
either one will do.** You set the global, nothing happens, because a section
override you set twenty minutes ago is still winning. The mechanism is sound
and the experience is not.

So a control is a view. Given `--a --b --c`, the Common control writes all
three and a section's own writes one:

```
Common   move A → --a: 1  --b: 1  --c: 1
section  move B → --a: 1  --b: 2  --c: 1
```

This costs nothing new. "A control may write several variables" is the founding
freedom of this schema (ADR 0010); a shared control simply writes more of them.
And it is what `CONTEXT.md` has always said a theme is — a complete, flat set
of variable values — rather than a record of what each control was set to,
which was one layer too many.

It also falls out of this that **nothing about the form leaves a trace in the
exported file**, so there is nothing to detect when one is reopened.

The one thing it costs is that a control which folds several answers into one
variable has to read its own answer back out of it. Border width and edges
share a shorthand, so the width recovers itself as the shorthand's first
non-zero part — exactly the number that was typed. Where even that is
impossible, the answer goes to a **sentinel**: a variable no stylesheet reads,
which the generator does. That mechanism already existed for group modes.

## Amendment, 2026-09-24 — one grain, and the override is derived

### What changed

There were two modes, Basic and Advanced, and a switch between them. There is
one. Common holds the shared groups; each section repeats the ones it has at
the end of its own list, behind a tick.

### Why the switch had to go

A mode switch answers "show me more" — a question about the form. The question
a person actually has is about their theme: *is this section still following
the common answer?* The switch could not answer it. Worse, it had no way back:
once a section diverged in Advanced, the Basic widget showed a `≠` and the only
cure was to overwrite every section.

The tick answers it, per section, and unticking copies Common's answer back in.

### Why the override state is not stored

Because it does not have to be. Bucket the sections by the answer they hold,
and the biggest bucket IS Common's answer — the rest have drifted from it. Two
sections agreeing are enough to set the reference; all of them disagreeing
means each is an override and Common has nothing to say.

Three implementations were on the table:

1. real `--common-*` variables with per-section defaults of `var(--common-X)` —
   112 new variables, and a second level of cascade this ADR spent its first
   half rejecting;
2. a sentinel per section per group, ~26 variables no stylesheet reads;
3. no new variable at all: read it off the values.

(3) wins on every axis. It keeps this ADR's core claim exactly true — a theme
is its variables and nothing else — and it has a property the other two do
not: **a theme written by hand, by someone who never opened the form, opens
with its overrides already marked.** There is no state to be out of date.

The one thing values cannot express is the moment between ticking a section and
moving its control, when the two still agree. That tick lives in
`generator.detached`, a TypeScript array beside `generator.open`. It is not a
variable, it is not exported, and it is cleared when a theme is loaded.

### What was measured

Per control, across the nineteen shipped themes — do the sections agree?

```
Muted / Fade             19 / 19
Muted / Colour           19 / 19
Hand-drawn / Strength    19 / 19
Hand-drawn / Tilt        19 / 19
Focus / Width            45 / 45   (3 sections × 19, minus none)
Focus / Colour           45 / 45
Border / Radius           0 / 19
```

Every shared control is genuinely shared **except the radius**, and breaking
that one down:

```
action + field                        19 / 19
+ container, divided by its ×2 factor  10 / 19
+ selectors, markers, feedback          0 / 19
```

So Common's radius writes Action, Field and Container. Selectors, Markers and
Feedback keep their own — and they do not need a flag saying so: their answers
differ, so they arrive detached. The measurement does the work.

Two errors this measurement found, both of which the old framing had hidden:
`sharedFactor` was declared in the schema and **set by nobody**, so the ×2 the
comments described never existed; and a comment claimed the factor held in all
thirteen daisy themes, where it holds in ten.

### Consequences of the amendment

- `Group.shared` is a string, the name of the shared answer, not a boolean.
- `Group.sharedFactor` is now actually set — `2` on Container's Border.
- `generator.advanced` is gone. `generator.detached` replaces it and is
  TypeScript only.
- `Shadow` is still out of Common (a button and a panel want different ones)
  and `Size` still is (no two sections have ever agreed on it).
- The comparison normalises by `sharedFactor` before comparing, which is the
  same arithmetic `forPeer` does in the other direction.

## What this does not decide

**It does not forbid a global variable.** If a future need is better served by
a real root-level value with per-section overrides, that is a decision to take
then, on its merits. What this ADR settles is that the Common / override split
does not require one, and that two levels must never be simultaneously
editable.

Nor does it fix which groups are shared. That list was measured, and it should
be re-measured when the set of shipped themes changes.

## Consequences

- `check:theme` is unaffected: a shared control's `vars` array names every
  variable it can write, in every section, which is exactly what the check
  reads.
- `gen:themes` is unaffected: the round trip sees values, not grains.
- The full control set is specified in
  [`docs/specs/theme-generator/`](../specs/theme-generator/); `00-grammar.md`
  is the binding half of this decision.
