<script lang="ts">
	// Create a family: what one is, the kit an AI reads to write one, and the
	// place to load the result. A loaded family joins the sidebar's picker and
	// every page treats it like a built one (local-families.svelte.ts); it
	// stays in this browser.
	import { onDestroy, onMount } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import { classesByFamily, schema } from '$lib/generated/components.js';
	import { familyShape, familyTypes } from '$lib/family-types.js';
	import {
		local,
		addFamily,
		removeFamily,
		MAX_BYTES,
		restoreFamilies,
		type LocalFamily
	} from '../../local-families.svelte.js';
	import { playground, showLoaded, leaveFamily } from '../../playground.svelte.js';
	import { reportFor } from './report.js';

	/* Absolute, so it can be pasted to an assistant as it is. */
	let origin = $state('');
	onMount(() => {
		origin = location.origin;
		void restoreFamilies();
	});
	const kitPath = resolve('/family-kit/index.md');
	let kitUrl = $derived(origin + kitPath);
	let prompt = $derived(
		`Read ${kitUrl} and follow it to write a new Sepale family with me. Start with its first step.`
	);

	/* Step 1 has two ways in: an assistant, or by hand. */
	let how = $state<'ai' | 'hand'>('ai');

	let copied = $state('');
	async function copy(what: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = what;
			setTimeout(() => (copied = ''), 1400);
		} catch {
			/* No clipboard (insecure origin): the text is on the page anyway. */
		}
	}

	/* ── Types ───────────────────────────────────────────────────────── */

	/* The family's `.css.d.ts`, derived from its classes by the function the
	   build uses (ADR 0015): the same text the bundle carries. */
	function downloadTypes(f: LocalFamily) {
		const text = familyTypes(f.name, familyShape(f.classification.classes, schema, f.css));
		const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = `${f.name}.css.d.ts`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	/* ── Loading ─────────────────────────────────────────────────────── */

	let error = $state('');
	let over = $state(false);

	async function load(file: File) {
		error = '';
		if (!/\.css$/i.test(file.name) && file.type !== 'text/css') {
			error = `${file.name} is not a stylesheet: a family is one .css file.`;
			return;
		}
		if (file.size > MAX_BYTES) {
			error = `${file.name} is larger than a family can be (${MAX_BYTES / 1e6} MB).`;
			return;
		}
		try {
			const family = await addFamily(await file.text(), file.name);
			showLoaded(family.name);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	function onPick(e: Event & { currentTarget: HTMLInputElement }) {
		const input = e.currentTarget;
		const file = input.files?.[0];
		if (file) void load(file);
		input.value = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		over = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) void load(file);
	}

	/* Following a file: Chromium's File System Access API hands a handle the
	   page can re-read, so saving in an editor reloads the family here. Other
	   browsers load by hand. */
	type Handle = { getFile(): Promise<File>; name: string };
	const canFollow = typeof window !== 'undefined' && 'showOpenFilePicker' in window;
	let followed = $state<{ handle: Handle; stamp: number; name: string } | null>(null);
	let timer: ReturnType<typeof setInterval> | undefined;

	async function follow() {
		error = '';
		try {
			const picker = (window as unknown as { showOpenFilePicker: (o: object) => Promise<Handle[]> })
				.showOpenFilePicker;
			const [handle] = await picker({ types: [{ description: 'Stylesheet', accept: { 'text/css': ['.css'] } }] });
			if (!handle) return;
			const file = await handle.getFile();
			await load(file);
			followed = { handle, stamp: file.lastModified, name: file.name };
			clearInterval(timer);
			timer = setInterval(poll, 1000);
		} catch (e) {
			if ((e as Error).name !== 'AbortError') error = (e as Error).message;
		}
	}

	async function poll() {
		if (!followed) return;
		try {
			const file = await followed.handle.getFile();
			if (file.lastModified === followed.stamp) return;
			followed.stamp = file.lastModified;
			await load(file);
		} catch {
			unfollow();
			error = 'The followed file can no longer be read.';
		}
	}

	function unfollow() {
		clearInterval(timer);
		followed = null;
	}
	onDestroy(() => clearInterval(timer));

	async function remove(f: LocalFamily) {
		leaveFamily(f.name);
		await removeFamily(f.name);
	}

	/* ── The report ──────────────────────────────────────────────────── */

	/* What the built families ship, together: the yardstick for coverage. */
	const known = new Set(Object.values(classesByFamily).flatMap((m) => Object.keys(m)));
	let reports = $derived(local.list.map((f) => ({ family: f, report: reportFor(f, known) })));

	const time = (t: number) => new Date(t).toLocaleTimeString();
</script>

<!-- The scroll container takes the whole width, so its scrollbar stays at
     the window edge; the column inside is centred, like a component page. -->
<main class="content">
<div class="nf">
	<header>
		<h1 class="nf-title">Create a family</h1>
		<p class="nf-lede">
			A family is <strong>one CSS file</strong>. The components already exist, their DOM and
			their classes fixed; the file paints them, in one direction, and declares the parameters a
			theme may set. Everything the app knows about a family is read out of that file: its name
			and prose from its header comment, its parameters from a <code>uu-params</code> comment,
			its components from its selectors.
		</p>
	</header>

	<section class="nf-section">
		<h2 class="nf-h2"><span class="nf-step">1</span>Write it</h2>
		<div class="nf-tabs" role="tablist">
			<button type="button" role="tab" class="nf-tab" aria-selected={how === 'ai'} onclick={() => (how = 'ai')}>
				With AI
			</button>
			<button type="button" role="tab" class="nf-tab" aria-selected={how === 'hand'} onclick={() => (how = 'hand')}>
				Without AI
			</button>
		</div>
		{#if how === 'hand'}
		<p class="nf-note">
			Everything the components expose to a family, on one page: for each component its classes
			(root, parts, axes, flags), the states its DOM goes through, the custom properties it writes,
			how it moves (what Svelte animates, what waits for your CSS), and the markup it renders. With
			the rules in short, and a built family to start from.
		</p>
		<div class="nf-box">
			<div class="nf-row">
				<a class="ui-btn ui-btn-sm ui-btn-primary" href={resolve('/new-family/reference')}>Open the reference</a>
				<a class="ui-btn ui-btn-sm" href={resolve('/family-kit/full.md')} download="sepale-family-reference.md">
					Download it as Markdown
				</a>
			</div>
			<p class="nf-note nf-flush">
				Fastest start: download a built family's stylesheet, rename it in its header, and rewrite
				its values:
				{#each ['daisy', 'dahlia', 'sunflower', 'cosmos', 'peony'] as f, i (f)}{i ? ', ' : ''}<a
						class="nf-link"
						href={asset(`/families/${f}.css`)}
						download="{f}.css">{f}</a
					>{/each}.
			</p>
		</div>
		{:else}
		<p class="nf-note">
			The <strong>family kit</strong> is written for an assistant: the steps, the contract the
			file must meet (header, parameters, intrinsic sizing, slots, states, motion), and one page
			per component with its classes, its states and the DOM it renders. Give an assistant the
			link; one that cannot fetch pages takes the whole kit as a file.
		</p>
		<div class="nf-box">
			<div class="nf-row">
				<code class="nf-url">{kitUrl || kitPath}</code>
				<button type="button" class="ui-btn ui-btn-sm" onclick={() => copy('link', kitUrl)}>
					{copied === 'link' ? 'Copied' : 'Copy link'}
				</button>
				<a class="ui-btn ui-btn-sm ui-btn-ghost" href={kitPath} target="_blank" rel="noopener">Open</a>
			</div>
			<p class="nf-prompt">{prompt}</p>
			<div class="nf-row">
				<button type="button" class="ui-btn ui-btn-sm ui-btn-primary" onclick={() => copy('prompt', prompt)}>
					{copied === 'prompt' ? 'Copied' : 'Copy the prompt'}
				</button>
				<a class="ui-btn ui-btn-sm" href={resolve('/family-kit/full.md')} download="sepale-family-kit.md">
					Download the whole kit
				</a>
			</div>
		</div>
		<p class="nf-note">
			The built families are the reference: their compiled stylesheets
			({#each ['daisy', 'dahlia', 'sunflower', 'cosmos', 'peony'] as f, i (f)}{i ? ', ' : ''}<a
					class="nf-link"
					href={asset(`/families/${f}.css`)}
					target="_blank"
					rel="noopener">{f}</a
				>{/each}) are a complete answer to the contract, and the kit links their sources component
			by component.
		</p>
		{/if}
	</section>

	<section class="nf-section">
		<h2 class="nf-h2"><span class="nf-step">2</span>Load it here</h2>
		<p class="nf-note">
			The family joins the picker in the sidebar: walk the component pages and the theme editor
			with it, in a light and a dark theme. It stays in this browser, and nothing is sent anywhere.
			Loading a file under the same name replaces it.
		</p>
		<label
			class="nf-drop"
			class:nf-drop-over={over}
			ondragover={(e) => {
				e.preventDefault();
				over = true;
			}}
			ondragleave={() => (over = false)}
			ondrop={onDrop}
		>
			<input type="file" accept=".css,text/css" class="nf-file" onchange={onPick} />
			<strong>Drop a family’s .css here</strong>
			<span>or click to pick one</span>
		</label>
		<div class="nf-row">
			{#if canFollow}
				{#if followed}
					<span class="nf-note">Following <code>{followed.name}</code>: every save reloads it.</span>
					<button type="button" class="ui-btn ui-btn-sm ui-btn-ghost" onclick={unfollow}>Stop</button>
				{:else}
					<button type="button" class="ui-btn ui-btn-sm" onclick={follow}>Follow a file</button>
					<span class="nf-note">Reload the family on every save, while this page is open.</span>
				{/if}
			{/if}
		</div>
		{#if error}<p class="nf-error" role="alert">{error}</p>{/if}
	</section>

	{#if reports.length}
		<section class="nf-section">
			<h2 class="nf-h2"><span class="nf-step">3</span>Read the report</h2>
			{#each reports as { family, report } (family.name)}
				<article class="nf-family" data-active={playground.family === family.name}>
					<header class="nf-family-head">
						<h3 class="nf-h3">{family.doc.title}</h3>
						{#if family.doc.after}<span class="nf-after">{family.doc.after}</span>{/if}
						<span class="nf-time">loaded {time(family.loadedAt)}</span>
						<span class="nf-spacer"></span>
						{#if playground.family === family.name}
							<span class="nf-badge">on show</span>
						{:else}
							<button type="button" class="ui-btn ui-btn-xs" onclick={() => showLoaded(family.name)}>Show</button>
						{/if}
						<a class="ui-btn ui-btn-xs" href={resolve('/theme')} onclick={() => showLoaded(family.name)}>Theme editor</a>
						<button
							type="button"
							class="ui-btn ui-btn-xs"
							title="{family.name}.css.d.ts: what it draws, as types (step 4)"
							onclick={() => downloadTypes(family)}>Download types</button
						>
						<button type="button" class="ui-btn ui-btn-xs ui-btn-ghost" onclick={() => remove(family)}>Remove</button>
					</header>

					<ul class="nf-checks">
						<li data-ok={family.hasDoc}>
							{#if family.hasDoc}
								Header found: <code>« {family.name} »</code>.
							{:else}
								No <code>STYLE FAMILY — « name »</code> header: named after the file,
								<code>{family.name}</code>.
							{/if}
						</li>
						<li data-ok={family.hasParams && family.params.length > 0}>
							{#if !family.hasParams}
								No readable <code>uu-params</code> comment: the theme editor has nothing to edit.
							{:else}
								{family.params.length} parameter{family.params.length === 1 ? '' : 's'} declared.
							{/if}
						</li>
						<li data-ok={report.unclassified.length === 0}>
							{#if report.unclassified.length}
								{report.unclassified.length} class{report.unclassified.length === 1 ? '' : 'es'} under a
								component's namespace that the component does not have. A typo or an invention:
								rename or remove.
								<span class="nf-classes">
									{#each report.unclassified as u (u.cls)}<code title={u.component}>.{u.cls}</code>{/each}
								</span>
							{:else}
								Every class under a component's namespace is one the component has.
							{/if}
						</li>
						{#if report.strays.length}
							<li data-ok="warn">
								{report.strays.length} class{report.strays.length === 1 ? '' : 'es'} under no
								namespace a page documents: unused by the components.
								<span class="nf-classes">
									{#each report.strays.slice(0, 40) as cls (cls)}<code>.{cls}</code>{/each}
									{#if report.strays.length > 40}…{/if}
								</span>
							</li>
						{/if}
						<li data-ok={report.missing.length === 0 ? true : 'warn'}>
							{report.styled.length} of {report.styled.length + report.missing.length} component pages
							styled.
						</li>
					</ul>

					{#if report.missing.length}
						<p class="nf-sub">Not styled</p>
						<p class="nf-classes">
							{#each report.missing as m (m.id)}<a class="nf-chip" href={resolve(`/components/${m.id}`)}>{m.label}</a>{/each}
						</p>
					{/if}
					{#if report.styled.length}
						<p class="nf-sub">Styled: classes shipped, against the most the built families ship</p>
						<p class="nf-classes">
							{#each report.styled as s (s.id)}
								<a
									class="nf-chip"
									data-partial={s.shipped < s.known}
									href={resolve(`/components/${s.id}`)}>{s.label} <small>{s.shipped}/{s.known}</small></a
								>
							{/each}
						</p>
					{/if}
				</article>
			{/each}
		</section>
	{/if}

	<section class="nf-section">
		<h2 class="nf-h2"><span class="nf-step">4</span>Get its types <small class="nf-optional">optional</small></h2>
		<p class="nf-note">
			A family <strong>works with its stylesheet alone</strong>: the classes draw everything, and the
			Svelte components run with any family. Its types are a convenience. Beside
			<code>name.css</code>, a <code>name.css.d.ts</code> narrows the components' props to what the
			family draws, so a variant it lacks is a compile error. Without it, the props accept every
			variant of every family, and nothing tells you which ones this family leaves unstyled.
		</p>
		<p class="nf-note">
			<strong>Never write that file by hand</strong>, and do not ask an assistant to: it is derived
			from the stylesheet, so it cannot promise a variant the stylesheet does not draw. Get it one of
			three ways:
		</p>
		<ol class="nf-ways">
			<li>
				<strong>Download types</strong>, on the family in step 3, once it is loaded here: the
				<code>.css.d.ts</code> alone.
			</li>
			<li>
				<strong>The bundle</strong>: theme editor → <em>Download bundle</em>, with the Svelte
				components. The stylesheet, your theme, the components and the types, together.
			</li>
			<li>
				<strong>Without this site</strong>: <code>npx sepale-types name.css</code> (from
				<code>@sepale/components</code>), or <code>node lib/sepale-types.js name.css</code> in a
				bundle. Add <code>--components &lt;dir&gt;</code> when you changed the components' variants,
				so the ones you added are typed.
			</li>
		</ol>
		<p class="nf-note">
			Then keep it beside the stylesheet and import the stylesheet from any file of your project, a
			layout typically: <code>import './name.css'</code>. Every component's props follow. Regenerate
			it whenever the stylesheet changes.
		</p>
	</section>
</div>
</main>

<style>
	.nf {
		width: 100%;
		max-width: 60rem;
		margin-inline: auto;
	}
	.nf-title {
		margin: 0 0 0.75rem;
		font-size: 1.9rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.nf-lede {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		color: color-mix(in oklab, var(--app-fg) 80%, transparent);
	}
	.nf-optional {
		margin-inline-start: 0.4rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.nf-ways {
		list-style: decimal;
		margin: 0.5rem 0 0.75rem;
		padding-inline-start: 1.25rem;
		display: grid;
		gap: 0.4rem;
		font-size: 0.875rem;
		line-height: 1.55;
	}
	.nf-section {
		margin-top: 2.25rem;
	}
	.nf-h2 {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0 0 0.6rem;
		font-size: 1.3rem;
		font-weight: 800;
	}
	.nf-step {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 50%;
		font-size: 0.85rem;
		color: var(--ui-color-primary);
		background: color-mix(in oklab, var(--ui-color-primary) 14%, transparent);
	}
	.nf-h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
	}
	.nf-note {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		line-height: 1.55;
		color: color-mix(in oklab, var(--app-fg) 70%, transparent);
	}
	code {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.85em;
		padding: 0.1em 0.35em;
		border-radius: 0.3rem;
		background: color-mix(in oklab, var(--app-fg) 8%, transparent);
	}
	.nf-link {
		color: var(--ui-color-primary);
	}
	.nf-tabs {
		display: flex;
		gap: 0.15rem;
		margin: 0.25rem 0 0.75rem;
		border-bottom: 1px solid color-mix(in oklab, var(--app-fg) 10%, transparent);
	}
	.nf-tab {
		appearance: none;
		border: 1px solid transparent;
		border-bottom: none;
		background: none;
		font: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.45rem 1rem;
		border-radius: 0.55rem 0.55rem 0 0;
		color: color-mix(in oklab, var(--app-fg) 50%, transparent);
		cursor: pointer;
		margin-bottom: -1px;
	}
	.nf-tab:hover {
		color: var(--app-fg);
	}
	.nf-tab[aria-selected='true'] {
		color: var(--app-fg);
		background: var(--app-bg);
		border-color: color-mix(in oklab, var(--app-fg) 10%, transparent);
	}
	.nf-flush {
		margin: 0;
	}
	.nf-box {
		display: grid;
		gap: 0.75rem;
		margin: 0.9rem 0;
		padding: 1rem;
		border: 1px solid color-mix(in oklab, var(--app-fg) 12%, transparent);
		border-radius: 0.85rem;
		background: color-mix(in oklab, var(--app-bg-2) 60%, var(--app-bg));
	}
	.nf-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.nf-url {
		flex: 1 1 18rem;
		min-width: 0;
		overflow-wrap: anywhere;
		padding: 0.45rem 0.6rem;
	}
	.nf-prompt {
		margin: 0;
		padding: 0.7rem 0.85rem;
		border-left: 3px solid var(--ui-color-primary);
		border-radius: 0.4rem;
		font-size: 0.875rem;
		line-height: 1.5;
		background: var(--app-bg);
	}
	.nf-drop {
		position: relative;
		display: grid;
		place-items: center;
		gap: 0.25rem;
		margin: 0.9rem 0 0.6rem;
		padding: 2rem 1rem;
		border: 2px dashed color-mix(in oklab, var(--app-fg) 22%, transparent);
		border-radius: 0.85rem;
		font-size: 0.9rem;
		text-align: center;
		color: color-mix(in oklab, var(--app-fg) 70%, transparent);
		cursor: pointer;
	}
	.nf-drop:hover,
	.nf-drop-over {
		border-color: var(--ui-color-primary);
		background: color-mix(in oklab, var(--ui-color-primary) 6%, transparent);
	}
	.nf-drop:focus-within {
		outline: 2px solid var(--ui-color-primary);
		outline-offset: 2px;
	}
	.nf-drop strong {
		color: var(--app-fg);
	}
	.nf-file {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
	.nf-error {
		margin: 0.5rem 0;
		font-size: 0.875rem;
		color: var(--ui-color-error);
	}
	.nf-family {
		margin: 0.9rem 0;
		padding: 1rem;
		border: 1px solid color-mix(in oklab, var(--app-fg) 12%, transparent);
		border-radius: 0.85rem;
	}
	.nf-family[data-active='true'] {
		border-color: color-mix(in oklab, var(--ui-color-primary) 55%, transparent);
	}
	.nf-family-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.nf-after,
	.nf-time {
		font-size: 0.8rem;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.nf-spacer {
		flex: 1;
	}
	.nf-badge {
		padding: 0.15rem 0.55rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--ui-color-primary);
		background: color-mix(in oklab, var(--ui-color-primary) 12%, transparent);
	}
	.nf-checks {
		margin: 0.9rem 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.4rem;
		font-size: 0.875rem;
		line-height: 1.5;
	}
	.nf-checks li {
		padding-left: 1.5rem;
		position: relative;
	}
	.nf-checks li::before {
		position: absolute;
		left: 0;
		font-weight: 700;
	}
	.nf-checks li[data-ok='true']::before {
		content: '✓';
		color: var(--ui-color-success);
	}
	.nf-checks li[data-ok='false']::before {
		content: '✕';
		color: var(--ui-color-error);
	}
	.nf-checks li[data-ok='warn']::before {
		content: '!';
		color: var(--ui-color-warning);
	}
	.nf-sub {
		margin: 1rem 0 0.4rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in oklab, var(--app-fg) 55%, transparent);
	}
	.nf-classes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin: 0.3rem 0 0;
	}
	.nf-chip {
		padding: 0.15rem 0.55rem;
		border-radius: 0.4rem;
		font-size: 0.8rem;
		color: inherit;
		text-decoration: none;
		background: color-mix(in oklab, var(--app-fg) 7%, transparent);
	}
	.nf-chip:hover {
		background: color-mix(in oklab, var(--ui-color-primary) 14%, transparent);
	}
	.nf-chip[data-partial='true'] small {
		color: var(--ui-color-warning);
	}
	.nf-chip small {
		opacity: 0.7;
	}
</style>
