<script module lang="ts">
	/** What .laptop-frame is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'laptop-frame';

	export const AXES = {} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['lid', 'screen', 'base'] as const;
</script>

<script lang="ts">
	/**
	 * A laptop drawn around content: a lid holding a 16:10 screen that scrolls,
	 * on a wider base. Its width is `--laptop-frame-width`.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLDivElement> {
		class?: string;
		/** What the screen shows. */
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
</script>

<div {...applied.rest} class={classes}>
	<div class="laptop-frame-lid">
		<div class="laptop-frame-screen">{@render children?.()}</div>
	</div>
	<div class="laptop-frame-base" aria-hidden="true"></div>
</div>
