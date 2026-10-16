<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['tooltip'],
		description:
			'A short hint beside its trigger, shown on hover and on keyboard focus. Pure CSS: it does not reposition itself to stay on screen, so pick the side that has room.',
		classes: {
			tooltip: 'Wraps the trigger; the bubble shows on :hover and :focus-within.',
			'tooltip-content': 'The bubble, with its arrow.'
		},
		props: {
			Tooltip: [
				{ name: 'text', type: 'string', description: 'The hint, as text.' },
				{ name: 'tip', type: 'Snippet', description: 'The hint, as markup. Wins over text.' },
				{ name: 'children', type: 'Snippet', description: 'The trigger. Its first focusable element gets aria-describedby.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Tooltip } from '$lib/index.js';
</script>

<Section
	title="Sides"
	subtitle="Hover or tab onto a button."
	svelte={`<Tooltip text="On top" side="top"><Button>Top</Button></Tooltip>
<Tooltip text="On the right" side="right"><Button>Right</Button></Tooltip>
<Tooltip text="Below" side="bottom"><Button>Bottom</Button></Tooltip>
<Tooltip text="On the left" side="left"><Button>Left</Button></Tooltip>`}
	html={`<span class="tooltip tooltip-top">
  <button class="btn" aria-describedby="tip-1">Top</button>
  <span class="tooltip-content" role="tooltip" id="tip-1">On top</span>
</span>`}
>
	<div style="display:flex; gap:4em; padding:3em 6em; flex-wrap:wrap; justify-content:center">
		<Tooltip text="On top" side="top"><Button>Top</Button></Tooltip>
		<Tooltip text="On the right" side="right"><Button>Right</Button></Tooltip>
		<Tooltip text="Below" side="bottom"><Button>Bottom</Button></Tooltip>
		<Tooltip text="On the left" side="left"><Button>Left</Button></Tooltip>
	</div>
</Section>

<Section
	title="Open and colored"
	svelte={`<Tooltip text="Always shown" open><Button>Open</Button></Tooltip>
<Tooltip text="Saved" color="success" open><Button>Success</Button></Tooltip>
<Tooltip text="Careful" color="error" side="bottom" open><Button>Error</Button></Tooltip>`}
	html={`<span class="tooltip tooltip-open tooltip-success">…</span>`}
>
	<div style="display:flex; gap:3em; padding:3em 2em; flex-wrap:wrap; justify-content:center">
		<Tooltip text="Always shown" open><Button>Open</Button></Tooltip>
		<Tooltip text="Saved" color="success" open><Button>Success</Button></Tooltip>
		<Tooltip text="Careful" color="error" side="bottom" open><Button>Error</Button></Tooltip>
	</div>
</Section>

<Section
	title="Float"
	subtitle="Inside a box that clips. Where anchor positioning exists, float lets the bubble out and flips it; elsewhere it is a plain tooltip."
	svelte={`<div style="overflow:hidden">
  <Tooltip text="I escape the box" float><Button>Float</Button></Tooltip>
</div>`}
	html={`<span class="tooltip tooltip-float" style="--tooltip-anchor: --tip-1">…</span>`}
>
	<div style="display:flex; gap:2em; padding:.75em; overflow:hidden; outline:1px dashed currentColor">
		<Tooltip text="Clipped by the box"><Button>Plain</Button></Tooltip>
		<Tooltip text="I escape the box" float><Button>Float</Button></Tooltip>
	</div>
</Section>
