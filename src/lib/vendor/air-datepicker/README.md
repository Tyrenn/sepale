# air-datepicker, vendored

[air-datepicker](https://air-datepicker.com) 3.6.0 by Timofey Marochkin, MIT
(see `LICENSE.md`), copied from its repository's `src/` (tag `v3.6.0`) so the
`Calendar` component carries it: no npm dependency, and a family's copy of
`Calendar.svelte` ships with this folder next to it.

Changes to the source, and nothing else:

- the `import './*.scss'` lines are gone: the library's stylesheet is not
  used. Each family draws the calendar in its `calendar.scss`, scoped under
  `.calendar` (the class `Calendar` puts on the picker's root).
- relative imports carry their `.js` extension.
- the default locale is English (`locale/en.js`) instead of Russian.
- a `// @ts-nocheck` header on every file: typed by `index.d.ts` (the
  library's own `src/datepicker.d.ts`), not checked line by line.

To update: copy `src/*.js` and `src/locale/*.js` from a new tag and reapply
the four changes above.
