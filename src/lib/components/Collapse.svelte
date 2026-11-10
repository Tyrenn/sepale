<script module lang="ts">
	/** What .collapse is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'collapse';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Draw no frame: the trigger and the content sit on the page. */
		variant: ['ghost']
	} as const;

	export const FLAGS = {
		arrow: 'Draw a chevron that turns when open.',
		plus: 'Draw a plus that becomes a minus when open.'
	} as const;
	export const PARTS = ['trigger', 'panel', 'inner'] as const;
</script>

<script lang="ts">
	/**
	 * A panel that folds under its trigger.
	 *
	 * A button and a region rather than <details>: the height animates, and the
	 * state is the button's `aria-expanded`, which the stylesheet reads. The
	 * closed panel is `inert`, so nothing inside it can be focused.
	 *
	 * `open` is where it starts. To drive it from outside, use the methods —
	 * `bind:this={c}` then `c.show()`, `c.hide()`, `c.toggle()` — and listen
	 * with `onToggle`. Inside an exclusive Accordion, opening one closes the
	 * others.
	 */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAccordion } from './accordion-context.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		/** The trigger's text. */
		title?: string;
		/** The trigger's content, as markup. Wins over `title`. */
		trigger?: Snippet;
		/** Whether it starts open. Not bound: use the methods to drive it. */
		open?: boolean;
		/** After every change, with the new state. */
		onToggle?: (open: boolean) => void;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		title,
		trigger,
		open: initial = false,
		onToggle,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	/* Where it starts, read once: afterwards the methods own it. */
	let isOpen = $state(untrack(() => initial));
	const id = `collapse-${Math.random().toString(36).slice(2, 9)}`;

	const group = getAccordion();
	const closeFromGroup = () => set(false);
	if (group) {
		const leave = group.join(closeFromGroup);
		$effect(() => leave);
	}

	function set(next: boolean) {
		if (next === isOpen) return;
		isOpen = next;
		if (next) group?.opened(closeFromGroup);
		onToggle?.(next);
	}

	export function show() {
		set(true);
	}
	export function hide() {
		set(false);
	}
	export function toggle() {
		set(!isOpen);
	}
</script>

<div {...applied.rest} class={classes}>
	<button type="button" class="collapse-trigger" aria-expanded={isOpen} aria-controls={id} onclick={toggle}>
		{#if trigger}{@render trigger()}{:else}{title}{/if}
	</button>
	<div class="collapse-panel" {id} role="region" inert={!isOpen}>
		<div class="collapse-inner">{@render children?.()}</div>
	</div>
</div>
