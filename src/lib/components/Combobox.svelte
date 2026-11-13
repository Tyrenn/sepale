<script module lang="ts">
	/** What .combobox is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    `.combobox-multiple` is a PART: the wrapper writes it from `multiple`. */
	export const PREFIX = 'combobox';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['option', 'multiple'] as const;

	/** Where the options come from: a list, a function, or an address answering JSON. */
	export type ComboboxSource =
		| any[]
		| ((query: string) => any[] | Promise<any[]>)
		| string
		| { uri: string | ((query: string) => string); options?: RequestInit | ((query: string) => RequestInit) };
</script>

<script lang="ts">
	/**
	 * A field whose value is looked up in a list of options while typing.
	 *
	 * **Strict** (default): the value is a picked option, never the typed
	 * text. A hidden `<select name>` carries it for a form, so the DOM says what
	 * was chosen. The field shows two things over time: the search being typed,
	 * and the label of the pick. Typing drops the pick; leaving a search
	 * unfinished brings the last pick back.
	 *
	 * **Free** (`strict={false}`): the value is the text — the options only
	 * complete it (autocompletion). The `<input>` itself carries `name`.
	 *
	 * **Multiple** (implies strict): the field shows a summary of the picks,
	 * the list stays open while ticking, and a hidden `<select multiple>`
	 * carries them. To collect free values as chips, see ChipsInput.
	 *
	 * Options come from a list (filtered here), a function of the query, or an
	 * address answering JSON (`then` reshapes the answer). The frame is the
	 * family's `.input`, the list its `.list-suggestions`.
	 */
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLInputAttributes, 'size' | 'value'> {
		/** The options, or where to fetch them. */
		options: ComboboxSource;
		/** Reshape what a function or an address answered into the list. */
		then?: (answer: any) => any[];
		/** The text an option stands for: in the list, and in the field once picked. */
		show?: (option: any) => string;
		/** What identifies an option, and what the hidden select submits. Defaults to `id`, `value`, then the label. */
		key?: (option: any) => string | number;
		/** The value is a picked option (default), or the text (`false`). */
		strict?: boolean;
		/** Pick several. Implies strict. */
		multiple?: boolean;
		/** The pick(s) — the text, when not strict. Followed when changed from outside. */
		value?: any;
		/** A pick changed: the option, `undefined` when dropped, or the list with `multiple`. */
		onvalue?: (value: any) => void;
		/** The text changed, typed or completed. */
		onquery?: (text: string) => void;
		/** Milliseconds without typing before the source is asked. Default 100. */
		wait?: number;
		/** Open the list as soon as the field takes the focus. */
		eager?: boolean;
		/** Draw the list over scrolling ancestors, at fixed coordinates. */
		float?: boolean;
		/** A last row, "create what is being typed", once something is typed. */
		add?: { show?: (text: string) => string; max?: number; onadd: (text: string) => void };
		/** The field's text for several picks. Defaults to the labels joined, or "n selected". */
		summary?: (picks: any[]) => string;
		/** How one option is drawn in the list. Defaults to its label. */
		option?: Snippet<[any]>;
		/** Inside the frame, before and after the text. */
		start?: Snippet;
		end?: Snippet;
		/** What the list says when nothing matches. */
		noresult?: string;
		/** Extra classes on the `.input` frame: `input-ghost`, `input-primary`… */
		field?: string;
		/** Colour the field by its validity and reveal `hint` once the browser
		    marks it invalid. A strict field holding typed text but no pick is
		    invalid, with `unpickedLabel` as its message. */
		validator?: boolean;
		/** Shown under the field when it is invalid. */
		hint?: Snippet;
		/** The validity message of a strict field left with text but no pick. */
		unpickedLabel?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		options,
		then,
		show,
		key,
		strict: strictProp = true,
		multiple = false,
		value: initial,
		onvalue,
		onquery,
		wait = 100,
		eager = false,
		float = false,
		add,
		summary,
		option,
		start,
		end,
		noresult = 'No results',
		field = '',
		validator = false,
		hint,
		unpickedLabel = 'Pick an option from the list',
		name,
		disabled = false,
		class: klass = '',
		oninput,
		onfocus,
		onblur,
		onkeydown,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, multiple && `${PREFIX}-multiple`, klass));

	const uid = $props.id();
	let strict = $derived(strictProp || multiple);

	/* ── What an option is ────────────────────────────────────────────── */

	function label(o: any): string {
		if (o == null) return '';
		if (show) return show(o);
		if (typeof o !== 'object') return `${o}`;
		return `${o.label ?? o.name ?? o.value ?? o.id ?? ''}`;
	}
	function keyOf(o: any): string | number {
		if (key) return key(o);
		if (o !== null && typeof o === 'object') return o.id ?? o.value ?? label(o);
		return o;
	}

	/* ── State ────────────────────────────────────────────────────────── */

	/* Where it starts, read once: afterwards the visitor owns it. */
	const start0 = untrack(() => initial);
	const many = untrack(() => multiple);
	const picks = untrack(() => strictProp || multiple);
	/** The text in the field. */
	let text = $state(picks ? (many ? '' : label(start0)) : `${start0 ?? ''}`);
	/** The pick (single), or the picks (multiple). */
	let picked: any = $state(many ? (Array.isArray(start0) ? [...start0] : []) : picks ? start0 : undefined);
	/** The search being typed, in strict mode. `undefined` when not searching. */
	let query: string | undefined = $state();
	/** The last pick, for a search left unfinished to fall back to. */
	let lastPicked: any = $state(start0);

	let open = $state(false);
	let loading = $state(false);
	let items: any[] = $state([]);
	/** Keyboard position in the list; -1 is the field itself. */
	let active = $state(-1);
	let timer: ReturnType<typeof setTimeout> | undefined;
	/** Answers can arrive out of order: only the latest request may write. */
	let ticket = 0;

	let input: HTMLInputElement | undefined = $state();

	/* A `value` changed from outside (a form reset, another field) replaces
	   the pick(s). A value echoing the current pick changes nothing, so a
	   parent writing back what `onvalue` gave it does not disturb a search. */
	const same = (a: any, b: any) => (a == null || b == null ? a == b : keyOf(a) === keyOf(b));
	$effect(() => {
		const next = initial;
		untrack(() => {
			if (many) {
				const list = Array.isArray(next) ? next : [];
				const now = picked as any[];
				if (list.length === now.length && list.every((o, i) => same(o, now[i]))) return;
				picked = [...list];
			} else if (picks) {
				if (same(next, picked)) return;
				picked = next;
				lastPicked = next;
				query = undefined;
			} else if (`${next ?? ''}` !== text) text = `${next ?? ''}`;
		});
	});

	/* A strict field's text is only a search: left with text but no pick, it
	   holds nothing, and says so to the form (an empty one is `required`'s). */
	$effect(() => {
		input?.setCustomValidity(strict && !multiple && picked == null && shown.trim() !== '' ? unpickedLabel : '');
	});

	const isPicked = (o: any) =>
		multiple ? (picked as any[]).some((p) => keyOf(p) === keyOf(o)) : picked != null && keyOf(picked) === keyOf(o);

	function summarize(list: any[]): string {
		if (summary) return summary(list);
		if (!list.length) return '';
		const joined = list.map(label).join(', ');
		return joined.length <= 32 ? joined : `${list.length} selected`;
	}

	/* Not searching: a strict field shows its pick, a multiple one its summary. */
	let shown = $derived(
		!strict ? text : query !== undefined ? query : multiple ? summarize(picked) : label(picked)
	);

	/* ── The source ───────────────────────────────────────────────────── */

	async function search() {
		const mine = ++ticket;
		open = true;
		loading = true;
		const q = strict ? (query ?? '') : text;

		let answer: any = [];
		try {
			if (Array.isArray(options)) {
				const needle = q.trim().toLowerCase();
				answer = needle ? options.filter((o) => label(o).toLowerCase().includes(needle)) : options;
			} else if (typeof options === 'function') answer = await options(q);
			else {
				const src = typeof options === 'string' ? { uri: options } : options;
				const uri = typeof src.uri === 'function' ? src.uri(q) : src.uri;
				const init = typeof src.options === 'function' ? src.options(q) : src.options;
				const res = await fetch(uri, init ?? { credentials: 'include', headers: { Accept: 'application/json' } });
				answer = res.ok ? await res.json() : [];
			}
		} catch {
			answer = [];
		}

		if (mine !== ticket) return;
		const list = then && !Array.isArray(options) ? then(answer) : answer;
		// Never undefined: a source that answers nothing leaves an empty list.
		items = Array.isArray(list) ? list : [];
		active = -1;
		loading = false;
	}

	function close() {
		clearTimeout(timer);
		ticket++;
		open = false;
		loading = false;
		active = -1;
	}

	/* ── Picking ──────────────────────────────────────────────────────── */

	function choose(o: any) {
		if (multiple) {
			picked = isPicked(o) ? (picked as any[]).filter((p) => keyOf(p) !== keyOf(o)) : [...picked, o];
			onvalue?.(picked);
			return; // the list stays open while ticking
		}
		query = undefined;
		if (strict) {
			picked = o;
			lastPicked = o;
		} else {
			text = label(o);
			onquery?.(text);
		}
		onvalue?.(o);
		close();
	}

	/** What "+ Create …" would create: the text as typed. */
	let typed = $derived((strict ? (query ?? '') : text).trim());
	let addLabel = $derived(
		add && typed !== '' && (add.max === undefined || items.length < add.max)
			? (add.show?.(typed) ?? `+ Create ${typed}`)
			: undefined
	);
	/** Rows the keyboard walks through: the options, then the add row. */
	let rows = $derived(items.length + (addLabel ? 1 : 0));

	function create() {
		const t = typed;
		close();
		query = undefined;
		add?.onadd(t);
	}

	/** Empty the field and drop the pick(s). */
	export function clear() {
		query = undefined;
		text = '';
		lastPicked = undefined;
		if (multiple) {
			if ((picked as any[]).length) onvalue?.((picked = []));
		} else if (strict && picked != null) onvalue?.((picked = undefined));
	}

	export function focus() {
		input?.focus();
	}

	/* ── A list at fixed coordinates follows its field ────────────────── */

	let frame: HTMLLabelElement | undefined = $state();
	let floatStyle = $state('');

	function place() {
		if (!frame) return;
		const box = frame.getBoundingClientRect();
		floatStyle = `position: fixed; top: ${box.bottom + 4}px; left: ${box.left}px; min-width: ${box.width}px;`;
	}

	$effect(() => {
		if (!float || !open || !frame) return;
		place();
		// Capture: the scroll of an inner container does not bubble.
		window.addEventListener('scroll', place, true);
		window.addEventListener('resize', place);
		return () => {
			window.removeEventListener('scroll', place, true);
			window.removeEventListener('resize', place);
		};
	});

	/* ── Events ───────────────────────────────────────────────────────── */

	function handleInput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(e);
		const t = e.currentTarget.value;
		if (strict) {
			// Typing, pasting or an autofill: the text is a search again, and no
			// longer stands for the pick.
			query = t;
			if (!multiple && picked != null) onvalue?.((picked = undefined));
		} else {
			text = t;
			onquery?.(t);
		}
		clearTimeout(timer);
		timer = setTimeout(search, wait);
	}

	/* The caller's own focus, blur and keydown run after ours: a key the list
	   used (an arrow moving in it, Enter picking) reaches them prevented. */
	function handleFocus(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		// A multiple field shows its summary at rest, and an empty search when in use.
		if (multiple) query = '';
		if (eager) search();
		onfocus?.(e);
	}

	function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		blurred();
		onblur?.(e);
	}

	function blurred() {
		close();
		if (multiple) {
			query = undefined;
			return;
		}
		// Leaving a strict field on an unfinished search: the leftover text
		// stands for nothing, so the last pick comes back. An emptied field is
		// a deliberate reset and stays empty.
		if (strict && picked == null) {
			const searching = query !== undefined && query.trim() !== '';
			if (searching && lastPicked != null) onvalue?.((picked = lastPicked));
			else if (!searching) lastPicked = undefined;
		}
		query = undefined;
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		listKeydown(e);
		onkeydown?.(e);
	}

	function listKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!open) search();
			else if (rows) active = (active + 1) % rows;
		} else if (e.key === 'ArrowUp' && open && rows) {
			e.preventDefault();
			active = active <= 0 ? rows - 1 : active - 1;
		} else if (e.key === 'Enter' && open && active >= 0) {
			e.preventDefault();
			if (active < items.length) choose(items[active]);
			else create();
		} else if (e.key === 'Escape' && open) {
			e.preventDefault();
			close();
		}
	}
</script>

<div class={classes}>
	<label bind:this={frame} class={cx('input', field, validator && 'validator')}>
		{@render start?.()}
		<!-- Password managers fill a field without going through the list,
		     which would leave a value with no pick: keep them away. -->
		<input
			{...applied.rest}
			bind:this={input}
			type="text"
			role="combobox"
			name={strict ? undefined : name}
			value={shown}
			{disabled}
			autocomplete="off"
			data-1p-ignore
			data-lpignore="true"
			data-bwignore="true"
			data-form-type="other"
			aria-autocomplete="list"
			aria-expanded={open}
			aria-controls="{uid}-list"
			aria-activedescendant={open && active >= 0 ? `${uid}-${active}` : undefined}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
			onkeydown={handleKeydown}
		/>
		{@render end?.()}

		{#if open}
			<!-- A row is picked on mousedown, before the field can lose the focus:
			     a blur first would close the list and, in strict mode, undo the
			     pick. The keyboard goes through the field (aria-activedescendant). -->
			<ul
				id="{uid}-list"
				class="list list-suggestions"
				role="listbox"
				aria-multiselectable={multiple || undefined}
				style={float ? floatStyle : undefined}
			>
				{#if loading}
					<li class="list-row"><span class="loading loading-dots loading-sm"></span></li>
				{:else}
					{#each items as o, i (i)}
						<li
							id="{uid}-{i}"
							class="list-row combobox-option"
							role="option"
							aria-selected={multiple ? isPicked(o) : active === i}
							data-active={multiple && active === i ? '' : undefined}
							onmousedown={(e) => {
								e.preventDefault();
								choose(o);
							}}
						>
							{#if option}{@render option(o)}{:else}{label(o)}{/if}
						</li>
					{/each}

					{#if addLabel}
						<!-- Always last: the way out when nothing in the list fits. -->
						<li
							id="{uid}-{items.length}"
							class="list-row"
							role="option"
							aria-selected={active === items.length}
							onmousedown={(e) => {
								e.preventDefault();
								create();
							}}
						>
							{addLabel}
						</li>
					{:else if items.length === 0}
						<li class="list-row" role="option" aria-selected="false" aria-disabled="true">{noresult}</li>
					{/if}
				{/if}
			</ul>
		{/if}
	</label>
	{#if hint}<p class="validator-hint">{@render hint()}</p>{/if}

	{#if strict}
		<!-- What was chosen, for a form and for whoever reads the DOM. -->
		<select {name} {disabled} multiple={multiple || undefined} hidden aria-hidden="true" tabindex="-1">
			{#each multiple ? picked : picked != null ? [picked] : [] as p (keyOf(p))}
				<option value={keyOf(p)} selected>{label(p)}</option>
			{/each}
		</select>
	{/if}
</div>
