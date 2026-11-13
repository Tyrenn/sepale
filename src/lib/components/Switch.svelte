<script module lang="ts">
	/** What .switch is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'switch';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		block: 'Fill the width, the items sharing it equally.'
	} as const;
	export const PARTS = ['item', 'input', 'indicator'] as const;
</script>

<script lang="ts">
	/**
	 * One choice among a few, as a pill track: a radio group in disguise.
	 *
	 * `options` are strings, or `{ value, label, disabled }`. `value` is
	 * bindable — it is the field's own value.
	 *
	 * An indicator slides from the old choice to the new one (`animated`,
	 * off when the visitor asks for reduced motion).
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	type Option = string | { value: string; label?: string; disabled?: boolean };

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
		options: Option[];
		/** The checked option's value. Bindable. */
		value?: string;
		/** The radios' name, for a form. */
		name?: string;
		/** The group's accessible name. */
		label?: string;
		/** After the user picked another option. */
		onvalue?: (value: string) => void;
		/** Slide the checked look from one option to the next. */
		animated?: boolean;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		options,
		value = $bindable(),
		name = `switch-${Math.random().toString(36).slice(2, 9)}`,
		label,
		onvalue,
		animated = true,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let list = $derived(options.map((o) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { label: o.value, disabled: false, ...o })));

	let root: HTMLDivElement | undefined = $state();
	let x = $state(0);
	let w = $state(0);

	/* The indicator follows the checked item: measured after every change of
	   value, and again whenever the track resizes (a font, a wrap). */
	$effect(() => {
		if (!animated || !root) return;
		void value;
		const measure = () => {
			const item = root?.querySelector<HTMLElement>(`.${PREFIX}-item:has(:checked)`);
			x = item?.offsetLeft ?? 0;
			w = item?.offsetWidth ?? 0;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	});
</script>

<div {...applied.rest} bind:this={root} class={classes} role="radiogroup" aria-label={label} style:--switch-x="{x}px" style:--switch-w="{w}px">
	{#if animated}<span class="{PREFIX}-indicator" aria-hidden="true"></span>{/if}
	{#each list as o (o.value)}
		<label class="switch-item">
			<input
				type="radio"
				class="switch-input"
				{name}
				value={o.value}
				checked={value === o.value}
				disabled={o.disabled}
				onchange={() => {
					value = o.value;
					onvalue?.(o.value);
				}}
			/>
			{o.label}
		</label>
	{/each}
</div>
