<script module lang="ts">
	/** What .mobile-frame is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'mobile-frame';

	export const AXES = {} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['screen'] as const;
</script>

<script lang="ts">
	/**
	 * A phone drawn around content — for showcases and screenshots, not an
	 * emulator. Its width is `--mobile-frame-width`; the height follows.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, HTMLAttributes<HTMLDivElement> {
		class?: string;
		/** What the screen shows. It scrolls. */
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
	<div class="mobile-frame-screen">{@render children?.()}</div>
</div>
