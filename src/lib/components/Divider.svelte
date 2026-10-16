<script module lang="ts">
	/** What .divider is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'divider';

	export const AXES = {
		direction: ['horizontal', 'vertical'],
		/* Where the content sits along the line. */
		align: ['start', 'center', 'end'],
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		/* The line's shape. Each family ships its own, or none. */
		variant: ['dashed', 'dotted', 'thick', 'fade']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['content'] as const;
</script>

<script lang="ts">
	/**
	 * A rule between two things, optionally carrying a word or two.
	 *
	 * Without children it is an `<hr>`. With children it is a `separator` whose
	 * content sits between two lines.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLElement>, 'color'> {
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
	let vertical = $derived(classes.includes(`${PREFIX}-vertical`));
</script>

{#if children}
	<div {...applied.rest} class={classes} role="separator" aria-orientation={vertical ? 'vertical' : 'horizontal'}>
		<span class="divider-content">{@render children()}</span>
	</div>
{:else}
	<hr {...applied.rest} class={classes} aria-orientation={vertical ? 'vertical' : undefined} />
{/if}
