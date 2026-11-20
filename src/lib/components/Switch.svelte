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
	 * `option` draws what an item shows (an icon, an icon and its text…)
	 * in place of its label; the label stays its accessible name.
	 *
	 * An indicator slides from the old choice to the new one (`animated`,
	 * off when the visitor asks for reduced motion).
	 */
	import type { Snippet } from 'svelte';
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
		/** What an item shows in place of its label, given the option and whether it is checked. */
		option?: Snippet<[{ value: string; label: string; disabled: boolean; checked: boolean }]>;
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
		option,
		onvalue,
		animated = true,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let list = $derived(options.map((o) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { label: o.value, disabled: false, ...o })));

	let root: HTMLDivElement | undefined = $state();
	let indicator: HTMLSpanElement | undefined = $state();
	/* The item the indicator stands under, from one value to the next. */
	let shown: HTMLElement | undefined;

	/* The indicator follows the checked item: placed after every change of
	   value, and again whenever the track resizes (a font, a wrap). How it
	   travels is the family's: the component only writes where it stands. */
	$effect(() => {
		if (!animated || !root || !indicator) return;
		const track = root;
		const mark = indicator;
		void value;
		const target = track.querySelector<HTMLElement>(`.${PREFIX}-item:has(:checked)`) ?? undefined;

		/* Read off the layout as it is now, to the subpixel, from the track's
		   padding box: where the indicator, positioned in the track, is laid. */
		const place = (item: HTMLElement | undefined) => {
			const t = track.getBoundingClientRect();
			const b = item?.getBoundingClientRect();
			mark.style.setProperty('--switch-x', `${b ? b.left - t.left - track.clientLeft + track.scrollLeft : 0}px`);
			mark.style.setProperty('--switch-w', `${b ? b.width : 0}px`);
		};

		/* Placed without the family's transition, which then starts from there. */
		const snap = (item: HTMLElement | undefined) => {
			mark.style.transition = 'none';
			place(item);
			void mark.offsetWidth;
			mark.style.transition = '';
		};

		/* A new value may have moved the items: the indicator first stands
		   under the item it leaves, as that item is laid out now, and travels
		   from there. On mount, nothing to travel from: it appears in place. */
		const from = shown !== target && shown?.isConnected ? shown : undefined;
		if (from) {
			snap(from);
			place(target);
		} else snap(target);
		shown = target;

		const observer = new ResizeObserver(() => place(target));
		observer.observe(track);
		return () => observer.disconnect();
	});
</script>

<div {...applied.rest} bind:this={root} class={classes} role="radiogroup" aria-label={label}>
	{#if animated}<span bind:this={indicator} class="{PREFIX}-indicator" aria-hidden="true"></span>{/if}
	{#each list as o (o.value)}
		<label class="switch-item">
			<input
				type="radio"
				class="switch-input"
				{name}
				value={o.value}
				checked={value === o.value}
				disabled={o.disabled}
				aria-label={option ? o.label : undefined}
				onchange={() => {
					value = o.value;
					onvalue?.(o.value);
				}}
			/>
			{#if option}{@render option({ value: o.value, label: o.label ?? o.value, disabled: o.disabled ?? false, checked: value === o.value })}{:else}{o.label}{/if}
		</label>
	{/each}
</div>
