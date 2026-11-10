<script module lang="ts">
	/** What .sidebar is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    `.sidebar-layout` is the row it may sit in: written by hand around the
	    page, never by the component, so it is a PART too. */
	export const PREFIX = 'sidebar';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* The page's side it stands on. The start by default. */
		side: ['end']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['head', 'body', 'foot', 'toggle', 'collapsed', 'keep', 'layout'] as const;
</script>

<script lang="ts">
	/**
	 * An app's side column — a brand, a menu, an account — that folds to a
	 * rail. In the flow, unlike a Drawer: the page beside it narrows or
	 * widens, it is never covered.
	 *
	 * `collapsed` is bindable. The toggle sits in the head, after `head`;
	 * folded, only the toggle stays (and anything marked `.sidebar-keep`).
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** Folded to a rail. Bindable. */
		collapsed?: boolean;
		/** The top of the column: a brand, a picker. The toggle follows it. */
		head?: Snippet<[{ collapsed: boolean }]>;
		/** The bottom of the column: an account, a setting. */
		foot?: Snippet<[{ collapsed: boolean }]>;
		/** Hide the toggle: the app folds it some other way. */
		noToggle?: boolean;
		/** The toggle's accessible name, open and folded. */
		toggleLabel?: { open: string; collapsed: string };
		/** After every fold or unfold. */
		onToggle?: (collapsed: boolean) => void;
		class?: string;
		/** The body: usually a Menu. */
		children?: Snippet<[{ collapsed: boolean }]>;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		collapsed = $bindable(false),
		head,
		foot,
		noToggle = false,
		toggleLabel = { open: 'Collapse the sidebar', collapsed: 'Expand the sidebar' },
		onToggle,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, collapsed && `${PREFIX}-collapsed`, klass));

	const uid = $props.id();

	/** Fold or unfold it. */
	export function toggle(value = !collapsed) {
		if (value === collapsed) return;
		collapsed = value;
		onToggle?.(value);
	}
</script>

<aside {...applied.rest} class={classes}>
	<div class="{PREFIX}-head">
		{@render head?.({ collapsed })}
		{#if !noToggle}
			<button
				type="button"
				class="{PREFIX}-toggle"
				aria-expanded={!collapsed}
				aria-controls="{uid}-body"
				aria-label={collapsed ? toggleLabel.collapsed : toggleLabel.open}
				title={collapsed ? toggleLabel.collapsed : toggleLabel.open}
				onclick={() => toggle()}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16M15.5 10l-2 2 2 2" /></svg>
			</button>
		{/if}
	</div>
	<div class="{PREFIX}-body" id="{uid}-body" inert={collapsed}>
		{@render children?.({ collapsed })}
	</div>
	{#if foot}
		<div class="{PREFIX}-foot" inert={collapsed}>{@render foot({ collapsed })}</div>
	{/if}
</aside>
