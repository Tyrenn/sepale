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
		namespaces: ["btn"],
		description:
			"The thing you press. Sized from its own font-size, so a button in a larger context grows without a breakpoint.",
		classes: {
			"btn-active": "Draw it as the current choice without it being pressed.",
			"btn-disabled": "For an <a>, which cannot carry the disabled attribute.",
			"btn-ripple": "Arm the press wave; the wave itself is drawn by the component.",
			"btn-ripple-wave": "One wave, positioned at the press point and removed when its animation ends.",
			"btn-block": "Full width of its container.",
			"btn-wide": "Wider than its content, without filling the row."
		},
		props: {
			Button: [
				{
					name: "active",
					type: "boolean",
					default: "false",
					description: "Draw the button as if it were the current choice."
				},
				{
					name: "ripple",
					type: "boolean",
					default: "false",
					description: "Expanding wave from the pointer on press."
				},
				{
					name: "href",
					type: "string",
					description: "Renders an <a> instead of a <button>."
				},
				{
					name: "onpointerdown",
					type: "(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) => void",
					description: "Ours: the element may be a <button> or an <a>, so the inherited overloaded signature cannot type it — and the ripple rides on it."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		Button
	} from '$lib/index.js';
</script>

	<Section
		title="Button sizes"
		subtitle="Buttons scale intrinsically with font-size — no breakpoints."
		svelte={`<Button size="xs">Xsmall</Button>
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Xlarge</Button>`}
		html={`<button class="btn btn-xs">Xsmall</button>
<button class="btn btn-sm">Small</button>
<button class="btn">Medium</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-xl">Xlarge</button>`}
	>
		<Button size="xs">Xsmall</Button>
		<Button size="sm">Small</Button>
		<Button>Medium</Button>
		<Button size="lg">Large</Button>
		<Button size="xl">Xlarge</Button>
	</Section>

	<Section
		title="Button colors"
		svelte={`<Button color="neutral">Neutral</Button>
<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="accent">Accent</Button>
<Button color="info">Info</Button>
<Button color="success">Success</Button>
<Button color="warning">Warning</Button>
<Button color="error">Error</Button>`}
		html={`<button class="btn btn-neutral">Neutral</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-error">Error</button>`}
	>
		<Button color="neutral">Neutral</Button>
		<Button color="primary">Primary</Button>
		<Button color="secondary">Secondary</Button>
		<Button color="accent">Accent</Button>
		<Button color="info">Info</Button>
		<Button color="success">Success</Button>
		<Button color="warning">Warning</Button>
		<Button color="error">Error</Button>
	</Section>

	<Section
		title="Button variants"
		svelte={`<Button variant="outline" color="primary">Outline</Button>
<Button variant="dash" color="primary">Dash</Button>
<Button variant="soft" color="primary">Soft</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
		html={`<button class="btn btn-outline btn-primary">Outline</button>
<button class="btn btn-dash btn-primary">Dash</button>
<button class="btn btn-soft btn-primary">Soft</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>`}
	>
		<Button variant="outline" color="primary">Outline</Button>
		<Button variant="dash" color="primary">Dash</Button>
		<Button variant="soft" color="primary">Soft</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="link">Link</Button>
	</Section>

	<Section
		title="Ripple"
		subtitle="Opt-in Material-style ripple — an expanding wave from the press point."
		svelte={`<Button ripple>Ripple</Button>
<Button ripple color="primary">Primary</Button>
<Button ripple color="accent" size="lg">Large</Button>
<Button ripple variant="soft" color="secondary">Soft</Button>`}
		html={`<!-- .btn-ripple clips the wave; the <Button ripple> component injects
     a .btn-ripple-wave <span> at the press point (see button.css). -->
<button class="btn btn-ripple">Ripple</button>`}
	>
		<Button ripple>Ripple</Button>
		<Button ripple color="primary">Primary</Button>
		<Button ripple color="accent" size="lg">Large</Button>
		<Button ripple variant="soft" color="secondary">Soft</Button>
	</Section>

	<Section
		title="States & widths"
		svelte={`<Button active color="primary">Active</Button>
<Button width="wide">Wide</Button>
<Button disabled>Disabled</Button>`}
		html={`<button class="btn btn-active btn-primary">Active</button>
<button class="btn btn-wide">Wide</button>
<button class="btn" disabled>Disabled</button>`}
	>
		<Button active color="primary">Active</Button>
		<Button width="wide">Wide</Button>
		<Button disabled>Disabled</Button>
	</Section>

	<Section
		title="Classic and surface"
		subtitle="Two weights Radix separates and soft and outline do not: a raised button, and a flat one drawn on a surface. They came from one look and belong to every theme now."
		svelte={`<Button variant="classic" color="primary">Classic</Button>
<Button variant="surface" color="primary">Surface</Button>`}
		html={`<button class="btn btn-classic btn-primary">Classic</button>
<button class="btn btn-surface btn-primary">Surface</button>`}
	>
		<Button variant="classic" color="primary">Classic</Button>
		<Button variant="surface" color="primary">Surface</Button>
		<Button variant="classic">Classic</Button>
		<Button variant="surface">Surface</Button>
	</Section>

	<Section
		title="Moving the shadow"
		subtitle="Where the cast shadow sits, or whether it sits at all. Its own axis, so it combines with every other one — and it costs nothing under a theme that casts no shadow, since both classes only move offsets that are already zero."
		svelte={`<Button color="primary">Default</Button>
<Button color="primary" shadow="reverse">Reverse</Button>
<Button color="primary" shadow="none">None</Button>`}
		html={`<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-reverse">Reverse</button>
<button class="btn btn-primary btn-noshadow">None</button>`}
	>
		<Button color="primary">Default</Button>
		<Button color="primary" shadow="reverse">Reverse</Button>
		<Button color="primary" shadow="none">None</Button>
	</Section>
