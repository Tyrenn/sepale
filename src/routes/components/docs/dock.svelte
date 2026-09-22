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
		namespaces: ["dock"],
		description:
			"A bar pinned to the bottom edge, for the two to five places you go most. Its height answers to the screen rather than to its content — one of the few absolute values in the kit.",
		classes: {
			"dock-label": "The text under a dock icon.",
			"dock-active": "The destination you are on."
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Dock
	} from '$lib/index.js';
</script>

	<Section
		title="Dock"
		svelte={`<Dock>
	<button><span class="dock-label">Home</span></button>
	<button class="dock-active"><span class="dock-label">Search</span></button>
	<button><span class="dock-label">Mail</span></button>
</Dock>`}
		html={`<nav class="dock">
	<button><span class="dock-label">Home</span></button>
	<button class="dock-active"><span class="dock-label">Search</span></button>
	<button><span class="dock-label">Mail</span></button>
</nav>`}
	>
		<div style="width:24rem; position:relative; height:5rem;">
			<Dock style="position:absolute;">
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" /></svg>
					<span class="dock-label">Home</span>
				</button>
				<button class="dock-active">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" /></svg>
					<span class="dock-label">Search</span>
				</button>
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" /></svg>
					<span class="dock-label">Mail</span>
				</button>
			</Dock>
		</div>
	</Section>
