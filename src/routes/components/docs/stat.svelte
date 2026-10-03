<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * read back from the active family's compiled CSS.
	 *
	 * Two namespaces: `.stats` lives in the same stylesheet as `.stat`.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ['stat', 'stats'],
		description:
			'A figure worth a glance — a title, a value, a description, and optionally a figure on the side and actions. A box like a card, laid out as a two-column grid. `.stats` lines several up in one frame, a divider between each.',
		classes: {
			'stat-title': 'The small label above the value, in the muted ink.',
			'stat-value': 'The number, large and heavy.',
			'stat-desc': 'A line under the value, in the muted ink.',
			'stat-figure': 'An icon or a picture in the second column, across the text rows.',
			'stat-actions': 'A wrapping row of buttons under the text.',
			stats: 'One frame for several stats; the stats inside put their own frame down.',
			'stats-horizontal': 'A row (the default).',
			'stats-vertical': 'A column.'
		},
		props: {
			Stat: [
				{ name: 'title', type: 'string | Snippet', description: 'The label above the value.' },
				{ name: 'value', type: 'string | Snippet', description: 'The number itself.' },
				{ name: 'desc', type: 'string | Snippet', description: 'A line under the value.' },
				{ name: 'figure', type: 'Snippet', description: 'An icon or a picture, beside the text.' },
				{ name: 'actions', type: 'Snippet', description: 'A row of buttons, under the text.' }
			],
			Stats: []
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import { Avatar, Button, Stat, Stats } from '$lib/index.js';
</script>

{#snippet heart()}
	<svg viewBox="0 0 24 24" style="height:2em" fill="none" stroke="currentColor" stroke-width="2"
		><path
			d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
		/></svg
	>
{/snippet}

<Section
	title="Plain"
	svelte={`<Stat title="Total page views" value="89,400" desc="21% more than last month" />`}
	html={`<div class="stat">
	<div class="stat-title">Total page views</div>
	<div class="stat-value">89,400</div>
	<div class="stat-desc">21% more than last month</div>
</div>`}
>
	<Stat title="Total page views" value="89,400" desc="21% more than last month" />
</Section>

<Section
	title="Figure and actions"
	svelte={`<Stat title="Total likes" value="25.6K" desc="↗︎ 400 (22%)">
	{#snippet figure()}<svg>…</svg>{/snippet}
	{#snippet actions()}<Button size="xs">Details</Button>{/snippet}
</Stat>`}
	html={`<div class="stat">
	<div class="stat-figure"><svg>…</svg></div>
	<div class="stat-title">Total likes</div>
	<div class="stat-value">25.6K</div>
	<div class="stat-desc">↗︎ 400 (22%)</div>
	<div class="stat-actions"><button class="btn btn-xs">Details</button></div>
</div>`}
>
	<Stat title="Total likes" value="25.6K" desc="↗︎ 400 (22%)">
		{#snippet figure()}{@render heart()}{/snippet}
		{#snippet actions()}<Button size="xs">Details</Button>{/snippet}
	</Stat>
	<Stat title="Tasks done" value="86%" desc="31 tasks remaining">
		{#snippet figure()}<Avatar size="lg" color="success">GV</Avatar>{/snippet}
	</Stat>
</Section>

<Section
	title="Stats"
	subtitle="One frame, a divider between each."
	svelte={`<Stats>
	<Stat title="Downloads" value="31K" desc="Jan 1st – Feb 1st" />
	<Stat title="New users" value="4,200" desc="↗︎ 400 (22%)" />
	<Stat title="New registers" value="1,200" desc="↘︎ 90 (14%)" />
</Stats>`}
	html={`<div class="stats">
	<div class="stat">…</div>
	<div class="stat">…</div>
	<div class="stat">…</div>
</div>`}
>
	<Stats>
		<Stat title="Downloads" value="31K" desc="Jan 1st – Feb 1st" />
		<Stat title="New users" value="4,200" desc="↗︎ 400 (22%)" />
		<Stat title="New registers" value="1,200" desc="↘︎ 90 (14%)" />
	</Stats>
</Section>

<Section
	title="Vertical"
	svelte={`<Stats direction="vertical">…</Stats>`}
	html={`<div class="stats stats-vertical">…</div>`}
>
	<Stats direction="vertical">
		<Stat title="Downloads" value="31K" desc="Jan 1st – Feb 1st" />
		<Stat title="New users" value="4,200" desc="↗︎ 400 (22%)" />
	</Stats>
</Section>
