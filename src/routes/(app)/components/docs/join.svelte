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
		namespaces: ["join"],
		description:
			"Glue two or more controls into one object: the inner corners go square, the outer ones keep the family's radius. It reaches into its children through their own radius slots.",
		classes: {
			"join-item": "A child of the join that is not one of the kit's components, and therefore has to be told."
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Button,
		Input,
		Join
	} from '$lib/index.js';
</script>

	<Section
		title="Buttons"
		svelte={`<Join>
	<Button class="join-item">Left</Button>
	<Button class="join-item" color="primary">Center</Button>
	<Button class="join-item">Right</Button>
</Join>`}
		html={`<div class="join">
	<button class="btn join-item">Left</button>
	<button class="btn join-item btn-primary">Center</button>
	<button class="btn join-item">Right</button>
</div>`}
	>
		<Join>
			<Button class="join-item">Left</Button>
			<Button class="join-item" color="primary">Center</Button>
			<Button class="join-item">Right</Button>
		</Join>
	</Section>

	<Section
		title="Input + button"
		svelte={`<Join>
	<Input class="join-item" placeholder="Search…" />
	<Button class="join-item" color="primary">Go</Button>
</Join>`}
		html={`<div class="join">
	<input type="text" class="input join-item" placeholder="Search…" />
	<button class="btn btn-primary join-item">Go</button>
</div>`}
	>
		<Join>
			<Input class="join-item" placeholder="Search…" />
			<Button class="join-item" color="primary">Go</Button>
		</Join>
	</Section>

	<Section
		title="Vertical"
		svelte={`<Join direction="vertical">
	<Button class="join-item">Top</Button>
	<Button class="join-item" color="primary">Middle</Button>
	<Button class="join-item">Bottom</Button>
</Join>`}
		html={`<div class="join join-vertical">
	<button class="btn join-item">Top</button>
	<button class="btn join-item btn-primary">Middle</button>
	<button class="btn join-item">Bottom</button>
</div>`}
	>
		<Join direction="vertical">
			<Button class="join-item">Top</Button>
			<Button class="join-item" color="primary">Middle</Button>
			<Button class="join-item">Bottom</Button>
		</Join>
	</Section>
