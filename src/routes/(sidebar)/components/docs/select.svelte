<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
	 *
	 * `namespaces` is the one piece of structure: it says which classes
	 * belong here. Nothing else can know that `.title` is part of `text`.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ["select"],
		description:
			"A closed list of choices, drawn as a field so it lines up with the inputs beside it.",
		classes: {},
		props: {
			Select: [
				{
					name: "validator",
					type: "boolean",
					default: "false",
					description: "Colour the field by its own validity and reveal `hint` once the browser marks it invalid. The CSS drives this off `:user-invalid`, so it only fires after the visitor has actually had a go."
				},
				{
					name: "hint",
					type: "Snippet",
					description: "Shown under the field when it is invalid. It has to be the field's next sibling for the CSS to reach it, which is the whole reason this is a prop and not something you write yourself."
				},
				{
					name: "value",
					type: "string | number",
					default: "$bindable()",
					description: "The chosen option — an array with `multiple`. Bindable."
				},
				{
					name: "error",
					type: "string | null",
					description: "An error from outside — the server said no. Marks the field invalid and shows the text under it, before any `hint`, for as long as it is given: the parent owns it and clears it."
				},
				{
					name: "invalid",
					type: "string | false",
					default: "$bindable(false)",
					description: "The message of the last check, `false` when the field passed. Written by `isValid()` and, with `validator`, on blur. The text is the browser's own `validationMessage`, in the visitor's language."
				},
				{
					name: "element",
					type: "HTMLSelectElement",
					default: "$bindable()",
					description: "The native field. Bindable."
				},
				{
					name: "options",
					type: "any[]",
					description: "The options, as data — written after any `children`. Objects are read through `optionvalue` and `optionname`; plain values are their own text."
				},
				{
					name: "optionvalue / optionname",
					type: "string",
					default: "'value' / 'name'",
					description: "The keys of an option object holding its value and its text."
				},
				{
					name: "option",
					type: "Snippet<[any]>",
					description: "How one option is drawn."
				},
				{
					name: "placeholder",
					type: "string",
					description: "Shown while nothing is chosen."
				},
				{
					name: "nullable",
					type: "boolean",
					default: "false",
					description: "The placeholder can be chosen back, to clear the field."
				},
				{
					name: "multiple",
					type: "boolean",
					default: "false",
					description: "Several choices; `value` is an array. Drawn as a frame opening a list of checkable rows, with a hidden native `<select multiple>` carrying the value into the form."
				},
				{
					name: "summary",
					type: "(chosen) => string",
					default: "`N selected`",
					description: "The text of a multiple field holding several choices."
				},
				{
					name: "onvalue",
					type: "(value) => void",
					description: "Called with the new value after every change."
				},
				{
					name: "isValid() / show()",
					type: "methods",
					description: "Through `bind:this`: check the field now; open the list of a multiple field."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Select
	} from '$lib/index.js';

	const FRUITS = [
		{ value: 'apple', name: 'Apple' },
		{ value: 'pear', name: 'Pear' },
		{ value: 'plum', name: 'Plum' },
		{ value: 'mango', name: 'Mango' }
	];

	let one: string | undefined = $state();
	let many: string[] = $state(['pear']);
</script>

	<Section
		title="Default"
		svelte={`<Select>
	<option disabled selected>Pick a color</option>
	<option>Crimson</option>
	<option>Amber</option>
	<option>Velvet</option>
</Select>`}
		html={`<select class="select">
	<option disabled selected>Pick a color</option>
	<option>Crimson</option>
	<option>Amber</option>
	<option>Velvet</option>
</select>`}
	>
		<Select>
			<option disabled selected>Pick a color</option>
			<option>Crimson</option>
			<option>Amber</option>
			<option>Velvet</option>
		</Select>
	</Section>

	<Section
		title="Sizes"
		svelte={`<Select size="xs"><option>xs</option></Select>
<Select size="sm"><option>sm</option></Select>
<Select><option>base</option></Select>
<Select size="lg"><option>lg</option></Select>`}
		html={`<select class="select select-xs"><option>xs</option></select>
<select class="select select-sm"><option>sm</option></select>
<select class="select"><option>base</option></select>
<select class="select select-lg"><option>lg</option></select>`}
	>
		<Select size="xs"><option>xs</option></Select>
		<Select size="sm"><option>sm</option></Select>
		<Select><option>base</option></Select>
		<Select size="lg"><option>lg</option></Select>
	</Section>

	<Section
		title="Options as data"
		subtitle="`placeholder` until something is chosen; `nullable` lets it be chosen back."
		svelte={`<Select options={FRUITS} placeholder="Pick a fruit" nullable bind:value={one} />`}
	>
		<div style="display:flex; flex-direction:column; gap:.5rem;">
			<Select options={FRUITS} placeholder="Pick a fruit" nullable bind:value={one} />
			<small>value: {one ?? '—'}</small>
		</div>
	</Section>

	<Section
		title="Several choices"
		subtitle="A frame that opens a list of checkable rows. Arrows, Space/Enter and Escape work."
		svelte={`<Select multiple options={FRUITS} placeholder="Fruits" nullable bind:value={many} />`}
		html={`<div class="select" role="combobox" aria-expanded="true" tabindex="0">
	<span>2 selected</span>
	<ul class="list list-suggestions" role="listbox" aria-multiselectable="true">
		<li class="list-row" role="option" aria-checked="true">
			<input type="checkbox" class="checkbox checkbox-sm" checked /> Pear
		</li>
	</ul>
</div>`}
	>
		<div style="display:flex; flex-direction:column; gap:.5rem; min-height:14rem;">
			<Select multiple options={FRUITS} placeholder="Fruits" nullable bind:value={many} />
			<small>value: {JSON.stringify(many)}</small>
		</div>
	</Section>

	<Section
		title="Validation"
		subtitle="Leave it empty and tab away: the browser's own message."
		svelte={`<Select options={FRUITS} placeholder="Required" required validator />`}
	>
		<div style="display:flex; flex-direction:column; gap:.5rem;">
			<Select options={FRUITS} placeholder="Required" required validator />
		</div>
	</Section>
