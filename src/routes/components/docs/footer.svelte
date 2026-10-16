<script module lang="ts">
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['footer'],
		description:
			'The closing block of a page: columns of links that fill the width as room allows, then a bottom row.',
		classes: {
			footer: 'The block.',
			'footer-sections': 'The columns, as an auto-fit grid.',
			'footer-section': 'One column.',
			'footer-title': 'A column heading.',
			'footer-bottom': 'The last row, under a rule.'
		},
		props: {
			Footer: [
				{ name: 'sections', type: '{ title, links: { label, href }[] }[]', description: 'Columns from data.' },
				{ name: 'bottom', type: 'Snippet', description: 'The last row.' },
				{ name: 'children', type: 'Snippet', description: 'Columns of your own, after sections.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Footer } from '$lib/index.js';

	const sections = [
		{ title: 'Product', links: [{ label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#changelog' }] },
		{ title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Careers', href: '#careers' }] },
		{ title: 'Legal', links: [{ label: 'Privacy', href: '#privacy' }, { label: 'Terms', href: '#terms' }] }
	];
</script>

<Section
	title="Columns and bottom row"
	svelte={`<Footer {sections}>
  {#snippet bottom()}<span>© 2026 Sepale</span><span>Made in Lyon</span>{/snippet}
</Footer>`}
	html={`<footer class="footer">
  <div class="footer-sections">
    <nav class="footer-section"><h2 class="footer-title">Product</h2><a href="…">Pricing</a></nav>
  </div>
  <div class="footer-bottom">© 2026 Sepale</div>
</footer>`}
>
	<div style="width:100%">
		<Footer {sections}>
			{#snippet bottom()}<span>© 2026 Sepale</span><span>Made in Lyon</span>{/snippet}
		</Footer>
	</div>
</Section>

<Section
	title="Centered, colored"
	svelte={`<Footer center color="neutral">…</Footer>`}
	html={`<footer class="footer footer-center footer-neutral">…</footer>`}
>
	<div style="width:100%">
		<Footer center color="neutral">
			{#snippet bottom()}<span>© 2026 Sepale</span>{/snippet}
		</Footer>
	</div>
</Section>
