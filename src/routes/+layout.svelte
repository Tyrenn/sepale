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

	/* Groups of the nav fold: open until folded by hand. */
	let folded = $state<Record<string, boolean>>({});

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
	<link rel="stylesheet" href="/reset.css" />
	<!-- The chrome: daisy in a sober theme, renamed to .ui-* / --ui-* so it
	     cannot meet the family below (scripts/build-css.mjs). -->
	<link rel="stylesheet" href="/app-ui.css" />
	<!-- Active style family (compiled by `npm run build:css`). The theme
	     <style> below comes after so its :root values always win. -->
	<link rel="stylesheet" href={`/families/${playground.family}.css`} />
	{@html `<style>${rootStyle}</style>`}
</svelte:head>

<div class="shell app-ui">
	<!-- The sidebar lives in the layout: it is the same on the theme page and
	     on every component page. -->
	<aside class="side">
		<div class="side-head">
			<label class="side-select">
				<span>Family</span>
				<select
					class="ui-select ui-select-sm"
					value={playground.family}
					onchange={(e) => selectFamily(e.currentTarget.value)}
				>
					{#each families as f (f)}<option value={f}>{f} ({categoryFor(f)})</option>{/each}
				</select>
			</label>
			<label class="side-select">
				<span>Theme</span>
				<select
					class="ui-select ui-select-sm"
					value={playground.theme}
					onchange={(e) => selectTheme(e.currentTarget.value)}
				>
					{#each themes as t (t.name)}<option value={t.name}>{t.label}</option>{/each}
				</select>
			</label>
		</div>

		<!-- The app's own navigation: a daisy .menu, in the chrome's ui- space. -->
		<nav class="side-nav">
			<ul class="ui-menu ui-menu-sm">
				<li class="ui-menu-title side-group-title">Family</li>
				<li>
					<a href="/description" class:ui-menu-active={page.url.pathname === '/description'}>
						Description
					</a>
				</li>
				<li><a href="/" class:ui-menu-active={page.url.pathname === '/'}>Theme</a></li>

				<!-- Each group is a sub-menu of the family's own: a heading that
				     folds, with its pages pushed in under it. -->
				{#each COMPONENTS as group (group.group)}
					{@const open = !folded[group.group]}
					<li class="side-group">
						<button
							type="button"
							class="ui-menu-toggle"
							aria-expanded={open}
							onclick={() => (folded[group.group] = open)}
						>
							<span>{group.group}</span>
							<span class="side-count">{group.items.length}</span>
						</button>
						<ul class="ui-menu-sub" class:ui-menu-sub-closed={!open}>
							{#each group.items as item (item.id)}
								<li>
									<a
										href="/components/{item.id}"
										class:ui-menu-active={page.url.pathname === `/components/${item.id}`}
									>
										{item.label}
									</a>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	{@render children()}
</div>
