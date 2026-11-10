<script module lang="ts">
	/** What .toast is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'toast';

	export const AXES = {
		/* Either one pins the stack to a corner; neither leaves it in the flow. */
		side: ['top', 'bottom'],
		align: ['start', 'center', 'end']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;

	/** The colours an alert has an icon for, and any other the family ships. */
	export type ToastColor = 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error';

	export interface ToastOptions {
		message: string;
		title?: string;
		color?: ToastColor;
		/** Milliseconds on screen. `0` keeps it until dismissed. Default 5000. */
		duration?: number;
		/** One button inside the alert. Clicking it also dismisses the alert. */
		action?: { label: string; onClick: () => void };
	}

	interface Item extends ToastOptions {
		id: number;
		duration: number;
	}
</script>

<script lang="ts">
	/**
	 * A stack of alerts. Bind the component and call `add()` to push one;
	 * each is dismissible and leaves on its own after `duration`, its
	 * countdown paused while the pointer is over it or focus is inside it.
	 *
	 * With `side` or `align` the stack is pinned to that corner of the
	 * viewport; without, it sits in the flow where it is placed.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import Alert from './Alert.svelte';
	import Button from './Button.svelte';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLElement> {
		/** The region's accessible name. */
		label?: string;
		/** Each close button's accessible name. */
		dismissLabel?: string;
		/** At most this many alerts; the oldest goes first. */
		max?: number;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		label = 'Notifications',
		dismissLabel = 'Dismiss',
		max = Infinity,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
	let top = $derived(classes.includes(`${PREFIX}-top`));

	let items: Item[] = $state([]);
	let next = 1;

	/** Push an alert. Returns its id, for `dismiss`. */
	export function add(options: string | ToastOptions): number {
		const o = typeof options === 'string' ? { message: options } : options;
		const id = next++;
		items.push({ ...o, id, duration: o.duration ?? 5000 });
		if (items.length > max) items.splice(0, items.length - max);
		return id;
	}

	/** Remove an alert now. Unknown ids are ignored. */
	export function dismiss(id: number): void {
		const i = items.findIndex((t) => t.id === id);
		if (i >= 0) items.splice(i, 1);
	}

	/** Remove every alert. */
	export function clear(): void {
		items.length = 0;
	}

	/** Runs an alert's countdown, paused while hovered or focused. */
	function countdown(node: HTMLElement, t: Item) {
		if (!t.duration) return;
		let left = t.duration;
		let started = Date.now();
		let timer: ReturnType<typeof setTimeout> | undefined;
		let held = 0;
		const run = () => {
			started = Date.now();
			timer = setTimeout(() => dismiss(t.id), left);
		};
		const hold = () => {
			if (held++ === 0 && timer) {
				clearTimeout(timer);
				timer = undefined;
				left -= Date.now() - started;
			}
		};
		const release = () => {
			if (--held === 0) run();
		};
		node.addEventListener('pointerenter', hold);
		node.addEventListener('pointerleave', release);
		node.addEventListener('focusin', hold);
		node.addEventListener('focusout', release);
		run();
		return {
			destroy() {
				clearTimeout(timer);
				node.removeEventListener('pointerenter', hold);
				node.removeEventListener('pointerleave', release);
				node.removeEventListener('focusin', hold);
				node.removeEventListener('focusout', release);
			}
		};
	}
</script>

<section {...applied.rest} class={classes} aria-label={label} aria-live="polite">
	{#each items as t (t.id)}
		<div use:countdown={t} animate:flip={{ duration: 180 }} in:fly={{ y: top ? -16 : 16, duration: 180 }} out:fly={{ x: 24, duration: 160 }}>
			{#snippet action()}
				<Button
					size="sm"
					onclick={() => {
						t.action?.onClick();
						dismiss(t.id);
					}}>{t.action?.label}</Button
				>
			{/snippet}
			<!-- `as never`: any colour name goes; a family that lacks one simply
			     draws the default alert, as a class it never ships does. -->
			<Alert color={t.color as never} title={t.title} dismissible {dismissLabel} onDismiss={() => dismiss(t.id)} actions={t.action ? action : undefined}>
				{t.message}
			</Alert>
		</div>
	{/each}
</section>
