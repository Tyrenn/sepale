# Adding a family

> **Status — target architecture, not yet built.** This describes the design
> agreed for the restart: manifest, registry, cascade layers, parameter maps.
> The code still uses explicit `@include` lists (see `git log`). Steps 3–5 of
> the plan implement it. Read this first: if you cannot picture writing a
> family from it, the architecture is wrong and we fix that before any Sass.

A **family** is one opinionated look. It ships as compiled CSS and is tuned
only through its **parameters**. A family lives in **one self-contained file**:
adding or deleting one touches nothing else (ADR 0003).

Everything in `CONTEXT.md` — family, parameter, theme, base, skin, variant,
recipe, registry, manifest — is used here with that exact meaning.

## The shape of a family file

```scss
// families/clay.scss
@use '../lib';

/* ── 1. Parameters ─────────────────────────────────────────────
   What the configurator shows for this family, on top of the
   standard colours and radii every family gets. The default is
   also the CSS fallback: declared once, here. (ADR: single
   source of truth — the app reads this map, it does not repeat
   it in TypeScript.) */
$params: (
  'clay-softness': (
    label: 'Softness',  group: 'Relief',  type: number,
    default: 0.35,      min: 0, max: 1, step: 0.05,
    help: 'How far the surface bulges before it flattens.',
  ),
);

/* ── 2. Manifest ───────────────────────────────────────────────
   What gets emitted, and in what order. The emitter walks the
   registry in ../_lib.scss; anything it cannot find is an
   @error naming the component and the mixin. */
@include lib.family((
  label: 'Claymorphism',      // shown in the family picker
  params: $params,
  owned: (                    // family-owned, NOT themeable → :root
    border: 0px,              // a length, never unitless 0: summed in calc()
    depth: 0,
    light-intensity: 0,
  ),
  skin: none,                 // no shared skin: this family paints itself
                              // (use `flat` to start from the shared flat look)
  drop: (skeleton),           // not shipped at all — no file in the bundle
  components: (
    button: (drop: (outline, dash, soft)),  // borders contradict soft clay
    toggle: (add: (track)),
  ),
));

/* ── 3. Recipes and bindings ───────────────────────────────────
   This family's own look: ordinary SCSS, written after the
   manifest, in the uu.family layer so it wins over the shared
   skins and variants selected above. */
@layer uu.family {
  /* Recipes on :where(*), not :root — they must resolve against
     each element's own font-size and per-state overrides. */
  :where(*) {
    --clay-lift: calc(var(--clay-softness, .35) * 1em);
    --clay-raised: 0 var(--clay-lift) calc(var(--clay-lift) * 2)
                   color-mix(in oklab, #000 12%, #0000);
  }

  /* Bindings: assign plumbing variables, never re-declare paint. */
  .btn { --btn-bg: var(--color-surface); --btn-shadow: var(--clay-raised); }
  .input { --input-shadow: none; }
}
```

That is the whole family. No `@use` of individual components, no include
order to remember, no separate skins file.

## The three levers, cheapest first

Reach for the next one only when the previous cannot say what you mean.

### 1. Parameters and owned variables

Most of a family's identity is values. `--light-intensity`, `--light-depth`,
`--border`, `--depth`, `--scale` and the radii flow into every component, so
changing a handful restyles the whole kit. `poppy` (Material) is almost
entirely this: `--light-intensity: 1.4; --light-depth: 2` plus rounder radii,
and inputs, chips, tabs and lists all pick up the Material shadow with no extra
CSS.

The split matters:

| where | what | why |
|---|---|---|
| `params:` | tunable — colours, radii, your own knobs | emitted at `:where(:root)` (specificity 0) so any theme wins, in any load order |
| `owned:` | the family's identity, not up for tuning | emitted at `:root`, beating the `:where(:root)` defaults of `base/default.scss` |

**Rule of thumb: if a difference is a value, it is a parameter; if it is a
different recipe or a state behaviour, it is CSS you write in step 3.**

### 2. Selection

`skin:`, `drop:` and `components:` pick from what already exists. Everything
available is listed in the registry in `../_lib.scss` — that file is the
answer to "what can I pick from?".

Not including something is a design statement: a family built on a soft,
borderless material has no reason to ship `button.variant-outline`. Say why in
the file header.

### 3. Your own look

Neumorphism cannot be reached by tuning the flat recipes — it needs different
shadow maths. That is step 3 of the file above: recipes as custom properties,
then bindings. It stays in your family file until a **second** family wants the
same look; then it is promoted into `components/` and added to the registry
(ADR 0003).

## Rules that keep families from fighting each other

1. **Assign plumbing variables, do not re-declare paint.** `base` paints from
   `--btn-bg` / `--btn-fg` / `--btn-border` / `--btn-shadow`; each component
   documents its own set in its header. A binding that sets variables composes
   with every variant; one that sets `background-color` starts a specificity
   war.
2. **Recipes go on `:where(*)`**, zero specificity, resolved per element. They
   are custom properties on purpose — a Sass mixin cannot recompute on `:hover`
   (ADR 0006). Pseudo-elements are *not* matched by `*`: rebuild the recipe
   inside `::before` / `::after` at the scale you need.
3. **Cascade order is not your problem any more.** The emitter orders
   `base → shared skin → variants` inside `uu.components`; your own rules sit
   in `uu.family`, which comes after (ADR 0004).
4. **Neutral defaults belong to `base`.** If your look needs a new hook — a
   thumb colour, say — add the variable with a neutral default in the
   component's `base`, then assign it in your family. Never fork `base`.
5. **State feedback is a look decision.** Hover / press / checked responses
   belong to your family (flat darkens, neu carves, material lowers). `base`
   owns only semantic plumbing: focus ring, disabled, checked → seed colour.
6. **Class names are never assembled from fragments** — a prefix is applied by
   substitution when the bundle is built (ADR 0007).

## Step by step

1. **`families/clay.scss`** — header paragraph (what the look is, what it skips
   and why), then the three sections above.
2. **`themes/clay/<name>.scss`** — at least one theme: `color-scheme` first,
   the colours, the radii, and any of your parameters worth pinning. A theme
   belongs to its family and may only set parameters that family exposes
   (ADR 0005). `-content` colours are never themed: they are derived in
   `_derived-content.scss`.
3. **Build** — `npm run build:css`. The family is discovered automatically
   (any non-underscore `families/*.scss`), along with its themes. Output:
   `static/families/clay.css` (one file, for the app preview) and
   `static/families/clay/*.css` (one per component, for the bundle). The
   parameter map is emitted with it and read by the configurator — nothing to
   register by hand.
4. **Verify** — `npm run dev`, switch family in the picker, walk every
   component in a light and a dark theme, and check hover / focus / disabled /
   checked. `/lab` is the page for a family still being written.

## Checklist

- [ ] `families/<name>.scss` — header, `$params`, manifest, `@layer uu.family`
- [ ] At least one theme in `themes/<name>/`
- [ ] Anything you skipped is justified in the header
- [ ] `npm run build:css` green, the family appears in the picker
- [ ] Every component walked, light + dark, all interactive states
