<script module lang="ts">
	/** What .calendar is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs).

	    `.calendar` is the only class we own. The calendar inside is drawn by
	    air-datepicker (vendored, src/lib/vendor/air-datepicker), whose class
	    names — `.air-datepicker-cell`, `.-selected-`… — are its own: a family
	    styles them from under `.calendar`, it does not own them. */
	export const PREFIX = 'calendar';

	export const AXES = {
		/* The selected day and the range. */
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * A date picker, drawn by air-datepicker (https://air-datepicker.com).
	 *
	 * Inline by default: the calendar sits in the page. With `inline={false}`
	 * it is a field (`.input`) that opens the calendar under it; the calendar
	 * is then appended to this component's own `.calendar` element rather
	 * than to <body>, so it stays under the class every family styles.
	 *
	 * `value` is a Date (or null) — an array of Dates with `range` or
	 * `multiple`. Anything air-datepicker can do that has no prop here goes
	 * through `options`, applied last.
	 */
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import AirDatepicker from '../vendor/air-datepicker/index.js';
	import type {
		AirDatepickerLocale,
		AirDatepickerOptions,
		AirDatepickerViews,
		AirDatepickerViewsSingle,
		AirDatepickerButtonPresets
	} from '../vendor/air-datepicker/index.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	type Value = Date | Date[] | null;

	// `color` is ours — the HTML attribute of the same name is long obsolete.
	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS>,
			Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onchange'> {
		/** The picked date, or dates with `range` / `multiple`. Bindable. */
		value?: Value;
		/** Pick a start and an end. */
		range?: boolean;
		/** Pick several dates — at most this many when a number. */
		multiple?: boolean | number;
		/** In the page (default), or as a field that opens it. */
		inline?: boolean;
		/** The field's placeholder and name, when not inline. */
		placeholder?: string;
		name?: string;
		/** The field cannot be opened, when not inline. */
		disabled?: boolean;
		/** Bounds: dates outside cannot be picked. */
		min?: Date;
		max?: Date;
		/** Month and day names. English unless given (see vendor/air-datepicker/locale). */
		locale?: AirDatepickerLocale;
		/** First day of the week: 0 Sunday … 6 Saturday. Defaults to the locale's. */
		firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
		/** The view it opens on, and the finest one a pick can be made in. */
		view?: AirDatepickerViews;
		minView?: AirDatepickerViews;
		/** Hours and minutes too. */
		timepicker?: boolean;
		/** Buttons under the calendar. */
		buttons?: AirDatepickerButtonPresets[];
		/** How a date is written in the field (air-datepicker tokens). */
		dateFormat?: string;
		/** Anything else air-datepicker accepts. Applied last. */
		options?: AirDatepickerOptions<HTMLElement>;
		/** Called with the new value after every pick. */
		onchange?: (value: Value) => void;
		/** The air-datepicker instance, for what no prop covers. Bindable. */
		picker?: AirDatepicker<HTMLElement>;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		value = $bindable(null),
		range = false,
		multiple = false,
		inline = true,
		placeholder,
		name,
		disabled = false,
		min,
		max,
		locale,
		firstDay,
		view = 'days',
		minView = 'days',
		timepicker = false,
		buttons,
		dateFormat,
		options,
		onchange,
		picker = $bindable(),
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let host: HTMLDivElement | undefined = $state();
	let field: HTMLInputElement | undefined = $state();

	const asList = (v: Value): Date[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
	const same = (a: Date[], b: Date[]) =>
		a.length === b.length && a.every((d, i) => d.getTime() === b[i].getTime());

	/** Everything air-datepicker is told, but the dates and the callback. */
	let settings = $derived<AirDatepickerOptions<HTMLElement>>({
		range,
		multipleDates: multiple,
		minDate: min,
		maxDate: max,
		...(locale ? { locale } : {}),
		...(firstDay !== undefined ? { firstDay } : {}),
		view,
		minView,
		timepicker,
		...(buttons ? { buttons } : {}),
		...(dateFormat ? { dateFormat } : {}),
		// A popup closes on a pick when one date is all there is to pick.
		autoClose: !range && !multiple && !timepicker,
		position: 'bottom left',
		...options
	});

	function picked({ date }: { date: Date | Date[] }) {
		const next: Value = range || multiple ? asList(date as Value) : ((date as Date | undefined) ?? null);
		if (same(asList(next), asList(value))) return;
		value = next;
		onchange?.(next);
	}

	// One instance per element: built when the element is there, rebuilt only
	// when switching between inline and field.
	$effect(() => {
		const el = inline ? host : field;
		if (!el || !host) return;
		const instance = new AirDatepicker<HTMLElement>(el, {
			...untrack(() => settings),
			inline,
			// The popup is placed against, and appended to, our own element.
			container: inline ? undefined : host,
			selectedDates: untrack(() => asList(value)),
			onSelect: picked
		});
		picker = instance;
		return () => {
			instance.destroy();
			picker = undefined;
		};
	});

	// Settings changed: the instance takes them as they are.
	$effect(() => {
		const next = settings;
		untrack(() => picker?.update(next, { silent: true }));
	});

	// The value changed from outside: select it, without echoing it back.
	$effect(() => {
		const wanted = asList(value);
		untrack(() => {
			if (!picker || same(wanted, picker.selectedDates)) return;
			picker.clear({ silent: true });
			if (wanted.length) picker.selectDate(wanted, { silent: true });
		});
	});
</script>

<div {...applied.rest} bind:this={host} class={classes}>
	{#if !inline}
		<input bind:this={field} class="input" {placeholder} {name} {disabled} readonly />
	{/if}
</div>
