<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import {
		playground,
		families,
		COMPONENTS,
		themesFor,
		categoryFor,
		drawAtRandom,
		selectFamily,
		selectTheme
	} from '../playground.svelte.js';
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	/* The page scrolls inside .content, not the window, so SvelteKit's own
	   scroll reset does not reach it: a new page starts at its top. */
	afterNavigate(({ from, to }) => {
		if (from?.url.pathname === to?.url.pathname) return;
		document.querySelector('.content')?.scrollTo({ top: 0 });
	});

	let themes = $derived(themesFor(playground.family));

	/* Client-side only: drawn during SSR, the server and the browser would
	   disagree. */
	onMount(drawAtRandom);

	/* The whole menu folds to a rail too, remembered across visits. */
	let collapsed = $state(false);
	$effect(() => {
		try {
			collapsed = localStorage.getItem('uu-nav-collapsed') === '1';
		} catch {}
	});
	$effect(() => {
		try {
			localStorage.setItem('uu-nav-collapsed', collapsed ? '1' : '0');
		} catch {}
	});

	/* Groups of the nav fold: open until folded by hand. */
	let folded = $state<Record<string, boolean>>({});
</script>

<svelte:head>
	<!-- The chrome: daisy in a sober theme, renamed to .ui-* / --ui-* so it
	     cannot meet the family below (scripts/build-css.mjs). -->
	<link rel="stylesheet" href={asset('/app-ui.css')} />
</svelte:head>

<div class="shell app-ui">
	<!-- The sidebar lives in the layout: it is the same on the theme page and
	     on every component page. -->
	<!-- The kit's own Sidebar, in the chrome's ui- space: it folds to a rail. -->
	<aside class="ui-sidebar side" class:ui-sidebar-collapsed={collapsed}>
		<div class="ui-sidebar-head">
			<a class="side-brand ui-sidebar-keep" href={resolve('/')}><span class="side-brand-mark">S</span><span class="side-brand-name">Sépale</span></a>
			<button
				type="button"
				class="ui-sidebar-toggle"
				aria-expanded={!collapsed}
				aria-label={collapsed ? 'Expand the menu' : 'Collapse the menu'}
				title={collapsed ? 'Expand the menu' : 'Collapse the menu'}
				onclick={() => (collapsed = !collapsed)}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16M15.5 10l-2 2 2 2" /></svg>
			</button>
		</div>
		<div class="ui-sidebar-body side-body" inert={collapsed}>
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
					<a href={resolve('/description')} class:ui-menu-active={page.url.pathname === resolve('/description')}>
						Description
					</a>
				</li>
				<li><a href={resolve('/theme')} class:ui-menu-active={page.url.pathname === resolve('/theme')}>Theme</a></li>

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
								{@const href = resolve(`/components/${item.id}`)}
								<li>
									<a {href} class:ui-menu-active={page.url.pathname === href}>
										{item.label}
									</a>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</nav>
		</div>
	</aside>

	{@render children()}
</div>
