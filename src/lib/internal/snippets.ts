import type { Snippet } from 'svelte';

/**
 * Is this entry a snippet rather than a piece of data?
 *
 * There is no runtime test for "is a snippet". `Snippet` is a type-only
 * interface (svelte/types/index.d.ts): it works by declaring a phantom return
 * type so TypeScript refuses `{@render}` on anything else. Compiled, a snippet
 * is an ordinary function carrying no marker.
 *
 * So this is `typeof === 'function'`, and it cannot tell a snippet from any
 * other function. That is fine for what we use it for — a component that
 * accepts `Row | Snippet` never has a reason to be handed a plain function as
 * data — but it is worth knowing before someone builds something stricter on
 * top of it.
 */
export function isSnippet<T>(value: T | Snippet): value is Snippet {
	return typeof value === 'function';
}

/**
 * Text that may have been replaced by markup: a label, a title, a tab's name.
 * The data form is a string; the snippet form draws whatever it likes in the
 * same place, with the same class around it.
 */
export type Text = string | Snippet;
