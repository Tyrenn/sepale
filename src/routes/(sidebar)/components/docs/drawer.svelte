<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['drawer'],
		description:
			'A panel sliding in from any side, in three states: hidden, peek (its last --drawer-peek in view) and open (all --drawer-size of it). As a dialog, open is modal; as a nav or an aside it never blocks the page — a collapsible menu.',
		classes: {
			drawer: 'The panel. Its state is the data-state attribute: hidden, peek or open. Left by default.',
			'drawer-content': 'The content; scrolls.',
			'drawer-handle': 'A grip on the inner edge that toggles open and the rest state.'
		},
		props: {
			Drawer: [
				{ name: 'as', type: "'div' | 'aside' | 'nav' | 'dialog'", default: "'div'", description: 'The element. dialog makes open modal; peek stays non-modal.' },
				{ name: 'state', type: "'hidden' | 'peek' | 'open'", default: "'hidden'", description: 'Where it starts. Read once.' },
				{ name: 'rest', type: "'hidden' | 'peek'", description: 'Where Escape and the backdrop send it. Defaults to peek if it starts peeking.' },
				{ name: 'onstate', type: '(state) => void', description: 'After every change of state.' },
				{ name: 'handle', type: 'boolean', default: 'false', description: 'Draw the grip.' },
				{ name: 'open() / peek() / hide() / toggle() / getState()', type: 'methods', description: 'Drive it, through bind:this.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, Drawer, Menu } from '$lib/index.js';

	let nav: Drawer | undefined = $state();
	let bottom: Drawer | undefined = $state();
	let modal: Drawer | undefined = $state();
	let navState = $state('peek');

	const stage = 'position:relative; width:100%; height:20em; overflow:hidden; border-radius:.5em; outline:1px dashed color-mix(in oklab, currentColor 25%, transparent); --drawer-position:absolute';
</script>

<Section
	title="Peeking menu"
	subtitle="A nav that peeks: click it, or its grip, to open; Escape sends it back."
	svelte={`<Drawer bind:this={nav} as="nav" state="peek" handle onstate={(s) => (navState = s)}
  style="--drawer-size: 14em; --drawer-peek: 3.5em">
  <Menu items={…} />
</Drawer>`}
	html={`<nav class="drawer" data-state="peek" style="--drawer-size:14em; --drawer-peek:3.5em">
  <div class="drawer-content">…</div>
  <button class="drawer-handle" aria-label="Toggle panel" aria-expanded="false"></button>
</nav>`}
>
	<div style={stage}>
		<Drawer bind:this={nav} as="nav" state="peek" handle onstate={(s) => (navState = s)} style="--drawer-size: 14em; --drawer-peek: 3.5em">
			<Menu items={[{ label: 'Home' }, { label: 'Projects' }, { label: 'Settings' }]} />
		</Drawer>
		<div style="margin-left:5em; padding:1em; display:flex; gap:.5em; flex-wrap:wrap; align-items:center">
			<Button size="sm" onclick={() => nav?.open()}>open()</Button>
			<Button size="sm" onclick={() => nav?.peek()}>peek()</Button>
			<Button size="sm" onclick={() => nav?.hide()}>hide()</Button>
			<span>state: {navState}</span>
		</div>
	</div>
</Section>

<Section
	title="Bottom sheet"
	svelte={`<Drawer bind:this={bottom} side="bottom" style="--drawer-size: 12em">…</Drawer>`}
	html={`<div class="drawer drawer-bottom" data-state="hidden">…</div>`}
>
	<div style={stage}>
		<div style="padding:1em"><Button size="sm" onclick={() => bottom?.toggle()}>Toggle the sheet</Button></div>
		<Drawer bind:this={bottom} side="bottom" style="--drawer-size: 12em">
			<p style="margin:0">A sheet from the bottom edge. Escape closes it.</p>
		</Drawer>
	</div>
</Section>

<Section
	title="Modal, from the right"
	subtitle="as=dialog: open is modal, with the backdrop; a click on the shade closes it."
	svelte={`<Drawer bind:this={modal} as="dialog" side="right">…</Drawer>
<Button onclick={() => modal.open()}>Open</Button>`}
	html={`<dialog class="drawer drawer-right" data-state="open">…</dialog>`}
>
	<Button onclick={() => modal?.open()}>Open the panel</Button>
	<Drawer bind:this={modal} as="dialog" side="right" style="--drawer-position: fixed">
		<div style="display:grid; gap:1em">
			<strong>Filters</strong>
			<p style="margin:0">The page behind is inert while this is open.</p>
			<Button onclick={() => modal?.hide()}>Done</Button>
		</div>
	</Drawer>
</Section>
