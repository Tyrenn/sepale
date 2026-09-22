<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the compiled kit
	 * (src/lib/generated/classes.ts), so a page cannot claim a class the
	 * stylesheet does not have, and the build fails on a class no page
	 * describes.
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
					default: "$bindable('')",
					description: "The chosen option. Bindable."
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
