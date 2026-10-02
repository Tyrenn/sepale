<script lang="ts">
	import Icon from '../icon/Icon.svelte';
	import DotLoader from '../loaders/DotLoader.svelte';
	import { onMount, type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { clickInside } from '../../scripts/actions/clickinside.js';
	import { clickOutside } from '../../scripts/actions/clickoutside.js';
	import type { RemoteQueryFunction } from '@sveltejs/kit';

	//Hack to avoid undefined error in dev
	// if(Icon && false)
	// 	console.log(clickInside, clickOutside);

	/**
	 * Everything that does not depend on where the suggestions come from.
	 */
	type SuggestCommon = {
		then? : (fetchres : any) => any[],
		show? : (suggestion : any) => string,
		wait? : number, // Time without input to wait before fetching suggestions (in ms)
		strict? : boolean, // Only a picked suggestion is a valid value (see `selected`)

		/**
		 * Opens the list as soon as the field takes the focus, without waiting for a first
		 * keystroke. For a field opened in order to pick something, where the list is the
		 * whole point.
		*/
		eager? : boolean,

		/**
		 * Draws the list over its scrolling ancestors rather than inside them.
		 *
		 * An absolutely positioned list is clipped by any ancestor that scrolls, so a field
		 * living in a table cell or a scrolling panel needs this. It only lifts the clipping :
		 * the list still paints inside the nearest stacking context, so a layout that stacks
		 * its rows has to raise the one holding the field.
		*/
		float? : boolean,

		/**
		 * Last entry of the list, whatever the list holds : "create what is being typed".
		 * Shown as soon as something is typed, so a value that does not exist yet is one
		 * click away instead of sending the user to another screen.
		*/
		add? : {
			// Defaults to `+ Créer <value>`
			show? : (value : string) => string,

			/**
			 * Only offered while the list holds *fewer* than `max` suggestions, so that it
			 * does not compete with a list that already answers. Always offered when unset.
			*/
			max? : number,

			onadd : (value : string) => void
		}
	};

	type Suggest<Parameters extends Record<PropertyKey,any> = any> =
	SuggestCommon &
	{
		uri : string | ((value : any) => string),
		options? : RequestInit | ((value : any) => RequestInit)
	}
	|
	SuggestCommon &
	{
		query : RemoteQueryFunction<{value : string} & Parameters, any>,
		options?: Parameters | ((value: any) => Parameters)
	}
	|
	SuggestCommon &
	{
		/** Already loaded data, filtered in the browser. No round trip, no debounce needed. */
		items : (value : string) => any[] | Promise<any[]>
	}
	| undefined;


	export type Props = {
		id? : string | null;
		class? : string | null;
		// Disable focus style effect
		noFocus? : boolean;
		// Input type
		type? : string;
		inputMode? : "none" | "text" | "decimal" | "numeric" | "tel"
		placeholder? : string;
		// Hidden label for SEO purposes
		label? : string | null;
		// Render a textarea instead of input
		multiline? : boolean;
		// Activate autofocus onmount
		autofocus? : boolean;
		// Activate Input width based content size
		autowidth? : boolean | number;
		value? : any;

		// Number/Range types input specific parameters
		step? : number | string | null;
		min? : number | string | null;
		max? : number | string | null;
		// Number/Range input spinner visibility
		spinner? : boolean;
		name? : string | undefined;
		// Min length in characters
		minlength? : number | undefined;
		// Max length in characters
		maxlength? : number | undefined;
		autocomplete? : string | null;

		// Error condition and message
		error? :	string | null;
		warning? : string | null;
		
		// Create an error if not entered
		required? : boolean;
		
		// Validity condition
		pattern? : RegExp | undefined;
		invalid? : string | boolean;
		disabled? : boolean;
		// If defined, add an Icon with this value as glyph inside inputfield
		icon? : string | undefined;

		/**
		 * If define, actives suggestions logic
		*/
		suggest? : Suggest;

		/**
		 * The suggestion the field starts with, when `suggest.strict` is on. Read only :
		 * the field never writes into it, it announces every change with `onselect`.
		 * `value` holds the displayed text (the search query while typing), the selection
		 * holds the picked item : typing or an autofill drops it, so it is never stale.
		*/
		selected? : any;

		// Textearea
		cols? : number | undefined;
		rows? : number | undefined;
		resizeable? : boolean;

		// Events
		onfocus? : (e : FocusEvent) => void;
		onblur? : (e : FocusEvent) => void;
		oninput? : (e : Event & { value : any }) => void;
		onchange? : (e : Event & { value : any }) => void;
		onkeydown? : (e : KeyboardEvent) => void;
		// A suggestion was picked in the list, or (strict mode) the selection was lost
		// because the text was edited. Picking always fires, losing fires once.
		onselect? : (selected : any | undefined) => void;
		onpaste? : (e : ClipboardEvent) => void;

		// Snippets
		children? : Snippet;
		suggestion? : Snippet<[any]>;
	};

	let {
		id = null,
		class: className = null,
		noFocus = false,
		type = 'text',
		placeholder = '',
		label = null,
		multiline = false,
		autofocus = false,
		autowidth = false,
		value = $bindable(),
		step = type === 'number' ? 0.01 : null,
		min = null,
		max = null,
		spinner = false,
		name = undefined,
		minlength = undefined,
		maxlength = undefined,
		autocomplete = null,
		error = null,
		warning = null,
		required = false,
		pattern = defaultRegexp(type),
		invalid = $bindable(),
		disabled = false,
		icon = undefined,
		suggest = undefined,
		selected = undefined,
		cols = 20,
		rows = 2,
		resizeable = false,

		// Events
		onfocus = undefined,
		onblur = undefined,
		oninput = undefined,
		onchange = undefined,
		onkeydown = undefined,
		onselect = undefined,
		onpaste = undefined,

		// Snippets
		children = undefined,
		suggestion = undefined
	} : Props = $props();

	/// VARIABLES

	let inputElement : HTMLInputElement |  HTMLTextAreaElement | undefined = $state(undefined);

	// The field as a whole, which a floating list hangs under : the inner input sits inside
	// the padding and the icons, so it is the wrong box to line the list up with.
	let fieldElement : HTMLDivElement | undefined = $state(undefined);

	// svelte-ignore state_referenced_locally
	let inputwidth = $state(5  + (typeof autowidth === "number" ? autowidth : 0));

	let showSuggestions = $state(false);
	let suggestions : any[] = $state([]);
	let suggestLoading = $state(false);

	let fetchSuggestionTimeout : NodeJS.Timeout | undefined;

	// Set only in floating mode : the list is taken out of the flow, so it has to be told
	// where the field is, and told again every time the page moves under it.
	let floatStyle = $state("");

	// Browser (and password managers) autofill writes into the input without going
	// through the suggestion list : the consumer ends up with a value but no selection.
	let autocompleteValue = $derived(suggest ? (autocomplete ?? "off") : autocomplete);
	let noAutofill = $derived(!!suggest && !autocomplete);

	// Strict mode : the field shows two different things over time, so it tracks them
	// separately. `query` is what the user is typing (a search term, only ever a
	// string), the selection is the suggestion picked in the list (the real value).
	// `value` is just what ends up displayed : the query while searching, the label of
	// the selection otherwise. Typing, pasting or a browser autofill sets a query and
	// drops the selection, so a text never picked in the list can not pass for one.
	let strict = $derived(!!suggest && "strict" in suggest && !!suggest.strict);
	let query : string | undefined = $state(undefined);
	let lastSelected : any = $state(undefined);

	// The selection the field currently holds. `selected` is only the incoming value :
	// changes are announced with `onselect`, never written back into the prop.
	// svelte-ignore state_referenced_locally
	let selection : any = $state(selected);

	// Follow the consumer when it sets a selection from the outside
	$effect(() => {
		selection = selected;
	});

	// Remember the selection so an unfinished search can fall back to it
	$effect(() => {
		if (!isEmpty(selection))
			lastSelected = selection;
	});

	// Not searching : the field displays the selection.
	$effect(() => {
		if (strict && query === undefined)
			value = suggestionLabel(selection) ?? '';
	});

	$effect(() => {
		if (autowidth && value)
			inputwidth = Math.max(`${value}`.length, 5) + (typeof autowidth === "number" ? autowidth : 0);
	});

	// Remove any error if disabled
	$effect(() => {
		if (disabled)
			invalid = false;
	});


	/**
	 * UTILS
	 */

	export function isValid() {
		if (required && (!value || value === ''))
			invalid = "Ce champ est requis";
		else
			invalid = generateInvalid();

		return !error && !invalid && !inputElement?.validity.badInput;
	}

	export function focus() {
		if (!disabled && inputElement && !noFocus)
			inputElement.focus();
	}

	/**
	 * Empty the field and drop the selection (strict mode).
	 */
	export function clear() {
		query = undefined;
		lastSelected = undefined;

		if (!isEmpty(selection))
			select(undefined);

		value = '';
	}

	/**
	 * Set the selection and announce it. Callers only call it on an actual change.
	 */
	function select(s : any | undefined) {
		selection = s;
		onselect?.(s);
	}

	function isEmpty(s : unknown) {
		return s === undefined || s === null;
	}

	function defaultRegexp(type : string) {
		if (multiline)
			return undefined;
		if (type === 'number')
			return /[\d.]+/m;
		if (type === 'email')
			return /^[a-zA-Z0-9\-.+_~]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*$/m;

		return undefined;
	}

	function generateInvalid() {
		if (!inputElement) return false;
		if (inputElement?.validity.badInput) return "Entrée invalide";
		if (inputElement?.validity.valid) return false;
		if (inputElement?.validity.patternMismatch) return type === "email" ? "Email invalide" : "Entrée invalide";
		if (inputElement?.validity.rangeOverflow) return "Valeur trop haute";
		if (inputElement?.validity.rangeUnderflow) return "Valeur trop basse";
		if (inputElement?.validity.stepMismatch) return "Valeur impossible";
		if (inputElement?.validity.tooLong) return "Entrée trop longue";
		if (inputElement?.validity.tooShort) return "Entrée trop courte";
		if (inputElement?.validity.typeMismatch) return type === "email" ? "Email invalide" : "Entrée invalide";
		if (inputElement?.validity.valueMissing) return "Ce champ est requis";
		return false;
	}

	/**
	 * The text displayed in the field for a picked suggestion.
	 */
	function suggestionLabel(s : any) : string | undefined {
		if (s === undefined || s === null)
			return undefined;
		if (typeof suggest?.show === "function")
			return suggest.show(s);

		return typeof s === "object" ? undefined : `${s}`;
	}

	// What "+ Créer ..." would create : the text as it stands, never a picked suggestion
	let typed = $derived(`${value ?? ''}`.trim());

	let addRoom = $derived(suggest?.add?.max === undefined || suggestions.length < suggest.add.max);

	let addLabel = $derived(suggest?.add && typed !== '' && addRoom
		? (suggest.add.show?.(typed) ?? `+ Créer ${typed}`)
		: undefined);


	async function fetchSuggestions() {
		if (!suggest)
			return;

		showSuggestions = true;
		suggestLoading = true;

		let json;

		if("uri" in suggest){
			let uri = typeof suggest.uri === "function" ? suggest.uri(value) : suggest.uri;
			let options : RequestInit = {
				method: 'GET',
				credentials: "include",
				headers: {
					'Content-Type': 'application/json',
					'Accept': '*/*'
				},
			};
			options = (typeof suggest.options === "function" ? suggest.options(value) : suggest.options) ?? options;

			const res = await fetch(uri, options);
			if (res.status != 200) {
				suggestLoading = false;
				suggestions = [];
				return;
			}

			json = await res.json();
		}
		else if("query" in suggest){
			json = await suggest.query({value, ...((typeof suggest.options === "function" ? suggest.options(value) : suggest.options) ?? {})})
		}
		else if("items" in suggest){
			json = await suggest.items(`${value ?? ''}`);
		}

		const list = suggest.then?.(json) ?? json;

		// Never undefined : a source that answers nothing — or a `suggest` shape this build
		// does not know — leaves an empty list instead of breaking the whole field
		suggestions = Array.isArray(list) ? list : [];

		suggestLoading = false;
	}


	/**
	 * LISTENERS
	 */

	function onFocus(e : FocusEvent) {
		if (required && (!value || value === ''))
			invalid = false;

		if (suggest?.eager)
			fetchSuggestions();

		onfocus?.(e);
	}


	function onBlur(e : FocusEvent) {
		// A search waiting on its delay would otherwise reopen the list after the field
		// has been left
		if (fetchSuggestionTimeout) {
			clearTimeout(fetchSuggestionTimeout);
			fetchSuggestionTimeout = undefined;
		}

		// Leaving the field on a search left unfinished : the leftover text stands for
		// nothing, so go back to the last suggestion chosen in the list. An emptied
		// field is a deliberate reset instead, and must not bring that one back.
		if (strict && isEmpty(selection)) {
			const searching = query !== undefined && query.trim() !== '';

			if (searching && !isEmpty(lastSelected))
				select(lastSelected);
			else if (!searching)
				lastSelected = undefined;

			// Stop searching : the field goes back to displaying the selection. Written
			// here too, and not only in the effect, so the checks below see the text
			// the user is actually left with.
			query = undefined;
			value = suggestionLabel(selection) ?? '';
			showSuggestions = false;
		}

		if (required && (!value || value === ''))
			invalid = "Ce champ est requis"

		onblur?.(e);
	}


	function onInput(e : Event) {
		if (pattern)
			invalid = generateInvalid();

		value = (e.target as HTMLInputElement).value;

		if (type === "number" && (e as any).data?.match(/^[1-9]$/))
			value = step === 1 ? parseInt(value) : parseFloat(value);

		if (suggest) {
			// Typing, pasting or a browser autofill : the text is a search term again,
			// and no longer stands for the picked suggestion.
			if (strict) {
				query = `${value ?? ''}`;

				if (!isEmpty(selection))
					select(undefined);
			}

			if (fetchSuggestionTimeout)
				clearTimeout(fetchSuggestionTimeout);

			fetchSuggestionTimeout = setTimeout(fetchSuggestions, suggest.wait ?? 100);
		}

		oninput?.({ ...e, value });
	}

	function onChange(e : Event) {
		if (type === "number")
			value = step === 1 ? parseInt(value) : parseFloat(value);

		onchange?.({ ...e, value });
	}

	function placeFloatingList() {
		if (!fieldElement)
			return;

		const box = fieldElement.getBoundingClientRect();

		floatStyle = `top: ${box.bottom}px; left: ${box.left}px; min-width: ${box.width}px;`;
	}

	// A fixed list does not follow its field on its own : anything that moves the field
	// under it — an outer scroller, a resize — has to move it too.
	$effect(() => {
		if (!suggest?.float || !showSuggestions || !fieldElement)
			return;

		placeFloatingList();

		// Capture : the scroll of an inner container does not bubble
		window.addEventListener("scroll", placeFloatingList, true);
		window.addEventListener("resize", placeFloatingList);

		return () => {
			window.removeEventListener("scroll", placeFloatingList, true);
			window.removeEventListener("resize", placeFloatingList);
		};
	});

	onMount(() => {
		if (autofocus && inputElement)
			inputElement.focus();
	});
</script>

<div
	bind:this={fieldElement}
	core="inputfield"
	tabindex="-1"
	role="textbox"
	class="inputfield {className}"
	class:multiline
	class:nospinner={!spinner}
	class:empty={value == null || value === ''}
	class:disabled
	class:error={!!error || invalid}
	class:warning={!!warning}
	class:focusable={!noFocus}
	style={autowidth ? "--auto-width : " + inputwidth + "ch" : ""}
	use:clickInside
	oninclick={() => focus()}
	onclick={() => focus()}
	onkeypress={() => {}}
>
	{#if label && id}
		<!-- for SEO -->
		<label for={id} class="label">{label}</label>
	{/if}

	{#if multiline}
		<textarea {id} {name} {value} {placeholder} {disabled} bind:this={inputElement}
			class:resizeable
			oninput={onInput}
			onchange={onChange}
			onfocus={onFocus}
			onblur={onBlur}
			{rows}
			{cols}
			{onkeydown}
			{required}
			{maxlength}
			{minlength}
			{onpaste}
		></textarea>
		{@render children?.()}
	{:else}
		<input id={id} {name} {placeholder} autocomplete={autocompleteValue as any} {value} {type} {disabled} bind:this={inputElement} {step} {min} {max}
			class:resizeable
			data-1p-ignore={noAutofill ? "" : undefined}
			data-lpignore={noAutofill ? "true" : undefined}
			data-bwignore={noAutofill ? "true" : undefined}
			data-form-type={noAutofill ? "other" : undefined}
			role={suggest ? "combobox" : undefined}
			aria-autocomplete={suggest ? "list" : undefined}
			aria-expanded={suggest ? showSuggestions : undefined}
			oninput={onInput}
			onchange={onChange}
			onfocus={onFocus}
			onblur={onBlur}
			{onkeydown}
			{required}
			pattern={pattern?.source}
			{maxlength}
			{minlength}
			{onpaste}
		/>

		{#if children}
			{@render children()}
		{:else}
			{#if icon}
				<Icon glyph={icon} />
			{/if}
		{/if}
	{/if}

	{#if (error && typeof error === "string") || invalid}
		<span class="error" transition:slide|local>{invalid ? invalid : error}</span>
	{/if}

	{#if warning && typeof warning === "string"}
		<span class="warning">{warning}</span>
	{/if}

	{#if suggest && showSuggestions}
		<ul class="suggestions" class:floating={suggest.float} style={suggest.float ? floatStyle : undefined}
			use:clickOutside onoutclick={() => showSuggestions = false}>
			{#if suggestLoading}
				<div class="suggestionsLoaderContainer">
					<DotLoader />
				</div>
			{:else}
				{#each suggestions as s}
					<li>
						<!-- Keep the focus on the input : in strict mode a blur fired before
						     the click would restore the text and cancel the pick -->
						<button onmousedown={e => e.preventDefault()}
							onclick={() => {
								// Stop searching : the field goes back to displaying the selection
								query = undefined;
								select(s);

								inputElement?.blur();
								showSuggestions = false;
							}}>
							{#if suggestion}
								{@render suggestion(s)}
							{:else if typeof suggest?.show === "function"}
								{suggest.show(s)}
							{:else}
								{s}
							{/if}
						</button>
					</li>
				{/each}

				{#if addLabel}
					<!-- Always last : the way out when nothing in the list fits -->
					<li class="add">
						<button onmousedown={e => e.preventDefault()}
							onclick={() => {
								showSuggestions = false;
								suggest.add?.onadd(typed);
							}}>
							{addLabel}
						</button>
					</li>
				{:else if suggestions.length < 1}
					<li class="noresult">Aucun résultat</li>
				{/if}
			{/if}
		</ul>
	{/if}
</div>

<style lang="scss">
	@use "../../../styles/mixins.scss" as *;
	@use "../../../styles/variables.scss" as *;

	.inputfield {
		@include expose(inputfield, display, [], flex);
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: var(--auto-width, var(--inputfield-width, var(--default-inputfield-width, unset)));

		@include expose(inputfield,
			height max-width max-height min-height min-width
			padding margin
			top right bottom left
			font-family font-weight font-size font-family color
			background-color
			border-color border-width border-radius border-style box-shadow
			flex-grow flex-shrink
		);
		@include expose(inputfield, position, [], relative);
		@include expose(inputfield, gap, [], 2ch);

		&:hover:not(.disabled) {
			cursor: text;
			@include expose(inputfield-hover,
				border-style border-width border-color
				padding margin
				background-color
				font-weight font-size color,
				inputfield
			);
		}

		&.focusable:focus-within:not(.disabled) {
			@include expose(inputfield-focus,
				border-style border-width border-color
				padding margin
				background-color
				font-weight font-size color,
				inputfield
			);
		}

		&.error, &.error:focus, &.error:focus-within {
			@include expound(inputfield-error-color, border-color, inputfield-border-color);
		}

		&.warning, &.warning:focus, &.warning:focus-within {
			@include expound(inputfield-warning-color, border-color, inputfield-border-color);
		}

		span.error {
			@include expose(inputfield-error,
				font-family font-weight font-size color, inputfield
			);
		}

		span.warning {
			@include expose(inputfield-warning,
				font-family font-weight font-size color, inputfield
			);
		}

		span.error, span.warning {
			position: absolute;
			bottom: -1ch;
			transform: translateY(100%);
			left: 0;
			width: 100%;
		}

		&.disabled {
			cursor: auto;
			@include expose(inputfield-disabled,
				font-weight font-size color
				border-style border-width border-color border-size
				background-color,
				inputfield
			)
		}

		input, textarea {
			width: 100%;
			background-color: transparent;
			resize: none;
			border: none;
			outline: none;
			font-size: inherit;
			font-weight: inherit;
			font-family: inherit;
			color: inherit;
			height: 100%;
			@include expose(inputfield, text-align);

			&.resizeable {
				resize: vertical;
			}

			&::placeholder {
				@include expose(inputfield-placeholder,
					color font-weight font-size,
					inputfield
				);
			}
		}

		&.nospinner input[type='number'] {
			appearance: inputfield;

			&::-webkit-inner-spin-button, &::-webkit-outer-spin-button {
				appearance: none;
				margin: 0;
			}
		}

		.suggestionsLoaderContainer {
			height: 100%;
			width: 100%;
			padding: 2ch;
			--dotloader-position: relative;
			--dotloader-border: none;
			--dotloader-transform: translate(-50%, 0%);
		}

		.suggestions {
			position :absolute;
			bottom: 0;
			left: 0;
			transform: translateY(100%);
			height: auto;

			/*
				Out of the flow entirely : placed on the field by script, so that a scrolling
				ancestor can no longer clip it. Its width follows its content, the field only
				gives it a floor.
			*/
			&.floating {
				position: fixed;
				bottom: auto;
				transform: none;
				width: max-content;
				max-width: 40ch;
				max-height: 40vh;

				// Explicit, and not just `overflow-y` : a single scrolling axis promotes the
				// other one from `visible` to `auto`, which is where the horizontal bar came
				// from. Long entries wrap instead.
				overflow-x: hidden;
				overflow-y: auto;

				// A list long enough to scroll still has to say so, but a full width system
				// bar next to three entries reads as a defect
				scrollbar-width: thin;
				scrollbar-color: #{grey(75%)} transparent;

				&::-webkit-scrollbar {
					width: 0.6ch;
				}

				&::-webkit-scrollbar-track {
					background: transparent;
				}

				&::-webkit-scrollbar-thumb {
					background-color: #{grey(75%)};
					border-radius: 0.3ch;
				}
			}

			@include expose(inputfield-suggestions, width, [], 100%);

			@include expose(inputfield-suggestions,
				z-index
				background-color
				border border-radius box-shadow
			);
			@include expose(inputfield-suggestions,
				font-size color,
				inputfield
			);

			&.floating li {
				// The list is only as wide as `max-width` allows : a name longer than that
				// has to fold rather than push a scrollbar under the list
				overflow-wrap: anywhere;
			}

			li {
				list-style: none;
				cursor: pointer;
				border-bottom: 1px solid #{grey(92%)};

				&:hover {
					background-color: grey(98%);
					@include expose(inputfield-suggestion-hover, background-color, inputfield-suggestion);
					@include expose(inputfield-suggestion-hover, color);
				}

				&.noresult {
					width: 100%;
					text-align: center;
					cursor: auto;

					&:hover {
						background-color: transparent;
					}
				}

				&.add {
					border-bottom: none;
					@include expound(active-color, color);
				}

				button {
					all: unset;
					outline: revert;
					@include expose(inputfield-suggestion, padding);
					width: 100%;
					height: 100%;
				}
			}
		}

		label {
			// Hide label
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap; /* added line */
			border: 0;
		}
	}
</style>
