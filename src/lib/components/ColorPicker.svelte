<script module lang="ts">
	/** What .color-picker is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'color-picker';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		flat: 'No box of its own: the host — a dropdown, a card — draws it.'
	} as const;
	export const PARTS = ['head', 'preview', 'value', 'channel', 'track', 'presets'] as const;
</script>

<script lang="ts">
	/**
	 * One colour, edited in OKLCH: lightness, chroma, hue, each a slider
	 * whose track is the gradient it moves along, plus the raw value for
	 * anything the sliders cannot say (`color-mix(…)`, a `var()`).
	 *
	 * A panel, not a popover: put it in a Dropdown to float it.
	 *
	 * The three numbers are state, seeded from `value` and then only written:
	 * reading them back from the colour on every drag goes through a lossy
	 * conversion, and moving the hue would nudge the lightness.
	 */
	import type { HTMLAttributes } from 'svelte/elements';
	import { oklchToCss, toOklch, type Oklch } from './color.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, HTMLAttributes<HTMLDivElement> {
		/** Any CSS colour. Bindable; written back as `oklch(…)`. */
		value?: string;
		/** Colours one click away, drawn as swatches. */
		presets?: string[];
		/** Hide the raw value field. */
		noInput?: boolean;
		/** The channels' accessible names. */
		labels?: { l?: string; c?: string; h?: string; value?: string };
		/** After every change. */
		onvalue?: (value: string) => void;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		value = $bindable(),
		presets = [],
		noInput = false,
		labels = {},
		onvalue,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let lch = $state<Oklch>({ l: 0.62, c: 0.19, h: 260 });
	/** The colour shown: the starting one while none is given. */
	let color = $derived(value ?? 'oklch(62% 0.19 260)');
	/* The value this component last wrote: a different one came from outside. */
	let written = '';
	$effect.pre(() => {
		if (value != null && value !== written && typeof document !== 'undefined') lch = toOklch(value);
	});

	function emit(v: string) {
		written = v;
		value = v;
		onvalue?.(v);
	}
	function set(part: Partial<Oklch>) {
		lch = { ...lch, ...part };
		emit(oklchToCss(lch));
	}
	function pick(v: string) {
		lch = toOklch(v);
		emit(v);
	}

	const ramp = (vals: number[], key: 'l' | 'c' | 'h') =>
		`linear-gradient(to right, ${vals.map((v) => oklchToCss({ ...lch, [key]: v })).join(', ')})`;
	let channels = $derived([
		{ key: 'l' as const, short: 'L', name: labels.l ?? 'Lightness', min: 0, max: 1, step: 0.005, track: ramp([0, 0.25, 0.5, 0.75, 1], 'l'), shown: Math.round(lch.l * 100) },
		{ key: 'c' as const, short: 'C', name: labels.c ?? 'Chroma', min: 0, max: 0.37, step: 0.005, track: ramp([0, 0.1, 0.2, 0.3, 0.37], 'c'), shown: Math.round(lch.c * 100) / 100 },
		{ key: 'h' as const, short: 'H', name: labels.h ?? 'Hue', min: 0, max: 360, step: 1, track: ramp(Array.from({ length: 13 }, (_, i) => i * 30), 'h'), shown: Math.round(lch.h) }
	]);
</script>

<div {...applied.rest} class={classes} style:--color-picker-value={color}>
	<div class="{PREFIX}-head">
		<span class="{PREFIX}-preview"></span>
		{#if !noInput}
			<input
				class="input input-sm {PREFIX}-value"
				aria-label={labels.value ?? 'Value'}
				spellcheck="false"
				value={color}
				onchange={(e) => pick(e.currentTarget.value)}
			/>
		{/if}
	</div>
	{#each channels as ch (ch.key)}
		<label class="{PREFIX}-channel">
			<span title={ch.name}>{ch.short}</span>
			<input
				type="range"
				class="{PREFIX}-track"
				aria-label={ch.name}
				min={ch.min}
				max={ch.max}
				step={ch.step}
				value={lch[ch.key]}
				style:--color-picker-track={ch.track}
				oninput={(e) => set({ [ch.key]: Number(e.currentTarget.value) })}
			/>
			<output>{ch.shown}</output>
		</label>
	{/each}
	{#if presets.length}
		<div class="{PREFIX}-presets">
			{#each presets as p (p)}
				<button
					type="button"
					class={cx('swatch', 'swatch-sm', p === value && 'swatch-active')}
					style:--swatch-color={p}
					aria-label={p}
					title={p}
					onclick={() => pick(p)}
				></button>
			{/each}
		</div>
	{/if}
</div>
