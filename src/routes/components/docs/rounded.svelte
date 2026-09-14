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

	const CORNERS: Record<string, string> = {
		t: 'the two top',
		b: 'the two bottom',
		l: 'the two start-side',
		r: 'the two end-side',
		tl: 'the top-start',
		tr: 'the top-end',
		br: 'the bottom-end',
		bl: 'the bottom-start'
	};

	const SHAPES: Record<string, string> = {
		box: 'box radius (cards, panels, menus)',
		field: 'field radius (inputs, buttons)',
		selector: 'selector radius (checkboxes, toggles)'
	};

	export const DOC: ComponentDoc = {
		namespaces: ['rounded'],
		utility: true,
		description:
			"Corner radii as classes, for markup the kit does not draw itself. Not a component — no structure, no state, no wrapper: it reads the family's three radius parameters and applies them, so a box you round by hand matches the boxes the family rounds.",
		classes: {
			/* Mechanical, so its prose is written the same way. */
			...Object.fromEntries(
				Object.entries(SHAPES).map(([shape, what]) => [`rounded-${shape}`, `All four corners, at the ${what}.`])
			),
			...Object.fromEntries(
				Object.entries(SHAPES).flatMap(([shape, what]) =>
					Object.entries(CORNERS).map(([side, which]) => [
						`rounded-${side}-${shape}`,
						`Only ${which} corner${side.length === 1 ? 's' : ''}, at the ${what}.`
					])
				)
			)
		},
		props: {}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
</script>

<Section
	title="The three radii"
	subtitle="A family exposes up to three: one for boxes, one for fields, one for selectors. These classes hand them to your own markup."
	html={`<div class="rounded-box">box</div>
<div class="rounded-field">field</div>
<div class="rounded-selector">selector</div>`}
>
	<div class="rd-row">
		<div class="rd-sample rounded-box">box</div>
		<div class="rd-sample rounded-field">field</div>
		<div class="rd-sample rounded-selector">selector</div>
	</div>
</Section>

<Section
	title="One side, one corner"
	subtitle="Each radius also comes per side and per corner, for a shape glued to something else."
	html={`<div class="rounded-t-box">top</div>
<div class="rounded-r-box">end side</div>
<div class="rounded-tl-box">top-start corner</div>`}
>
	<div class="rd-row">
		<div class="rd-sample rounded-t-box">t</div>
		<div class="rd-sample rounded-b-box">b</div>
		<div class="rd-sample rounded-l-box">l</div>
		<div class="rd-sample rounded-r-box">r</div>
		<div class="rd-sample rounded-tl-box">tl</div>
		<div class="rd-sample rounded-tr-box">tr</div>
		<div class="rd-sample rounded-br-box">br</div>
		<div class="rd-sample rounded-bl-box">bl</div>
	</div>
</Section>

<style>
	.rd-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
	}

	/* A plain box, so the only thing on show is the corner. */
	.rd-sample {
		display: grid;
		place-items: center;
		min-width: 5rem;
		padding: 1.1rem 0.9rem;
		font-size: 0.8rem;
		background: var(--color-surface-2);
		color: var(--color-on-surface);
		border: 1px solid color-mix(in oklab, var(--color-on-surface) 15%, transparent);
	}
</style>
