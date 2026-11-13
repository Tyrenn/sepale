<script module lang="ts">
	/** What .drawer is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'drawer';

	export const AXES = {
		/* The edge it slides from. Left when none is given. */
		side: ['left', 'right', 'top', 'bottom']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['content', 'handle'] as const;

	/** hidden: out of view · peek: its last --drawer-peek in view · open: all of it. */
	export type DrawerState = 'hidden' | 'peek' | 'open';
</script>

<script lang="ts">
	/**
	 * A panel sliding in from any side, in three states: hidden, peek, open.
	 *
	 * `state` is where it starts, read once. From then on the drawer is driven
	 * by its methods — `bind:this={d}`, then `d.open()`, `d.peek()`, `d.hide()`,
	 * `d.toggle()` — and reports every change through `onstate`. It moves by
	 * itself only to fall back to its rest state (`peek` if it started peeking,
	 * else `hidden`): on Escape, or a click on the backdrop. A click on a
	 * peeking drawer opens it.
	 *
	 * `as` picks the element. `dialog` makes `open` modal (backdrop, focus kept
	 * inside, page inert) while `peek` stays non-modal; `aside`, `nav` and the
	 * default `div` never block the page — a collapsible menu is a `nav`.
	 */
	import { onMount, untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLElement> {
		/** The element. `dialog` makes the open state modal. */
		as?: 'div' | 'aside' | 'nav' | 'dialog';
		/** Where it starts. Read once: use the methods afterwards. */
		state?: DrawerState;
		/** Where Escape and the backdrop send it. Defaults to `peek` if it starts peeking, else `hidden`. */
		rest?: 'hidden' | 'peek';
		/** After every change of state. */
		onstate?: (state: DrawerState) => void;
		/** Draw a grip on the inner edge that toggles open and the rest state. */
		handle?: boolean;
		handleLabel?: string;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		as = 'div',
		state: initial = 'hidden',
		rest: restProp,
		onstate,
		handle = false,
		handleLabel = 'Toggle panel',
		class: klass = '',
		children,
		// Native events we listen to as well: handed on, never swallowed.
		oncancel,
		onkeydown,
		onclick,
		...axes
	}: Props = $props();

	type On<E extends Event> = E & { currentTarget: EventTarget & HTMLElement };

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	/* Where it starts, read once: afterwards the methods own it. */
	let current: DrawerState = $state(untrack(() => initial));
	let restState = $derived(restProp ?? (untrack(() => initial) === 'peek' ? 'peek' : 'hidden'));

	let element: HTMLElement | undefined = $state();
	const dialog = () => (as === 'dialog' ? (element as HTMLDialogElement | undefined) : undefined);

	/** Puts a <dialog> in the mode the state needs. Hiding waits for the slide. */
	function sync(next: DrawerState) {
		const d = dialog();
		if (!d) return;
		if (next === 'open') {
			if (d.open) d.close();
			d.showModal();
		} else if (next === 'peek') {
			if (d.open) d.close();
			d.show();
		} else {
			const done = () => {
				if (current === 'hidden' && d.open) d.close();
			};
			d.addEventListener('transitionend', done, { once: true });
			setTimeout(done, 500);
		}
	}

	function go(next: DrawerState) {
		if (next === current) return;
		current = next;
		sync(next);
		onstate?.(next);
	}

	export function open() {
		go('open');
	}
	export function peek() {
		go('peek');
	}
	export function hide() {
		go('hidden');
	}
	/** Open, or back to the rest state when open. */
	export function toggle() {
		go(current === 'open' ? restState : 'open');
	}
	export function getState(): DrawerState {
		return current;
	}

	onMount(() => {
		if (current !== 'hidden') sync(current);
	});

	/* A dialog's Escape: the browser would close it outright. */
	function cancel(e: On<Event>) {
		if (as === 'dialog') {
			e.preventDefault();
			go(restState);
		}
		oncancel?.(e);
	}

	function keydown(e: On<KeyboardEvent>) {
		if (e.key === 'Escape' && current === 'open' && as !== 'dialog') {
			e.stopPropagation();
			go(restState);
		}
		onkeydown?.(e);
	}

	function click(e: On<MouseEvent>) {
		onclick?.(e);
		if (e.defaultPrevented || !element) return;
		/* A modal dialog's backdrop: the click lands on the element, outside its box. */
		if (as === 'dialog' && current === 'open' && e.target === element) {
			const r = element.getBoundingClientRect();
			const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
			if (!inside) return go(restState);
		}
		if (current === 'peek') go('open');
	}
</script>

<svelte:element
	this={as}
	{...applied.rest}
	bind:this={element}
	class={classes}
	data-state={current}
	inert={current === 'hidden' && as !== 'dialog' ? true : undefined}
	oncancel={cancel}
	onkeydown={keydown}
	onclick={click}
	role={as === 'div' ? 'region' : undefined}
>
	<div class="drawer-content">{@render children?.()}</div>
	{#if handle}
		<button
			type="button"
			class="drawer-handle"
			aria-label={handleLabel}
			aria-expanded={current === 'open'}
			onclick={(e) => {
				e.preventDefault();
				toggle();
			}}
		></button>
	{/if}
</svelte:element>
