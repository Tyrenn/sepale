<script module lang="ts">
	/** What .stat is made of, classified. */
	export const PREFIX = 'stat';

	export const AXES = {
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['title', 'value', 'desc', 'figure', 'actions'] as const;
</script>

<script lang="ts">
	/**
	 * A figure worth a glance: a title, a value, a description, and optionally
	 * a figure on the side and a row of actions.
	 *
	 * The three text parts take a string — the common case — or a snippet.
	 * Put several in a `Stats` to line them up in one frame.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	/* `title` is an HTML attribute too, and a tooltip is not a label — so the
	   DOM one is dropped rather than shadowed silently. */
	interface Props
		extends AxisProps<typeof AXES, typeof FLAGS>,
			Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		/** The small label above the value. */
		title?: string | Snippet;
		/** The number itself. */
		value?: string | Snippet;
		/** A line under the value: a trend, a period. */
		desc?: string | Snippet;
		/** An icon or a picture, beside the text. */
		figure?: Snippet;
		/** A row of buttons, under the text. */
		actions?: Snippet;
		class?: string;
		/** Anything else, after the description. */
		children?: Snippet;
	}

	let {
		title,
		value,
		desc,
		figure,
		actions,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

{#snippet text(part: string | Snippet)}
	{#if typeof part === 'string'}{part}{:else}{@render part()}{/if}
{/snippet}

<div class={classes} {...applied.rest}>
	{#if figure}<div class="stat-figure">{@render figure()}</div>{/if}
	{#if title}<div class="stat-title">{@render text(title)}</div>{/if}
	{#if value}<div class="stat-value">{@render text(value)}</div>{/if}
	{#if desc}<div class="stat-desc">{@render text(desc)}</div>{/if}
	{@render children?.()}
	{#if actions}<div class="stat-actions">{@render actions()}</div>{/if}
</div>
