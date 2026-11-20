<script lang="ts">
	import { resolve } from '$app/paths';
	import Code from '../Code.svelte';

	const HOOK = `/* A hook: a custom property the component exposes */
.avatar.team { --avatar-bg: var(--color-accent); }`;

	const OVERRIDE = `/* Loaded after the family: one class against one class, yours wins */
.btn { text-transform: uppercase; }
.card-title { letter-spacing: -0.02em; }`;

	const SCOPE = `<section style="--color-primary: oklch(60% 0.18 150)">
  <Button color="primary">Green here</Button>
</section>`;
</script>

<svelte:head><title>Your own styles: Sépale</title></svelte:head>

<h1 class="guide-title">Your own styles</h1>
<p class="guide-lede">
	A family is a starting point, not a cage. From the lightest touch to the heaviest: tune a parameter, use a
	hook, override a class, write a family.
</p>

<h2 class="guide-h2">Tune a parameter</h2>
<p>
	The family's parameters are custom properties: set them after the theme, on the whole page or on one part
	of it. The <a href={resolve('/theme')}>theme generator</a> does it with a preview and gives you the file.
</p>
<Code code={SCOPE} />

<h2 class="guide-h2">Use a hook</h2>
<p>
	Some components expose custom properties of their own, listed as hooks on the DOM tab of their page. Set
	one on an element and that element changes, nothing else.
</p>
<Code code={HOOK} />

<h2 class="guide-h2">Override a class</h2>
<p>
	Most of a family's rules are one class, so a rule of yours loaded after the family wins without
	<code>!important</code>. A variant that reacts to states weighs more (<code>.btn-ghost:not(:hover)</code>):
	there, set a parameter or a hook rather than fight the selector.
</p>
<Code code={OVERRIDE} />

<h2 class="guide-h2">When your classes meet the kit's</h2>
<p>
	The kit's classes are plain: <code>btn</code>, <code>chip</code>, <code>title</code>. If your project
	already has a <code>.title</code>, a Vite plugin renames the kit's while you build: see
	<a href={resolve('/prefix')}>Class prefix</a>.
</p>

<h2 class="guide-h2">Write a family</h2>
<p>
	When the look you want is not a theme away, write a family. The
	<a href={resolve('/new-family')}>Create a family</a> page gives the reference, loads your stylesheet into
	this site and checks it against every component.
</p>
