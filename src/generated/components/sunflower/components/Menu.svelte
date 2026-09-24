<script module lang="ts">
	/** What .menu is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely.

	    The menu draws its own rows, so every class below the root is a PART:
	    nobody opts into `.menu-item` or `.menu-active`, they follow from the
	    data. A divider is an item with `divider: true` — an empty <li>. */
	export const PREFIX = 'menu';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* A menu runs down the page unless it is told to run across it. */
		direction: ['horizontal']
	} as const;

	export const FLAGS = [] as const;
	export const PARTS = ['item', 'active', 'disabled', 'toggle', 'sub', 'sub-closed', 'title'] as const;

	import type { Text } from '../internal/snippets.js';

	/** One row of a menu: a link, a section title, a divider, or a group. */
	export interface MenuNode {
		/** The row's text, or a snippet drawing whatever belongs in its place. */
		label?: Text;
		/** A section heading rather than a row — renders `.menu-title`. */
		title?: Text;
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
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';
	import { isSnippet } from '../internal/snippets.js';

	// `onselect` is ours: the native event of that name fires on text
	// selection and means nothing on a <ul>, so the attribute is Omitted
	// rather than the prop renamed.
	interface Props
		extends AxisProps<typeof AXES>,
			Omit<HTMLAttributes<HTMLUListElement>, 'onselect'> {
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
		onselect?: (node: MenuNode) => void;
		class?: string;
	}

	let { items = [], row, onselect, class: klass = '', ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	// Open/closed lives here, keyed by the row's path, so the caller can hand
	// over plain data and still get a working disclosure. `node.open` is the
	// starting point; once a row is clicked, this map wins.
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

{#snippet text(value: Text | undefined)}
	{#if isSnippet(value)}{@render value()}{:else}{value}{/if}
{/snippet}

{#snippet inside(node: MenuNode)}
	{#if isSnippet(node.label)}{@render node.label()}
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
					onclick={() => (toggled[key] = !isOpen(key, node))}
				>{@render inside(node)}</button>
				<ul class={cx(`${PREFIX}-sub`, !isOpen(key, node) && `${PREFIX}-sub-closed`)}>
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
					onclick={() => onselect?.(node)}
				>{@render inside(node)}</button>
			</li>
		{/if}
	{/each}
{/snippet}

<ul {...applied.rest} class={classes}>{@render rows(items, '')}</ul>
