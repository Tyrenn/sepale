<script module lang="ts">
	/** What .list is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely.

	    The list draws its own rows: `.list-row` is a PART, not something a
	    caller opts into. What goes INSIDE a row is the caller's, three ways —
	    a string, a `row` snippet for every row at once, or a snippet in place
	    of one entry. The wrapper and its class stay ours either way. */
	export const PREFIX = 'list';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A floating list of things to pick from, rather than a block of rows. */
		variant: ['suggestions']
	} as const;

	export const FLAGS = [] as const;
	export const PARTS = ['row', 'col-grow', 'col-wrap'] as const;
</script>

<script lang="ts" generics="Row">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';
	import { isSnippet } from '../internal/snippets.js';

	interface Props extends AxisProps<typeof AXES>, HTMLAttributes<HTMLUListElement> {
		/**
		 * The rows. An entry is your data — rendered by `row`, or as text when
		 * there is no `row` — or a snippet standing in for that one row.
		 */
		rows?: (Row | Snippet)[];
		/**
		 * How to draw every row that is data. Written once for the whole list;
		 * an entry that is itself a snippet skips it.
		 */
		row?: Snippet<[Row]>;
		class?: string;
	}

	let { rows = [], row, class: klass = '', ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<ul {...applied.rest} class={classes}>
	{#each rows as entry, i (i)}
		<li class={`${PREFIX}-row`}>
			{#if isSnippet(entry)}
				{@render entry()}
			{:else if row}
				{@render row(entry)}
			{:else}
				{entry}
			{/if}
		</li>
	{/each}
</ul>
