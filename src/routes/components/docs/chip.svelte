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
		namespaces: ["chip"],
		description:
			"A small standalone token: a status, a tag, a removable value. Distinct from badge, which attaches to something else.",
		classes: {},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Chip
	} from '$lib/index.js';
</script>

	<Section
		title="Sizes"
		svelte={`<Chip size="xs">Xsmall</Chip>
<Chip size="sm">Small</Chip>
<Chip>Medium</Chip>
<Chip size="lg">Large</Chip>`}
		html={`<span class="chip chip-xs">Xsmall</span>
<span class="chip chip-sm">Small</span>
<span class="chip">Medium</span>
<span class="chip chip-lg">Large</span>`}
	>
		<Chip size="xs">Xsmall</Chip>
		<Chip size="sm">Small</Chip>
		<Chip>Medium</Chip>
		<Chip size="lg">Large</Chip>
	</Section>

	<Section
		title="Colors"
		svelte={`<Chip color="primary">Primary</Chip>
<Chip color="secondary">Secondary</Chip>
<Chip color="accent">Accent</Chip>
<Chip color="info">Info</Chip>
<Chip color="success">Success</Chip>
<Chip color="warning">Warning</Chip>
<Chip color="error">Error</Chip>`}
		html={`<span class="chip chip-primary">Primary</span>
<span class="chip chip-secondary">Secondary</span>
<span class="chip chip-accent">Accent</span>
<span class="chip chip-info">Info</span>
<span class="chip chip-success">Success</span>
<span class="chip chip-warning">Warning</span>
<span class="chip chip-error">Error</span>`}
	>
		<Chip color="primary">Primary</Chip>
		<Chip color="secondary">Secondary</Chip>
		<Chip color="accent">Accent</Chip>
		<Chip color="info">Info</Chip>
		<Chip color="success">Success</Chip>
		<Chip color="warning">Warning</Chip>
		<Chip color="error">Error</Chip>
	</Section>

	<Section
		title="Variants"
		svelte={`<Chip variant="soft" color="primary">Soft</Chip>
<Chip variant="outline" color="primary">Outline</Chip>
<Chip variant="dash" color="primary">Dash</Chip>
<Chip variant="ghost">Ghost</Chip>`}
		html={`<span class="chip chip-soft chip-primary">Soft</span>
<span class="chip chip-outline chip-primary">Outline</span>
<span class="chip chip-dash chip-primary">Dash</span>
<span class="chip chip-ghost">Ghost</span>`}
	>
		<Chip variant="soft" color="primary">Soft</Chip>
		<Chip variant="outline" color="primary">Outline</Chip>
		<Chip variant="dash" color="primary">Dash</Chip>
		<Chip variant="ghost">Ghost</Chip>
	</Section>

