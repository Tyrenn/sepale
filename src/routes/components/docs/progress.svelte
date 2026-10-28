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
		namespaces: ["progress"],
		description:
			"How far along something is, on a line. The value is the element's own attribute, not a class.",
		classes: {
			'progress-segments':
				'Not a <progress>: a bar cut into parts, each as wide as its share of the whole (--segment). It stands for a split, not a progress.',
			'progress-segment': 'One part of a segmented bar; --segment is its share, --segment-color its colour.'
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Progress
	} from '$lib/index.js';
</script>

	<Section
		title="Default"
		svelte={`<Progress value={40} />`}
		html={`<progress class="progress" value="40" max="100"></progress>`}
	>
		<Progress value={40} />
	</Section>

	<Section
		title="Colors"
		svelte={`<Progress color="primary" value={60} />
<Progress color="secondary" value={60} />
<Progress color="success" value={60} />
<Progress color="error" value={60} />`}
		html={`<progress class="progress progress-primary" value="60" max="100"></progress>
<progress class="progress progress-secondary" value="60" max="100"></progress>
<progress class="progress progress-success" value="60" max="100"></progress>
<progress class="progress progress-error" value="60" max="100"></progress>`}
	>
		<Progress color="primary" value={60} />
		<Progress color="secondary" value={60} />
		<Progress color="success" value={60} />
		<Progress color="error" value={60} />
	</Section>

	<Section
		title="Segments"
		svelte={`<Progress segments={[
	{ value: 9, color: 'primary', label: 'Négociation' },
	{ value: 6, color: 'warning', label: 'Facturation' },
	{ value: 7, color: 'info', label: 'Livraison' }
]} />`}
		html={`<div class="progress progress-segments" role="img">
	<span class="progress-segment" style="--segment: 9; --segment-color: var(--color-primary)"></span>
	<span class="progress-segment" style="--segment: 6; --segment-color: var(--color-warning)"></span>
	<span class="progress-segment" style="--segment: 7; --segment-color: var(--color-info)"></span>
</div>`}
	>
		<Progress
			segments={[
				{ value: 9, color: 'primary', label: 'Négociation' },
				{ value: 6, color: 'warning', label: 'Facturation' },
				{ value: 7, color: 'info', label: 'Livraison' }
			]}
		/>
	</Section>
