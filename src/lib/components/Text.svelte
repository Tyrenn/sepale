<script module lang="ts">
	/** What .text is made of, classified. */
	export const PREFIX = 'text';

	/* Two axes rather than one product. `s` carries the size AND the leading
	   that belongs with it, `b` carries the weight; they never interacted, so
	   the twelve `.text-sN-bN` classes were twelve ways of saying seven
	   things. */
	export const AXES = {
		s: ['1', '2', '3', '4'],
		b: ['1', '2', '3'],
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = [] as const;
</script>

<script lang="ts">
	/**
	 * A paragraph.
	 *
	 * No `level`: a paragraph has no heading level to pick. It renders `<p>`,
	 * and a `<span>` would be a different prop on the day something needs one.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLParagraphElement>, 'color'> {
		class?: string;
		children?: Snippet;
	}

	/* Both defaulted: `.text` alone is not a class, so a paragraph with no
	   props still has to name a size and a weight to have either. */
	let { s = '2', b = '3', class: klass = '', children, ...axes }: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, { ...axes, s, b }));
	let classes = $derived(cx(applied.classes, klass));
</script>

<p class={classes} {...applied.rest}>{@render children?.()}</p>
