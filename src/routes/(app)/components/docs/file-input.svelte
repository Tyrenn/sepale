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
		namespaces: ["file-input"],
		description:
			"The browser's file picker wearing the kit's field frame. The button inside it is the ::file-selector-button, painted like a button.",
		classes: {},
		props: {
			FileInput: [
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
					name: "files",
					type: "FileList | null",
					default: "$bindable<FileList | null>(null)",
					description: "The chosen files. Bindable."
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
					name: "isValid() / clear()",
					type: "methods",
					description: "Through `bind:this`: check the field now; drop the chosen files."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		FileInput
	} from '$lib/index.js';
</script>

	<Section
		title="Default"
		svelte={`<FileInput />`}
		html={`<input type="file" class="file-input" />`}
	>
		<FileInput />
	</Section>

	<Section
		title="Sizes"
		svelte={`<FileInput size="xs" />
<FileInput size="sm" />
<FileInput />
<FileInput size="lg" />`}
		html={`<input type="file" class="file-input file-input-xs" />
<input type="file" class="file-input file-input-sm" />
<input type="file" class="file-input" />
<input type="file" class="file-input file-input-lg" />`}
	>
		<FileInput size="xs" />
		<FileInput size="sm" />
		<FileInput />
		<FileInput size="lg" />
	</Section>

	<Section
		title="Validation"
		subtitle="`required` and `accept` are the browser's; `error` forces a message."
		svelte={`<FileInput required validator accept="image/*" />
<FileInput error="The server refused this file" />`}
	>
		<div style="display:flex; flex-direction:column; gap:.5rem;">
			<FileInput required validator accept="image/*" />
		</div>
		<div style="display:flex; flex-direction:column; gap:.5rem;">
			<FileInput error="The server refused this file" />
		</div>
	</Section>
