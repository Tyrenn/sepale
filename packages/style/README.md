# @sepale/style

Sepale's opinionated CSS families and their themes, as plain compiled
stylesheets. No dependency, no build step, no JavaScript.

```sh
npm install @sepale/style
```

```js
import '@sepale/style/reset.css';              // optional, for a page without a reset
import '@sepale/style/daisy.css';              // a family: every component's classes
import '@sepale/style/daisy/themes/light.css'; // one of its themes
```

```html
<button class="btn btn-primary">Save</button>
```

The families are `cosmos`, `dahlia`, `daisy`, `peony` and `sunflower`. Changing
family is changing a stylesheet, never the markup.

A theme is a set of values for its family's parameters, and belongs to that
family. To tune your own, use the theme generator on the site and lay the
`theme.css` it exports after the family's stylesheet.

Using Svelte? [`@sepale/components`](https://www.npmjs.com/package/@sepale/components)
has the components, typed to what each family ships.
