<script lang="ts">
	import { resolve } from '$app/paths';
	import { GITHUB } from '../links.js';
	import Page from '../Page.svelte';

	const ADR = `${GITHUB}/blob/main/docs/adr`;

	const options = [
		{
			name: 'prefix',
			type: 'string',
			text: 'Lowercase letters and digits, without the dash: sp writes sp-btn. Left out, the plugin does nothing and the kit stays unprefixed.'
		},
		{
			name: 'family',
			type: 'string | string[]',
			text: 'The family stylesheet(s) the project imports, by package path or relative to the project. Required with a prefix: the classes to rename are the ones it ships. Themes carry no class and are not listed.'
		},
		{
			name: 'components',
			type: 'RegExp',
			text: "Where the package's build is, tested on a file's path. Default: @sepale/components/dist in node_modules. Only worth setting for a build kept somewhere else."
		}
	];

	const SETUP = `// vite.config.ts
import { sepale } from '@sepale/components/vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default {
  plugins: [
    sepale({ prefix: 'sp', family: '@sepale/style/peony.css' }),
    sveltekit()
  ]
};`;

	const LAYOUT = `<script>
  import '@sepale/style/peony.css';            // still the unprefixed file: the plugin renames it
  import '@sepale/style/peony/themes/iris.css';
  import { Button, Chip } from '@sepale/components';
<\/script>

<Button color="primary">Save</Button>          <!-- renders <button class="sp-btn sp-btn-primary"> -->
<Chip>Draft</Chip>                             <!-- your own .chip is no longer the kit's -->`;

	const OWN = `<!-- Your own markup takes the prefixed names too -->
<p class="sp-text-s2 sp-text-b1">Fixed price</p>

<!-- and so does a class you give a component -->
<Input class="sp-input-ghost" />`;

	const PRIVATE = `// A family that is not in @sepale/style: a private one, one built from a theme editor,
// one written by hand. Same option, any path.
sepale({ prefix: 'sp', family: '@acme/ui/acme.css' })
sepale({ prefix: 'sp', family: './src/styles/acme.css' })`;

	const OTHER = `// Any other build tool: the plugin is a thin layer over two functions.
import { classesIn, prefixCss, prefixComponent } from '@sepale/components/prefix';

const css = readFileSync('peony.css', 'utf8');
const classes = classesIn(css);                    // what the family ships

writeFileSync('peony.sp.css', prefixCss(css, 'sp'));
// on every .svelte of @sepale/components, before Svelte compiles it:
const { code } = prefixComponent(source, 'sp', classes);`;

	const BEFORE = `.btn { … }                .sp-btn { … }
.btn-primary { … }   →    .sp-btn-primary { … }
.toast.toast-top { … }    .sp-toast.sp-toast-top { … }
--btn-bg: #fff;           --btn-bg: #fff;              /* a custom property is never renamed */`;
</script>

<svelte:head>
	<title>Class prefix: Sépale</title>
	<meta
		name="description"
		content="Sépale's classes are unprefixed. When your own classes would meet them (.title, .chip, .label), a Vite plugin in @sepale/components renames the kit's at build time."
	/>
</svelte:head>

<Page>
	<main class="s-page s-prefix">
		<h1 class="s-h1 s-prefix-title">Class prefix</h1>
		<p class="s-prefix-lead">
			Sépale's classes are plain: <code class="s-prefix-code">btn</code>, <code class="s-prefix-code">chip</code>, <code class="s-prefix-code">title</code>. In a project that
			already has a <code class="s-prefix-code">.title</code> or a <code class="s-prefix-code">.chip</code> of its own, the kit styles it by name. A Vite plugin shipped
			in <code class="s-prefix-code">@sepale/components</code> renames the kit's classes while the project builds, so the two never meet.
		</p>

		<h2 class="s-h2 s-prefix-more">Turn it on</h2>
		<p>
			One line in the Vite config. The prefix is yours to choose, which is why it is applied while you build rather than shipped: nothing
			published carries it, and without the option nothing changes.
		</p>
		<div class="s-code"><pre>{SETUP}</pre></div>
		<p>The project keeps importing the same stylesheet and the same components. The plugin renames both on their way through the build.</p>
		<div class="s-code"><pre>{LAYOUT}</pre></div>

		<h2 class="s-h2 s-prefix-more">Options</h2>
		<dl class="s-prefix-options">
			{#each options as option (option.name)}
				<dt>
					<code class="s-prefix-code">{option.name}</code>
					<span class="s-prefix-type">{option.type}</span>
				</dt>
				<dd>{option.text}</dd>
			{/each}
		</dl>

		<h2 class="s-h2 s-prefix-more">What is renamed</h2>
		<p>Classes, and only classes. The stylesheet and the components are renamed from the same list, the classes the family ships, so they cannot disagree.</p>
		<ul class="s-prefix-list">
			<li><strong>The family stylesheet</strong>, token by token. Comments, strings and <code class="s-prefix-code">url()</code> are left alone.</li>
			<li>
				<strong>The components</strong> of <code class="s-prefix-code">@sepale/components</code>: <code class="s-prefix-code">class</code> attributes and directives, the classes
				a component builds from its name (<code class="s-prefix-code">checkbox</code> and <code class="s-prefix-code">checkbox-primary</code>), classes it tests or
				toggles, classes in the selectors it queries.
			</li>
			<li>
				<strong>Not renamed</strong>: custom properties (<code class="s-prefix-code">--btn-bg</code>), keyframes, element selectors, attributes, and the classes
				of a library the kit only reaches into (<code class="s-prefix-code">air-datepicker</code>).
			</li>
		</ul>
		<div class="s-code"><pre>{BEFORE}</pre></div>
		<p>So a theme, a <code class="s-prefix-code">background</code> prop or a reset needs no change: they never named a class.</p>

		<h2 class="s-h2 s-prefix-more">Your own markup</h2>
		<p>
			A class you write on an element, or hand to a component through <code class="s-prefix-code">class</code>, <code class="s-prefix-code">chipClass</code> or
			<code class="s-prefix-code">field</code>, is the kit's own: it takes the prefix too. The types do not know the prefix. They narrow what a family
			draws (<code class="s-prefix-code">color</code>, <code class="s-prefix-code">size</code>), not how a class is spelled.
		</p>
		<div class="s-code"><pre>{OWN}</pre></div>

		<h2 class="s-h2 s-prefix-more">A family that is not in <code class="s-prefix-code">@sepale/style</code></h2>
		<p>
			<code class="s-prefix-code">family</code> takes any stylesheet that follows the family contract, so a private family or one made on
			<a class="s-link" href={resolve('/new-family')}>the family page</a> is prefixed like the published ones. It is the plugin that reads it: the prefix is never part of
			its build.
		</p>
		<div class="s-code"><pre>{PRIVATE}</pre></div>

		<h2 class="s-h2 s-prefix-more">Another bundler</h2>
		<p>Only Vite has a plugin. The two functions behind it are exported, so any build step can do the same.</p>
		<div class="s-code"><pre>{OTHER}</pre></div>

		<h2 class="s-h2 s-prefix-more">Limits</h2>
		<ul class="s-prefix-list">
			<li>A rename is made on the syntax tree, so a class has to be written where it can be seen: a string in a class attribute, or in what the attribute reads. A class assembled elsewhere would be missed.</li>
			<li>
				That is checked on what ships: <code class="s-prefix-code">pnpm run check:prefix</code> renders every component, every axis value and every flag through the plugin and fails
				on any class of a family that comes out unprefixed.
			</li>
			<li>No source map for the renamed files: a rename moves columns on a line, never lines.</li>
			<li>
				The decisions are written down in <a class="s-link" href="{ADR}/0007-class-prefix-deferred.md">ADR 0007</a> and
				<a class="s-link" href="{ADR}/0017-the-prefix-is-a-vite-plugin.md">ADR 0017</a>.
			</li>
		</ul>
	</main>
</Page>

<style>
	/* A single reading column, centered by .s-page. */
	.s-prefix {
		--s-page: 52rem;
		padding-block: clamp(32px, 5vw, 64px);
	}

	.s-prefix-title {
		font-size: clamp(2.2rem, 5vw, 3rem);
	}

	.s-prefix-lead {
		margin: 16px 0 0;
		font-size: 1.1rem;
	}

	.s-prefix-more {
		margin-block: 48px 16px;
		font-size: 1.75rem;
	}

	.s-prefix p {
		margin-block: 0 16px;
	}

	.s-prefix .s-code {
		margin-bottom: 16px;
	}

	.s-prefix-code {
		font-family: var(--s-font-mono);
		font-size: 0.88em;
		font-variant-ligatures: none;
	}

	.s-prefix-options {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 12px 24px;
		margin: 0;
	}

	.s-prefix-options dd {
		margin: 0;
		color: var(--s-text-muted);
	}

	.s-prefix-type {
		display: block;
		color: var(--s-text-muted);
		font: 0.78rem var(--s-font-mono);
	}

	.s-prefix-list {
		display: grid;
		gap: 10px;
		margin: 0 0 16px;
		padding-left: 1.3rem;
	}

	@media (max-width: 560px) {
		.s-prefix-options {
			grid-template-columns: 1fr;
			gap: 2px;
		}

		.s-prefix-options dd {
			margin-bottom: 12px;
		}
	}
</style>
