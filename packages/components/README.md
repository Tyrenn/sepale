# @sepale/components

Sepale's Svelte 5 components, with one typed entry point per CSS family.

```sh
npm install @sepale/components @sepale/style
```

```svelte
<script>
	import { Button } from '@sepale/components/daisy'; // props narrowed to daisy
	import '@sepale/style/daisy.css';                  // explicit, never automatic
	import '@sepale/style/daisy/themes/light.css';
</script>

<Button color="primary">Save</Button>
```

The entry points are `cosmos`, `dahlia`, `daisy`, `peony` and `sunflower`. Each
offers the same components with their props narrowed to what that family ships,
so a variant it lacks is a compile error. Switching family changes the types,
never the runtime. The root `@sepale/components` is the generic entry: every
variant of every family, with no guarantee that one renders.

The components load no CSS. `@sepale/style` is an optional peer, because the
stylesheet may come from elsewhere: a family and a `theme.css` downloaded from
the site's theme generator work the same.
