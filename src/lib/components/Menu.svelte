<script module lang="ts">
	/** What .menu is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

	    The menu draws its own rows, so every class below the root is a PART:
	    nobody opts into `.menu-item` or `.menu-active`, they follow from the
	    data. A divider is an item with `divider: true` — an empty <li>. */
	export const PREFIX = 'menu';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A menu runs down the page unless it is told to run across it. */
		direction: ['horizontal']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['item', 'active', 'disabled', 'toggle', 'sub', 'sub-closed', 'title'] as const;

	import type { Snippet } from 'svelte';

	/** One row of a menu: a link, a section title, a divider, or a group. */
	export interface MenuNode {
		/** The row's text, or a snippet drawing whatever belongs in its place. */
		label?: string | Snippet;
		/** A section heading rather than a row — renders `.menu-title`. */
		title?: string | Snippet;
		/** A blank separator between two groups — an empty <li>. */
		divider?: boolean;
		/** Where the row goes. Without it the row is a <button>. */
		href?: string;
		/** Mark it as where the visitor currently is. */
		active?: boolean;
		/** Unreachable, and drawn as such. */
		disabled?: boolean;
		/** A nested group. Supplying it turns the row into its toggle. */
		items?: MenuNode[];
		/** Whether that group starts open. Open by default. */
		open?: boolean;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>,
			HTMLAttributes<HTMLUListElement> {
		/**
		 * The rows, nested as deep as needed. A node's `label` and `title` take
		 * a snippet as readily as a string, for the one row that differs.
		 */
		items?: MenuNode[];
		/**
		 * How to draw the inside of every row. Written once for the whole menu;
		 * a node whose own `label` is a snippet skips it.
		 */
		row?: Snippet<[MenuNode]>;
		/** Called when a row without an href is chosen. */
		onSelect?: (node: MenuNode) => void;
		class?: string;
	}

	let { items = [], row, onSelect, class: klass = '', ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	// Open/closed lives here, keyed by the row's path, so the caller can hand
	// over plain data and still get a working disclosure. `node.open` is the
	// starting point; once a row is clicked, this map wins.
	const uid = $props.id();
	let toggled = $state<Record<string, boolean>>({});
	const isOpen = (key: string, node: MenuNode) => toggled[key] ?? node.open ?? true;

	function rowClass(node: MenuNode, group: boolean) {
		return cx(
			`${PREFIX}-item`,
			group && `${PREFIX}-toggle`,
			node.active && `${PREFIX}-active`,
			node.disabled && `${PREFIX}-disabled`
		);
	}
</script>

{#snippet text(value: string | Snippet | undefined)}
	{#if typeof value === 'function'}{@render value()}{:else}{value}{/if}
{/snippet}

{#snippet inside(node: MenuNode)}
	{#if typeof node.label === 'function'}{@render node.label()}
	{:else if row}{@render row(node)}
	{:else}{node.label}{/if}
{/snippet}

{#snippet rows(nodes: MenuNode[], path: string)}
	{#each nodes as node, i (path + i)}
		{@const key = path + i}
		{#if node.divider}
			<li></li>
		{:else if node.title !== undefined}
			<li class={`${PREFIX}-title`}>{@render text(node.title)}</li>
		{:else if node.items?.length}
			<li>
				<button
					type="button"
					class={rowClass(node, true)}
					disabled={node.disabled}
					aria-expanded={isOpen(key, node)}
					aria-controls="{uid}-{key}"
					onclick={() => (toggled[key] = !isOpen(key, node))}
				>{@render inside(node)}</button>
				<!-- As in Collapse: a closed sub-menu is inert, so Tab skips its rows. -->
				<ul
					id="{uid}-{key}"
					class={cx(`${PREFIX}-sub`, !isOpen(key, node) && `${PREFIX}-sub-closed`)}
					inert={!isOpen(key, node)}
				>
					{@render rows(node.items, key + '.')}
				</ul>
			</li>
		{:else if node.href}
			<li>
				<a
					class={rowClass(node, false)}
					href={node.disabled ? undefined : node.href}
					aria-disabled={node.disabled ? 'true' : undefined}
					aria-current={node.active ? 'page' : undefined}
				>{@render inside(node)}</a>
			</li>
		{:else}
			<li>
				<button
					type="button"
					class={rowClass(node, false)}
					disabled={node.disabled}
					onclick={() => onSelect?.(node)}
				>{@render inside(node)}</button>
			</li>
		{/if}
	{/each}
{/snippet}

<ul {...applied.rest} class={classes}>{@render rows(items, '')}</ul>
