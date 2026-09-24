# 07 — Markers

**Components** — `badge`, `chip`.
**Prefix** — `marker`.
**Controls** — **4 of its own**, plus 10 it shares with the other sections. The shared ones are answered in **Common** and repeated at the end of this list behind a tick; see [`02-common.md`](./02-common.md).

`badge` wants zero controls and earns them: it positions a chip and paints
nothing. Everything here is `chip`.

## Entries, in order

```
Size
▸ Fill        Background ▪ · Text ▪
▸ Corners     …                          ← shared (pill, always)
▸ Border      …                          ← shared
▸ Shadow      [None│Soft│Hard│Inset]
▸ Typography  …                          ← shared
▸ Hand-drawn  …                          ← shared, LAST
```

### `marker-scale` — Size

number, `0.75`–`2`, step `0.05`, default `1`. Writes `--marker-scale`.
Grows a chip and a badge.

### ▸ Fill — `layout: 'row'`

| Control | Sources | Default |
|---|---|---|
| `marker-bg` | `semantic`, `surface`, custom | Derived from `--color-action` — a chip takes the same fill as a button |
| `marker-fg` | `own`, `text`, custom | Derived from Own, contrast |

`--marker-muted-bg`, `--marker-soft-mix` and `--marker-soft-border-mix` derive
from these and go to `internal`.

### Corners

`--marker-corners` is `999px` — a chip is a pill, always. Common's Radius group
does **not** multiply it; the factor table in `02-common.md` says so
explicitly. If a look ever wants square chips, that is a class.

### ▸ Shadow — type · not shared

Same four modes as Field.

## internal

`marker-muted-bg`, `marker-soft-mix`, `marker-soft-border-mix`,
`marker-corners`, and every geometric length that follows `--marker-scale`.

Then run `node scripts/check-theme-vars.mjs` and paste what it still names.

## Note

The sunflower marker preset block **did not land** the last time this section
was migrated: the script's anchor did not match and nothing failed. Only
rendering caught it. `check:theme` verifies that names exist, **not that a
preset writes anything** — so after this section, open the sunflower themes and
look at a chip.
