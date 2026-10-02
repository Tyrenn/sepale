<script module lang="ts">
	/** What .list is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs).

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

	export const FLAGS = {} as const;
	export const PARTS = ['row', 'col-grow', 'col-wrap'] as const;
</script>

<script lang="ts" generics="Row">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLUListElement> {
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

	/* A snippet has no runtime marker — compiled, it is a plain function — so
	   `typeof` is the only test. Fine as long as a row is never a function.
	   A guard rather than an inline `typeof`, because `Row` is generic and
	   TypeScript cannot rule out a callable `Row` on its own. */
	const isSnippet = (entry: Row | Snippet): entry is Snippet => typeof entry === 'function';

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
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
