<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['steps'],
		description:
			'Where the user is in a journey: one column per step, one bar per sub-step. Four states — current, visited, complete (declared by the app), unknown — and errors or warnings once a step is reached. It moves nothing: clicks go to onStep.',
		classes: {
			steps: 'The journey. Horizontal unless vertical.',
			'steps-heading': 'The line above the bars in compact mode.',
			'steps-list': 'The steps, in order.',
			'steps-item': 'One step; its data-state is current, visited, complete or unknown.',
			'steps-track': 'The marker and the bars of a step.',
			'steps-marker': 'The disc at the start of a step; a check once complete.',
			'steps-segment': 'One bar per sub-step; data-state and data-issue paint it.',
			'steps-label': "The step's label, and its issue icon.",
			'steps-issue': 'The warning or error icon.',
			'steps-sublabel': 'The current sub-step, under the current step.'
		},
		props: {
			Steps: [
				{ name: 'steps', type: 'Step[]', description: '{ id, label?, steps?, complete?, error?, warning? } — sub-steps one level deep.' },
				{ name: 'current', type: 'id', description: 'The current leaf: a sub-step, or a step without any.' },
				{ name: 'explored', type: 'id', description: 'The first leaf never reached; leaves before it are visited. Defaults to the one after current.' },
				{ name: 'clickable', type: 'boolean', default: 'true', description: 'Reached steps answer clicks.' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: 'No clicks at all.' },
				{ name: 'onStep', type: '(step) => void', description: "A reached leaf was clicked (a step's marker gives its first leaf)." },
				{ name: 'heading', type: 'Snippet<[{ step, parent, index, total }]>', description: 'The compact heading. Defaults to "label · sub-label   n/total".' },
				{ name: 'label', type: 'string', default: "'Progress'", description: "The nav's accessible name." }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Steps, type Step } from '$lib/index.js';

	const journey: Step[] = [
		{ id: 'basics', label: 'Basics', steps: [{ id: 1, label: 'Photos', complete: true }, { id: 2, label: 'Title', complete: true }] },
		{ id: 'price', label: 'Price', steps: [{ id: 3, label: 'Amount', warning: 'Check the currency' }, { id: 4, label: 'Discounts' }] },
		{ id: 5, label: 'Delivery' },
		{ id: 6, label: 'Publish' }
	];
	let current = $state<Step['id']>(4);
	let explored = $state<Step['id']>(5);
	const order = [1, 2, 3, 4, 5, 6];
	function go(s: Step) {
		current = s.id;
		const i = order.indexOf(s.id as number);
		if (i + 1 > order.indexOf(explored as number)) explored = order[i + 1] ?? 7;
	}
</script>

<Section
	title="With sub-steps"
	subtitle="Click a reached step. Basics is complete, Price is current, a warning sits on Amount."
	svelte={`<Steps steps={journey} {current} {explored} onStep={(s) => (current = s.id)} />`}
	html={`<nav class="steps" aria-label="Progress">
  <ol class="steps-list">
    <li class="steps-item" data-state="complete">
      <div class="steps-track">
        <button class="steps-marker">…</button>
        <button class="steps-segment" data-state="complete"><span></span></button>
      </div>
      <p class="steps-label"><span>Basics</span></p>
    </li>
    …
  </ol>
</nav>`}
>
	<div style="width:100%"><Steps steps={journey} {current} {explored} onStep={go} /></div>
</Section>

<Section
	title="Compact"
	svelte={`<Steps steps={journey} {current} compact />`}
	html={`<nav class="steps steps-compact">
  <div class="steps-heading"><span>Price · Discounts</span><span>2/4</span></div>
  …
</nav>`}
>
	<div style="width:100%; max-width:22em"><Steps steps={journey} {current} {explored} compact onStep={go} /></div>
</Section>

<Section
	title="Vertical"
	svelte={`<Steps steps={journey} {current} direction="vertical" color="success" />`}
	html={`<nav class="steps steps-vertical steps-success">…</nav>`}
>
	<div style="width:16em"><Steps steps={journey} {current} {explored} direction="vertical" color="success" onStep={go} /></div>
</Section>

<Section
	title="Without labels, not clickable"
	svelte={`<Steps steps={[{ id: 1 }, { id: 2 }, { id: 3 }]} current={2} clickable={false} />`}
	html={`<nav class="steps">…</nav>`}
>
	<div style="width:100%"><Steps steps={[{ id: 1, complete: true }, { id: 2 }, { id: 3 }]} current={2} clickable={false} /></div>
</Section>
