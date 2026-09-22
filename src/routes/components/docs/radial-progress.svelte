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
		namespaces: ["radial-progress"],
		description:
			"The same statement as progress, drawn as a ring, for when the number itself is the point.",
		classes: {},
		props: {
			RadialProgress: [
				{
					name: "value",
					type: "number",
					default: "0",
					description: "0–100."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		RadialProgress
	} from '$lib/index.js';
</script>

	<Section
		title="Values"
		svelte={`<RadialProgress value={25} />
<RadialProgress value={50} />
<RadialProgress value={75} />
<RadialProgress value={100} />`}
		html={`<div class="radial-progress" style="--value:25">25%</div>
<div class="radial-progress" style="--value:50">50%</div>
<div class="radial-progress" style="--value:75">75%</div>
<div class="radial-progress" style="--value:100">100%</div>`}
	>
		<RadialProgress value={25} />
		<RadialProgress value={50} />
		<RadialProgress value={75} />
		<RadialProgress value={100} />
	</Section>

	<Section
		title="Sizes & colors"
		svelte={`<RadialProgress size="sm" value={70} style="color:var(--color-primary)" />
<RadialProgress value={70} style="color:var(--color-accent)" />
<RadialProgress size="lg" value={70} style="color:var(--color-success)" />`}
		html={`<div class="radial-progress radial-progress-sm" style="--value:70; color:var(--color-primary)">70%</div>
<div class="radial-progress" style="--value:70; color:var(--color-accent)">70%</div>
<div class="radial-progress radial-progress-lg" style="--value:70; color:var(--color-success)">70%</div>`}
	>
		<RadialProgress size="sm" value={70} style="color:var(--color-primary)" />
		<RadialProgress value={70} style="color:var(--color-accent)" />
		<RadialProgress size="lg" value={70} style="color:var(--color-success)" />
	</Section>
