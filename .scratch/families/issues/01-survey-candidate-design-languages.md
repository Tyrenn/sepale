# Survey candidate design languages

Type: research
Status: resolved
Blocked by: —

## Question

Which existing component libraries or design systems have an art direction
worth turning into a **family**, and what would each cost us?

Produce a survey of 8–12 candidates, deliberately spread across visibly
different styles (flat, material, neo-brutalist, editorial/typographic,
skeuomorphic, terminal, glass, hand-drawn…). For each:

1. **Name, source, and one-line description of the look** — what a person would
   recognise it by in a single screenshot.
2. **What carries its identity**: is it colour, border weight, radius, shadow,
   typography, motion, texture, spacing? Be specific — "the identity is a 2px
   black border and a hard offset shadow" is useful, "it looks modern" is not.
3. **Its parameter set**: which knobs the library itself exposes to theme
   authors (radius scale, elevation levels, density, accent colour…).
4. **Fit against our family contract** — the decisive part:
   - Does its sizing survive being made **intrinsic** (em-based, driven by
     font-size) or is its identity tied to fixed px dimensions?
   - Do its colours map onto `surface-1` / `-2` / `-3` /
     `on-*` / the eight semantics, or does it need something we don't have?
   - Which of its button/field variants map onto our existing classes
     (`outline`, `dash`, `soft`, `ghost`, `link`), and which would need a
     **family-specific variant class**?
   - Does it rely on anything our primitives cannot express (gradients,
     per-component fonts, animation curves, images/textures)?
5. **Rough cost**: which of our 23 components it would restyle trivially
   (parameters only), which need a real skin, which it has no equivalent for.

Write the survey to `.scratch/families/research/candidates.md`, one section per
candidate, plus a comparison table at the top. Do not pick a winner — that is
the next ticket, and it is the user's call.

Read `CONTEXT.md`, `src/scss/families/daisy.scss` and
`src/scss/families/README.md` first, so "fit against our contract" is judged
against what the code actually does.


## Answer

Written to [`.scratch/families/research/candidates.md`](../research/candidates.md)
(933 lines): comparison table, then a section per candidate following the five
headings. Every parameter set was read from the library's own token or source
files, cited file by file. Cost is grounded in the actual tree — 8 components
carry a `skin-flat` a new family must replace (button, input, select, textarea,
file-input, checkbox, radio, toggle), 4 more ride `--shadow-light` / `--depth`,
13 are parameters-only.

**Twelve candidates**: Material Design 3 · Fluent 2 · Carbon (IBM) · Ant Design 5 ·
Radix Themes · Geist (Vercel) · Neobrutalism · 98.css / 7.css · WebTUI ·
PaperCSS · Glassmorphism / Liquid Glass · Claymorphism.

**Three findings that reshape the map**

1. **Our five button variants are Ant Design's variant axis, verbatim** —
   `['outlined','dashed','solid','filled','text','link']`, `dash` included.
   The uncomfortable consequence: every candidate that maps cleanly onto our
   classes (Ant, Fluent, Geist) sits inside `daisy`'s visual band, and **every
   visibly different candidate needs one or two family-specific classes**
   (M3 `elevated`, Radix `classic` + `surface`, neobrutalism `noShadow` +
   `reverse`, WebTUI `box`, PaperCSS shape rotation). So the mechanism for
   family-specific variants is on the critical path, not an edge case.
2. **Three grounds is the binding constraint, not intrinsic sizing.** Ten of
   twelve pass the sizing test — control heights are ratios (2.29em Ant and
   Fluent, 2.86em M3, 3.43em Carbon, 2.09em even for 98.css) and convert
   mechanically. What fails is the colour budget: Fluent wants
   `colorNeutralBackground1…8`, M3 five `surface-container` steps, WebTUI four
   grounds plus three foregrounds. Carbon is the striking counter-example: its
   `background / layer-01 / layer-02` *is* our `surface / -high / -peak`, and it
   keeps a separate `field-01` for exactly the reason `CONTEXT.md` gives when it
   calls a field "a hole cut in the page".
3. **Half the candidates carry a typeface, and the bundle has nowhere to put
   one.** Carbon *is* IBM Plex, Geist *is* Geist Sans, PaperCSS `@import`s
   Patrick Hand from Google Fonts, 98.css bundles a `.woff` bitmap face and
   disables antialiasing. This is a per-**family** question, and it decides four
   candidates.

**Two secondary findings**

- The 90% floor admits `backdrop-filter` but excludes `backdrop-filter: url(#…)`:
  a glass family can ship 2021 frosted glass, not 2025 Apple refraction.
- Radix Themes independently invented our `--scale`, as `--scaling: 0.9…1.1` —
  but it scales font sizes with it, the exact thing our non-negotiable forbids.
  Worth a line in that family's header if Radix is retained.
