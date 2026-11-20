<script lang="ts">
	import { resolve } from '$app/paths';
	import Code from '../Code.svelte';

	const SWITCH = `import '@sepale/style/daisy.css';      /* before */
import '@sepale/style/peony.css';      /* after: the same markup, another look */
import '@sepale/style/peony/themes/iris.css';`;

	const TUNE = `/* After the theme: a parameter is a custom property */
:root {
  --color-primary: oklch(55% 0.2 250);
}

/* or for one part of the page only */
.checkout {
  --color-primary: oklch(60% 0.18 150);
}`;
</script>

<svelte:head><title>Families and themes: Sépale</title></svelte:head>

<h1 class="guide-title">Families and themes</h1>
<p class="guide-lede">
	The components say what something is. A family says how it looks. You choose a family, then tune it
	lightly with a theme; you never restyle a component from scratch to get a coherent look.
</p>

<h2 class="guide-h2">A family</h2>
<p>
	A family is an opinionated visual direction, compiled to one stylesheet that draws every component it
	styles. Changing family is changing that stylesheet, never the markup.
</p>
<Code code={SWITCH} />
<p>
	Each family is self-contained: it reads nothing from another one, so two families can differ as much as
	they like — a flat one, a hand-drawn one, a glassy one. The cost is accepted on purpose: a family does
	not have to ship every variant another one has. The <a href={resolve('/description')}>description</a> of
	the family picked in the sidebar says what it is after and what it exposes.
</p>

<h2 class="guide-h2">Parameters</h2>
<p>
	A parameter is a custom property the family exposes for tuning: colours, radii, and the family's own knobs
	(a shadow offset, a wobble, a blur). Each family decides its own set. One may expose fifteen background
	colours, another none; sharing a name between two families is a convenience, never a rule.
</p>

<h2 class="guide-h2">A theme</h2>
<p>
	A theme is a named set of values for one family's parameters, and belongs to that family: it can only set
	what its family exposes. A theme is a stylesheet too, loaded after the family. Since parameters are custom
	properties, any of them can be overridden by hand, for the whole page or for one part of it.
</p>
<Code code={TUNE} />

<h2 class="guide-h2">Sizes follow the text</h2>
<p>
	Every component is sized in <code>em</code>, from its own font size: a button in a larger context grows
	with it, without a breakpoint. A size variant (<code>sm</code>, <code>lg</code>…) only sets that font
	size. The type scale is fixed, a ratio of 1.125 on a base of <code>1rem</code>; a family's
	<code>--scale</code> may grow the frames — paddings, gaps — never the text.
</p>

<h2 class="guide-h2">Make your own theme</h2>
<p>
	The <a href={resolve('/theme')}>theme generator</a> edits every parameter of the family picked in the
	sidebar, on a live preview, and downloads the result as a <code>theme.css</code> to load after the family.
</p>
