<script lang="ts">
	// What every page shares: the header, the active family and its theme.
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource-variable/newsreader';
	import './app.css';
	import './site.css';
	import { asset } from '$app/paths';
	import { tokensToInlineStyle } from '$lib/theme.js';
	import Header from './Header.svelte';
	import { playground, stylesheetFor } from './playground.svelte.js';
	import { restoreFamilies } from './local-families.svelte.js';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	/* Families loaded on the "Create a family" page, on an earlier visit. */
	onMount(() => void restoreFamilies());

	// The active theme is applied to :root, where the family reads it. The
	// chrome reads none of it — it is daisy renamed to --ui-* (app-ui.css) —
	// and only the islands (.uu-island) take the theme's colour scheme.
	let rootStyle = $derived(
		`:root{--pv-scheme:${playground.scheme};${tokensToInlineStyle(playground.tokens)}}`
	);
</script>

<svelte:head>
	<!-- The optional reset, now its own file rather than part of base: the app
	     loads it the way a consumer would. -->
	<link rel="stylesheet" href={asset('/reset.css')} />
	<!-- Active style family (compiled by `pnpm run build:css`). The theme
	     <style> below comes after so its :root values always win. -->
	<link rel="stylesheet" href={stylesheetFor(playground.family)} />
	{@html `<style>${rootStyle}</style>`}
</svelte:head>

<!-- As tall as its content: the body is only as tall as the screen, and the
     sticky header would leave with it. -->
<div>
	<Header />
	{@render children()}
</div>
