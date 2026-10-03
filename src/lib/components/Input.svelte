<script module lang="ts">
	/** What .input is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'input';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		variant: ['ghost']
	} as const;

	export const FLAGS = {
		nospinner: 'Hide the step arrows of a number field.'
	} as const;
	export const PARTS = [] as const;

	/** Everything about suggestions that does not depend on where they come from. */
	type SuggestCommon = {
		/** Reshape what the source answered into the list (e.g. `(r) => r.items`). */
		then?: (answer: any) => any[];
		/** The text a suggestion stands for: in the list, and in the field once picked. */
		show?: (suggestion: any) => string;
		/** Milliseconds without typing before the source is asked. Default 100. */
		wait?: number;
		/**
		 * Only a picked suggestion is a value. The field then shows two things
		 * over time: the search being typed, and the label of the pick. Typing
		 * drops the pick; leaving a search unfinished brings the last pick back.
		 */
		strict?: boolean;
		/** Open the list as soon as the field takes the focus. */
		eager?: boolean;
		/**
		 * Draw the list over scrolling ancestors instead of inside them, at
		 * fixed coordinates that follow the field. For a field in a table cell
		 * or a scrolling panel, whose list would otherwise be clipped.
		 */
		float?: boolean;
		/** A last row, "create what is being typed", once something is typed. */
		add?: {
			/** Its text. Defaults to `+ Create <value>`. */
			show?: (value: string) => string;
			/** Only offered while the list holds fewer than this many suggestions. */
			max?: number;
			onadd: (value: string) => void;
		};
	};

	/** Where suggestions come from: a function, or an address that answers JSON. */
	export type Suggest = SuggestCommon &
		(
			| { items: (value: string) => any[] | Promise<any[]> }
			| {
					uri: string | ((value: string) => string);
					options?: RequestInit | ((value: string) => RequestInit);
			  }
		);
</script>

<script lang="ts">
	/**
	 * A text field. Plain by default — one `<input class="input">` — and a
	 * frame around the field (`<label class="input">`) as soon as it needs one:
	 * something drawn before or after the text (`start`, `end`), or a list of
	 * suggestions.
	 *
	 * Validation stays the browser's: `required`, `pattern`, `min`… are plain
	 * attributes, and the message shown is the browser's own `validationMessage`,
	 * in the visitor's language. `error` forces one from outside.
	 */
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLInputAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	// `size` is ours — the HTML attribute of the same name is a character count
	// our CSS overrides anyway.
	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLInputAttributes, 'size' | 'color'> {
		/**
		 * Colour the field by its own validity and reveal `hint` once the
		 * browser marks it invalid. The CSS drives this off `:user-invalid`,
		 * so it only fires after the visitor has actually had a go.
		 */
		validator?: boolean;
		/**
		 * Shown under the field when it is invalid. It has to be the field's
		 * next sibling for the CSS to reach it, which is the whole reason this
		 * is a prop and not something you write yourself. Without it, the
		 * message is the browser's own.
		 */
		hint?: Snippet;
		/**
		 * An error from outside (the server said no): marks the field invalid and
		 * shows this, for as long as it is given. The parent owns it — it knows
		 * the value and is the one able to test it — so the field never clears it.
		 */
		error?: string | null;
		/** The message of the last check, `false` when the field passed. Bindable. */
		invalid?: string | false;
		/** Drawn inside the frame, before the text: an icon, a label, a unit. */
		start?: Snippet;
		/** Drawn inside the frame, after the text. */
		end?: Snippet;
		/** The field grows with its text. A number adds that many characters of room. */
		autowidth?: boolean | number;
		/** Turns on suggestions. See the `Suggest` type. */
		suggest?: Suggest;
		/** The pick the field starts with (`suggest.strict`). Read only: changes go through `onselect`. */
		selected?: any;
		/** A suggestion was picked — or, in strict mode, the pick was dropped by typing (`undefined`). */
		onselect?: (selected: any) => void;
		/** How one suggestion is drawn in the list. Defaults to its `show` text. */
		suggestion?: Snippet<[any]>;
		/** What the list says when nothing matches. */
		noresult?: string;
		/** The `<input>` itself. Bindable. */
		element?: HTMLInputElement;
		class?: string;
		value?: any;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		validator = false,
		hint,
		error = null,
		invalid = $bindable(false),
		start,
		end,
		autowidth = false,
		suggest,
		selected,
		onselect,
		suggestion,
		noresult = 'No results',
		element = $bindable(),
		value = $bindable(''),
		class: klass = '',
		disabled = false,
		autocomplete,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));

	const uid = $props.id();

	/* ── Validity ─────────────────────────────────────────────────────── */

	/** What is shown under the field. A disabled field shows nothing. */
	let message = $derived(disabled ? '' : error || (typeof invalid === 'string' ? invalid : ''));

	let classes = $derived(
		cx(PREFIX, applied.classes, (validator || !!message) && 'validator', klass)
	);

	/** Check the field now and show the browser's message if it fails. */
	export function isValid(): boolean {
		if (!element || disabled) return !error;
		invalid = element.validity.valid ? false : element.validationMessage;
		return !error && !invalid;
	}

	export function focus() {
		element?.focus();
	}

	/** Empty the field, and drop the pick in strict mode. */
	export function clear() {
		query = undefined;
		lastPicked = undefined;
		if (picked != null) pick(undefined);
		value = '';
	}

	/* ── Width ────────────────────────────────────────────────────────── */

	let width = $derived(
		autowidth
			? `${Math.max(`${value ?? ''}`.length, 5) + (typeof autowidth === 'number' ? autowidth : 0) + 2}ch`
			: undefined
	);

	/* ── Suggestions ──────────────────────────────────────────────────── */

	let open = $state(false);
	let loading = $state(false);
	let items: any[] = $state([]);
	/** Keyboard position in the list; -1 is the field itself. */
	let active = $state(-1);
	let timer: ReturnType<typeof setTimeout> | undefined;
	/** Answers can arrive out of order: only the latest request may write. */
	let ticket = 0;

	let strict = $derived(!!suggest?.strict);
	/** The search being typed, in strict mode. `undefined` when not searching. */
	let query: string | undefined = $state();
	/** The pick: follows `selected`, overridden by what the visitor picks. */
	let picked = $derived(selected);
	/** The last pick, for a search left unfinished to fall back to. */
	let lastPicked: any = $state();

	$effect(() => {
		if (picked != null) lastPicked = picked;
	});

	// Not searching: a strict field shows the label of its pick.
	$effect(() => {
		if (strict && query === undefined) value = label(picked) ?? '';
	});

	/** The text a suggestion stands for. */
	function label(s: any): string | undefined {
		if (s == null) return undefined;
		if (suggest?.show) return suggest.show(s);
		return typeof s === 'object' ? undefined : `${s}`;
	}

	function pick(s: any) {
		picked = s;
		onselect?.(s);
	}

	/** What "+ Create …" would create: the text as typed. */
	let typed = $derived(`${value ?? ''}`.trim());

	let addLabel = $derived(
		suggest?.add && typed !== '' && (suggest.add.max === undefined || items.length < suggest.add.max)
			? (suggest.add.show?.(typed) ?? `+ Create ${typed}`)
			: undefined
	);

	/** Rows the keyboard walks through: the suggestions, then the add row. */
	let rows = $derived(items.length + (addLabel ? 1 : 0));

	async function search() {
		if (!suggest) return;
		const mine = ++ticket;
		open = true;
		loading = true;
		const text = `${value ?? ''}`;

		let answer: any = [];
		try {
			if ('items' in suggest) answer = await suggest.items(text);
			else {
				const uri = typeof suggest.uri === 'function' ? suggest.uri(text) : suggest.uri;
				const options = typeof suggest.options === 'function' ? suggest.options(text) : suggest.options;
				const res = await fetch(uri, options ?? { credentials: 'include', headers: { Accept: 'application/json' } });
				answer = res.ok ? await res.json() : [];
			}
		} catch {
			answer = [];
		}

		if (mine !== ticket) return;
		const list = suggest.then ? suggest.then(answer) : answer;
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

	function choose(s: any) {
		query = undefined;
		pick(s);
		if (!strict) value = label(s) ?? value;
		close();
	}

	function create() {
		const text = typed;
		close();
		suggest?.add?.onadd(text);
	}

	/* A list at fixed coordinates does not follow its field on its own:
	   anything that moves the field — an outer scroll, a resize — moves it. */
	let frame: HTMLLabelElement | undefined = $state();
	let floatStyle = $state('');

	function place() {
		if (!frame) return;
		const box = frame.getBoundingClientRect();
		floatStyle = `position: fixed; top: ${box.bottom + 4}px; left: ${box.left}px; min-width: ${box.width}px;`;
	}

	$effect(() => {
		if (!suggest?.float || !open || !frame) return;
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
		// A field shown invalid is re-checked as it is corrected.
		if (invalid) invalid = e.currentTarget.validity.valid ? false : e.currentTarget.validationMessage;

		if (suggest) {
			// Typing, pasting or an autofill: the text is a search again, and no
			// longer stands for the pick.
			if (strict) {
				query = `${value ?? ''}`;
				if (picked != null) pick(undefined);
			}
			clearTimeout(timer);
			timer = setTimeout(search, suggest.wait ?? 100);
		}
		oninput?.(e);
	}

	function handleFocus(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (suggest?.eager) search();
		onfocus?.(e);
	}

	function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		close();

		// Leaving a strict field on an unfinished search: the leftover text
		// stands for nothing, so the last pick comes back. An emptied field is
		// a deliberate reset and stays empty.
		if (strict && picked == null) {
			const searching = query !== undefined && query.trim() !== '';
			if (searching && lastPicked != null) pick(lastPicked);
			else if (!searching) lastPicked = undefined;
			query = undefined;
			value = label(picked) ?? '';
		}

		if (validator) isValid();
		onblur?.(e);
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (suggest) {
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
		onkeydown?.(e);
	}

	/* Password managers fill a field without going through the list, which
	   would leave a value with no pick: keep them away from a suggest field. */
	let noAutofill = $derived(!!suggest && !autocomplete);

	let framed = $derived(!!(start || end || suggest));
</script>

{#snippet field(cls: ClassValue | undefined, style: string | undefined)}
	<!-- Ours first: what the caller writes in the spread still wins. -->
	<input
		aria-invalid={message ? 'true' : undefined}
		role={suggest ? 'combobox' : undefined}
		{...applied.rest}
		bind:this={element}
		bind:value
		class={cls}
		style:width={style}
		{disabled}
		autocomplete={noAutofill ? 'off' : autocomplete}
		data-1p-ignore={noAutofill ? '' : undefined}
		data-lpignore={noAutofill ? 'true' : undefined}
		data-bwignore={noAutofill ? 'true' : undefined}
		data-form-type={noAutofill ? 'other' : undefined}
		aria-autocomplete={suggest ? 'list' : undefined}
		aria-expanded={suggest ? open : undefined}
		aria-controls={suggest ? `${uid}-list` : undefined}
		aria-activedescendant={suggest && open && active >= 0 ? `${uid}-${active}` : undefined}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
	/>
{/snippet}

{#if framed}
	<label bind:this={frame} class={classes} style:width>
		{@render start?.()}
		{@render field(undefined, undefined)}
		{@render end?.()}

		{#if suggest && open}
			<!-- A row is picked on mousedown, before the field can lose the focus:
			     a blur first would close the list and, in strict mode, undo the
			     pick. The keyboard goes through the field (aria-activedescendant). -->
			<ul
				id="{uid}-list"
				class="list list-suggestions"
				role="listbox"
				style={suggest.float ? floatStyle : undefined}
			>
				{#if loading}
					<li class="list-row"><span class="loading loading-dots loading-sm"></span></li>
				{:else}
					{#each items as s, i (i)}
						<li
							id="{uid}-{i}"
							class="list-row"
							role="option"
							aria-selected={active === i}
							onmousedown={(e) => {
								e.preventDefault();
								choose(s);
							}}
						>
							{#if suggestion}{@render suggestion(s)}{:else}{label(s) ?? s}{/if}
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
{:else}
	{@render field(classes, width)}
{/if}
<!-- An error from outside first, then the caller's hint, then the browser's
     own message. -->
{#if error && !disabled}
	<p class="validator-hint">{error}</p>
{:else if hint}
	<p class="validator-hint">{@render hint()}</p>
{:else if message}
	<p class="validator-hint">{message}</p>
{/if}
