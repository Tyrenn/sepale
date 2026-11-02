/* Paths only — the modules themselves are never loaded here, or the nav would
   import the pages that import the nav.

   The glob is written from here because it cannot name `(app)`: the dev server
   reads those parentheses as a glob group and finds nothing, the build does not. */
export const pageIds = Object.keys(import.meta.glob('./docs/*.svelte')).map((path) =>
	path.slice('./docs/'.length, -'.svelte'.length)
);
