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
