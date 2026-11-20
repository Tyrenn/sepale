<script lang="ts">
	import { resolve } from '$app/paths';
	import Code from '../Code.svelte';

	const AXES = `<Button color="primary" size="sm" variant="outline">Save</Button>
<!-- renders <button class="btn btn-primary btn-sm btn-outline"> -->

<Button active>Bold</Button>         <!-- a flag is a boolean: btn-active -->
<Button class="my-own">…</Button>    <!-- your classes are added, never replaced -->`;

	const BIND = `<script>
  let name = $state();
  let open = $state(false);
<\/script>

<Input bind:value={name} />
<Dialog bind:open onvalue={(v) => console.log('closed with', v)}>…</Dialog>
<Carousel bind:this={carousel} onindex={(i) => (shown = i)} />`;

	const EVENTS = `<Select
  onchange={(e) => console.log(e.target)}   /* the native event, untouched */
  onvalue={(value) => (picked = value)}      /* what the component adds */
/>`;

	const TYPES = `import '@sepale/style/daisy.css';   /* registers what daisy draws */

<Button variant="surface" />   /* a compile error if daisy has no surface variant */`;

	const PORTABLE = `/* Stay valid in every family you might switch to */
import type {} from '@sepale/style/cosmos.css';
import type {} from '@sepale/style/peony.css';

declare global {
  namespace Sepale {
    interface Config { portable: true }
  }
}`;

	const CLI = `npx sepale-types my-family.css   /* -> my-family.css.d.ts */`;
</script>

<svelte:head><title>Svelte components: Sépale</title></svelte:head>

<h1 class="guide-title">Svelte components</h1>
<p class="guide-lede">
	A wrapper renders a component's structure and writes its classes from props. It brings the behaviour too —
	focus, keyboard, ARIA, fetching for the data components — so a functional piece is one line in a page.
</p>

<h2 class="guide-h2">Axes and flags are props</h2>
<p>
	An axis is a prop that takes one of its values; a flag is a boolean. Every other attribute reaches the
	element, and <code>class</code> is added to the component's own.
</p>
<Code code={AXES} />

<h2 class="guide-h2">What you can bind</h2>
<p>
	A prop is bindable when its value <em>is</em> the component's state: <code>value</code>,
	<code>checked</code>, <code>open</code>, <code>page</code>. A value the component reads off the DOM — a
	carousel's index, read from its scroll — is not: the component gives commands to change it (through
	<code>bind:this</code>) and a callback to learn it.
</p>
<Code code={BIND} />

<h2 class="guide-h2">Callbacks and native events</h2>
<p>
	Native events are never taken over. <code>onchange</code>, <code>oninput</code>, <code>onclose</code> reach
	the element with their <code>Event</code>, even when the component listens to them too. What the component
	adds is a lowercase callback named after what it hands over: <code>onvalue(value)</code>,
	<code>onpage(page)</code>, <code>onopen(open)</code>, <code>ondismiss()</code>.
</p>
<Code code={EVENTS} />

<h2 class="guide-h2">Types follow the family</h2>
<p>
	Each family's stylesheet comes with its types, <code>daisy.css.d.ts</code>. Importing the stylesheet, from
	any file of your project, narrows every component's props to what the family ships. Switching family is
	changing that import; <code>svelte-check</code> then lists what the new family lacks. The runtime never
	changes.
</p>
<Code code={TYPES} />
<ul class="guide-list">
	<li><strong>No family imported</strong>: the props are generic, every variant of every family.</li>
	<li><strong>Several families imported</strong>: a prop accepts what any of them draws.</li>
	<li><strong>Portable</strong>: register the families and declare it, and a prop accepts only what all of them draw.</li>
</ul>
<Code code={PORTABLE} />
<p>
	A family that is not in the package — a private one, one made on the
	<a href={resolve('/new-family')}>Create a family</a> page — works the same once its types sit beside its
	stylesheet. Derive them, never write them by hand:
</p>
<Code code={CLI} />
