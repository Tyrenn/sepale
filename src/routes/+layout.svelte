<script lang="ts">
	import './app.css';
	import { defaultTheme, serializeTheme } from '$lib/theme.js';
	import { playground } from './playground.svelte.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Default theme on :root so the app chrome renders; the preview area
	// overrides these per-token via an inline style on its wrapper.
	const rootTheme = serializeTheme(defaultTheme);
</script>

<svelte:head>
	<!-- Active style family (compiled by `npm run build:css`). Theme loads
	     after the family so its :root colors/radii win. -->
	<link rel="stylesheet" href={`/families/${playground.family}.css`} />
	{@html `<style>${rootTheme}</style>`}
</svelte:head>

{@render children()}
