<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * read back from the active family's compiled CSS.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['avatar'],
		description:
			'A picture, or a few letters, standing for someone — cropped to a shape. `.avatar` is the frame; its one child, an image or a span of initials, fills it.',
		classes: {
			'avatar-square': 'A box with the family’s box radius instead of a circle.',
			'avatar-squircle': 'daisyUI’s squircle mask.',
			'avatar-hexagon': 'daisyUI’s hexagon mask.'
		},
		props: {
			Avatar: [
				{ name: 'src', type: 'string', description: 'The picture. Without it, the children are drawn instead.' },
				{ name: 'alt', type: 'string', default: '""', description: 'The picture’s alternative text.' },
				{ name: 'children', type: 'Snippet', description: 'The initials, when there is no picture.' },
				{ name: 'badge', type: 'Snippet', description: 'A count or a status, pinned to the avatar’s edge as a .chip inside a .badge.' },
				{ name: 'badgeSide', type: '"top" | "bottom"', default: '"top"', description: 'Which edge the badge sits on, at the end side.' }
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Avatar } from '$lib/index.js';

	/* A face needs a picture; an inline SVG keeps the page offline. */
	const img = `data:image/svg+xml,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#fc6"/><stop offset="1" stop-color="#f69"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="38" r="17" fill="#fff8"/><ellipse cx="48" cy="92" rx="32" ry="26" fill="#fff8"/></svg>'
	)}`;
</script>

<Section
	title="Picture or initials"
	svelte={`<Avatar src="…" alt="Ada" />
<Avatar>AL</Avatar>`}
	html={`<div class="avatar"><img src="…" alt="Ada" /></div>
<div class="avatar"><span>AL</span></div>`}
>
	<Avatar src={img} alt="Ada" />
	<Avatar>AL</Avatar>
</Section>

<Section
	title="Contour"
	subtitle="The colour axis draws a ring in that colour."
	svelte={`<Avatar src="…" color="primary" />
<Avatar color="success">GV</Avatar>`}
	html={`<div class="avatar avatar-primary"><img src="…" alt="" /></div>
<div class="avatar avatar-success"><span>GV</span></div>`}
>
	<Avatar src={img} color="primary" />
	<Avatar src={img} color="secondary" />
	<Avatar color="success">GV</Avatar>
	<Avatar color="error">ER</Avatar>
</Section>

<Section
	title="Sizes"
	svelte={`<Avatar size="xs">XS</Avatar> … <Avatar size="xl">XL</Avatar>`}
	html={`<div class="avatar avatar-xs"><span>XS</span></div>
<div class="avatar avatar-xl"><span>XL</span></div>`}
>
	<Avatar size="xs">XS</Avatar>
	<Avatar size="sm">SM</Avatar>
	<Avatar size="md">MD</Avatar>
	<Avatar size="lg">LG</Avatar>
	<Avatar size="xl">XL</Avatar>
	<Avatar src={img} style="--avatar-size: 6rem" />
</Section>

<Section
	title="Shapes"
	subtitle="Round by default. Which other shapes exist is the family’s call."
	svelte={`<Avatar shape="square" src="…" />`}
	html={`<div class="avatar avatar-square"><img src="…" alt="" /></div>`}
>
	<Avatar shape="square" src={img} size="xl" />
	<Avatar shape="square" color="primary" size="xl">SQ</Avatar>
</Section>

<Section
	title="Masks"
	subtitle="Shapes cut by a mask; the contour follows them."
	svelte={`<Avatar shape="squircle" src="…" />
<Avatar shape="hexagon" color="primary" src="…" />`}
	html={`<div class="avatar avatar-squircle"><img src="…" alt="" /></div>
<div class="avatar avatar-hexagon avatar-primary"><img src="…" alt="" /></div>`}
>
	<Avatar shape="squircle" src={img} size="xl" />
	<Avatar shape="squircle" color="accent" src={img} size="xl" />
	<Avatar shape="hexagon" src={img} size="xl" />
	<Avatar shape="hexagon" color="primary" src={img} size="xl" />
</Section>

<Section
	title="Badge"
	subtitle="A .badge around the avatar; the chip lands on the shape’s edge."
	svelte={`<Avatar src="…">
	{#snippet badge()}3{/snippet}
</Avatar>
<Avatar badgeSide="bottom">…</Avatar>`}
	html={`<div class="badge badge-top badge-end">
	<div class="avatar"><img src="…" alt="" /></div>
	<span class="chip">3</span>
</div>`}
>
	<Avatar src={img} size="xl">
		{#snippet badge()}3{/snippet}
	</Avatar>
	<Avatar size="xl" color="primary" badgeSide="bottom">
		GV
		{#snippet badge()}●{/snippet}
	</Avatar>
	<Avatar shape="square" src={img} size="xl">
		{#snippet badge()}new{/snippet}
	</Avatar>
</Section>
