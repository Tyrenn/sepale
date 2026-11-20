---
"@sepale/style": patch
"@sepale/components": patch
---

Families no longer size every `svg` of the page. The `svg { height: 1em }` rule of each family's root leaked into the application (an illustration lost its `height` attribute). It is now limited to the svg placed inside the components that take icons (button, chip, badge, input, select, combobox, tab, menu, alert, dropdown, collapse, breadcrumbs, navbar, dock, list, stat), at zero specificity, and skips any svg that states its own `height`. The dialog's close cross gets its own size.
