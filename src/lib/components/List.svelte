<script module lang="ts">
	/** What .list is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

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

	export const FLAGS = {
		loading: 'Fade the rows while new ones are on their way.'
	} as const;
	export const PARTS = ['row', 'row-selected', 'row-dirty', 'col-grow', 'col-wrap', 'empty'] as const;
</script>

<script lang="ts" generics="Row">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLUListElement> {
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
		/** A row's identity, for `selected`, `dirty` and keyed rendering. Defaults to its index. */
		key?: (row: Row, index: number) => string;
		/** Drawn in place of the rows when there are none. */
		empty?: Snippet;
		/** Keys of the rows to draw as selected. */
		selected?: Iterable<string>;
		/** Keys of the rows to draw as changed and not yet saved. */
		dirty?: Iterable<string>;
		class?: string;
	}

	let {
		rows = [],
		row,
		key = (_row: Row, i: number) => String(i),
		empty,
		selected,
		dirty,
		class: klass = '',
		...axes
	}: Props = $props();

	let selectedSet = $derived(new Set(selected ?? []));
	let dirtySet = $derived(new Set(dirty ?? []));

	/* A snippet has no runtime marker — compiled, it is a plain function — so
	   `typeof` is the only test. Fine as long as a row is never a function.
	   A guard rather than an inline `typeof`, because `Row` is generic and
	   TypeScript cannot rule out a callable `Row` on its own. */
	const isSnippet = (entry: Row | Snippet): entry is Snippet => typeof entry === 'function';

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<ul {...applied.rest} class={classes}>
	{#each rows as entry, i (isSnippet(entry) ? `snippet-${i}` : key(entry, i))}
		{@const k = isSnippet(entry) ? String(i) : key(entry, i)}
		<li
			class={cx(
				`${PREFIX}-row`,
				selectedSet.has(k) && `${PREFIX}-row-selected`,
				dirtySet.has(k) && `${PREFIX}-row-dirty`
			)}
		>
			{#if isSnippet(entry)}
				{@render entry()}
			{:else if row}
				{@render row(entry)}
			{:else}
				{entry}
			{/if}
		</li>
	{:else}
		{#if empty}<li class={`${PREFIX}-empty`}>{@render empty()}</li>{/if}
	{/each}
</ul>
