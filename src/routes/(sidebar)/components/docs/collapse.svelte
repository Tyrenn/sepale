<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['collapse'],
		description:
			'A panel that folds under its trigger. A button and a region, not <details>: the height animates and the state is the button\'s aria-expanded. Stack several in an Accordion.',
		classes: {
			collapse: 'The frame; two grid rows, the second folding from 0fr to 1fr.',
			'collapse-trigger': 'The button. Its aria-expanded is the state the stylesheet reads.',
			'collapse-panel': 'The region that folds; inert when closed.',
			'collapse-inner': 'The padding inside the panel (the panel itself must stay unpadded to fold to zero).'
		},
		props: {
			Collapse: [
				{ name: 'title', type: 'string', description: "The trigger's text." },
				{ name: 'trigger', type: 'Snippet', description: "The trigger's content, as markup." },
				{ name: 'open', type: 'boolean', default: 'false', description: 'Whether it starts open. Not bound.' },
				{ name: 'onopen', type: '(open: boolean) => void', description: 'After every change.' },
				{ name: 'show() / hide() / toggle()', type: 'methods', description: 'Drive it from outside, through bind:this.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Collapse } from '$lib/index.js';

	let remote: Collapse | undefined = $state();
	let log = $state('closed');
</script>

<Section
	title="Plain, arrow, plus"
	svelte={`<Collapse title="Plain">…</Collapse>
<Collapse title="Arrow" arrow open>…</Collapse>
<Collapse title="Plus" plus>…</Collapse>`}
	html={`<div class="collapse collapse-arrow">
  <button class="collapse-trigger" aria-expanded="true" aria-controls="p1">Arrow</button>
  <div class="collapse-panel" id="p1" role="region">
    <div class="collapse-inner">…</div>
  </div>
</div>`}
>
	<div style="display:grid; gap:.75em; width:100%">
		<Collapse title="Plain">Delivered in three to five working days.</Collapse>
		<Collapse title="Arrow" arrow open>Opens on load. Returns are free for thirty days.</Collapse>
		<Collapse title="Plus" plus>Gift wrapping is available at checkout.</Collapse>
	</div>
</Section>

<Section
	title="Ghost"
	svelte={`<Collapse title="Ghost" variant="ghost" arrow>…</Collapse>`}
	html={`<div class="collapse collapse-ghost collapse-arrow">…</div>`}
>
	<div style="display:grid; gap:.75em; width:100%">
		<Collapse title="No frame" variant="ghost" arrow>The trigger and the content sit on the page.</Collapse>
	</div>
</Section>

<Section
	title="Driven from outside"
	svelte={`<Collapse bind:this={remote} title="Remote" arrow onopen={(o) => (log = o ? 'open' : 'closed')}>…</Collapse>
<Button onclick={() => remote.toggle()}>Toggle</Button>`}
	html={`<!-- the wrapper's methods set aria-expanded -->`}
>
	<div style="display:grid; gap:.75em; width:100%">
		<div style="display:flex; gap:.5em; align-items:center">
			<Button size="sm" onclick={() => remote?.show()}>Show</Button>
			<Button size="sm" onclick={() => remote?.hide()}>Hide</Button>
			<Button size="sm" onclick={() => remote?.toggle()}>Toggle</Button>
			<span>onopen: {log}</span>
		</div>
		<Collapse bind:this={remote} title="Remote" arrow onopen={(o) => (log = o ? 'open' : 'closed')}>Opened by a button elsewhere.</Collapse>
	</div>
</Section>
