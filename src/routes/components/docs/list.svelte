<script module lang="ts">
	/**
	 * The hand-written half of this page: what the component is, what each
	 * of its classes does, and what its props mean. WHICH classes exist is
	 * not written here — that is read back from the active family's compiled
	 * CSS (src/lib/generated/components.ts), so a page cannot claim a class
	 * the family does not ship.
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
			"list-suggestions": "A floating list of things to pick from, rather than a block of rows.",
			"list-row-selected": "A row whose key is in `selected`.",
			"list-row-dirty": "A row whose key is in `dirty`: changed, not saved.",
			"list-empty": "Drawn in place of the rows when there are none."
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
				},
				{ name: "key", type: "(row, index) => string", default: "the index", description: "A row's identity, for selected, dirty and keyed rendering." },
				{ name: "selected", type: "Iterable<string>", description: "Keys of the rows drawn as selected." },
				{ name: "dirty", type: "Iterable<string>", description: "Keys of the rows drawn as changed and not saved." },
				{ name: "empty", type: "Snippet", description: "Drawn in place of the rows when there are none." }
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
			style="width:24rem; border:1px solid var(--app-bg-2);"
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
		style="width:22rem; border:1px solid var(--app-bg-2);"
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

<Section
	title="Selected, changed, loading"
	subtitle="The same states a table has: selected and dirty take keys, loading fades the rows."
	svelte={`<List rows={deployments} key={(d) => d.name} selected={['Build']} dirty={['Rollback']} {row} />`}
>
	<List
		rows={[
			{ name: 'Deployment', when: '2 min ago', state: 'live' },
			{ name: 'Build', when: '11 min ago', state: 'queued' },
			{ name: 'Rollback', when: 'yesterday', state: 'failed' }
		]}
		key={(d) => d.name}
		selected={['Build']}
		dirty={['Rollback']}
		row={deployRow}
		style="width:22rem; border:1px solid var(--app-bg-2);"
	/>
</Section>
