<script module lang="ts">
	/** What .tabs is made of, classified. Only this block differs between this
	    file and the copy generated for each family (scripts/gen-components.mjs):
	    an axis a family leaves empty loses its prop entirely.

	    One namespace, `tabs`: the strip AND the tabs in it (ADR 0009). The
	    component draws every tab, so `.tabs-item` and its states are PARTS.
	    A panel is rendered right after its tab because the CSS reaches it with
	    `+` — moving it elsewhere would break the selector. */
	export const PREFIX = 'tabs';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* How the strip is drawn. */
		variant: ['border', 'box', 'lift'],
		/* Which edge the strip sits on, which decides where the seam goes. */
		placement: ['top', 'bottom']
	} as const;

	export const FLAGS = [] as const;
	export const PARTS = ['item', 'item-active', 'item-disabled', 'item-content'] as const;

	import type { Text } from '../internal/snippets.js';

	/** One tab, and optionally the panel it reveals. */
	export interface TabItem {
		/** The tab's text, or a snippet drawing whatever belongs in its place. */
		label: Text;
		/** Unreachable, and drawn as such. */
		disabled?: boolean;
		/** What the tab shows when selected. Omit to place panels yourself. */
		content?: Snippet;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';
	import { isSnippet } from '../internal/snippets.js';

	// `onselect` is ours: the native event of that name fires on text
	// selection and means nothing on the strip, so the attribute is Omitted
	// rather than the prop renamed.
	interface Props
		extends AxisProps<typeof AXES>,
			Omit<HTMLAttributes<HTMLDivElement>, 'onselect'> {
		/**
		 * The tabs, in order. A tab's `label` takes a snippet as readily as a
		 * string, for the one tab that carries an icon or a count.
		 */
		tabs?: TabItem[];
		/**
		 * How to draw the inside of every tab. Written once for the whole strip;
		 * a tab whose own `label` is a snippet skips it.
		 */
		tab?: Snippet<[TabItem]>;
		/** Index of the selected tab. Bindable, so a parent can drive it. */
		active?: number;
		/** Called with the new index when a tab is chosen. */
		onselect?: (index: number) => void;
		class?: string;
	}

	let {
		tabs = [],
		tab,
		active = $bindable(0),
		onselect,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	function select(i: number) {
		active = i;
		onselect?.(i);
	}
</script>

{#snippet inside(item: TabItem)}
	{#if isSnippet(item.label)}{@render item.label()}
	{:else if tab}{@render tab(item)}
	{:else}{item.label}{/if}
{/snippet}

<div {...applied.rest} role="tablist" class={classes}>
	{#each tabs as item, i (i)}
		<button
			type="button"
			role="tab"
			class={cx(
				`${PREFIX}-item`,
				i === active && `${PREFIX}-item-active`,
				item.disabled && `${PREFIX}-item-disabled`
			)}
			aria-selected={i === active}
			disabled={item.disabled}
			onclick={() => select(i)}
		>{@render inside(item)}</button>
		{#if item.content}
			<div class={`${PREFIX}-item-content`}>{@render item.content()}</div>
		{/if}
	{/each}
</div>
