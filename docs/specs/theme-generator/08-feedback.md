# 08 — Feedback

**Components** — `progress`, `radial-progress`, `loading`, `skeleton`.
**Prefixes** — `feedback`, `skeleton`.
**Controls** — **6 in Basic**, 10 in Advanced.

`validator` has moved to Field, where it belongs: it drives a field's accent.

## Entries, in order

```
Size
▸ Fill       Fill ▪ · Track ▪
▸ Corners    …                            ← shared (×2 factor)
▸ Border     …                            ← shared
▸ Skeleton   [ Static │ Pulse │ Shimmer ] · Intensity
```

No Shadow group: nothing here casts one. No Focus, no Disabled, no Hand-drawn
— a progress bar is not drawn by hand in any shipped theme, and if one ever is,
the shared group is already there to be extended.

### `feedback-scale` — Size

number, `0.75`–`2`, step `0.05`, default `1`. Writes `--feedback-scale`.

Grows a bar, a ring and a placeholder. **`progress` takes its height from
here** — there is no track height shared with the slider. Selectors has its
own Size, Feedback has this one, and that is the per-section rule.

### ▸ Fill — `layout: 'row'`

| Control | Sources | Default |
|---|---|---|
| `feedback-fill` | `semantic`, `text`, custom | Derived from `primary` |
| `feedback-track` | `own`, `text`, `surface` | Derived from Own, `0.10` |

`--feedback-dot-bg` (the `loading` dots) derives from the fill and goes to
`internal`. `radial-progress` reads both.

### ▸ Skeleton — type

| Mode | Controls | |
|---|---|---|
| **Static** | — | a flat block, `--skeleton-shimmer` off |
| **Pulse** | Intensity `0`–`100` | opacity breathing, the accessible default |
| **Shimmer** | Intensity `0`–`100` | the travelling highlight, `15s` hard-coded |

Intensity writes `--skeleton-shimmer` and the two mask stops
(`--skeleton-mask-edge`, `--skeleton-mask-peak`) from one number.

`--skeleton-bg` follows `--feedback-track`.

`skeleton`'s `transition-duration: 15s` stays hard-coded in the component. It
is not a theme decision and it is not a question.

## internal

`feedback-dot-bg`, `skeleton-bg`, `skeleton-shimmer`, `skeleton-mask-edge`,
`skeleton-mask-peak`, and every geometric length that follows
`--feedback-scale`.

Then run `node scripts/check-theme-vars.mjs` and paste what it still names.
