<script module lang="ts">
	/** What .steps is made of, classified. Each family's copy writes these out as
	    plain props (scripts/family-component.mjs). */
	export const PREFIX = 'steps';

	export const AXES = {
		direction: ['horizontal', 'vertical'],
		color: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		size: ['xs', 'sm', 'md', 'lg', 'xl']
	} as const;

	export const FLAGS = {
		compact: 'No markers nor labels: the bars, and a heading above them (small screens).'
	} as const;
	export const PARTS = [
		'heading',
		'list',
		'item',
		'track',
		'marker',
		'segment',
		'label',
		'issue',
		'sublabel'
	] as const;

	/** A stage of the journey. Its sub-steps go one level deep, no further. */
	export interface Step {
		id: string | number;
		label?: string;
		/** The sub-steps. A step without any is a stage of its own. */
		steps?: Step[];
		/** Declared done by the app. Visiting a step does not complete it. */
		complete?: boolean;
		/** Shown once the step has been reached. */
		error?: string;
		warning?: string;
	}

	/** current · visited (reached before) · complete (declared) · unknown (not reached). */
	export type StepState = 'current' | 'visited' | 'complete' | 'unknown';
</script>

<script lang="ts">
	/**
	 * Where the user is in a journey: one column per step, one bar per sub-step.
	 *
	 * The component moves nothing: a click calls `onStep` with the step, and
	 * the app decides whether to change `current`. A step is clickable once it
	 * has been reached (current, visited or complete) — a step's own marker
	 * leads to its first sub-step. `clickable={false}` or `disabled` turns that
	 * off.
	 *
	 * `explored` is the first leaf never reached; every leaf before it counts
	 * as visited. Without it, everything up to `current` does.
	 */
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { applyAxes, cx, type AxisProps } from '../variants.js';

	interface Props extends AxisProps<typeof AXES, typeof FLAGS>, Omit<HTMLAttributes<HTMLElement>, 'color'> {
		steps: Step[];
		/** The id of the current leaf (a sub-step, or a step without any). */
		current?: Step['id'];
		/** The id of the first leaf never reached. */
		explored?: Step['id'];
		/** Reached steps answer clicks. */
		clickable?: boolean;
		disabled?: boolean;
		/** A reached step was clicked: a leaf, or the first leaf of a step. */
		onStep?: (step: Step) => void;
		/** The line above the bars in compact mode. Defaults to "label · sub-label   n/total". */
		heading?: Snippet<[{ step: Step | undefined; parent: Step | undefined; index: number; total: number }]>;
		/** The nav's accessible name. */
		label?: string;
		class?: string;
	}

	// The axes are deliberately NOT destructured: they travel in `axes` and are
	// resolved by name, so an axis a family drops changes nothing down here.
	let {
		steps,
		current,
		explored,
		clickable = true,
		disabled = false,
		onStep,
		heading,
		label = 'Progress',
		class: klass = '',
		...axes
	}: Props = $props();

	let applied = $derived(applyAxes(PREFIX, AXES, FLAGS, axes));
	let classes = $derived(cx(PREFIX, applied.classes, klass));
	/* Read back from the classes: a family's copy has no `axes`. */
	let condensed = $derived(classes.includes(`${PREFIX}-compact`));

	const leavesOf = (s: Step) => (s.steps?.length ? s.steps : [s]);
	let leaves = $derived(steps.flatMap(leavesOf));
	let currentAt = $derived(leaves.findIndex((l) => l.id === current));
	let exploredAt = $derived.by(() => {
		const i = explored === undefined ? -1 : leaves.findIndex((l) => l.id === explored);
		return i >= 0 ? i : currentAt + 1;
	});

	function leafState(leaf: Step): StepState {
		if (leaf.id === current) return 'current';
		if (leaf.complete) return 'complete';
		return leaves.indexOf(leaf) < exploredAt ? 'visited' : 'unknown';
	}

	function stepState(step: Step): StepState {
		const states = leavesOf(step).map(leafState);
		if (states.includes('current')) return 'current';
		if (states.every((s) => s === 'complete')) return 'complete';
		return states.some((s) => s !== 'unknown') ? 'visited' : 'unknown';
	}

	/** The issue a reached leaf carries. */
	const issueOf = (leaf: Step, state: StepState) =>
		state === 'unknown' ? undefined : leaf.error ? 'error' : leaf.warning ? 'warning' : undefined;

	const reachable = (state: StepState) => clickable && !disabled && state !== 'unknown';

	let currentParent = $derived(steps.find((s) => leavesOf(s).some((l) => l.id === current)));
	let currentLeaf = $derived(leaves[currentAt]);
</script>

{#snippet issueIcon(kind: 'error' | 'warning', text: string)}
	<span class="steps-issue" data-issue={kind} title={text} role="img" aria-label={text}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" />
		</svg>
	</span>
{/snippet}

<nav {...applied.rest} class={classes} aria-label={label}>
	{#if condensed}
		<div class="steps-heading">
			{#if heading}
				{@render heading({ step: currentLeaf, parent: currentParent, index: steps.indexOf(currentParent!) + 1, total: steps.length })}
			{:else}
				<span>
					{currentParent?.label ?? ''}{#if currentParent && currentLeaf && currentLeaf !== currentParent && currentLeaf.label}{' · '}{currentLeaf.label}{/if}
				</span>
				<span>{steps.indexOf(currentParent!) + 1}/{steps.length}</span>
			{/if}
		</div>
	{/if}
	<ol class="steps-list">
		{#each steps as step, n (step.id)}
			{@const state = stepState(step)}
			{@const own = leavesOf(step)}
			{@const issues = own
				.map((l) => ({ kind: issueOf(l, leafState(l)), text: l.error ?? l.warning ?? '' }))
				.filter((i) => i.kind)}
			<li class="steps-item" data-state={state}>
				<div class="steps-track">
					{#if !condensed}
						<button
							type="button"
							class="steps-marker"
							aria-label={step.label ?? `${n + 1}`}
							disabled={!reachable(state)}
							onclick={() => onStep?.(own[0])}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
						</button>
					{/if}
					{#each own as leaf, i (leaf.id)}
						{@const ls = leafState(leaf)}
						<button
							type="button"
							class="steps-segment"
							data-state={ls}
							data-issue={issueOf(leaf, ls)}
							title={(issueOf(leaf, ls) && (leaf.error ?? leaf.warning)) || leaf.label}
							aria-label={leaf.label ?? `${n + 1}${own.length > 1 ? `.${i + 1}` : ''}`}
							aria-current={ls === 'current' ? 'step' : undefined}
							disabled={!reachable(ls)}
							onclick={() => onStep?.(leaf)}
						>
							<span></span>
						</button>
					{/each}
				</div>
				{#if !condensed && (step.label || issues.length)}
					<p class="steps-label">
						{#if step.label}<span>{step.label}</span>{/if}
						{#if issues.some((i) => i.kind === 'error')}
							{@render issueIcon('error', issues.filter((i) => i.kind === 'error').map((i) => i.text).join('\n'))}
						{:else if issues.length}
							{@render issueIcon('warning', issues.map((i) => i.text).join('\n'))}
						{/if}
					</p>
				{/if}
				{#if !condensed && state === 'current' && own.length > 1 && currentLeaf?.label}
					<p class="steps-sublabel">{currentLeaf.label}</p>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
