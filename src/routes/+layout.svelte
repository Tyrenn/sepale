<script lang="ts">
	// What every page shares: the active family and its theme, because both the
	// presentation pages and the app show the kit in it. The app's chrome is in
	// (app)/+layout.svelte, the presentation's in (site)/+layout.svelte.
	import './app.css';
	import { asset } from '$app/paths';
	import { tokensToInlineStyle } from '$lib/theme.js';
	import { playground } from './playground.svelte.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

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
	<link rel="stylesheet" href={asset(`/families/${playground.family}.css`)} />
	{@html `<style>${rootStyle}</style>`}
</svelte:head>

{@render children()}
