---
'@sepale/components': patch
'@sepale/style': patch
---

A class prefix, as a Vite plugin: `import { sepale } from '@sepale/components/vite'` and
`sepale({ prefix: 'sp', family: '@sepale/style/peony.css' })` rename the kit's classes while the project
builds (ADR 0017). `@sepale/components/prefix` exports `classesIn`, `prefixCss` and `prefixComponent` for another build tool.

`prefixCss` now renames a class glued to another (`.toast.toast-top`) or to an element (`a.btn`), which it skipped.

The index exports the `GetQuery`, `UpdateQuery` and `DeleteQuery` types of the data handler and `colorToHex`, which were
in the build but not reachable.
