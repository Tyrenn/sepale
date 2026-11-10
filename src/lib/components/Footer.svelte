<script module lang="ts">
	/** What .footer is made of, classified. The props follow the
	    families the project registers (variants.ts, ADR 0015). */
	export const PREFIX = 'footer';

	export const AXES = {
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
	} as const;

	export const FLAGS = {
		center: 'Centre the columns and the bottom row.'
	} as const;
	export const PARTS = ['sections', 'section', 'title', 'bottom'] as const;

	export interface FooterSection {
		title: string;
		links: { label: string; href: string }[];
	}
</script>

<script lang="ts">
	/**
	 * The closing block of a page: columns of links, then a bottom row.
	 *
	 * `sections` draws the columns from data; for anything else, pass
	 * children and write `<nav class="footer-section">` yourself.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS, typeof PREFIX>, Omit<HTMLAttributes<HTMLElement>, 'color'> {
		sections?: FooterSection[];
		/** The last row: copyright, legal links, social icons. */
		bottom?: Snippet;
		class?: string;
		/** Columns of your own, after `sections`. */
		children?: Snippet;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		sections = [],
		bottom,
		class: klass = '',
		children,
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
</script>

<footer {...applied.rest} class={classes}>
	{#if sections.length || children}
		<div class="footer-sections">
			{#each sections as s (s.title)}
				<nav class="footer-section" aria-label={s.title}>
					<h2 class="footer-title">{s.title}</h2>
					{#each s.links as l (l.href)}<a href={l.href}>{l.label}</a>{/each}
				</nav>
			{/each}
			{@render children?.()}
		</div>
	{/if}
	{#if bottom}<div class="footer-bottom">{@render bottom()}</div>{/if}
</footer>
