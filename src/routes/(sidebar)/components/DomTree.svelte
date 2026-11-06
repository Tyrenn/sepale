<script lang="ts">
	// One level of a rendered DOM tree (dom.ts), drawn as indented markup. Each
	// class is tagged with what it is — root, part, axis, flag — by the
	// components' own vocabulary (classify.ts), whatever family is active: the
	// structure is the components', a family only paints it.
	import { isElement, type DomElement, type DomNode } from './dom.js';
	import { classify } from '../../classify.js';
	import { statesByClass } from '$lib/generated/components.js';
	import Self from './DomTree.svelte';

	let { nodes, depth = 0 }: { nodes: DomNode[]; depth?: number } = $props();

	interface Token {
		t: 'punct' | 'tag' | 'attr' | 'value' | 'class' | 'text' | 'repeat';
		s: string;
		kind?: string;
		title?: string;
	}

	function title(cls: string): string {
		const info = classify(cls);
		const what =
			info.kind === 'axis'
				? `axis ${info.axis} = ${info.value}`
				: info.kind === 'flag'
					? `flag, written by the ${info.prop} prop`
					: info.kind === 'unclassified'
						? 'no wrapper classifies it'
						: info.kind;
		const states = statesByClass[cls];
		return states?.length ? `${what} · states drawn on it: ${states.join(' ')}` : what;
	}

	/* The opening tag as a flat run of tokens: rendered on one line, so no
	   template whitespace can slip in between them. */
	function open(el: DomElement): Token[] {
		const out: Token[] = [
			{ t: 'punct', s: '<' },
			{ t: 'tag', s: el.tag }
		];
		for (const [name, value] of el.attrs) {
			out.push({ t: 'attr', s: ` ${name}` });
			if (value === null) continue;
			out.push({ t: 'punct', s: '="' });
			if (name === 'class') {
				value.split(' ').forEach((cls, i) => {
					if (i) out.push({ t: 'value', s: ' ' });
					out.push({ t: 'class', s: cls, kind: classify(cls).kind, title: title(cls) });
				});
			} else {
				out.push({ t: 'value', s: value });
			}
			out.push({ t: 'punct', s: '"' });
		}
		out.push({ t: 'punct', s: '>' });
		if (el.elided) out.push({ t: 'text', s: '…' });
		if (el.repeat) out.push({ t: 'repeat', s: `×${el.repeat}`, title: 'Siblings shaped exactly like this one, folded' });
		return out;
	}
</script>

{#each nodes as node, i (i)}
	{#if isElement(node)}
		<div class="dt-line" style:--depth={depth}>{#each open(node) as k, j (j)}<span class="dt-{k.t}" data-kind={k.kind} title={k.title}>{k.s}</span>{/each}</div>
		{#if node.children.length}<Self nodes={node.children} depth={depth + 1} />{/if}
	{:else}
		<div class="dt-line" style:--depth={depth}><span class="dt-text">{node.text}</span></div>
	{/if}
{/each}

<style>
	.dt-line {
		padding-left: calc(var(--depth) * 1.1rem);
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.6;
	}
	.dt-punct {
		color: color-mix(in oklab, var(--app-fg) 40%, transparent);
	}
	.dt-tag {
		color: var(--ui-color-primary);
		font-weight: 600;
	}
	.dt-attr {
		color: color-mix(in oklab, var(--app-fg) 65%, transparent);
	}
	.dt-value {
		color: color-mix(in oklab, var(--app-fg) 85%, transparent);
	}
	.dt-text {
		color: color-mix(in oklab, var(--app-fg) 50%, transparent);
		font-style: italic;
	}
	.dt-class {
		padding: 0 0.15em;
		border-radius: 0.25rem;
		cursor: help;
	}
	/* One tint per kind, as in the legend under the tree. */
	.dt-class[data-kind='root'] {
		background: color-mix(in oklab, var(--ui-color-primary) 22%, transparent);
		font-weight: 600;
	}
	.dt-class[data-kind='part'] {
		background: color-mix(in oklab, var(--ui-color-info) 20%, transparent);
	}
	.dt-class[data-kind='axis'] {
		background: color-mix(in oklab, var(--ui-color-success) 20%, transparent);
	}
	.dt-class[data-kind='flag'] {
		background: color-mix(in oklab, var(--ui-color-warning) 24%, transparent);
	}
	.dt-class[data-kind='unclassified'] {
		background: color-mix(in oklab, var(--app-fg) 8%, transparent);
	}
	.dt-repeat {
		margin-left: 0.5rem;
		padding: 0 0.4em;
		border-radius: 0.6rem;
		font-size: 0.85em;
		background: color-mix(in oklab, var(--app-fg) 10%, transparent);
	}
</style>
