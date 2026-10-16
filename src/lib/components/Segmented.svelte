<script module lang="ts">
	/** What .segmented is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'segmented';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		block: 'Fill the width, the items sharing it equally.'
	} as const;
	export const PARTS = ['item', 'input'] as const;
</script>

<script lang="ts">
	/**
	 * One choice among a few, as a pill track: a radio group in disguise.
	 *
	 * `options` are strings, or `{ value, label, disabled }`. `value` is
	 * bindable — it is the field's own value.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	type Option = string | { value: string; label?: string; disabled?: boolean };

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onchange'> {
		options: Option[];
		/** The checked option's value. Bindable. */
		value?: string;
		/** The radios' name, for a form. */
		name?: string;
		/** The group's accessible name. */
		label?: string;
		/** After the user picked another option. */
		onChange?: (value: string) => void;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		options,
		value = $bindable(),
		name = `segmented-${Math.random().toString(36).slice(2, 9)}`,
		label,
		onChange,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let list = $derived(options.map((o) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { label: o.value, disabled: false, ...o })));
</script>

<div {...applied.rest} class={classes} role="radiogroup" aria-label={label}>
	{#each list as o (o.value)}
		<label class="segmented-item">
			<input
				type="radio"
				class="segmented-input"
				{name}
				value={o.value}
				checked={value === o.value}
				disabled={o.disabled}
				onchange={() => {
					value = o.value;
					onChange?.(o.value);
				}}
			/>
			{o.label}
		</label>
	{/each}
</div>
