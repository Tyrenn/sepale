<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import {
		playground,
		allFamilies,
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

	/* The family picker's last option is not a family: it opens the page that
	   makes one, and the picker stays on the family on show. */
	const NEW_FAMILY = '__new';
	function pickFamily(select: HTMLSelectElement) {
		if (select.value !== NEW_FAMILY) return selectFamily(select.value);
		select.value = playground.family;
		void goto(resolve('/new-family'));
	}

	function newFamily() {
		rail = null;
		void goto(resolve('/new-family'));
	}

	/* The folded rail's pickers: which list is open, and where — beside the
	   rail, level with the icon that opened it. */
	let rail = $state<{ which: 'family' | 'theme'; x: number; y: number } | null>(null);
	function toggleRail(which: 'family' | 'theme', trigger: HTMLElement) {
		if (rail?.which === which) {
			rail = null;
			return;
		}
		const box = trigger.getBoundingClientRect();
		const side = trigger.closest('.side')?.getBoundingClientRect();
		rail = { which, x: (side?.right ?? box.right) + 6, y: box.top };
	}
	/* Closed by a click elsewhere, by Escape, and when the rail unfolds. */
	function outside(e: PointerEvent) {
		if (rail && !(e.target as Element | null)?.closest('.side-rail-drop')) rail = null;
	}
	function escape(e: KeyboardEvent) {
		if (rail && e.key === 'Escape') rail = null;
	}
	$effect(() => {
		if (!collapsed) rail = null;
	});

	/* Groups of the nav fold: open until folded by hand. */
	let folded = $state<Record<string, boolean>>({});
</script>

<svelte:window onpointerdown={outside} onkeydown={escape} />

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
		<!-- Folded, the rail keeps the two pickers, then a way to the three pages
		     that are not a component. A picker is the kit's Dropdown with a Menu
		     in it, in the chrome's ui- space. The fixed variant: the sidebar
		     clips what overflows it, so the list is placed against the rail. -->
		<nav class="side-rail" aria-label="Sections" inert={!collapsed}>
			<div class="ui-dropdown ui-dropdown-fixed side-rail-drop" class:ui-dropdown-open={rail?.which === 'family'}>
				<button
					type="button"
					class="side-rail-link"
					aria-haspopup="menu"
					aria-expanded={rail?.which === 'family'}
					aria-label="Family: {playground.family}"
					title="Family: {playground.family}"
					onclick={(e) => toggleRail('family', e.currentTarget)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" /><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" /></svg>
				</button>
				<div class="ui-dropdown-content side-rail-list" style:left="{rail?.x ?? 0}px" style:top="{rail?.y ?? 0}px">
					<ul class="ui-menu ui-menu-sm" role="menu" aria-label="Family">
						<li class="ui-menu-title">Family</li>
						{#each allFamilies() as f (f)}
							<li role="none">
								<button
									type="button"
									role="menuitemradio"
									aria-checked={f === playground.family}
									class:ui-menu-active={f === playground.family}
									onclick={() => {
										rail = null;
										selectFamily(f);
									}}
								>
									{f}<span class="side-rail-hint">{categoryFor(f)}</span>
								</button>
							</li>
						{/each}
						<li role="none">
							<button type="button" role="menuitem" onclick={newFamily}>Create a family…</button>
						</li>
					</ul>
				</div>
			</div>
			<div class="ui-dropdown ui-dropdown-fixed side-rail-drop" class:ui-dropdown-open={rail?.which === 'theme'}>
				<button
					type="button"
					class="side-rail-link"
					aria-haspopup="menu"
					aria-expanded={rail?.which === 'theme'}
					aria-label="Theme: {playground.theme}"
					title="Theme: {playground.theme}"
					onclick={(e) => toggleRail('theme', e.currentTarget)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c-3 4-5.5 7-5.5 10a5.5 5.5 0 0 0 11 0c0-3-2.5-6-5.5-10Z" /></svg>
				</button>
				<div class="ui-dropdown-content side-rail-list" style:left="{rail?.x ?? 0}px" style:top="{rail?.y ?? 0}px">
					<ul class="ui-menu ui-menu-sm" role="menu" aria-label="Theme">
						<li class="ui-menu-title">Theme</li>
						{#each themes as t (t.name)}
							<li role="none">
								<button
									type="button"
									role="menuitemradio"
									aria-checked={t.name === playground.theme}
									class:ui-menu-active={t.name === playground.theme}
									onclick={() => {
										rail = null;
										selectTheme(t.name);
									}}>{t.label}</button
								>
							</li>
						{/each}
					</ul>
				</div>
			</div>
			<hr class="side-rail-rule" />
			<a
				class="side-rail-link"
				href={resolve('/description')}
				aria-label="Family description"
				title="Family description"
				aria-current={page.url.pathname === resolve('/description') ? 'page' : undefined}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5" /><path d="M12 9.5c-3-2-3-6.5 0-7.5 3 1 3 5.5 0 7.500ZM14.4 11.200c1-3.4 5.3-4.8 7.2-2.2-.1 3.2-4.2 4.6-7.2 2.200ZM13.5 14c3.5-.1 6.2 3.6 4.2 6.1-3.1.9-5.7-2.6-4.2-6.100ZM10.5 14c1.5 3.5-1.1 7-4.2 6.1-2-2.5.7-6.2 4.2-6.100ZM9.6 11.200c-3 2.4-7.1 1-7.2-2.2 1.9-2.6 6.2-1.2 7.2 2.200Z" /></svg>
			</a>
			<a
				class="side-rail-link"
				href={resolve('/theme')}
				aria-label="Theme generator"
				title="Theme generator"
				aria-current={page.url.pathname === resolve('/theme') ? 'page' : undefined}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-1.8 0-1.2-1-1.7-1-2.9 0-1 .8-1.8 1.9-1.800H17a4 4 0 0 0 4-4c0-4.2-4-7.5-9-7.500Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7" r="1" /><circle cx="15.5" cy="7.5" r="1" /></svg>
			</a>
			<a
				class="side-rail-link"
				href={resolve('/components')}
				aria-label="All components"
				title="All components"
				aria-current={page.url.pathname.startsWith(resolve('/components')) ? 'page' : undefined}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
			</a>
		</nav>
		<div class="ui-sidebar-body side-body" inert={collapsed}>
		<div class="side-head">
			<label class="side-select">
				<span>Family</span>
				<select
					class="ui-select ui-select-sm"
					value={playground.family}
					onchange={(e) => pickFamily(e.currentTarget)}
				>
					{#each allFamilies() as f (f)}<option value={f}>{f} ({categoryFor(f)})</option>{/each}
					<option value={NEW_FAMILY}>Create a family…</option>
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
				<li>
					<a href={resolve('/theme')} class:ui-menu-active={page.url.pathname === resolve('/theme')}>
						Theme generator
					</a>
				</li>

				<li class="ui-menu-title side-group-title">Components</li>
				<li>
					<a href={resolve('/components')} class:ui-menu-active={page.url.pathname === resolve('/components')}>
						All components
					</a>
				</li>

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
