<script module lang="ts">
	/** What .grid is made of, classified. Each family's copy writes these out
	    as plain props (scripts/family-component.mjs).

	    `masonry` is a PART, not a flag: its prop changes what is drawn (the
	    lanes), so it is written by hand below and every family's copy keeps
	    it. */
	export const PREFIX = 'grid';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Space between the items. */
		gap: ['none', 'tight', 'loose']
	} as const;

	export const FLAGS = {
		loading: 'Fade the items while new ones are on their way.'
	} as const;
	export const PARTS = ['item', 'item-selected', 'item-dirty', 'lane', 'masonry', 'empty'] as const;
</script>

<script lang="ts" generics="Item">
	/**
	 * Items in as many columns as fit: a column is at least the family's
	 * minimum wide, so the count follows the width, never a breakpoint. What
	 * an item looks like is the `item` snippet's — a card, usually.
	 *
	 * `masonry` stacks each column on its own instead of lining items up in
	 * rows: the grid deals the items into its columns in turn, so the reading
	 * order stays row by row.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLDivElement> {
		/** The items: your data, as is. */
		items?: Item[];
		/** How one item is drawn. */
		item: Snippet<[Item, number]>;
		/** An item's identity, for `selected`, `dirty` and keyed rendering. Defaults to its index. */
		key?: (item: Item, index: number) => string;
		/** Drawn in place of the items when there are none. */
		empty?: Snippet;
		/** Keys of the items to draw as selected. */
		selected?: Iterable<string>;
		/** Keys of the items to draw as changed and not yet saved. */
		dirty?: Iterable<string>;
		/** Stack each column on its own, items of uneven height packed tight. */
		masonry?: boolean;
		class?: string;
	}

	let {
		items = [],
		item,
		key = (_item: Item, i: number) => String(i),
		empty,
		selected,
		dirty,
		masonry = false,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, masonry && `${PREFIX}-masonry`, klass));

	let selectedSet = $derived(new Set(selected ?? []));
	let dirtySet = $derived(new Set(dirty ?? []));

	/* Masonry: how many columns the browser made, read off the computed
	   track list — the CSS stays the one place that decides it. */
	let root: HTMLDivElement | undefined = $state();
	let count = $state(1);

	$effect(() => {
		if (!masonry || !root) return;
		const el = root;
		const measure = () => {
			const tracks = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
			count = Math.max(1, tracks);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	});

	/** Item i goes to lane i mod n: row by row, as a reader expects. */
	let lanes = $derived.by(() => {
		const out: { item: Item; index: number }[][] = Array.from({ length: count }, () => []);
		items.forEach((it, index) => out[index % count]!.push({ item: it, index }));
		return out;
	});

	function itemClass(it: Item, i: number) {
		const k = key(it, i);
		return cx(
			`${PREFIX}-item`,
			selectedSet.has(k) && `${PREFIX}-item-selected`,
			dirtySet.has(k) && `${PREFIX}-item-dirty`
		);
	}
</script>

<div {...applied.rest} bind:this={root} class={classes}>
	{#if !items.length}
		{#if empty}<div class={`${PREFIX}-empty`}>{@render empty()}</div>{/if}
	{:else if masonry}
		{#each lanes as lane, li (li)}
			<div class={`${PREFIX}-lane`}>
				{#each lane as entry (key(entry.item, entry.index))}
					<div class={itemClass(entry.item, entry.index)}>{@render item(entry.item, entry.index)}</div>
				{/each}
			</div>
		{/each}
	{:else}
		{#each items as it, i (key(it, i))}
			<div class={itemClass(it, i)}>{@render item(it, i)}</div>
		{/each}
	{/if}
</div>
