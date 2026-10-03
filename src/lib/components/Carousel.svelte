<script module lang="ts">
	/** What .carousel is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs).

	    The carousel draws its own parts: the track, one item per entry of
	    `items`, and the cells its arrows and pagination are drawn in. */
	export const PREFIX = 'carousel';

	export const AXES = {
		/* Where a slide comes to rest when several are visible. */
		align: ['start', 'center', 'end']
	} as const;

	export const FLAGS = {
		vertical: 'Slide up and down instead of sideways.'
	} as const;
	export const PARTS = ['track', 'item', 'prev', 'next', 'pagination'] as const;
</script>

<script lang="ts" generics="Item">
	/**
	 * A row of slides, one per entry of `items`, each drawn by `children`
	 * with the entry and its index. Scrolling is the browser's own —
	 * scroll-snap — so touch, trackpad and keyboard work with no script; the
	 * script only follows which slide is current, and moves to one on demand.
	 *
	 * `arrow` and `pagination` are each: absent (nothing drawn), `true` (the
	 * default: chevron buttons, dots), or a snippet of your own. A snippet is
	 * handed what it needs to act — it does not have to know the carousel.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	/** What an arrow snippet is given: drawn once per side. */
	type Arrow = { direction: 'prev' | 'next'; go: () => void; disabled: boolean };
	/** What a pagination snippet is given. `index` counts from 0. */
	type Pages = { count: number; index: number; go: (index: number) => void };

	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS>,
			Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The slides' data. */
		items: Item[];
		/** One slide, from its entry and its index. */
		children: Snippet<[Item, number]>;
		/** Previous / next: `true` for chevron buttons, or a snippet drawn on each side. */
		arrow?: true | null | Snippet<[Arrow]>;
		/** Under the slides: `true` for dots, or a snippet. */
		pagination?: true | null | Snippet<[Pages]>;
		/** The current slide, from 0. Bindable: setting it moves there. */
		index?: number;
		/** Past the last slide comes the first, and the other way round. */
		loop?: boolean;
		/**
		 * Move on by itself every this many milliseconds (`true`: 5000). It
		 * pauses under the pointer, while focus is inside, while the tab is
		 * hidden, and does not run at all with prefers-reduced-motion. It
		 * starts over from the first slide at the end, loop or not.
		 */
		autoplay?: boolean | number;
		/** Called with the new index whenever the current slide changes. */
		onslide?: (index: number) => void;
		/** Accessible names. */
		previousLabel?: string;
		nextLabel?: string;
		slideLabel?: (index: number, count: number) => string;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name. The scrolling reads the direction and the resting
	// point from the CSS the browser applied, not from the props.
	let {
		items,
		children,
		arrow = null,
		pagination = null,
		index = $bindable(0),
		loop = false,
		autoplay = false,
		onslide,
		previousLabel = 'Previous slide',
		nextLabel = 'Next slide',
		slideLabel = (i: number, n: number) => `${i + 1} / ${n}`,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let track: HTMLDivElement | undefined = $state();
	let count = $derived(items.length);

	/* ── Where we are ─────────────────────────────────────────────────── */

	/** The slide the track rests on, read from the scroll position. */
	let current = $state(0);
	let atStart = $state(true);
	let atEnd = $state(false);

	/** Up and down, as the stylesheet lays the track out. */
	const isVertical = () => !!track && getComputedStyle(track).flexDirection.startsWith('column');

	/** The scroll position at which a slide rests, from its own snap point. */
	function anchor(item: HTMLElement, vertical: boolean, view: number) {
		const start = vertical ? item.offsetTop : item.offsetLeft;
		const size = vertical ? item.offsetHeight : item.offsetWidth;
		const snap = getComputedStyle(item).scrollSnapAlign;
		return snap.includes('center') ? start - (view - size) / 2 : snap.includes('end') ? start - view + size : start;
	}

	function measure() {
		if (!track) return;
		const vertical = isVertical();
		const pos = vertical ? track.scrollTop : track.scrollLeft;
		const view = vertical ? track.clientHeight : track.clientWidth;
		const full = vertical ? track.scrollHeight : track.scrollWidth;
		let best = 0;
		let bestDistance = Infinity;
		Array.from(track.children).forEach((el, i) => {
			const at = anchor(el as HTMLElement, vertical, view);
			const distance = Math.abs(at - pos);
			if (distance < bestDistance) {
				bestDistance = distance;
				best = i;
			}
		});
		atStart = pos <= 1;
		atEnd = pos + view >= full - 1;
		if (best !== current) {
			current = best;
			index = best;
			onslide?.(best);
		}
	}

	let frame = 0;
	function onscroll() {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(measure);
	}

	/* ── Moving ───────────────────────────────────────────────────────── */

	/** Scroll to slide `i` (wrapped with `loop`, clamped otherwise). */
	function go(i: number) {
		if (!track || count === 0) return;
		const target = loop ? ((i % count) + count) % count : Math.min(Math.max(0, i), count - 1);
		const item = track.children[target] as HTMLElement | undefined;
		if (!item) return;
		const vertical = isVertical();
		const view = vertical ? track.clientHeight : track.clientWidth;
		const at = anchor(item, vertical, view);
		// The track's own scroll-behavior decides: smooth, unless reduced motion.
		track.scrollTo(vertical ? { top: at } : { left: at });
	}

	function prev() {
		if (atStart && loop) go(count - 1);
		else go(current - 1);
	}

	function next(wrap = loop) {
		if (atEnd && wrap) go(0);
		else go(current + 1);
	}

	// Follow `index` when the parent sets it. The scroll handler writes it too,
	// but always to the slide the track already rests on: nothing to do then.
	$effect(() => {
		const wanted = index;
		if (track && wanted !== current) go(wanted);
	});

	// Measure once laid out, and whenever the track changes size.
	$effect(() => {
		if (!track) return;
		const observer = new ResizeObserver(() => measure());
		observer.observe(track);
		return () => observer.disconnect();
	});

	/* ── Autoplay ─────────────────────────────────────────────────────── */

	let hovered = $state(false);
	let focused = $state(false);
	let hidden = $state(false);

	$effect(() => {
		const visibility = () => (hidden = document.visibilityState === 'hidden');
		visibility();
		document.addEventListener('visibilitychange', visibility);
		return () => document.removeEventListener('visibilitychange', visibility);
	});

	let delay = $derived(autoplay === true ? 5000 : typeof autoplay === 'number' ? autoplay : 0);

	$effect(() => {
		if (!delay || count < 2 || hovered || focused || hidden) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = setInterval(() => next(true), delay);
		return () => clearInterval(id);
	});

	/* ── What the snippets are given ─────────────────────────────────── */

	/* A scrolling region has to take the focus, or the keyboard can not scroll
	   it (Safari does not make scrollers focusable on its own). The a11y lint
	   only sees a div with a tabindex; spread, it lets the attribute through. */
	const scrollable = { tabindex: 0 };

	let prevArrow = $derived<Arrow>({ direction: 'prev', go: prev, disabled: !loop && atStart });
	let nextArrow = $derived<Arrow>({ direction: 'next', go: () => next(), disabled: !loop && atEnd });
	let pages = $derived<Pages>({ count, index: current, go });
</script>

{#snippet chevron({ direction, go, disabled }: Arrow)}
	<button
		type="button"
		class="btn btn-circle btn-sm"
		aria-label={direction === 'prev' ? previousLabel : nextLabel}
		{disabled}
		onclick={go}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d={direction === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
		</svg>
	</button>
{/snippet}

{#snippet dots({ count, index, go }: Pages)}
	<!-- The pagination component's markup, written out: a family's copy of
	     this file imports nothing. -->
	<nav class="pagination pagination-dots" aria-label="Slides">
		{#each { length: count }, i (i)}
			<button
				type="button"
				class="pagination-item"
				aria-label={slideLabel(i, count)}
				aria-current={i === index ? 'page' : undefined}
				onclick={() => go(i)}
			>
				{i + 1}
			</button>
		{/each}
	</nav>
{/snippet}

<div
	{...applied.rest}
	class={classes}
	role="region"
	aria-roledescription="carousel"
	onpointerenter={() => (hovered = true)}
	onpointerleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
>
	<!-- Focusable so the keyboard can scroll it: the arrow keys move from
	     slide to slide through scroll-snap, with no handler of ours. -->
	<div bind:this={track} class={`${PREFIX}-track`} {...scrollable} {onscroll}>
		{#each items as item, i (i)}
			<div
				class={`${PREFIX}-item`}
				role="group"
				aria-roledescription="slide"
				aria-label={slideLabel(i, count)}
			>
				{@render children(item, i)}
			</div>
		{/each}
	</div>

	{#if arrow}
		<div class={`${PREFIX}-prev`}>
			{#if typeof arrow === 'function'}{@render arrow(prevArrow)}{:else}{@render chevron(prevArrow)}{/if}
		</div>
		<div class={`${PREFIX}-next`}>
			{#if typeof arrow === 'function'}{@render arrow(nextArrow)}{:else}{@render chevron(nextArrow)}{/if}
		</div>
	{/if}

	{#if pagination}
		<div class={`${PREFIX}-pagination`}>
			{#if typeof pagination === 'function'}{@render pagination(pages)}{:else}{@render dots(pages)}{/if}
		</div>
	{/if}
</div>
