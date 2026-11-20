<script lang="ts">
	import { resolve } from '$app/paths';
	import Code from './Code.svelte';

	const INSTALL = `npm install @sepale/components @sepale/style`;

	const LAYOUT = `<script>
  import '@sepale/style/reset.css';              /* optional */
  import '@sepale/style/daisy.css';              /* the family: every component */
  import '@sepale/style/daisy/themes/light.css'; /* one of its themes */
<\/script>`;

	const PAGE = `<script>
  import { Button, Input, Dialog } from '@sepale/components';
  let open = $state(false);
<\/script>

<Input placeholder="Your name" />
<Button color="primary" onclick={() => (open = true)}>Save</Button>

<Dialog bind:open title="Saved">Your name is kept.</Dialog>`;

	const HTML = `<link rel="stylesheet" href="daisy.css" />
<link rel="stylesheet" href="light.css" />

<button class="btn btn-primary btn-sm">Save</button>
<span class="badge badge-success">Paid</span>`;
</script>

<svelte:head><title>Getting started: Sépale</title></svelte:head>

<h1 class="guide-title">Getting started</h1>
<p class="guide-lede">
	Sépale is a set of components: each one a DOM structure and a few well-defined classes, and in Svelte a
	wrapper that puts it in a page in one line. How they look is a separate choice, a <strong>family</strong>:
	one stylesheet, tuned by a <strong>theme</strong>. Change the stylesheet and every component changes with
	it; the markup never does.
</p>

<h2 class="guide-h2">Install</h2>
<p>
	Two packages. <code>@sepale/style</code> holds the families and their themes, as plain CSS.
	<code>@sepale/components</code> holds the Svelte 5 components; they load no CSS of their own.
</p>
<Code code={INSTALL} />

<h2 class="guide-h2">Load a family and a theme</h2>
<p>
	Import them once, in your root layout. The reset is optional: no family depends on it. The family comes
	first, the theme after it.
</p>
<Code code={LAYOUT} label="src/routes/+layout.svelte" />
<p>
	Importing the stylesheet does more than style the page: it also narrows the components' types to what
	this family draws. A variant daisy does not ship becomes a compile error. See
	<a href={resolve('/guide/svelte')}>Svelte components</a>.
</p>

<h2 class="guide-h2">Use the components</h2>
<Code code={PAGE} />
<p>
	Each prop that picks a look — <code>color</code>, <code>size</code>, <code>variant</code> — writes one class,
	<code>btn-primary</code> here. The <a href={resolve('/components')}>component pages</a> list them all, for the
	family picked in the sidebar.
</p>

<h2 class="guide-h2">Without Svelte</h2>
<p>
	The families are plain CSS. Any page can write the classes by hand; the DOM tab of each component page
	shows the structure to write.
</p>
<Code code={HTML} />

<h2 class="guide-h2">Packages or a download</h2>
<ul class="guide-list">
	<li>
		<strong>The packages</strong> follow the kit: a fix or a new component reaches you with an update. Their
		public API — parameters, classes, props — follows semver.
	</li>
	<li>
		<strong>A bundle</strong>, downloaded from the <a href={resolve('/theme')}>theme generator</a>, is a
		snapshot: the family's stylesheet, your tuned <code>theme.css</code>, and, if you want them, the
		components rewritten for that family alone. It never updates. A bundle can also be only a
		<code>theme.css</code>, laid over the package's family.
	</li>
</ul>

<h2 class="guide-h2">Next</h2>
<p>
	Pick a family and a theme in the sidebar: every page of this site redraws with them. Then read how
	<a href={resolve('/guide/families')}>families and themes</a> work.
</p>
