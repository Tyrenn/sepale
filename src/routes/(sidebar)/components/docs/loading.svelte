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
		namespaces: ["loading"],
		description:
			"Work is in progress and there is no percentage to show. If there is one, that is progress.",
		classes: {},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Loading
	} from '$lib/index.js';
</script>

	<Section
		title="Types"
		svelte={`<Loading variant="spinner" />
<Loading variant="dots" />
<Loading variant="ring" />
<Loading variant="ball" />
<Loading variant="bars" />
<Loading variant="infinity" />`}
		html={`<span class="loading loading-spinner"></span>
<span class="loading loading-dots"></span>
<span class="loading loading-ring"></span>
<span class="loading loading-ball"></span>
<span class="loading loading-bars"></span>
<span class="loading loading-infinity"></span>`}
	>
		<Loading variant="spinner" />
		<Loading variant="dots" />
		<Loading variant="ring" />
		<Loading variant="ball" />
		<Loading variant="bars" />
		<Loading variant="infinity" />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Loading size="xs" />
<Loading size="sm" />
<Loading />
<Loading size="lg" />`}
		html={`<span class="loading loading-spinner loading-xs"></span>
<span class="loading loading-spinner loading-sm"></span>
<span class="loading loading-spinner"></span>
<span class="loading loading-spinner loading-lg"></span>`}
	>
		<Loading size="xs" />
		<Loading size="sm" />
		<Loading />
		<Loading size="lg" />
	</Section>
