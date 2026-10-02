# Write the family contract into the glossary

Type: grilling
Status: open
Blocked by: —

## Question

What exactly must a family honour, and where is that written?

Settled while charting, not yet written down anywhere:

- Intrinsic, em-based sizing driven by the element's own font-size; geometry
  scales through `--scale`, text never does.
- Our colour vocabulary: `--color-surface-1` / `-2` / `-3`,
  `--color-border`, `--color-on-surface`, `--color-on-{semantic}`.
- **Core class names are identical across families** — `btn`, `btn-primary`,
  `input`… — so swapping a family never touches markup.
- A family **may** add variant classes of its own; they exist only while that
  family is selected, and must be documented as family-specific.
- Every accepted component is styled by every family, extending the family's
  own art direction where its source library has no equivalent.

To resolve: name the term (**family contract**?), pin the wording, and decide
where it belongs — `CONTEXT.md` is a glossary and must stay free of
implementation detail, so the mechanics may belong in
`src/scss/families/README.md` with only the term in the glossary. Decide
whether it also deserves an ADR (it is hard to reverse and a fresh reader will
propose adding classes per family).

Open sub-question worth resolving here: what makes a variant "core" versus
"family-specific"? `btn-outline` is core today because three families used it.
Is the rule the same mechanical "≥2 families" as ADR 0003, or is the core set
frozen deliberately?
