<script module lang="ts">
	/** What .toaster is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'toaster';

	export const AXES = {
		/* The corner the stack grows from: two independent choices. */
		side: ['top', 'bottom'],
		align: ['start', 'center', 'end']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * Where toasts appear. Place ONE in the layout; call `toast()` from anywhere.
	 *
	 * Each toast is an `Alert`, dismissible. Its countdown pauses while the
	 * pointer is over it or focus is inside it, so a toast is never taken away
	 * from someone reading it.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import Alert from './Alert.svelte';
	import Button from './Button.svelte';
	import { toasts, dismissToast, type Toast } from './toast.svelte.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLElement> {
		/** The region's accessible name. */
		label?: string;
		/** Each close button's accessible name. */
		dismissLabel?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		label = 'Notifications',
		dismissLabel = 'Dismiss',
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
	let top = $derived(classes.includes(`${PREFIX}-top`));

	/** Runs a toast's countdown, paused while hovered or focused. */
	function countdown(node: HTMLElement, t: Toast) {
		if (!t.duration) return;
		let left = t.duration;
		let started = Date.now();
		let timer: ReturnType<typeof setTimeout> | undefined;
		let held = 0;
		const run = () => {
			started = Date.now();
			timer = setTimeout(() => dismissToast(t.id), left);
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
	<!-- `as never`: the store takes any colour name; a family that lacks one
		     simply draws the default alert, as a class it never ships does. -->
	{#each toasts as t (t.id)}
		<div use:countdown={t} animate:flip={{ duration: 180 }} in:fly={{ y: top ? -16 : 16, duration: 180 }} out:fly={{ x: 24, duration: 160 }}>
			{#snippet action()}
				<Button
					size="sm"
					onclick={() => {
						t.action?.onClick();
						dismissToast(t.id);
					}}>{t.action?.label}</Button
				>
			{/snippet}
			<Alert color={t.color as never} title={t.title} dismissible {dismissLabel} onDismiss={() => dismissToast(t.id)} actions={t.action ? action : undefined}>
				{t.message}
			</Alert>
		</div>
	{/each}
</section>
