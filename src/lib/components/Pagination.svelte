<script module lang="ts">
	/** What .pagination is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs).

	    The pagination draws its own pages: `.pagination-item` and
	    `.pagination-gap` are PARTS. The current page is marked by
	    `aria-current="page"`, not by a class. */
	export const PREFIX = 'pagination';

	export const AXES = {
		/* The fill of the current page. */
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A dot per page instead of its number, as under a carousel. */
		variant: ['dots']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['item', 'gap'] as const;
</script>

<script lang="ts">
	/**
	 * A row of pages to jump between. Pages are numbered from 1. Past a few
	 * pages, the ones far from the current page fold into a gap: the first
	 * and the last stay, and `siblings` pages on each side of the current one.
	 * The dots variant always shows every page, and no previous / next.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `color` is ours — the HTML attribute of the same name is long obsolete.
	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLElement>, 'color'> {
		/** How many pages there are. */
		count: number;
		/** The current page, from 1. Bindable. */
		page?: number;
		/** Pages kept on each side of the current one before a gap. Default 1. */
		siblings?: number;
		/** Draw previous / next. Default: yes, except in the dots variant. */
		controls?: boolean;
		/** Called with the new page after every change. */
		onpage?: (page: number) => void;
		/** The accessible name of a page. Default `Page N`. */
		pageLabel?: (page: number) => string;
		/** The accessible names of the controls. */
		previousLabel?: string;
		nextLabel?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured — except `variant`, which
	// also changes what is drawn. It is handed back to applyAxes below.
	let {
		count,
		page = $bindable(1),
		siblings = 1,
		controls,
		onpage,
		pageLabel = (p: number) => `Page ${p}`,
		previousLabel = 'Previous page',
		nextLabel = 'Next page',
		variant,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, { ...axes, variant }));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let dots = $derived(variant === 'dots');
	let showControls = $derived(controls ?? !dots);

	/** The pages to draw, with `null` for a gap. */
	let pages = $derived.by((): (number | null)[] => {
		const all = Array.from({ length: Math.max(0, count) }, (_, i) => i + 1);
		// first + last + current + siblings + two gaps: below that, folding saves nothing
		if (dots || count <= 2 * siblings + 5) return all;
		const from = Math.max(2, page - siblings);
		const to = Math.min(count - 1, page + siblings);
		return [
			1,
			...(from > 2 ? [null] : []),
			...all.slice(from - 1, to),
			...(to < count - 1 ? [null] : []),
			count
		];
	});

	function go(p: number) {
		const next = Math.min(Math.max(1, p), count);
		if (next === page) return;
		page = next;
		onpage?.(next);
	}
</script>

<nav {...applied.rest} class={classes}>
	{#if showControls}
		<button
			type="button"
			class={`${PREFIX}-item`}
			aria-label={previousLabel}
			disabled={page <= 1}
			onclick={() => go(page - 1)}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
		</button>
	{/if}

	{#each pages as p, i (p ?? `gap-${i}`)}
		{#if p === null}
			<span class={`${PREFIX}-gap`} aria-hidden="true">…</span>
		{:else}
			<button
				type="button"
				class={`${PREFIX}-item`}
				aria-label={pageLabel(p)}
				aria-current={p === page ? 'page' : undefined}
				onclick={() => go(p)}
			>
				{p}
			</button>
		{/if}
	{/each}

	{#if showControls}
		<button
			type="button"
			class={`${PREFIX}-item`}
			aria-label={nextLabel}
			disabled={page >= count}
			onclick={() => go(page + 1)}
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
		</button>
	{/if}
</nav>
