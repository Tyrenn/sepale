<script lang="ts">
	import { resolve } from '$app/paths';
	import Code from '../Code.svelte';

	const CLASSES = `<button class="btn btn-primary btn-sm btn-outline">Save</button>
<!--          root   axis color   size    variant -->

<div class="card">
  <div class="card-body">            <!-- a part -->
    <h2 class="card-title">Plan</h2> <!-- a part -->
  </div>
</div>`;

	const STATES = `<button class="btn" disabled>…</button>           <!-- the DOM says it: drawn disabled -->
<input type="checkbox" class="checkbox" checked /> <!-- drawn checked -->
<button class="btn btn-active">…</button>          <!-- a flag: held pressed by the app -->`;
</script>

<svelte:head><title>Components and classes: Sépale</title></svelte:head>

<h1 class="guide-title">Components and classes</h1>
<p class="guide-lede">
	A component is a DOM structure and a set of classes, all rooted in one name. Knowing the five kinds of
	class is enough to read any component page, and to write any component by hand.
</p>

<h2 class="guide-h2">The namespace</h2>
<p>
	Every class of a component starts with its <strong>namespace</strong>: <code>btn</code> yields
	<code>.btn</code>, <code>.btn-primary</code>, <code>.btn-ripple-wave</code>. A namespace has one owner, so
	a class tells you at a glance which component it belongs to. A component may still reach into another one:
	a validator colours the input it checks, a join glues buttons together.
</p>

<h2 class="guide-h2">Five kinds of class</h2>
<Code code={CLASSES} />
<dl class="guide-terms">
	<dt>Root</dt>
	<dd>The component itself: <code>.btn</code>, <code>.card</code>. Alone, it draws the default look.</dd>
	<dt>Axis</dt>
	<dd>
		A group of mutually exclusive variants, named after what it changes: <code>color</code>,
		<code>size</code>, <code>shape</code>, <code>width</code>. At most one value of an axis applies at a time,
		so the component pages list an axis as one row. <code>variant</code> is the name kept for an exclusive
		group with no better one (<code>outline</code>, <code>ghost</code>, <code>link</code>…).
	</dd>
	<dt>Flag</dt>
	<dd>
		A variant that excludes nothing: <code>.btn-active</code>, <code>.menu-sub-closed</code>. Two flags at
		once are a legal state.
	</dd>
	<dt>Part</dt>
	<dd>
		A piece the component is made of, on the element that plays it: <code>.card-body</code>,
		<code>.menu-title</code>. A part is never opted into; it belongs to the structure.
	</dd>
	<dt>Plain class</dt>
	<dd>
		A few components are a single class with nothing to wrap: <code>text</code>, <code>link</code>,
		<code>validator</code>. They have no Svelte wrapper; you write the class.
	</dd>
</dl>

<h2 class="guide-h2">A family ships what it draws</h2>
<p>
	An axis belongs to the component, not to the family, but a family may ship only part of it. The component
	pages show what the family picked in the sidebar ships: switch family and the tables change. In Svelte, the
	types follow the same way.
</p>

<h2 class="guide-h2">States come from the DOM</h2>
<p>
	A state is read from the element itself whenever the DOM can say it — <code>:hover</code>,
	<code>:focus-visible</code>, <code>:disabled</code>, <code>:checked</code>, <code>aria-expanded</code> —
	and only otherwise from a class, a flag or a part (<code>.btn-active</code>,
	<code>.tabs-item-active</code>). The DOM tab of a component page lists the states each family draws.
</p>
<Code code={STATES} />

<h2 class="guide-h2">Reading a component page</h2>
<ul class="guide-list">
	<li><strong>CSS</strong>: every class the family ships for it, by kind, axes grouped.</li>
	<li><strong>Svelte</strong>: the props of its wrapper; an axis is a prop that takes one of its values.</li>
	<li>
		<strong>DOM</strong>: the structure each example renders, its states, the custom properties it exposes
		(its hooks) and how it moves.
	</li>
</ul>
<p>Start with the <a href={resolve('/components')}>list of components</a>.</p>
