<script lang="ts">
	import Code from '../Code.svelte';

	const FAMILY = `/* In a family, or in your own stylesheet */
@media (prefers-reduced-motion: no-preference) {
  .toast-item[data-motion='enter'] { animation: toast-in 0.2s ease-out; }
  .toast-item[data-motion='leave'] { opacity: 0; transition: opacity 0.15s; }
  .toast-item[data-motion='move']  { animation: toast-move 0.2s ease; }
}
@keyframes toast-move {
  from { translate: var(--motion-dx) var(--motion-dy); }
}`;

	const SVELTE = `<script>
  import { fly, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
<\/script>

<Dialog transition={fly}>…</Dialog>
<Dropdown transition={{ fn: fly, params: { y: -8, duration: 150 } }}>…</Dropdown>
<Toast transition={{ in: fly, out: fade }} animate={flip} />
<Alert dismissible transition={false}>Instant</Alert>`;

	const CROSS = `<script>
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  const pair = crossfade({ duration: 300 });   /* [send, receive] */
<\/script>

<!-- A card moved to another column flies there, the others slide -->
<Kanban items={tasks} key="id" columnOf={(t) => t.status} transition={pair} animate={flip}>…</Kanban>

<!-- Shared between two components, an item flies from one to the other -->
<ChipsInput bind:values={picked} transition={pair} />
<ChipsInput bind:values={left} transition={pair} />`;

	const REFLOW_CSS = `@media (prefers-reduced-motion: no-preference) {
  .kanban-item[data-motion='move'] { animation: kanban-move 0.25s ease; }
}
@keyframes kanban-move {
  from { translate: var(--motion-dx) var(--motion-dy); }
}`;

	const REFLOW_OWN = `<script>
  import { motion, Reflow } from '@sepale/components';

  let { cards, columns } = $props();
  let board = $state();
  const reflow = new Reflow(() => board, 'cardKey');   /* reads data-card-key */
  let ids = $derived(new Set(cards.map((c) => c.id)));  /* the keys after the change */

  $effect.pre(() => { void cards; reflow.measure(); });   /* before the DOM changes */
  $effect(() => { void cards; reflow.play(); });          /* after: marks the moves */
<\/script>

<div bind:this={board}>
  {#each columns as column (column.id)}
    {#each cards.filter((c) => c.column === column.id) as card (card.id)}
      <article
        data-card-key={card.id}
        in:motion={reflow.motion(card.id, undefined, ids.has(card.id))}
        out:motion={reflow.motion(card.id, undefined, ids.has(card.id))}
      >…</article>
    {/each}
  {/each}
</div>`;

	const OWN = `<script>
  import { motion, moved } from '@sepale/components';
<\/script>

{#each items as item (item.id)}
  <div class="card" in:motion out:motion animate:moved>…</div>
{/each}`;

	const INDICATOR = `.tabs-indicator {
  left: var(--tabs-x);
  width: var(--tabs-w);
  transition: left 0.25s, width 0.25s;   /* or none: it jumps */
}`;
</script>

<svelte:head><title>Motion: Sépale</title></svelte:head>

<h1 class="guide-title">Motion</h1>
<p class="guide-lede">
	How a component moves belongs to its family, like its colours. A component never plays an animation of its
	own: it says what is happening, and the family's CSS decides how it looks — or that nothing moves. Your app
	can still take any motion back with a Svelte transition.
</p>

<h2 class="guide-h2">Coming, going, moving</h2>
<p>
	When an element appears, leaves or changes place, the component marks it, then waits exactly as long as the
	family's CSS on it lasts, read from the computed style. A family that draws nothing makes it instant.
</p>
<dl class="guide-terms">
	<dt><code>data-motion="enter"</code></dt>
	<dd>Just inserted, while the family's animation runs. A new element has nothing to transition from: use <code>@keyframes</code> or <code>@starting-style</code>.</dd>
	<dt><code>data-motion="leave"</code></dt>
	<dd>Going: it stays in the DOM until its transitions and animations have run.</dd>
	<dt><code>data-motion="move"</code></dt>
	<dd>Changed place in a list. <code>--motion-dx</code> / <code>--motion-dy</code> hold where it came from.</dd>
	<dt><code>--motion-w</code> / <code>--motion-h</code></dt>
	<dd>Its size as it enters or leaves, for a family that opens or collapses it.</dd>
</dl>
<Code code={FAMILY} />
<p>
	A family writes its motion under <code>prefers-reduced-motion: no-preference</code>, and is free to draw
	none: the DOM tab of a component page says what it marks, whether the family picked draws it or not.
</p>

<h2 class="guide-h2">Continuous state is written, not played</h2>
<p>
	An indicator that follows a selection — tabs, a switch — gets its place in custom properties, measured
	after the change. The family decides whether it slides.
</p>
<Code code={INDICATOR} />

<h2 class="guide-h2">Your own Svelte transition</h2>
<p>
	Every component that makes something come and go takes a <code>transition</code> prop:
	<code>Dialog</code>, <code>Dropdown</code>, <code>Toast</code>, <code>Alert</code>,
	<code>DataControl</code>, <code>Combobox</code> and <code>Select</code> (their list),
	<code>ChipsInput</code> (a chip), <code>Kanban</code> (a card), <code>FileExplorer</code> (a branch of
	the tree). <code>Toast</code> and <code>ChipsInput</code> take <code>animate</code> for the move of the
	others. A family may not draw every one of these yet: then it is instant, and the prop is how you give it
	a motion.
</p>
<ul class="guide-list">
	<li><strong>Left out</strong>: the family plays it.</li>
	<li><strong><code>false</code></strong>: nothing does, it is instant.</li>
	<li>
		<strong>A Svelte transition</strong> — <code>fly</code>, <code>{'{ fn: fly, params }'}</code>,
		<code>{'{ in: fly, out: fade }'}</code> — plays instead. The element is then not marked, so the family's CSS
		stays out of it: the two never play at once.
	</li>
</ul>
<Code code={SVELTE} />

<h2 class="guide-h2">From one list to another: crossfade</h2>
<p>
	An item that changes list is not moved by Svelte: it leaves one list and a new element enters the other.
	Svelte's <code>crossfade()</code> pairs the two by a key and makes the item fly across. Its pair
	<code>[send, receive]</code> is a <code>transition</code> as is, and the components with keyed items —
	<code>Kanban</code>, <code>ChipsInput</code>, <code>Toast</code> — hand it each item's key. Give the list
	its <code>key</code> (<code>"id"</code>), or items are paired by position.
</p>
<Code code={CROSS} />

<h2 class="guide-h2">Moves the component measures (FLIP)</h2>
<p>
	The family's CSS cannot know that an item changed list: it sees an element leave and another enter. And
	Svelte's <code>animate:</code> only moves the sole child of a keyed block. Where neither reaches, a
	component can measure its moves itself: where each keyed element stands before a change, and after.
	An element that stands elsewhere is marked <code>data-motion="move"</code> from where it stood — the
	same phase as any other move, drawn by the same CSS — and an item that changed list neither leaves nor
	enters: its old element goes at once, the new one arrives as a move.
</p>
<p>
	<code>Kanban</code> does it for its cards, within a column and from one column to another. It is a
	mechanism ready for the families: none draws <code>move</code> on <code>.kanban-item</code> yet, so the
	cards still jump until one does — or until your stylesheet does.
</p>
<Code code={REFLOW_CSS} />
<p>
	The same tool, <code>Reflow</code>, is exported for your own lists. Measure in <code>$effect.pre</code>,
	play in <code>$effect</code>, and let <code>reflow.motion()</code> tell an item that only moves from one
	that comes or goes.
</p>
<Code code={REFLOW_OWN} />

<h2 class="guide-h2">What is not a coming and going</h2>
<p>
	A hover, a press, a focus, a colour that changes: the element stays, only its state changes. That is a
	CSS transition on <code>:hover</code> or <code>:active</code>, the family's like the rest of its look, and
	overridden in CSS. A Svelte transition only plays when an element enters or leaves the DOM, or moves in a
	keyed list.
</p>

<h2 class="guide-h2">The same contract for your elements</h2>
<p>
	<code>motion</code> and <code>moved</code> are exported: your own elements can leave their motion to the
	family, or to your stylesheet, the same way. <code>settle(node, done)</code> waits for the motion of a
	change of state.
</p>
<Code code={OWN} />
