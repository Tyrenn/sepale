<script lang="ts">
	import { slide } from "svelte/transition";
	import Icon from "../icon/Icon.svelte";
	import { clickOutsideThisAndOther } from "../../scripts/actions/clickoutside.js";
	import type { Snippet } from "svelte";

	export type Props = {
		id? : string | undefined;
		class? : string | null;
		// Show icon or not
		arrow? : boolean;

		/**
			Array of options. By default array of { name: string; value: any }.
			Change 'name' and 'value' keys with optionvalue and optionname props.
		*/
		options? : any[];
		optionvalue? : string;
		optionname? : string;

		placeholder? : string;

		label? : string | null;

		// If multiple options can be chosen
		multiple? : boolean;

		value : string | string[] | undefined;
		required? : boolean;
		nullable? : boolean;
		invalid? : string | boolean | null;
		error? : string | null;

		noFocus? : boolean;

		// Disable selectfield
		disabled? : boolean;

		name? : string | undefined;

		// Events
		onclick? : (e : MouseEvent) => void;
		ondblclick? : (e : MouseEvent) => void;
		onfocus? : (e : FocusEvent) => void;
		onblur? : (e : FocusEvent) => void;
		onchange? : (value : string | string[] | undefined) => void

		// Snippets
		children? : Snippet;
		option? : Snippet<[any]>;
	};

	let {
		id = undefined,
		class: className = "",
		arrow = false,
		options = [],
		optionvalue = "value",
		optionname = "name",
		placeholder = "___",
		label = null,
		multiple = false,
		value = $bindable(),
		required = false,
		nullable = false,
		invalid = false,
		error = null,
		noFocus = false,
		disabled = false,
		name = undefined,

		// Events
		onclick = undefined,
		ondblclick = undefined,
		onfocus = undefined,
		onblur = undefined,
		onchange = undefined,

		// Snippets
		children = undefined,
		option = undefined
	} : Props = $props();

	let selectField : HTMLDivElement | undefined = $state(undefined);

	let focus = $state(false);
	let selectref : HTMLSelectElement | undefined = $state(undefined);

	$effect(() => {
		if (multiple && !value)
			value = [];

		if (multiple && (value?.length ?? -1) >= 0) {
			let selectedOptions = options.filter((o) => value?.includes(o[optionvalue]));
			if (selectedOptions.length == 0)
				name = placeholder;
			else if (selectedOptions.length == 1)
				name = selectedOptions[0][optionname];
			else
				name = `${selectedOptions.length} sélectionnées`;
		} else if (!multiple && value) {
			const opt = options?.find((o) => o[optionvalue] == value);
			name = opt ? opt[optionname] : placeholder;
		} else {
			name = placeholder;
		}
	});

	export function click() {
		selectField?.click();
	}

	export function isValid() {
		if (required && (!value || value === ''))
			invalid = "Ce champ est requis";
		else
			invalid = generateInvalid();

		return !error && !invalid && !selectref?.validity.badInput;
	}

	function generateInvalid() {
		if (selectref?.validity.badInput) return "Entrée invalide";
		if (selectref?.validity.valid) return null;
		if (selectref?.validity.patternMismatch) return "Entrée invalide";
		if (selectref?.validity.rangeOverflow) return "Valeur trop haute";
		if (selectref?.validity.rangeUnderflow) return "Valeur trop basse";
		if (selectref?.validity.stepMismatch) return "Valeur impossible";
		if (selectref?.validity.tooLong) return "Entrée trop longue";
		if (selectref?.validity.tooShort) return "Entrée trop courte";
		if (selectref?.validity.typeMismatch) return "Entrée invalide";
		if (selectref?.validity.valueMissing) return "Ce champ est requis";
		return null;
	}

	async function onWindowClick(e : MouseEvent) {
		blurSelect(e);
	}

	async function onSelectClick(e : MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		focus ? blurSelect(e) : selectref?.focus();

		onclick?.(e);
	}

	// Permet de mettre le focus sur
	async function onSelectFocusIn(e : FocusEvent) {
		if (e.target !== selectref) return;

		focus = true;

		onfocus?.(e);
	}

	async function blurSelect(e : MouseEvent) {
		if (focus) {
			focus = false;

			// Must set value of select ref ourselves in case not multiple for obscure reasons
			if (!multiple && selectref)
				selectref.value = value as string;

			invalid = generateInvalid();

			onblur?.(e);
		}
	}

	async function onOptionClick(e : MouseEvent, option : any) {
		e.preventDefault();
		e.stopPropagation();

		if (multiple) {
			if (!value)
				value = [];
			if (value.includes(option[optionvalue])) {
				value = (value as string[]).filter((v) => v != option[optionvalue]);
				onchange?.(value);
			} else {
				value = [...value, option[optionvalue]];
				onchange?.(value);
			}
		} else if (!value || value !== option[optionvalue]) {
			value = option[optionvalue];
			onchange?.(value);
			blurSelect(e);
		}
	}
</script>

<svelte:window onclick={onWindowClick} />

<div
	bind:this={selectField}
	role="button"
	tabindex=0
	core="selectfield"
	class="selectfield {className}"
	class:placeholded={name === placeholder}
	class:multiple
	class:focus={focus && !noFocus}
	class:error={error || invalid}
	class:disabled
	class:arrow
	onclick={onSelectClick}
	onkeypress={() => {}}
	onfocusin={onSelectFocusIn}
	onoutclick={() => focus = false}
	use:clickOutsideThisAndOther={selectref}
>
	{@render children?.()}

	<p class="name">{name}</p>

	{#if arrow}
		<div class="arrowicon">
			<Icon glyph="arrow_left" />
		</div>
	{/if}

	{#if (error && typeof error === "string") || invalid}
		<span class="error" transition:slide|local>{invalid ? invalid : error}</span>
	{/if}

	{#if label && id}
		<!-- for SEO -->
		<label for={id}>{label}</label>
	{/if}

	{#if multiple}
		<select {id} bind:this={selectref} bind:value={value} {required} {disabled} multiple>
			<option value={undefined} selected={!value} disabled hidden>{placeholder}</option>
			{#each options as option}
				<option value={option[optionvalue]}>{option[optionname]}</option>
			{/each}
		</select>
	{:else}
		<select {id} bind:this={selectref} bind:value={value} {required} {disabled}>
			<option value={undefined} selected={!value} disabled hidden>{placeholder}</option>
			{#each options as option}
				<option value={option[optionvalue]}>{option[optionname]}</option>
			{/each}
		</select>
	{/if}

	<div class="options" class:display={focus}>
		{#if nullable}
			<button
				class="option-item"
				onclick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					value = multiple ? [] : undefined;
					onchange?.(value);
					focus = false;
				}}
				ondblclick={(e) => { e.preventDefault(); ondblclick?.(e); }}
				onkeypress={() => {}}
			>
				{placeholder}
			</button>
		{/if}

		{#each options as opt}
			<button
				class="option-item"
				onclick={(e) => onOptionClick(e, opt)}
				ondblclick={(e) => { e.preventDefault(); ondblclick?.(e); }}
				onkeypress={() => {}}
			>
				{#if multiple}
					<div class="checksign" class:checked={value && Array.isArray(value) ? value.includes(opt[optionvalue]) : false}>
						<Icon glyph='check' />
					</div>
				{/if}

				{#if option}
					{@render option(opt)}
				{:else}
					<p class:multiple>{opt[optionname]}</p>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	@use "../../../styles/mixins.scss" as *;

	div.selectfield {
		user-select: none;
		display: flex;
		flex-direction: row;
		gap: 3%;
		cursor: pointer;
		// TODO ADD SLOTS ?

		@include expose(selectfield,
			width height min-width max-width padding margin
			top right bottom left
			background-color
			font-family font-weight font-size color
			justify-content align-items
			border-style border-color border-width border-radius border-style box-shadow
		);

		@include expose(selectfield, position, [], relative);

		&:hover {
			@include expose(selectfield-hover,
				border-style border-width
				background-color
				margin padding
				font-weight font-size color,
				selectfield
			)
		}

		&.focus {
			@include expose(selectfield-focus,
				border-style border-width
				background-color
				margin padding
				font-weight font-size color,
				selectfield
			)
		}

		&.placeholded p.name {
			@include expose(selectfield-placeholder,
				color font-weight font-size,
				selectfield
			);
		}

		&.placeholded:hover p.name {
			@include expose(selectfield-placeholder-hover,
				color font-weight font-size,
				selectfield selectfield-hover selectfield-placeholder
			);
		}

		&.placeholded.focus p.name {
			@include expose(selectfield-placeholder-focus,
				color font-weight font-size,
				selectfield selectfield-focus selectfield-placeholder
			);
		}

		&.error {
			@include expound(selectfield-error-color, border-color, selectfield-border-color);
		}

		&.disabled {
			cursor: auto;
			@include expose(selectfield-disabled,
				font-weight font-size color
				border-style border-width border-color border-size
				background-color,
				selectfield
			)
		}

		.arrowicon {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 1ch;
			--icon-transform: rotate(-90deg);
			--icon-stroke: var(--selectfield-color-arrow, var(--default-selectfield-color, initial));
			--icon-size: 100%;
		}

		span.error {
			position: absolute;
			top: 120%;
			width: 100%;
			@include expose(selectfield-error,
				font-family font-weight font-size color, selectfield);
		}

		p.name {
			width: 100%;
			height: 100%;
			overflow: hidden;
			white-space: nowrap;
			@include expose(selectfield, text-align, [], left);
		}

		div.options {
			display: none;
			position: absolute;
			flex-direction: column;
			overflow-y: auto;
			bottom: 0;

			@include expose(selectfield-options,
				font-family font-size font-weight color
				background-color filter
				overflow-x,
				selectfield
			);

			@include expose(selectfield-options,
				height max-height min-width
				right top
				border-radius box-shadow
			);

			@include expose(selectfield-options, left, [], 0);
			@include expose(selectfield-options, width, [], 100%);
			@include expose(selectfield-options, transform, [], translate(0%, 100%));
			@include expose(selectfield-options, z-index, [], 3);

			.option-item {
				all: unset;
				cursor: pointer;
				display: flex;
				flex-direction: row;
				align-items: center;
				@include expose(selectfield-option, gap, [], 1em);
				@include expose(selectfield-option, padding justify-content min-width);
				@include expose(selectfield-option, background-color, selectfield-options);

				&:hover {
					@include expose(selectfield-option-hover, background-color, selectfield-options selectfield-option);
				}
			}

			&.display {
				display: flex;
			}
		}

		&.multiple div.options {
			div {
				gap: 2%;
			}

			p {
				width: 90%;
			}

			div.checksign {
				width: 1.5em;
				height: 1.5em;
				display: flex;
				justify-content: center;
				position: relative;
				padding: 0;

				--icon-size: 0;
				--icon-transition:
				transform 0.1s ease-out,
				width 0.1s ease-out,
				height 0.1s ease-out;
				--icon-transform-origin: 50% 50%;
				--icon-transform: rotate(90deg);

				@include expound(selectfield-color, --icon-fill --icon-stroke);

				&.checked {
					--icon-size: 100%;
					--icon-transform: unset;
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

		select {
			// Hide Select
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap; /* added line */
			border: 0;

			&::-ms-expand {
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

			option {
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
	}
</style>
