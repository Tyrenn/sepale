<script module lang="ts">
	/** What .carousel is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs).

	    The carousel draws its own parts: the track, one item per entry of
	    `items` (and the duplicates of an infinite carousel), the cells its
	    arrows and pagination are drawn in, and the row of upcoming items. */
	export const PREFIX = 'carousel';

	export const AXES = {
		/* Where an item comes to rest when several are visible. */
		align: ['start', 'center', 'end']
	} as const;

	export const FLAGS = {
		vertical: 'Slide up and down instead of sideways.'
	} as const;
	export const PARTS = ['track', 'item', 'prev', 'next', 'pagination', 'upcoming', 'upcoming-item'] as const;
</script>

<script lang="ts" generics="Item">
	/**
	 * A row of items, one per entry of `items`, each drawn by `children` with
	 * the entry and its index. Scrolling is the browser's own — scroll-snap —
	 * and the script reads which item the track rests on from the measured
	 * items, so items may differ in size.
	 *
	 * The index is a projection of the scroll position, never bound
	 * (ADR 0011): `index` is the initial item, `goto` / `prev` / `next`
	 * (through `bind:this`) move, `onIndex` tells. The script holds no
	 * `$effect`: the observers, the drag, the wheel and the autoplay are
	 * attachments, and only exist while their prop asks for them.
	 *
	 * `arrow`, `pagination` and `upcoming` are each: absent (nothing drawn),
	 * `true` (a default), or a snippet of your own, handed what it needs to
	 * act — it does not have to know the carousel.
	 */
	import { tick, untrack, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';
	import Pagination from './Pagination.svelte';

	/** What an arrow snippet is given: drawn once per side. */
	type Arrow = { direction: 'prev' | 'next'; go: () => void; disabled: boolean };
	/** What a pagination snippet is given. `index` counts from 0. */
	type Pages = { count: number; index: number; goto: (index: number) => void };
	/** What an upcoming snippet is given: the items after the current one. */
	type Upcoming = { items: { item: Item; index: number }[]; goto: (index: number) => void };

	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS>,
			Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The items' data. */
		items: Item[];
		/** One item, from its entry and its index. */
		children: Snippet<[Item, number]>;
		/** Previous / next: `true` for chevron buttons, or a snippet drawn on each side. */
		arrow?: true | null | Snippet<[Arrow]>;
		/** Under the items: `true` for the pagination in its dots variant, or a snippet. */
		pagination?: true | null | Snippet<[Pages]>;
		/**
		 * The items that come next, small, under the track: `true` for the
		 * next 3 drawn by `children`, a number for that many, or a snippet.
		 */
		upcoming?: true | number | null | Snippet<[Upcoming]>;
		/** The item to start on, from 0. Not bound: move with `goto`, listen with `onIndex`. */
		index?: number;
		/** At the last item, next goes back to the first, and the other way round. */
		loop?: boolean;
		/** No end: items are duplicated on both sides so the row runs on with no jump. Wins over `loop`. */
		infinite?: boolean;
		/**
		 * Move on by itself every this many milliseconds (`true`: 5000). It
		 * pauses under the pointer, while focus is inside, while the tab is
		 * hidden, and does not run at all with prefers-reduced-motion. At the
		 * end it starts over from the first item; infinite, it runs on.
		 */
		autoplay?: boolean | number;
		/** Drag with the mouse. Default `true`. */
		drag?: boolean;
		/** Scroll with the wheel, the trackpad or a finger. Default `true`. */
		scroll?: boolean;
		/** Move with the arrow keys, Home and End once the track has the focus. Default `true`. */
		keyboard?: boolean;
		/** Called with the new index whenever the current item changes. */
		onIndex?: (index: number) => void;
		/** Accessible names. */
		previousLabel?: string;
		nextLabel?: string;
		itemLabel?: (index: number, count: number) => string;
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
		upcoming = null,
		index = 0,
		loop = false,
		infinite = false,
		autoplay = false,
		drag = true,
		scroll = true,
		keyboard = true,
		onIndex,
		previousLabel = 'Previous item',
		nextLabel = 'Next item',
		itemLabel = (i: number, n: number) => `${i + 1} / ${n}`,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let track: HTMLDivElement | undefined = $state();
	let count = $derived(items.length);
	let wraps = $derived(loop || infinite);

	const mod = (i: number, n: number) => ((i % n) + n) % n;

	/* ── Where we are ─────────────────────────────────────────────────── */

	/** The item the track rests on — read from the scroll position, never set. */
	let current = $state(untrack(() => index));
	let atStart = $state(true);
	let atEnd = $state(false);
	/** Duplicates drawn on EACH side of an infinite carousel. 0 until measured. */
	let clones = $state(0);
	/** The child of the track resting in view, duplicates counted. */
	let rendered = 0;

	/** Up and down, as the stylesheet lays the track out. */
	const isVertical = () => !!track && getComputedStyle(track).flexDirection.startsWith('column');
	const isRtl = () => !!track && getComputedStyle(track).direction === 'rtl';

	/** The scroll position at which an item rests, from its own snap point. */
	function anchor(item: Element, vertical: boolean, view: number) {
		const el = item as HTMLElement;
		const start = vertical ? el.offsetTop : el.offsetLeft;
		const size = vertical ? el.offsetHeight : el.offsetWidth;
		const snap = getComputedStyle(el).scrollSnapAlign;
		return snap.includes('center') ? start - (view - size) / 2 : snap.includes('end') ? start - view + size : start;
	}

	/** Scroll position ↔ index. One reading, done on demand: the DOM is the truth. */
	function measure() {
		if (!track || count === 0) return;
		const vertical = isVertical();
		const pos = vertical ? track.scrollTop : track.scrollLeft;
		const view = vertical ? track.clientHeight : track.clientWidth;
		const full = vertical ? track.scrollHeight : track.scrollWidth;
		// A track that cannot scroll (a stylesheet swapping) reports 0, not
		// where it rests: keep the last reading.
		if (full <= view + 1 && count > 1) return;
		let best = 0;
		let bestDistance = Infinity;
		Array.from(track.children).forEach((el, r) => {
			const distance = Math.abs(anchor(el, vertical, view) - pos);
			if (distance < bestDistance) {
				bestDistance = distance;
				best = r;
			}
		});
		rendered = best;
		atStart = pos <= 1;
		atEnd = pos + view >= full - 1;
		const i = mod(best - clones, count);
		if (i !== current) {
			current = i;
			onIndex?.(i);
		}
	}

	/** Scroll so the track's child `r` rests in view. */
	function toChild(r: number, instant = false) {
		const item = track?.children[r];
		if (!track || !item) return;
		const vertical = isVertical();
		const at = anchor(item, vertical, vertical ? track.clientHeight : track.clientWidth);
		// Otherwise the track's own scroll-behavior decides: smooth, unless reduced motion.
		const behavior = instant ? 'instant' : undefined;
		track.scrollTo(vertical ? { top: at, behavior } : { left: at, behavior });
	}

	/** How many duplicates fill a view on each side, plus one to step into. */
	function fit() {
		if (!track || count < 2) return 0;
		const vertical = isVertical();
		const view = vertical ? track.clientHeight : track.clientWidth;
		const own = Array.from(track.children).slice(clones, clones + count) as HTMLElement[];
		const smallest = Math.min(...own.map((el) => (vertical ? el.offsetHeight : el.offsetWidth)));
		// Nothing laid out (a stylesheet swapping, a hidden parent): keep what is
		// drawn, or the items shift under the scroll position and the index with them.
		if (!(smallest > 0) || !view) return clones;
		return Math.min(count, Math.ceil(view / smallest) + 1);
	}

	/** After a resize or new items: draw the duplicates needed, rest on the current item. */
	async function layout() {
		if (!track) return;
		const wanted = infinite ? fit() : 0;
		if (wanted !== clones) {
			clones = wanted;
			await tick();
		}
		toChild(clones + Math.min(current, count - 1), true);
		measure();
	}

	/* Once the scroll stops: an infinite carousel resting on a duplicate is
	   moved, with no animation, onto the item it duplicates — the same
	   picture, one round further. */
	let frame = 0;
	let settling: ReturnType<typeof setTimeout> | undefined;
	let dragged = false;

	function settle() {
		if (!track) return;
		measure();
		if (dragged) {
			dragged = false;
			track.style.scrollSnapType = '';
		}
		if (!infinite || !clones || (rendered >= clones && rendered < clones + count)) return;
		const vertical = isVertical();
		const view = vertical ? track.clientHeight : track.clientWidth;
		const from = track.children[rendered];
		const to = track.children[rendered < clones ? rendered + count : rendered - count];
		const shift = anchor(to, vertical, view) - anchor(from, vertical, view);
		track.scrollBy(vertical ? { top: shift, behavior: 'instant' } : { left: shift, behavior: 'instant' });
		rendered += rendered < clones ? count : -count;
	}

	function onscroll() {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(measure);
		clearTimeout(settling);
		settling = setTimeout(settle, 120);
	}

	/* ── Moving ───────────────────────────────────────────────────────── */

	/** Scroll to item `i` — wrapped with `loop` or `infinite`, clamped otherwise. */
	export function goto(i: number) {
		if (!track || count === 0) return;
		if (infinite && clones) {
			// The same item exists up to three times: take the nearest copy.
			const own = clones + mod(i, count);
			const copies = [own - count, own, own + count].filter((r) => r >= 0 && r < count + 2 * clones);
			toChild(copies.reduce((a, b) => (Math.abs(b - rendered) < Math.abs(a - rendered) ? b : a)));
		} else {
			toChild(clones + (wraps ? mod(i, count) : Math.min(Math.max(0, i), count - 1)));
		}
	}

	export function prev() {
		if (!infinite && atStart && loop) goto(count - 1);
		else goto(current - 1);
	}

	export function next(wrap = loop) {
		if (!infinite && atEnd && wrap) goto(0);
		else goto(current + 1);
	}

	/* ── Interactions: each one exists only while its prop asks for it ── */

	/** Measure once laid out, and whenever the track, an item, or the items change. */
	const observe: Attachment<HTMLDivElement> = (node) => {
		const sizes = new ResizeObserver(() => layout());
		const watch = () => {
			sizes.disconnect();
			sizes.observe(node);
			for (const child of node.children) sizes.observe(child);
		};
		const list = new MutationObserver(watch);
		list.observe(node, { childList: true });
		watch();
		return () => {
			sizes.disconnect();
			list.disconnect();
		};
	};

	/* A vertical wheel moves a sideways track one item per gesture, and
	   hands the page back at the ends. A horizontal one (a trackpad) is the
	   browser's. */
	const wheeling: Attachment<HTMLDivElement> = (node) => {
		let locked = false;
		let quiet: ReturnType<typeof setTimeout> | undefined;
		const onwheel = (e: WheelEvent) => {
			if (isVertical() || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
			const forward = e.deltaY > 0;
			if (!infinite && (forward ? atEnd : atStart)) return;
			e.preventDefault();
			// One gesture, one item: unlocked once the wheel has been quiet a moment.
			clearTimeout(quiet);
			quiet = setTimeout(() => (locked = false), 200);
			if (locked) return;
			locked = true;
			if (forward) next(false);
			else goto(current - 1);
		};
		node.addEventListener('wheel', onwheel, { passive: false });
		return () => {
			clearTimeout(quiet);
			node.removeEventListener('wheel', onwheel);
		};
	};

	/* The mouse drags the row; on release it comes to rest on the nearest
	   item, or on the next one in the drag's direction after a real pull. */
	const dragging: Attachment<HTMLDivElement> = (node) => {
		let start = 0;
		let origin = 0;
		let from = 0;
		let delta = 0;
		let vertical = false;

		const move = (e: PointerEvent) => {
			delta = (vertical ? e.clientY : e.clientX) - start;
			if (!dragged && Math.abs(delta) < 5) return;
			if (!dragged) {
				dragged = true;
				node.style.scrollSnapType = 'none';
			}
			node.scrollTo(vertical ? { top: origin - delta, behavior: 'instant' } : { left: origin - delta, behavior: 'instant' });
		};
		const up = () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			if (!dragged) return;
			// The release is not a click on what lies under it.
			const swallow = (e: Event) => {
				e.preventDefault();
				e.stopPropagation();
			};
			node.addEventListener('click', swallow, { capture: true, once: true });
			setTimeout(() => node.removeEventListener('click', swallow, { capture: true }));
			measure();
			let r = rendered;
			if (r === from && Math.abs(delta) > 30) r += (delta < 0 ? 1 : -1) * (isRtl() && !vertical ? -1 : 1);
			toChild(Math.min(Math.max(0, r), node.children.length - 1));
			// The snap comes back once the row is at rest (settle).
			clearTimeout(settling);
			settling = setTimeout(settle, 120);
		};
		const down = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || e.button !== 0) return;
			vertical = isVertical();
			start = vertical ? e.clientY : e.clientX;
			origin = vertical ? node.scrollTop : node.scrollLeft;
			from = rendered;
			delta = 0;
			window.addEventListener('pointermove', move);
			window.addEventListener('pointerup', up);
		};
		const nodrag = (e: DragEvent) => e.preventDefault();

		node.addEventListener('pointerdown', down);
		node.addEventListener('dragstart', nodrag);
		return () => {
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('dragstart', nodrag);
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
	};

	/* The keys are ours rather than the browser's, so they move one item
	   whether the track can scroll or not — and do nothing when switched off. */
	function onkeydown(e: KeyboardEvent) {
		if (e.target !== track) return;
		const vertical = isVertical();
		const flip = !vertical && isRtl();
		const back = vertical ? 'ArrowUp' : flip ? 'ArrowRight' : 'ArrowLeft';
		const forth = vertical ? 'ArrowDown' : flip ? 'ArrowLeft' : 'ArrowRight';
		const keys = [back, forth, 'Home', 'End', 'PageUp', 'PageDown', ' '];
		if (!keys.includes(e.key)) return;
		e.preventDefault();
		if (!keyboard) return;
		if (e.key === back) prev();
		else if (e.key === forth) next();
		else if (e.key === 'Home') goto(0);
		else if (e.key === 'End') goto(count - 1);
	}

	/* ── Autoplay ─────────────────────────────────────────────────────── */

	let delay = $derived(autoplay === true ? 5000 : typeof autoplay === 'number' ? autoplay : 0);

	const autoplaying =
		(ms: number): Attachment<HTMLDivElement> =>
		(node) => {
			if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
			let hovered = false;
			let focused = false;
			let id: ReturnType<typeof setInterval> | undefined;
			const run = () => {
				clearInterval(id);
				if (hovered || focused || document.visibilityState === 'hidden') return;
				id = setInterval(() => count > 1 && next(true), ms);
			};
			const enter = () => ((hovered = true), run());
			const leave = () => ((hovered = false), run());
			const focusin = () => ((focused = true), run());
			const focusout = (e: FocusEvent) => ((focused = node.contains(e.relatedTarget as Node | null)), run());
			node.addEventListener('pointerenter', enter);
			node.addEventListener('pointerleave', leave);
			node.addEventListener('focusin', focusin);
			node.addEventListener('focusout', focusout);
			document.addEventListener('visibilitychange', run);
			run();
			return () => {
				clearInterval(id);
				node.removeEventListener('pointerenter', enter);
				node.removeEventListener('pointerleave', leave);
				node.removeEventListener('focusin', focusin);
				node.removeEventListener('focusout', focusout);
				document.removeEventListener('visibilitychange', run);
			};
		};

	/* ── What the snippets are given ─────────────────────────────────── */

	/* A scrolling region has to take the focus, or the keyboard can not reach
	   it (Safari does not make scrollers focusable on its own). Switched off,
	   it leaves the tab order. The a11y lint only sees a div with a tabindex;
	   spread, it lets the attribute through. */
	let focusable = $derived({ tabindex: keyboard ? 0 : -1 });

	let prevArrow = $derived<Arrow>({ direction: 'prev', go: prev, disabled: !wraps && atStart });
	let nextArrow = $derived<Arrow>({ direction: 'next', go: () => next(), disabled: !wraps && atEnd });
	let pages = $derived<Pages>({ count, index: current, goto });

	let ahead = $derived.by(() => {
		const n = typeof upcoming === 'number' ? upcoming : 3;
		const list: { item: Item; index: number }[] = [];
		for (let step = 1; step <= Math.min(n, count - 1); step++) {
			const i = current + step;
			if (i >= count && !wraps) break;
			list.push({ item: items[mod(i, count)], index: mod(i, count) });
		}
		return list;
	});
	let coming = $derived<Upcoming>({ items: ahead, goto });
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

{#snippet thumbnails({ items: next, goto }: Upcoming)}
	{#each next as { item, index: i } (i)}
		<button type="button" class={`${PREFIX}-upcoming-item`} aria-label={itemLabel(i, count)} onclick={() => goto(i)}>
			{@render children(item, i)}
		</button>
	{/each}
{/snippet}

{#snippet duplicate(i: number)}
	<!-- A duplicate is only a picture: out of the accessibility tree, out of reach. -->
	<div class={`${PREFIX}-item`} aria-hidden="true" inert>
		{@render children(items[i], i)}
	</div>
{/snippet}

<div
	{...applied.rest}
	class={classes}
	role="region"
	aria-roledescription="carousel"
	{@attach delay ? autoplaying(delay) : undefined}
>
	<div
		bind:this={track}
		class={`${PREFIX}-track`}
		style={scroll ? undefined : 'overflow: hidden'}
		{...focusable}
		{onscroll}
		{onkeydown}
		{@attach observe}
		{@attach scroll ? wheeling : undefined}
		{@attach drag ? dragging : undefined}
	>
		{#each { length: clones }, c}
			{@render duplicate(mod(count - clones + c, count))}
		{/each}
		{#each items as item, i (i)}
			<div
				class={`${PREFIX}-item`}
				role="group"
				aria-roledescription="item"
				aria-label={itemLabel(i, count)}
			>
				{@render children(item, i)}
			</div>
		{/each}
		{#each { length: clones }, c}
			{@render duplicate(c)}
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

	{#if upcoming && ahead.length}
		<div class={`${PREFIX}-upcoming`}>
			{#if typeof upcoming === 'function'}{@render upcoming(coming)}{:else}{@render thumbnails(coming)}{/if}
		</div>
	{/if}

	{#if pagination}
		<div class={`${PREFIX}-pagination`}>
			{#if typeof pagination === 'function'}{@render pagination(pages)}{:else}
				<Pagination
					variant="dots"
					{count}
					page={current + 1}
					onPage={(p) => goto(p - 1)}
					pageLabel={(p) => itemLabel(p - 1, count)}
					aria-label="Items"
				/>
			{/if}
		</div>
	{/if}
</div>
