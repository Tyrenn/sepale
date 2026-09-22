<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the compiled kit
	 * (src/lib/generated/classes.ts), so a page cannot claim a class the
	 * stylesheet does not have, and the build fails on a class no page
	 * describes.
	 *
	 * `namespaces` is the one piece of structure: it says which classes
	 * belong here. Nothing else can know that `.title` is part of `text`.
	 */
	import type { ComponentDoc } from '../doc.js';

	export const DOC: ComponentDoc = {
		namespaces: ["list"],
		description:
			"Rows of data in a painted box. Distinct from menu, which goes somewhere, and from tabs, which switches what is shown.",
		classes: {
			"list-row": "One row. The component wraps each of your snippets in one.",
			"list-col-grow": "Inside a row: the column that takes the leftover width.",
			"list-col-wrap": "Inside a row: the column allowed to wrap onto several lines.",
			"list-suggestions": "A floating list of things to pick from, rather than a block of rows."
		},
		props: {
			List: [
				{
					name: "rows",
					type: "(Row | Snippet)[]",
					default: "[]",
					description: "The rows. An entry is your data — rendered by `row`, or as text when there is no `row` — or a snippet standing in for that one row."
				},
				{
					name: "row",
					type: "Snippet<[Row]>",
					description: "How to draw every row that is data. Written once for the whole list; an entry that is itself a snippet skips it."
				}
			]
		}
	};
</script>

<script lang="ts">
	import Section from '../../Section.svelte';
	import {
		List
	} from '$lib/index.js';
</script>

	{#snippet listRow(title: string, secondary: string, right: string)}
		<div>
			<p style="font-weight:600;">{title}</p>
			<p style="opacity:.6; font-size:.875em;">{secondary}</p>
		</div>
		<div class="list-col-grow" style="text-align:right; opacity:.6;">{right}</div>
	{/snippet}
	{#snippet firstRow()}{@render listRow('Item title', 'Secondary info', 'Right')}{/snippet}
	{#snippet secondRow()}{@render listRow('Another item', 'More info here', 'Value')}{/snippet}

	<Section
		title="Rows"
		subtitle="One snippet per row; the list wraps each in its own .list-row."
		svelte={`{#snippet firstRow()}
	<div>
		<p style="font-weight:600;">Item title</p>
		<p style="opacity:.6; font-size:.875em;">Secondary info</p>
	</div>
	<div class="list-col-grow" style="text-align:right; opacity:.6;">Right</div>
{/snippet}

<List rows={[firstRow, secondRow]} style="width:24rem;" />`}
		html={`<ul class="list" style="width:24rem;">
	<li class="list-row">
		<div>
			<p style="font-weight:600;">Item title</p>
			<p style="opacity:.6; font-size:.875em;">Secondary info</p>
		</div>
		<div class="list-col-grow" style="text-align:right; opacity:.6;">Right</div>
	</li>
</ul>`}
	>
		<List
			rows={[firstRow, secondRow]}
			style="width:24rem; border:1px solid var(--color-surface-2);"
		/>
	</Section>

{#snippet deployRow(d: { name: string; when: string; state: string })}
	<div>
		<p style="font-weight:600;">{d.name}</p>
		<p style="opacity:.6; font-size:.875em;">{d.when}</p>
	</div>
	<div class="list-col-grow" style="text-align:right; opacity:.6;">{d.state}</div>
{/snippet}

<Section
	title="Plain rows"
	subtitle="A row that is a string is drawn as text, inside the .list-row the list writes for it."
	svelte={`<List rows={['Deployment', 'Build', 'Rollback']} />`}
	html={`<ul class="list">
	<li class="list-row">Deployment</li>
	<li class="list-row">Build</li>
	<li class="list-row">Rollback</li>
</ul>`}
>
	<List rows={['Deployment', 'Build', 'Rollback']} style="width:18rem;" />
</Section>

<Section
	title="One snippet for every row"
	subtitle="Pass your own data and say once how a row is drawn. The list still writes the <li> and its class — you fill it."
	svelte={`{#snippet row(d)}
	<div>
		<p style="font-weight:600;">{d.name}</p>
		<p style="opacity:.6; font-size:.875em;">{d.when}</p>
	</div>
	<div class="list-col-grow" style="text-align:right; opacity:.6;">{d.state}</div>
{/snippet}

<List rows={deployments} {row} />`}
>
	<List
		rows={[
			{ name: 'Deployment', when: '2 min ago', state: 'live' },
			{ name: 'Build', when: '11 min ago', state: 'queued' },
			{ name: 'Rollback', when: 'yesterday', state: 'failed' }
		]}
		row={deployRow}
		style="width:22rem; border:1px solid var(--color-surface-2);"
	/>
</Section>

<Section
	title="Suggestions"
	subtitle="The dropdown variant: the box floats, the rows lose their separator and gain a hover, and the option the keyboard is on is marked with aria-selected."
	html={`<ul class="list list-suggestions" role="listbox">
	<li class="list-row" role="option" aria-selected="false">Paris</li>
	<li class="list-row" role="option" aria-selected="true">Lyon</li>
	<li class="list-row" role="option" aria-selected="false">Marseille</li>
</ul>`}
>
	<ul class="list list-suggestions" role="listbox" style="width:14rem;">
		<li class="list-row" role="option" aria-selected="false">Paris</li>
		<li class="list-row" role="option" aria-selected="true">Lyon</li>
		<li class="list-row" role="option" aria-selected="false">Marseille</li>
	</ul>
</Section>
