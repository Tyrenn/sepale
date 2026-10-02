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
		namespaces: ["breadcrumbs"],
		description:
			"Where you are in a hierarchy, and the way back up. Text-natured: it draws no frame, so --scale leaves it alone.",
		classes: {},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Breadcrumbs
	} from '$lib/index.js';
</script>

	<Section
		title="Breadcrumbs"
		svelte={`<Breadcrumbs>
	<li><a href="#demo">Home</a></li>
	<li><a href="#demo">Documents</a></li>
	<li>Add Document</li>
</Breadcrumbs>`}
		html={`<nav class="breadcrumbs">
	<ul>
		<li><a href="#demo">Home</a></li>
		<li><a href="#demo">Documents</a></li>
		<li>Add Document</li>
	</ul>
</nav>`}
	>
		<Breadcrumbs>
			<li><a href="#demo">Home</a></li>
			<li><a href="#demo">Documents</a></li>
			<li>Add Document</li>
		</Breadcrumbs>
	</Section>
