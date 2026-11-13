<script module lang="ts">
	/** What .rating is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'rating';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		readonly: 'Show the score; no picking.'
	} as const;
	export const PARTS = ['item'] as const;
</script>

<script lang="ts">
	/**
	 * A whole-number score picked from a row of icons — real radios, so it
	 * submits with a form and the arrow keys move along it.
	 *
	 * The icon is a CSS mask, a star by default; `mask` takes another
	 * (`url(heart.svg)`). `value` is bindable: it is the field's own value.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
		/** The score, 0 for none. Bindable. */
		value?: number;
		/** How many icons. */
		max?: number;
		/** The radios' name, for a form. */
		name?: string;
		/** Another icon, as a CSS image: `url(…)`. */
		mask?: string;
		disabled?: boolean;
		/** The group's accessible name. */
		label?: string;
		/** One item's accessible name. */
		itemLabel?: (n: number) => string;
		/** After the user picked a score. */
		onvalue?: (value: number) => void;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		value = $bindable(),
		max = 5,
		name = `rating-${Math.random().toString(36).slice(2, 9)}`,
		mask,
		disabled = false,
		label = 'Rating',
		itemLabel = (n: number) => `${n} / ${max}`,
		onvalue,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
	/* Read back from the classes, the one place the axes are resolved. */
	let locked = $derived(classes.includes(`${PREFIX}-readonly`));
</script>

<div
	{...applied.rest}
	class={classes}
	role="radiogroup"
	aria-label={label}
	style={mask ? `--rating-mask: ${mask};` : undefined}
>
	{#each { length: max }, i (i)}
		<input
			type="radio"
			class="rating-item"
			{name}
			value={i + 1}
			aria-label={itemLabel(i + 1)}
			checked={value === i + 1}
			disabled={disabled || locked}
			onchange={() => {
				value = i + 1;
				onvalue?.(value);
			}}
		/>
	{/each}
</div>
