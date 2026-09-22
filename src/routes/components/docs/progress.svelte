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
		namespaces: ["progress"],
		description:
			"How far along something is, on a line. The value is the element's own attribute, not a class.",
		classes: {},
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
