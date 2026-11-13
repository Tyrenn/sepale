<script module lang="ts">
	/** What .tabs is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015).

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

	export const FLAGS = {} as const;
	export const PARTS = ['item', 'item-active', 'item-disabled', 'item-content', 'indicator'] as const;

	import type { Snippet } from 'svelte';

	/** One tab, and optionally the panel it reveals. */
	export interface TabItem<V = string | number> {
		/** The tab's text, or a snippet drawing whatever belongs in its place. */
		label: string | Snippet;
		/** What identifies the tab when the strip is driven by `value` rather than by index. */
		value?: V;
		/** Unreachable, and drawn as such. */
		disabled?: boolean;
		/** What the tab shows when selected. Omit to place panels yourself. */
		content?: Snippet;
	}
</script>

<script lang="ts" generics="V extends string | number">
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>,
			HTMLAttributes<HTMLDivElement> {
		/**
		 * The tabs, in order. A tab's `label` takes a snippet as readily as a
		 * string, for the one tab that carries an icon or a count.
		 */
		tabs?: TabItem<V>[];
		/**
		 * How to draw the inside of every tab. Written once for the whole strip;
		 * a tab whose own `label` is a snippet skips it.
		 */
		tab?: Snippet<[TabItem<V>]>;
		/** Index of the selected tab. Bindable, so a parent can drive it. */
		active?: number;
		/** `value` of the selected tab, for tabs keyed by their own id rather than by
		    position. Bindable. When set, it decides the selection over `active`. */
		value?: V;
		/** Called with the tab's `value`, and its index, when a tab is chosen. */
		onvalue?: (value: V | undefined, index: number) => void;
		/** Slide the selection from one tab to the next. Not with `lift`, whose
		    tab opens into its panel. */
		animated?: boolean;
		class?: string;
	}

	let {
		tabs = [],
		tab,
		active = $bindable(),
		value = $bindable(),
		onvalue,
		animated = true,
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	/* The selected index: from `value` when the strip is keyed by value, else `active`. */
	let current = $derived(value !== undefined ? tabs.findIndex((t) => t.value === value) : (active ?? 0));

	let root: HTMLDivElement | undefined = $state();
	let box = $state({ x: 0, y: 0, w: 0, h: 0 });

	/* The indicator follows the selected tab: measured after every change,
	   and again whenever the strip resizes (a font, a wrap, a panel). */
	$effect(() => {
		if (!animated || !root) return;
		void current;
		void tabs.length;
		const measure = () => {
			const item = root?.querySelectorAll<HTMLElement>(`:scope > [role="tab"]`)[current];
			box = item
				? { x: item.offsetLeft, y: item.offsetTop, w: item.offsetWidth, h: item.offsetHeight }
				: { x: 0, y: 0, w: 0, h: 0 };
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	});

	function select(i: number) {
		active = i;
		if (tabs[i]?.value !== undefined) value = tabs[i].value;
		onvalue?.(tabs[i]?.value, i);
	}
</script>

{#snippet inside(item: TabItem<V>)}
	{#if typeof item.label === 'function'}{@render item.label()}
	{:else if tab}{@render tab(item)}
	{:else}{item.label}{/if}
{/snippet}

<div {...applied.rest} bind:this={root} role="tablist" class={classes}
	style:--tabs-x="{box.x}px"
	style:--tabs-y="{box.y}px"
	style:--tabs-w="{box.w}px"
	style:--tabs-h="{box.h}px"
>
	{#if animated}<span class="{PREFIX}-item {PREFIX}-item-active {PREFIX}-indicator" aria-hidden="true"></span>{/if}
	{#each tabs as item, i (i)}
		<button
			type="button"
			role="tab"
			class={cx(
				`${PREFIX}-item`,
				i === current && `${PREFIX}-item-active`,
				item.disabled && `${PREFIX}-item-disabled`
			)}
			aria-selected={i === current}
			disabled={item.disabled}
			onclick={() => select(i)}
		>{@render inside(item)}</button>
		{#if item.content}
			<div class={`${PREFIX}-item-content`}>{@render item.content()}</div>
		{/if}
	{/each}
</div>
