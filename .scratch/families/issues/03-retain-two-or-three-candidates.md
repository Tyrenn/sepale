# Retain two or three candidates

Type: grilling
Status: resolved
Blocked by: 01, 04

## Question

Which candidates do we keep, and why each one?

The user's process, agreed while charting: one candidate is put to them at a
time, with its look and its fit summarised; they say keep or drop and say why.
Run it that way rather than presenting a ranked list to approve wholesale —
the reasons they give are the actual output, because they are what will judge
the fourth candidate later.

The survey's uncomfortable finding shapes the judgement: our five button
variants are Ant Design's axis verbatim, so **a candidate that maps cleanly
onto our existing classes is probably too close to `daisy` to be worth
retaining**. Wanting a family-specific class is a sign of interest, not of
misfit — which is why [What a family may add beyond the contract](04-what-a-family-may-add.md)
must land first, or "does it fit?" has no stable meaning.

Target: **2–3 retained**, in visibly different styles. One of them must be a
credible replacement for `poppy`.

For each retained candidate, record:
- what its identity rests on, in one sentence;
- which of our components it restyles through parameters alone, and which need
  a real skin;
- the family-specific variant classes it would want, if any;
- anything it needs that our primitives cannot express today (this is the part
  that graduates fog into new tickets).

For each dropped candidate, record the reason in one line — a dropped candidate
with a written reason is worth more than a silent one.


## Answer

Overtaken by events, and by the user's call: rather than shortlist two or
three, they picked seven from the survey and asked for all of them at once.
Built: `aster` (Ant Design), `snowdrop` (Geist), `gladiolus` (Carbon),
`dahlia` (Radix), `sunflower` (neo-brutalist), `foxglove` (WebTUI), `cosmos`
(PaperCSS). `poppy` deleted.

The survey's finding held: the three that map cleanly onto our classes
(`aster`, `snowdrop`, and `dahlia` in part) needed no new class, while the
visually distinct ones each needed one or two — `gladiolus` has
`.btn-tertiary`, `dahlia` has `.btn-surface` and `.btn-classic`, `sunflower`
has `.btn-noshadow` and `.btn-reverse`.
