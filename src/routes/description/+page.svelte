<script lang="ts">
	import { SECTIONS, NEUTRAL, generator } from '$lib/theme/store.svelte.js';
	import { isGroup, type Control, type Entry, type Group, type Section } from '$lib/theme/schema.js';

	/**
	 * The control → variable table: the documentation of the theme format.
	 *
	 * It is not a nicety. A theme is a flat file of custom properties and the
	 * generator's controls are not one-to-one with them — "press: push" writes
	 * four — so without this page, "the dev can go in and edit the values by
	 * hand" is a claim with nothing behind it. This is what makes it true.
	 *
	 * Everything here is derived: the sections, their controls, what each one
	 * writes, and what the neutral default is. Add a control and it appears.
	 */

	let live = $derived(generator.vars);

	/**
	 * A control and everything nested under it, flattened for the table.
	 *
	 * Each row carries its own key: the same control appears under more than
	 * one mode of a group — a width is offered by Solid, Dashed and Dotted —
	 * so the control's id is not unique here and the mode is what separates
	 * them.
	 */
	interface Row {
		control: Control | Group;
		depth: number;
		key: string;
	}

	function rows(entries: Entry[], depth = 0, prefix = ''): Row[] {
		return entries.flatMap((e) =>
			isGroup(e)
				? [
						{ control: e, depth, key: prefix + e.id },
						...rows(e.controls, depth + 1, `${prefix}${e.id}/`),
						...(e.type?.modes ?? []).flatMap((m) =>
							rows(m.controls, depth + 1, `${prefix}${e.id}:${m.id}/`)
						)
					]
				: [{ control: e, depth, key: prefix + e.id }]
		);
	}

	function countVars(section: Section): number {
		return new Set(rows(section.controls).flatMap((r) => r.control.vars)).size;
	}

	const kind = (c: Control | Group) =>
		isGroup(c)
			? c.type
				? `group (${c.type.modes.map((m) => m.id).join(' | ')})`
				: 'group'
			: c.type;
</script>

<main class="content">
	<section class="gallery">
		<h2 class="gallery-title">Variables</h2>

		<p class="doc-lede">
			Every control in the generator, and the CSS custom properties it writes. A theme is a flat
			file of these — nothing else — so this table is what lets you edit one by hand instead of
			going back to the form.
		</p>

		<p class="note">
			A control is not a variable. Some write several: <code>Press</code> writes four, and the edges
			of a shadow and its distance both feed the same two <code>box-shadow</code> layers. A few
			write a variable no stylesheet reads — those are the <strong>sentinels</strong>, and they are
			how the generator reopens a theme it wrote rather than seeing an unreadable pile of offsets.
		</p>

		{#each SECTIONS as section (section.id)}
			<section class="sec">
				<h3 class="sec-title">
					{section.label}
					<span class="sec-count">{countVars(section)} variables</span>
				</h3>
				{#if section.help}<p class="note">{section.help}</p>{/if}
				{#if section.prefixes.length}
					<p class="note">
						Prefixes: {#each section.prefixes as p, i (p)}<code
								>--{p}-</code
							>{i < section.prefixes.length - 1 ? ', ' : ''}{/each}
					</p>
				{/if}

				<table class="tbl">
					<thead>
						<tr><th>Control</th><th>Writes</th><th>Neutral</th><th>Now</th></tr>
					</thead>
					<tbody>
						{#each rows(section.controls) as { control, depth, key } (section.id + key)}
							<tr class:nested={depth > 0}>
								<td>
									<span class="ctl-name" style="padding-inline-start:{depth * 0.9}rem">
										{control.label}
									</span>
									<span class="ctl-kind">{kind(control)}</span>
									{#if control.help}<span class="ctl-help">{control.help}</span>{/if}
								</td>
								<td class="mono">
									{#each control.vars as v (v)}<span class="var">--{v}</span>{/each}
									{#if !control.vars.length}<span class="none">—</span>{/if}
								</td>
								<td class="mono dim">
									{#each control.vars as v (v)}<span class="val">{NEUTRAL[v] ?? '—'}</span>{/each}
								</td>
								<td class="mono">
									{#each control.vars as v (v)}<span
											class="val"
											class:changed={live[v] !== NEUTRAL[v]}>{live[v] ?? '—'}</span
										>{/each}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/each}
	</section>
</main>

<style>
	.note {
		margin: 0.5rem 0 0;
		max-width: 46rem;
		font-size: 0.8rem;
		line-height: 1.55;
		opacity: 0.7;
	}
	.sec {
		margin-top: 2.5rem;
	}
	.sec-title {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0;
	}
	.sec-count {
		font-size: 0.7rem;
		font-weight: 400;
		text-transform: none;
		letter-spacing: normal;
		opacity: 0.5;
	}
	.tbl {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		margin-top: 0.75rem;
		font-size: 0.75rem;
	}
	/* Fixed, because the help text is the widest thing here and an auto
	   layout gives it one word per line to make room for the values. */
	.tbl th:nth-child(1) {
		width: 34%;
	}
	.tbl th:nth-child(2) {
		width: 22%;
	}
	.tbl th:nth-child(3),
	.tbl th:nth-child(4) {
		width: 22%;
	}
	.tbl th {
		text-align: start;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.5;
		padding: 0.4rem 0.6rem;
		border-bottom: 1px solid color-mix(in oklab, currentColor 15%, transparent);
	}
	.tbl td {
		vertical-align: top;
		padding: 0.45rem 0.6rem;
		border-bottom: 1px solid color-mix(in oklab, currentColor 8%, transparent);
	}
	.nested td:first-child {
		opacity: 0.85;
	}
	.ctl-name {
		display: block;
		font-weight: 600;
	}
	.ctl-kind {
		display: block;
		font-size: 0.65rem;
		opacity: 0.5;
	}
	.ctl-help {
		display: block;
		margin-top: 0.15rem;
		max-width: 26rem;
		line-height: 1.4;
		opacity: 0.6;
	}
	.mono {
		font-family: ui-monospace, monospace;
		font-size: 0.68rem;
	}
	.var,
	.val {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dim {
		opacity: 0.55;
	}
	.changed {
		font-weight: 700;
	}
	.none {
		opacity: 0.4;
	}
</style>
