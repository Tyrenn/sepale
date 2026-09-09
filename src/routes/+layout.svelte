<script lang="ts">
	import './app.css';
	import { page } from '$app/state';
	import { tokensToInlineStyle } from '$lib/theme.js';
	import {
		playground,
		families,
		COMPONENTS,
		themesFor,
		categoryFor,
		selectFamily,
		selectTheme
	} from './playground.svelte.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let themes = $derived(themesFor(playground.family));

	// The active theme is applied to :root so the whole app chrome is styled
	// by it — the app is its own showcase. Edited tokens override the
	// family's fallbacks live.
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

<div class="shell">
	<!-- The sidebar lives in the layout: it is the same on the theme page and
	     on every component page. -->
	<aside class="side">
		<div class="side-head">
			<label class="side-select">
				<span>Family</span>
				<select
					class="select select-sm"
					value={playground.family}
					onchange={(e) => selectFamily(e.currentTarget.value)}
				>
					{#each families as f (f)}<option value={f}>{f} ({categoryFor(f)})</option>{/each}
				</select>
			</label>
			<label class="side-select">
				<span>Theme</span>
				<select
					class="select select-sm"
					value={playground.theme}
					onchange={(e) => selectTheme(e.currentTarget.value)}
				>
					{#each themes as t (t.name)}<option value={t.name}>{t.label}</option>{/each}
				</select>
			</label>
		</div>

		<nav class="side-nav">
			<ul class="side-list">
				<li>
					<a class="side-link" href="/" data-active={page.url.pathname === '/'}>Theme</a>
				</li>
			</ul>

			{#each COMPONENTS as group (group.group)}
				<p class="side-group">{group.group}</p>
				<ul class="side-list">
					{#each group.items as item (item.id)}
						<li>
							<a
								class="side-link"
								href="/components/{item.id}"
								data-active={page.url.pathname === `/components/${item.id}`}
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>
	</aside>

	{@render children()}
</div>
