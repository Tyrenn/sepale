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
		namespaces: ["input"],
		description:
			"A single-line field. The frame is a hole cut in the page: it sits on surface-1, not above it.",
		classes: {},
		props: {
			Input: [
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
					description: "The field's text. Bindable."
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
					type: "HTMLInputElement",
					default: "$bindable()",
					description: "The native field. Bindable."
				},
				{
					name: "start / end",
					type: "Snippet",
					description: "Drawn inside the frame before / after the text: an icon, a unit, a shortcut. Either one turns the field into a `<label class=\"input\">` frame around the `<input>`."
				},
				{
					name: "nospinner",
					type: "boolean",
					default: "false",
					description: "Hide the step arrows of a number field."
				},
				{
					name: "autowidth",
					type: "boolean | number",
					default: "false",
					description: "The field grows with its text. A number adds that many characters of room."
				},
				{
					name: "isValid() / focus() / clear()",
					type: "methods",
					description: "Through `bind:this`: check the field now, focus it, empty it. Suggestions moved to Combobox."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Input
	} from '$lib/index.js';

</script>

	<Section
		title="Default"
		svelte={`<Input placeholder="Default input" />`}
		html={`<input type="text" class="input" placeholder="Default input" />`}
	>
		<Input placeholder="Default input" />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Input size="xs" placeholder="xs" />
<Input size="sm" placeholder="sm" />
<Input placeholder="base" />
<Input size="lg" placeholder="lg" />`}
		html={`<input type="text" class="input input-xs" placeholder="xs" />
<input type="text" class="input input-sm" placeholder="sm" />
<input type="text" class="input" placeholder="base" />
<input type="text" class="input input-lg" placeholder="lg" />`}
	>
		<Input size="xs" placeholder="xs" />
		<Input size="sm" placeholder="sm" />
		<Input placeholder="base" />
		<Input size="lg" placeholder="lg" />
	</Section>

	<Section
		title="Colors"
		svelte={`<Input color="primary" placeholder="Primary" />
<Input color="success" placeholder="Success" />
<Input color="error" placeholder="Error" />`}
		html={`<input type="text" class="input input-primary" placeholder="Primary" />
<input type="text" class="input input-success" placeholder="Success" />
<input type="text" class="input input-error" placeholder="Error" />`}
	>
		<Input color="primary" placeholder="Primary" />
		<Input color="success" placeholder="Success" />
		<Input color="error" placeholder="Error" />
	</Section>

	<Section
		title="With inline label"
		subtitle="A composite that needs wrapper markup, so there's no single-component Svelte form."
		html={`<label class="input">
	<span class="label">https://</span>
	<input type="text" placeholder="example.com" />
</label>`}
	>
		<label class="input">
			<span class="label">https://</span>
			<input type="text" placeholder="example.com" />
		</label>
	</Section>

	<Section
		title="Icons and units"
		subtitle="`start` and `end` draw inside the frame."
		svelte={`<Input placeholder="Search" type="search">
	{#snippet start()}<svg …/>{/snippet}
	{#snippet end()}<kbd>⌘K</kbd>{/snippet}
</Input>
<Input type="number" nospinner placeholder="0">
	{#snippet end()}<span class="label">kg</span>{/snippet}
</Input>`}
		html={`<label class="input">
	<svg …/>
	<input type="search" placeholder="Search" />
	<kbd>⌘K</kbd>
</label>`}
	>
		<Input placeholder="Search" type="search">
			{#snippet start()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>{/snippet}
			{#snippet end()}<kbd>⌘K</kbd>{/snippet}
		</Input>
		<Input type="number" nospinner placeholder="0">
			{#snippet end()}<span class="label">kg</span>{/snippet}
		</Input>
	</Section>

	<Section
		title="Validation"
		subtitle="The browser checks, and its own message is shown. `error` forces one."
		svelte={`<Input type="email" required validator placeholder="Email" />
<Input value="taken" error="This name is already used" />`}
		html={`<input type="email" class="input validator" required placeholder="Email" />
<p class="validator-hint">…</p>`}
	>
		<div style="display:flex; flex-direction:column; gap:.5rem;">
			<Input type="email" required validator placeholder="Email" />
		</div>
		<div style="display:flex; flex-direction:column; gap:.5rem;">
			<Input value="taken" error="This name is already used" />
		</div>
	</Section>


