<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: [],
		description:
			"Its content becomes a place to drop files on. It draws nothing of its own: the content is the look, `over` says when files are dragged above it, `open()` opens the dialog. A hidden file input holds the files, so a form submits and validates them.",
		classes: {},
		props: {
			FileDropzone: [
				{ name: 'accept', type: 'string', description: 'As on a file input: `image/*`, `.pdf`… A dropped file outside it is refused.' },
				{ name: 'multiple', type: 'boolean', default: 'false', description: 'Several files at once; otherwise the first one only.' },
				{ name: 'maxSize', type: 'number', description: 'Largest file, in bytes.' },
				{ name: 'name / required / id', type: '', description: 'On the hidden file input, for a form.' },
				{ name: 'disabled', type: 'boolean', default: 'false', description: 'Neither drops nor the dialog.' },
				{ name: 'clickable', type: 'boolean', default: 'false', description: 'A click anywhere on the zone opens the dialog.' },
				{ name: 'over', type: 'boolean', description: 'Bindable: files are dragged above the zone, for a look drawn outside it.' },
				{ name: 'onFiles', type: '(accepted, rejected) => void', description: 'After a drop or a pick.' },
				{ name: 'children', type: 'Snippet<[{ over, open }]>', description: 'The content: whether files are dragged above it, and how to open the dialog.' },
				{ name: 'open()', type: 'method', description: 'Open the file dialog from outside.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Button, FileDropzone } from '$lib/index.js';

	let names = $state<string[]>([]);
</script>

<Section
	title="Any content"
	svelte={`<FileDropzone accept="image/*" multiple onFiles={(files) => …}>
  {#snippet children({ over, open })}
    <div class="card" class:over>
      Drop pictures here, or <Button onclick={open}>browse</Button>
    </div>
  {/snippet}
</FileDropzone>`}
	html={`<!-- the content, and a hidden <input type="file"> -->`}
>
	<FileDropzone accept="image/*" multiple onFiles={(files) => (names = files.map((f) => f.name))}>
		{#snippet children({ over, open })}
			<div class="card card-border" style:padding="2em" style:outline={over ? '2px dashed currentColor' : 'none'}>
				Drop pictures here, or <Button size="sm" type="button" onclick={open}>browse</Button>
			</div>
		{/snippet}
	</FileDropzone>
	<span>{names.join(', ') || '—'}</span>
</Section>
