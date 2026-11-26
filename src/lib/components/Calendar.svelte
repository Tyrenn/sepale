<script module lang="ts">
	/** What .calendar is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

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
	 * it is a read-only field (the family's Input) that opens it in a
	 * Dropdown: a popover, in the top layer, so no ancestor's `overflow`,
	 * `z-index` or `transform` crops, covers or moves it. The calendar is
	 * always air-datepicker's inline one, under `.calendar`.
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
	import en from '../vendor/air-datepicker/locale/en.js';
	import { applyAxes, cx, type AxisProps } from '../variants.js';
	import Input from './Input.svelte';
	import Dropdown from './Dropdown.svelte';

	type Value = Date | Date[] | null;

	// `color` is ours — the HTML attribute of the same name is long obsolete.
	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>,
			Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
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
		/** How a date is written in the field (air-datepicker tokens). The
		    locale's by default, its time format added with `timepicker`. */
		dateFormat?: string;
		/** Anything else air-datepicker accepts. Applied last. */
		options?: AirDatepickerOptions<HTMLElement>;
		/** Called with the new value after every pick. */
		onvalue?: (value: Value) => void;
		/** The air-datepicker instance, for what no prop covers. Bindable. */
		picker?: AirDatepicker<HTMLElement>;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		value = $bindable(),
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
		onvalue,
		picker = $bindable(),
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	let host: HTMLDivElement | undefined = $state();
	/** Not inline: whether the field's box is open. */
	let open = $state(false);

	const asList = (v: Value | undefined): Date[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
	const same = (a: Date[], b: Date[]) =>
		a.length === b.length && a.every((d, i) => d.getTime() === b[i]!.getTime());

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
		...options
	});

	function picked({ date }: { date: Date | Date[] }) {
		const next: Value = range || multiple ? asList(date as Value) : ((date as Date | undefined) ?? null);
		if (same(asList(next), asList(value))) return;
		value = next;
		onvalue?.(next);
		/* The field's box closes once there is nothing left to pick. */
		if (!inline && !multiple && !timepicker && (!range || asList(next).length === 2)) open = false;
	}

	/* The field's text, written as air-datepicker writes dates: its
	   formatDate reads nothing but the locale. */
	let text = $derived.by(() => {
		const lang = { ...en, ...locale };
		const pattern = dateFormat ?? (timepicker ? `${lang.dateFormat} ${lang.timeFormat}` : lang.dateFormat);
		const write = (d: Date) => (AirDatepicker.prototype.formatDate as (this: unknown, d: Date, f: string) => string).call({ locale: lang }, d, pattern);
		return asList(value).map(write).join(range ? ' – ' : ', ');
	});

	// One instance per element: built when it is there — not inline, each
	// time the box opens.
	$effect(() => {
		if (!host) return;
		const instance = new AirDatepicker<HTMLElement>(host, {
			...untrack(() => settings),
			inline: true,
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

{#if inline}
	<div {...applied.rest} bind:this={host} class={classes}></div>
{:else}
	<Dropdown bind:open>
		{#snippet trigger({ props })}
			<Input {...props} {placeholder} {disabled} value={text} readonly />
		{/snippet}
		<div {...applied.rest} bind:this={host} class={classes}></div>
	</Dropdown>
	<!-- The value for a form, as the field shows it -->
	{#if name}
		<input type="hidden" {name} value={text} />
	{/if}
{/if}
