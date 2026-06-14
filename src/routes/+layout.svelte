<script lang="ts">
	import './app.css';
	import { tokensToInlineStyle } from '$lib/theme.js';
	import { playground } from './playground.svelte.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// The active theme is applied to :root so the whole app chrome (sidebar,
	// nav) is styled by it, like the original example pages. Edited tokens
	// override the family's fallbacks live.
	let rootStyle = $derived(
		`:root{color-scheme:${playground.scheme};${tokensToInlineStyle(playground.tokens)}}`
	);
</script>

<svelte:head>
	<!-- Active style family (compiled by `npm run build:css`). The theme
	     <style> below comes after so its :root values always win. -->
	<link rel="stylesheet" href={`/families/${playground.family}.css`} />
	{@html `<style>${rootStyle}</style>`}
</svelte:head>

{@render children()}
