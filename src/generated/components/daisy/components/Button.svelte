<script module lang="ts">
	/**
	 * What .btn is made of, classified. This block is the ONE thing that
	 * differs between this file and the copy generated for each family: the
	 * generator filters every list down to the classes that family ships, and
	 * an axis left empty loses its prop. Nothing else in the file is touched,
	 * which is why a generated copy is still an ordinary, readable component.
	 *
	 * AXES are mutually exclusive and named after what they impact. FLAGS are
	 * independent booleans. PARTS are class names the component renders itself
	 * and never exposes. The build fails if a .btn-* class in a family's CSS
	 * appears in none of the three.
	 */
	export const PREFIX = 'btn';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
		shape: ['square', 'circle'],
		width: ['wide', 'block'],
		/* The fill/border/text treatments. daisyUI ships them as flat
		   combinations rather than as orthogonal axes — `dash` is `outline`
		   plus a dashed border — so they are one axis, and `variant` is the
		   name we keep for an exclusive group with no better one. */
		variant: ['outline', 'dash', 'soft', 'ghost', 'link'],
		/* sunflower only: the hard shadow is the family, so moving or removing
		   it is its own axis and combines with everything above. */
		shadow: {}
	} as const;

	export const FLAGS = ['active', 'ripple'] as const;
	export const PARTS = ['ripple-wave', 'disabled'] as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../internal/variants.js';

	// `size` is ours — the HTML attribute of the same name is a character
	// count our CSS overrides anyway. Any axis whose name collides with an
	// attribute of the element we render must be Omitted like this, or renamed.
	interface Props
		extends AxisProps<typeof AXES>,
			Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'size' | 'color' | 'onpointerdown'> {
		/** Draw the button as if it were the current choice. */
		active?: boolean;
		/** Expanding wave from the pointer on press. */
		ripple?: boolean;
		/** Renders an <a> instead of a <button>. */
		href?: string;
		class?: string;
		children?: Snippet;
		/* Ours, because the ripple rides on it: the element may be a <button>
		   or an <a>, so the inherited overloaded signature cannot type it. */
		onpointerdown?: (event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) => void;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name against the AXES block. That is what keeps this half of
	// the file identical in every family's copy — drop an axis up there and
	// nothing down here has to know.
	let {
		active = false,
		ripple = false,
		disabled = false,
		href,
		onpointerdown,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, axes));

	let classes = $derived(
		cx(
			PREFIX,
			applied.classes,
			active && `${PREFIX}-active`,
			ripple && `${PREFIX}-ripple`,
			// An <a> cannot be disabled, so the class carries what the attribute
			// would have: it is the only way the two states cannot drift apart.
			href && disabled && `${PREFIX}-disabled`,
			klass
		)
	);

	// Live ripple waves; each renders a .btn-ripple-wave positioned at the
	// press point and removed when its animation ends.
	let waves = $state<{ id: number; x: number; y: number; size: number }[]>([]);
	let waveId = 0;

	function press(e: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (ripple) {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			// Radius reaching the farthest corner, so the wave always covers it.
			const r = 2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
			waves.push({ id: waveId++, x, y, size: r });
		}
		onpointerdown?.(e);
	}
</script>

{#snippet body()}
	{@render children?.()}
	{#each waves as wave (wave.id)}
		<span
			class={`${PREFIX}-ripple-wave`}
			style="--ripple-x:{wave.x}px;--ripple-y:{wave.y}px;--ripple-size:{wave.size}px"
			onanimationend={() => (waves = waves.filter((w) => w.id !== wave.id))}
		></span>
	{/each}
{/snippet}

{#if href}
	<a
		{...applied.rest}
		href={disabled ? undefined : href}
		class={classes}
		aria-disabled={disabled ? 'true' : undefined}
		onpointerdown={press}
	>
		{@render body()}
	</a>
{:else}
	<button {...applied.rest} class={classes} {disabled} onpointerdown={press}>
		{@render body()}
	</button>
{/if}
