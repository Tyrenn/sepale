<script lang="ts">
	import './app.css';
	import { page } from '$app/state';
	import { COMPONENTS } from './playground.svelte.js';
	import { PRESETS } from '$lib/theme/presets.js';
	import { generator, inlineStyle, selectPreset } from '$lib/theme/store.svelte.js';
	import type { Snippet } from 'svelte';

	/**
	 * The app's own chrome, built from the kit it ships — so a theme that gets
	 * its menu wrong is visible the moment you pick it.
	 *
	 * There is no family picker any more (ADR 0010). One stylesheet, one
	 * `kit.css`, and the whole look is the `<style>` block below: nothing here
	 * ever swaps a stylesheet, which is why the preview is instant and why
	 * what you download is what you saw.
	 */
	let { children }: { children: Snippet } = $props();

	/* Built in the script rather than the markup: the braces of a CSS block
	   inside a template literal read as the end of the expression. */
	let styleTag = $derived(
		`<style>${generator.paintApp ? ':root' : '.preview, .gallery'}{${inlineStyle()}}</style>`
	);
</script>

<svelte:head>
	<!-- The optional reset, its own file rather than part of the kit: the app
	     loads it the way a consumer would. -->
	<link rel="stylesheet" href="/reset.css" />
	<link rel="stylesheet" href="/kit.css" />
	{@html styleTag}
</svelte:head>

<div class="shell">
	<aside class="side">
		<div class="side-head">
			<label class="side-select">
				<span>Theme</span>
				<select
					class="select select-sm"
					value={generator.preset}
					onchange={(e) => selectPreset(e.currentTarget.value)}
				>
					{#each PRESETS as p (p.name)}<option value={p.name}>{p.label}</option>{/each}
				</select>
			</label>
			<label class="side-paint">
				<input type="checkbox" class="checkbox checkbox-xs" bind:checked={generator.paintApp} />
				<span>Paint this page</span>
			</label>
		</div>

		<nav class="side-nav">
			<ul class="menu menu-sm">
				<li><a href="/" class:menu-active={page.url.pathname === '/'}>Theme</a></li>
				<li>
					<a href="/description" class:menu-active={page.url.pathname === '/description'}>
						Variables
					</a>
				</li>

				{#each COMPONENTS as group (group.group)}
					<li class="menu-title">{group.group}</li>
					{#each group.items as item (item.id)}
						<li>
							<a
								href="/components/{item.id}"
								class:menu-active={page.url.pathname === `/components/${item.id}`}
							>
								{item.label}
							</a>
						</li>
					{/each}
				{/each}
			</ul>
		</nav>
	</aside>

	{@render children()}
</div>

<style>
	.side-paint {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.7rem;
		opacity: 0.75;
	}
</style>
