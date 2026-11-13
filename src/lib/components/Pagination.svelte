<script module lang="ts">
	/** What .pagination is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    The pagination draws its own pages: `.pagination-item`,
	    `.pagination-gap` and `.pagination-text` are PARTS. The current page is marked by
	    `aria-current="page"`, not by a class. */
	export const PREFIX = 'pagination';

	export const AXES = {
		/* The fill of the current page. */
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* How the pages are drawn. All three keep the same parts and props
		   (a different structure would be another component):
		   dots — a dot per page instead of its number, as under a carousel;
		   bars — a segment per page, stretched across the row;
		   count — no pages at all, "3 / 8" between previous and next. */
		variant: ['dots', 'bars', 'count']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['item', 'gap', 'text', 'number'] as const;
</script>

<script lang="ts">
	/**
	 * A row of pages to jump between. Pages are numbered from 1. Past a few
	 * pages, the ones far from the current page fold into a gap: the first
	 * and the last stay, and `siblings` pages on each side of the current one.
	 * The dots and bars variants always show every page, and no previous /
	 * next; the count variant shows no page, only "3 / 8" between them.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `color` is ours — the HTML attribute of the same name is long obsolete.
	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLElement>, 'color'> {
		/** How many pages there are. */
		count: number;
		/** The current page, from 1. Bindable. */
		page?: number;
		/** Pages kept on each side of the current one before a gap. Default 1. */
		siblings?: number;
		/** Keep the first and last pages, with a gap, around the window. Default no.
		    Without: only the current page and its siblings — `< 6 >` with
		    siblings 0, `< 5 6 7 >` with 1. */
		edges?: boolean;
		/** Draw previous / next. Default: yes, except in the dots and bars variants. */
		controls?: boolean;
		/** Called with the new page after every change. */
		onpage?: (page: number) => void;
		/** The accessible name of a page. Default `Page N`. */
		pageLabel?: (page: number) => string;
		/** The text of the count variant. Default `3 / 8`. */
		countLabel?: (page: number, count: number) => string;
		/** The accessible names of the controls. */
		previousLabel?: string;
		nextLabel?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured — except `variant`, which
	// also changes what is drawn. It is handed back to applyAxes below.
	let {
		count,
		page = $bindable(),
		siblings = 1,
		edges = false,
		controls,
		onpage,
		pageLabel = (p: number) => `Page ${p}`,
		countLabel = (p: number, n: number) => `${p} / ${n}`,
		previousLabel = 'Previous page',
		nextLabel = 'Next page',
		variant,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, { ...axes, variant }));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	/** Every page drawn, none folded, no number shown. */
	let marks = $derived(variant === 'dots' || variant === 'bars');
	let showControls = $derived(controls ?? !marks);

	/** The page shown: the first while none is given. */
	let current = $derived(page ?? 1);

	/** The pages to draw, with `null` for a gap. */
	let pages = $derived.by((): (number | null)[] => {
		const all = Array.from({ length: Math.max(0, count) }, (_, i) => i + 1);
		if (variant === 'count') return [];
		if (marks) return all;
		// No edges: a window of 2 * siblings + 1 pages, slid back inside the row at its ends.
		if (!edges) {
			const w = Math.min(count, 2 * siblings + 1);
			const start = Math.min(Math.max(1, current - siblings), count - w + 1);
			return all.slice(start - 1, start - 1 + w);
		}
		// first + last + current + siblings + two gaps: below that, folding saves nothing
		if (count <= 2 * siblings + 5) return all;
		// Always 2 * siblings + 5 slots, so the row keeps its width: near an
		// end, the pages the missing gap would have taken are shown instead.
		const edge = 2 * siblings + 3;
		if (current <= siblings + 3) return [...all.slice(0, edge), null, count];
		if (current >= count - siblings - 2) return [1, null, ...all.slice(count - edge)];
		return [1, null, ...all.slice(current - siblings - 1, current + siblings), null, count];
	});

	/** Which way the last move went, for a family that animates the numbers.
	    Unset until the first move, so nothing plays on load. */
	let direction = $state<'next' | 'previous'>();

	function go(p: number) {
		const next = Math.min(Math.max(1, p), count);
		if (next === current) return;
		direction = next > current ? 'next' : 'previous';
		page = next;
		onpage?.(next);
	}
</script>

<nav {...applied.rest} class={classes} data-direction={direction}>
	{#if showControls}
		<button
			type="button"
			class={`${PREFIX}-item`}
			aria-label={previousLabel}
			disabled={current <= 1}
			onclick={() => go(current - 1)}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
		</button>
	{/if}

	{#if variant === 'count'}
		<span class={`${PREFIX}-text`} aria-live="polite">{countLabel(current, count)}</span>
	{/if}

	<!-- Unkeyed: the slots stay put and only their numbers change, so the
	     current page's fill moves between fixed buttons. -->
	{#each pages as p}
		{#if p === null}
			<span class={`${PREFIX}-gap`} aria-hidden="true">…</span>
		{:else}
			<button
				type="button"
				class={`${PREFIX}-item`}
				aria-label={pageLabel(p)}
				aria-current={p === current ? 'page' : undefined}
				onclick={() => go(p)}
			>
				<!-- Keyed: a new number is a new span, so its entrance can play. -->
				{#key p}<span class={`${PREFIX}-number`}>{p}</span>{/key}
			</button>
		{/if}
	{/each}

	{#if showControls}
		<button
			type="button"
			class={`${PREFIX}-item`}
			aria-label={nextLabel}
			disabled={current >= count}
			onclick={() => go(current + 1)}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
		</button>
	{/if}
</nav>
