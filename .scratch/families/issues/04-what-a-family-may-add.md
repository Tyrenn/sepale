# What a family may add beyond the contract

Type: grilling
Status: open
Blocked by: 02

## Question

A family honours the contract — intrinsic sizing, our colour vocabulary, our
core class names. What may it **add** on top, and how does it declare it?

The survey put this on the critical path rather than at the edges: every
candidate that is visibly different from `daisy` needs something we have not
provided for. Three additions, each with its own answer:

**1. Variant classes.** Already allowed in principle. M3 wants `elevated`,
Radix wants `classic` and `surface`, neobrutalism wants `noShadow` and
`reverse`, WebTUI wants `box`. Open: how a family declares one, how the
registry knows about it, how the app's preview and the bundle's README mark it
as family-specific, and what happens to markup carrying it when the user swaps
families. Note the constraint discovered by the survey — our five variants are
Ant Design's axis verbatim, so a candidate that maps cleanly onto them is
probably too close to `daisy` to be worth retaining. **Needing a variant class
is evidence a candidate is interesting, not evidence it is a bad fit.**

**2. Colour tokens beyond the three grounds.** — **largely settled on
2026-09-10, in the components map**: a family owns its own set of variables. The
contract fixes only the shared *vocabulary* where it applies; a family declares
which colours it exposes, and may declare more grounds than three. What is left
open here is narrower: does the editor read that list from the family (it is
global in `theme.ts` today), and what happens to a component that wants a level
a different family has not declared?

Original framing: This is the binding constraint,
not sizing. Fluent wants eight neutral backgrounds, M3 five `surface-container`
steps, WebTUI four grounds plus three foregrounds. Options to weigh: the family
derives extra levels from the three it is given (`color-mix` between `surface`
and `surface-3`); the family declares extra grounds as its own parameters,
which its themes then set; or the contract's three grounds are a hard ceiling
and a candidate that needs more is rejected. Whichever wins, say what happens
to a component that wants a level a *different* family does not have.

**3. A typeface.** Carbon *is* IBM Plex, Geist *is* Geist Sans, PaperCSS is
Patrick Hand, 98.css bundles a bitmap `.woff` and turns off antialiasing. Four
candidates are unrecognisable without their face. Open: does a family get to
name a font stack, does the bundle carry font files at all, is a webfont
`@import` acceptable in a kit meant to be dropped into someone's project, and
does the theme editor expose the choice? WebTUI is the cheap counter-example —
its identity needs `font-family: monospace`, which costs nothing.

Answering this before [Retain two or three candidates](03-retain-two-or-three-candidates.md)
is deliberate: without it, "does this candidate fit?" has no stable meaning.
