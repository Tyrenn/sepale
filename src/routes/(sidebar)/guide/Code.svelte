<script lang="ts">
	// A code sample of the guide, lightly coloured.
	import { highlight } from '../../highlight.js';

	let { code, label }: { code: string; label?: string } = $props();
</script>

<figure class="guide-code">
	{#if label}<figcaption>{label}</figcaption>{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped by highlight() -->
	<pre>{@html highlight(code)}</pre>
</figure>
