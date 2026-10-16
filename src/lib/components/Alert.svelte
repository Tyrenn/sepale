<script module lang="ts">
	/** What .alert is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'alert';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl'],
		/* Default is a soft tint; these two are the alternatives. */
		variant: ['outline', 'solid']
	} as const;

	export const FLAGS = {} as const;
	export const PARTS = ['icon', 'body', 'title', 'actions', 'close'] as const;
</script>

<script lang="ts">
	/**
	 * An inline message: something the user should know, in place.
	 *
	 * `info`, `success`, `warning` and `error` come with an icon of their own;
	 * the `icon` snippet replaces it. A dismissible alert hides itself when its
	 * close button is pressed, then calls `onDismiss` — the parent need not
	 * track it.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { slide } from 'svelte/transition';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
		/** A bold first line. */
		title?: string;
		/** Replaces the colour's own icon. */
		icon?: Snippet;
		/** Buttons or links on the trailing side. */
		actions?: Snippet;
		/** Draw a close button that hides the alert. */
		dismissible?: boolean;
		/** After the alert hid itself. */
		onDismiss?: () => void;
		/** The close button's accessible name. */
		dismissLabel?: string;
		class?: string;
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		title,
		icon,
		actions,
		dismissible = false,
		onDismiss,
		dismissLabel = 'Dismiss',
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));

	/* Read back from the classes, not the prop: a family's copy has no `axes`. */
	let kind = $derived((['info', 'success', 'warning', 'error'] as const).find((k) => classes.includes(`${PREFIX}-${k}`)));
	let urgent = $derived(kind === 'error' || kind === 'warning');

	let gone = $state(false);

	function dismiss() {
		gone = true;
		onDismiss?.();
	}
</script>

{#if !gone}
	<div {...applied.rest} class={classes} role={urgent ? 'alert' : 'status'} out:slide={{ duration: 160 }}>
		{#if icon}
			<span class="alert-icon">{@render icon()}</span>
		{:else if kind}
			<span class="alert-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					{#if kind === 'success'}
						<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0" /><path d="m8 12 3 3 5-6" />
					{:else if kind === 'warning'}
						<path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" />
					{:else if kind === 'error'}
						<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0" /><path d="m9 9 6 6M15 9l-6 6" />
					{:else}
						<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0" /><path d="M12 11v5M12 8h.01" />
					{/if}
				</svg>
			</span>
		{/if}
		<div class="alert-body">
			{#if title}<p class="alert-title">{title}</p>{/if}
			{@render children?.()}
		</div>
		{#if actions}<div class="alert-actions">{@render actions()}</div>{/if}
		{#if dismissible}
			<button type="button" class="alert-close" aria-label={dismissLabel} onclick={dismiss}>
				<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
			</button>
		{/if}
	</div>
{/if}
