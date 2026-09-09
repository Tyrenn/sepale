<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Color, Size } from '../types.js';
	import { cx, mod } from '../internal/cx.js';

	interface Props extends HTMLButtonAttributes {
		color?: Color;
		size?: Size;
		/** Visual style. */
		variant?: 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
		shape?: 'square' | 'circle';
		width?: 'wide' | 'block';
		active?: boolean;
		/** Material-style ripple: an expanding wave from the pointer on press. */
		ripple?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		color,
		size,
		variant,
		shape,
		width,
		active = false,
		ripple = false,
		onpointerdown,
		class: klass = '',
		children,
		...rest
	}: Props = $props();

	let classes = $derived(
		cx(
			'btn',
			mod('btn', color),
			mod('btn', size),
			mod('btn', variant),
			mod('btn', shape),
			mod('btn', width),
			active && 'btn-active',
			ripple && 'btn-ripple',
			klass
		)
	);

	// Live ripple waves; each renders a .btn-ripple-wave (styled in button.scss)
	// positioned at the press point and removed when its animation ends.
	let waves = $state<{ id: number; x: number; y: number; size: number }[]>([]);
	let waveId = 0;

	function press(e: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (ripple) {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			// Radius reaching the farthest corner, so the wave always covers the button.
			const size =
				2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
			waves.push({ id: waveId++, x, y, size });
		}
		onpointerdown?.(e);
	}
</script>

<button class={classes} onpointerdown={press} {...rest}>
	{@render children?.()}
	{#each waves as wave (wave.id)}
		<span
			class="btn-ripple-wave"
			style="--ripple-x:{wave.x}px;--ripple-y:{wave.y}px;--ripple-size:{wave.size}px"
			onanimationend={() => (waves = waves.filter((w) => w.id !== wave.id))}
		></span>
	{/each}
</button>
