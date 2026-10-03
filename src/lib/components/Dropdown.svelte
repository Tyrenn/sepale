<script module lang="ts">
	/** What .dropdown is made of, classified. Each family's copy writes these
	    out as plain props (scripts/family-component.mjs).

	    `.dropdown-open` and `.dropdown-fixed` are PARTS: the wrapper writes
	    them from its own state, nobody opts into them. */
	export const PREFIX = 'dropdown';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Which side of the trigger the box opens on. Below by default. */
		side: ['top', 'bottom', 'left', 'right'],
		/* Where the box lines up along that side. The start by default. */
		align: ['center', 'end']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['content', 'open', 'fixed'] as const;

	/** What the trigger snippet receives: spread `props` on your button. */
	export interface DropdownTrigger {
		open: boolean;
		toggle: () => void;
		props: {
			'aria-expanded': boolean;
			'aria-controls': string;
			'aria-haspopup': 'true';
			onclick: () => void;
		};
	}
</script>

<script lang="ts">
	/**
	 * A trigger and a box that floats next to it. The box is placed in fixed
	 * coordinates, so no ancestor's `overflow` crops it, and it flips to the
	 * other side when there is no room. It closes on Escape and on a press
	 * outside — not on a click inside, which is the content's to decide
	 * (`close` is handed to it).
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fly } from 'svelte/transition';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'ontoggle'> {
		/** Whether the box is shown. Bindable. */
		open?: boolean;
		/** The element that opens it. Spread `props` on it. */
		trigger: Snippet<[DropdownTrigger]>;
		/** The box's content. `close` closes it. */
		children?: Snippet<[{ close: () => void }]>;
		/** Animate the box. Ignored when the visitor asks for reduced motion. */
		animated?: boolean;
		/** Called after every change of `open`. */
		ontoggle?: (open: boolean) => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		trigger,
		children,
		animated = true,
		ontoggle,
		side,
		align,
		class: klass = '',
		...axes
	}: Props = $props();

	// `side` and `align` are destructured because the placement reads them;
	// they are handed back to applyAxes so they still write their classes.
	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, { ...axes, side, align }));
	let classes = $derived(cx(PREFIX, applied.classes, `${PREFIX}-fixed`, open && `${PREFIX}-open`, klass));

	const uid = $props.id();

	let root: HTMLDivElement | undefined = $state();
	let content: HTMLDivElement | undefined = $state();
	let coords = $state('');

	function set(value: boolean) {
		if (value === open) return;
		open = value;
		ontoggle?.(value);
	}
	const toggle = () => set(!open);
	const close = () => set(false);

	/** Fixed coordinates for the box, flipped when the asked side has no room. */
	function place() {
		if (!root || !content) return;
		const t = (root.firstElementChild ?? root).getBoundingClientRect();
		const b = content.getBoundingClientRect();
		const gap = parseFloat(getComputedStyle(root).getPropertyValue('--dropdown-gap')) || 4;
		const vw = document.documentElement.clientWidth;
		const vh = document.documentElement.clientHeight;
		const rtl = getComputedStyle(root).direction === 'rtl';

		let top: number;
		let left: number;
		if (side === 'left' || side === 'right') {
			const fitsRight = vw - t.right >= b.width + gap;
			const fitsLeft = t.left >= b.width + gap;
			const toRight = side === 'right' ? fitsRight || !fitsLeft : !fitsLeft && fitsRight;
			left = toRight ? t.right + gap : t.left - gap - b.width;
			top = align === 'end' ? t.bottom - b.height : align === 'center' ? t.top + (t.height - b.height) / 2 : t.top;
		} else {
			const below = vh - t.bottom;
			const above = t.top;
			const wantUp = side === 'top';
			const up = wantUp ? above >= b.height + gap || above > below : below < b.height + gap && above > below;
			top = up ? t.top - gap - b.height : t.bottom + gap;
			const start = rtl ? t.right - b.width : t.left;
			const end = rtl ? t.left : t.right - b.width;
			left = align === 'end' ? end : align === 'center' ? t.left + (t.width - b.width) / 2 : start;
		}
		/* Kept inside the viewport, a little off its edges. */
		left = Math.min(Math.max(4, left), Math.max(4, vw - b.width - 4));
		top = Math.min(Math.max(4, top), Math.max(4, vh - b.height - 4));
		coords = `top:${Math.round(top)}px;left:${Math.round(left)}px;`;
	}

	/* While open: placed now, and again on every scroll or resize. Closed by
	   Escape and by a press outside the dropdown. */
	$effect(() => {
		if (!open || !content) return;
		place();
		const reposition = () => place();
		const outside = (e: PointerEvent) => {
			if (root && !root.contains(e.target as Node)) close();
		};
		const escape = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			/* Focus inside: back to the trigger, which the box belonged to. */
			const inside = root?.contains(document.activeElement);
			close();
			if (inside) root?.querySelector<HTMLElement>('[aria-controls]')?.focus();
		};
		const observer = new ResizeObserver(reposition);
		observer.observe(content);
		window.addEventListener('scroll', reposition, true);
		window.addEventListener('resize', reposition);
		document.addEventListener('pointerdown', outside, true);
		document.addEventListener('keydown', escape);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', reposition, true);
			window.removeEventListener('resize', reposition);
			document.removeEventListener('pointerdown', outside, true);
			document.removeEventListener('keydown', escape);
		};
	});

	const reduced = () =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let duration = $derived(animated && !reduced() ? 120 : 0);
</script>

<div {...applied.rest} bind:this={root} class={classes}>
	{@render trigger({
		open,
		toggle,
		props: {
			'aria-expanded': open,
			'aria-controls': `${uid}-content`,
			'aria-haspopup': 'true',
			onclick: toggle
		}
	})}
	{#if open}
		<div
			bind:this={content}
			id={`${uid}-content`}
			class={`${PREFIX}-content`}
			style={coords}
			transition:fly={{ y: side === 'top' ? 4 : -4, duration }}
		>
			{@render children?.({ close })}
		</div>
	{/if}
</div>
