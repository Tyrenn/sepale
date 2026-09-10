<script lang="ts">
	// Component galleries, daisyUI-style. Each example is a <Section> with a
	// live Preview rendered from the real $lib Svelte components, plus the
	// Svelte source (the component call) and, where useful, the HTML markup
	// the component emits. Some structural demos only ship a Preview + HTML.
	import Section from './Section.svelte';
	import {
		Button,
		Input,
		Select,
		Textarea,
		Checkbox,
		Radio,
		Toggle,
		Range,
		FileInput,
		Chip,
		Badge,
		Loading,
		Progress,
		RadialProgress,
		Skeleton,
		List,
		Text,
		Link,
		Tabs,
		Tab,
		Breadcrumbs,
		Dock,
		Join,
		ValidatorHint
	} from '$lib/index.js';

	let { component }: { component: string } = $props();
</script>

{#if component === 'button'}
	<Section
		title="Button sizes"
		subtitle="Buttons scale intrinsically with font-size — no breakpoints."
		svelte={`<Button size="xs">Xsmall</Button>
<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Xlarge</Button>`}
		html={`<button class="btn btn-xs">Xsmall</button>
<button class="btn btn-sm">Small</button>
<button class="btn">Medium</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-xl">Xlarge</button>`}
	>
		<Button size="xs">Xsmall</Button>
		<Button size="sm">Small</Button>
		<Button>Medium</Button>
		<Button size="lg">Large</Button>
		<Button size="xl">Xlarge</Button>
	</Section>

	<Section
		title="Button colors"
		svelte={`<Button color="neutral">Neutral</Button>
<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="accent">Accent</Button>
<Button color="info">Info</Button>
<Button color="success">Success</Button>
<Button color="warning">Warning</Button>
<Button color="error">Error</Button>`}
		html={`<button class="btn btn-neutral">Neutral</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-error">Error</button>`}
	>
		<Button color="neutral">Neutral</Button>
		<Button color="primary">Primary</Button>
		<Button color="secondary">Secondary</Button>
		<Button color="accent">Accent</Button>
		<Button color="info">Info</Button>
		<Button color="success">Success</Button>
		<Button color="warning">Warning</Button>
		<Button color="error">Error</Button>
	</Section>

	<Section
		title="Button variants"
		svelte={`<Button variant="outline" color="primary">Outline</Button>
<Button variant="dash" color="primary">Dash</Button>
<Button variant="soft" color="primary">Soft</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
		html={`<button class="btn btn-outline btn-primary">Outline</button>
<button class="btn btn-dash btn-primary">Dash</button>
<button class="btn btn-soft btn-primary">Soft</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>`}
	>
		<Button variant="outline" color="primary">Outline</Button>
		<Button variant="dash" color="primary">Dash</Button>
		<Button variant="soft" color="primary">Soft</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="link">Link</Button>
	</Section>

	<Section
		title="Ripple"
		subtitle="Opt-in Material-style ripple — an expanding wave from the press point."
		svelte={`<Button ripple>Ripple</Button>
<Button ripple color="primary">Primary</Button>
<Button ripple color="accent" size="lg">Large</Button>
<Button ripple variant="soft" color="secondary">Soft</Button>`}
		html={`<!-- .btn-ripple clips the wave; the <Button ripple> component injects
     a .btn-ripple-wave <span> at the press point (see button.css). -->
<button class="btn btn-ripple">Ripple</button>`}
	>
		<Button ripple>Ripple</Button>
		<Button ripple color="primary">Primary</Button>
		<Button ripple color="accent" size="lg">Large</Button>
		<Button ripple variant="soft" color="secondary">Soft</Button>
	</Section>

	<Section
		title="States & widths"
		svelte={`<Button active color="primary">Active</Button>
<Button width="wide">Wide</Button>
<Button disabled>Disabled</Button>`}
		html={`<button class="btn btn-active btn-primary">Active</button>
<button class="btn btn-wide">Wide</button>
<button class="btn" disabled>Disabled</button>`}
	>
		<Button active color="primary">Active</Button>
		<Button width="wide">Wide</Button>
		<Button disabled>Disabled</Button>
	</Section>
{:else if component === 'input'}
	<Section
		title="Default"
		svelte={`<Input placeholder="Default input" />`}
		html={`<input type="text" class="input" placeholder="Default input" />`}
	>
		<Input placeholder="Default input" />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Input fieldSize="xs" placeholder="xs" />
<Input fieldSize="sm" placeholder="sm" />
<Input placeholder="base" />
<Input fieldSize="lg" placeholder="lg" />`}
		html={`<input type="text" class="input input-xs" placeholder="xs" />
<input type="text" class="input input-sm" placeholder="sm" />
<input type="text" class="input" placeholder="base" />
<input type="text" class="input input-lg" placeholder="lg" />`}
	>
		<Input fieldSize="xs" placeholder="xs" />
		<Input fieldSize="sm" placeholder="sm" />
		<Input placeholder="base" />
		<Input fieldSize="lg" placeholder="lg" />
	</Section>

	<Section
		title="Colors"
		svelte={`<Input color="primary" placeholder="Primary" />
<Input color="success" placeholder="Success" />
<Input color="error" placeholder="Error" />`}
		html={`<input type="text" class="input input-primary" placeholder="Primary" />
<input type="text" class="input input-success" placeholder="Success" />
<input type="text" class="input input-error" placeholder="Error" />`}
	>
		<Input color="primary" placeholder="Primary" />
		<Input color="success" placeholder="Success" />
		<Input color="error" placeholder="Error" />
	</Section>

	<Section
		title="With inline label"
		subtitle="A composite that needs wrapper markup, so there's no single-component Svelte form."
		html={`<label class="input">
	<span class="label">https://</span>
	<input type="text" placeholder="example.com" />
</label>`}
	>
		<label class="input">
			<span class="label">https://</span>
			<input type="text" placeholder="example.com" />
		</label>
	</Section>
{:else if component === 'select'}
	<Section
		title="Default"
		svelte={`<Select>
	<option disabled selected>Pick a color</option>
	<option>Crimson</option>
	<option>Amber</option>
	<option>Velvet</option>
</Select>`}
		html={`<select class="select">
	<option disabled selected>Pick a color</option>
	<option>Crimson</option>
	<option>Amber</option>
	<option>Velvet</option>
</select>`}
	>
		<Select>
			<option disabled selected>Pick a color</option>
			<option>Crimson</option>
			<option>Amber</option>
			<option>Velvet</option>
		</Select>
	</Section>

	<Section
		title="Sizes"
		svelte={`<Select fieldSize="xs"><option>xs</option></Select>
<Select fieldSize="sm"><option>sm</option></Select>
<Select><option>base</option></Select>
<Select fieldSize="lg"><option>lg</option></Select>`}
		html={`<select class="select select-xs"><option>xs</option></select>
<select class="select select-sm"><option>sm</option></select>
<select class="select"><option>base</option></select>
<select class="select select-lg"><option>lg</option></select>`}
	>
		<Select fieldSize="xs"><option>xs</option></Select>
		<Select fieldSize="sm"><option>sm</option></Select>
		<Select><option>base</option></Select>
		<Select fieldSize="lg"><option>lg</option></Select>
	</Section>
{:else if component === 'textarea'}
	<Section
		title="Default"
		svelte={`<Textarea placeholder="Default textarea" />`}
		html={`<textarea class="textarea" placeholder="Default textarea"></textarea>`}
	>
		<Textarea placeholder="Default textarea" />
	</Section>

	<Section
		title="Colors"
		svelte={`<Textarea color="primary" placeholder="Primary" />
<Textarea color="success" placeholder="Success" />
<Textarea color="error" placeholder="Error" />`}
		html={`<textarea class="textarea textarea-primary" placeholder="Primary"></textarea>
<textarea class="textarea textarea-success" placeholder="Success"></textarea>
<textarea class="textarea textarea-error" placeholder="Error"></textarea>`}
	>
		<Textarea color="primary" placeholder="Primary" />
		<Textarea color="success" placeholder="Success" />
		<Textarea color="error" placeholder="Error" />
	</Section>
{:else if component === 'checkbox'}
	<Section
		title="Sizes"
		svelte={`<Checkbox fieldSize="xs" checked />
<Checkbox fieldSize="sm" checked />
<Checkbox checked />
<Checkbox fieldSize="lg" checked />`}
		html={`<input type="checkbox" checked class="checkbox checkbox-xs" />
<input type="checkbox" checked class="checkbox checkbox-sm" />
<input type="checkbox" checked class="checkbox" />
<input type="checkbox" checked class="checkbox checkbox-lg" />`}
	>
		<Checkbox fieldSize="xs" checked />
		<Checkbox fieldSize="sm" checked />
		<Checkbox checked />
		<Checkbox fieldSize="lg" checked />
	</Section>

	<Section
		title="Colors"
		svelte={`<Checkbox color="primary" checked />
<Checkbox color="secondary" checked />
<Checkbox color="accent" checked />
<Checkbox color="success" checked />
<Checkbox color="warning" checked />
<Checkbox color="error" checked />`}
		html={`<input type="checkbox" checked class="checkbox checkbox-primary" />
<input type="checkbox" checked class="checkbox checkbox-secondary" />
<input type="checkbox" checked class="checkbox checkbox-accent" />
<input type="checkbox" checked class="checkbox checkbox-success" />
<input type="checkbox" checked class="checkbox checkbox-warning" />
<input type="checkbox" checked class="checkbox checkbox-error" />`}
	>
		<Checkbox color="primary" checked />
		<Checkbox color="secondary" checked />
		<Checkbox color="accent" checked />
		<Checkbox color="success" checked />
		<Checkbox color="warning" checked />
		<Checkbox color="error" checked />
	</Section>

	<Section
		title="Variants"
		svelte={`<Checkbox variant="outline" color="primary" checked />
<Checkbox variant="square" color="accent" checked />
<Checkbox disabled checked />`}
		html={`<input type="checkbox" checked class="checkbox checkbox-outline checkbox-primary" />
<input type="checkbox" checked class="checkbox checkbox-square checkbox-accent" />
<input type="checkbox" disabled checked class="checkbox" />`}
	>
		<Checkbox variant="outline" color="primary" checked />
		<Checkbox variant="square" color="accent" checked />
		<Checkbox disabled checked />
	</Section>
{:else if component === 'radio'}
	<Section
		title="Colors"
		svelte={`<Radio name="rc" color="primary" checked />
<Radio name="rc" color="secondary" checked />
<Radio name="rc" color="accent" checked />
<Radio name="rc" color="success" checked />
<Radio name="rc" color="error" checked />`}
		html={`<input type="radio" name="rc" class="radio radio-primary" checked />
<input type="radio" name="rc" class="radio radio-secondary" checked />
<input type="radio" name="rc" class="radio radio-accent" checked />
<input type="radio" name="rc" class="radio radio-success" checked />
<input type="radio" name="rc" class="radio radio-error" checked />`}
	>
		<Radio name="rc" color="primary" checked />
		<Radio name="rc" color="secondary" checked />
		<Radio name="rc" color="accent" checked />
		<Radio name="rc" color="success" checked />
		<Radio name="rc" color="error" checked />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Radio name="rs" fieldSize="xs" checked />
<Radio name="rs" fieldSize="sm" checked />
<Radio name="rs" checked />
<Radio name="rs" fieldSize="lg" checked />`}
		html={`<input type="radio" name="rs" class="radio radio-xs" checked />
<input type="radio" name="rs" class="radio radio-sm" checked />
<input type="radio" name="rs" class="radio" checked />
<input type="radio" name="rs" class="radio radio-lg" checked />`}
	>
		<Radio name="rs" fieldSize="xs" checked />
		<Radio name="rs" fieldSize="sm" checked />
		<Radio name="rs" checked />
		<Radio name="rs" fieldSize="lg" checked />
	</Section>
{:else if component === 'toggle'}
	<Section
		title="Default"
		svelte={`<Toggle />
<Toggle checked />`}
		html={`<input type="checkbox" class="toggle" />
<input type="checkbox" class="toggle" checked />`}
	>
		<Toggle />
		<Toggle checked />
	</Section>

	<Section
		title="Colors"
		svelte={`<Toggle color="primary" checked />
<Toggle color="secondary" checked />
<Toggle color="accent" checked />
<Toggle color="success" checked />
<Toggle color="error" checked />`}
		html={`<input type="checkbox" class="toggle toggle-primary" checked />
<input type="checkbox" class="toggle toggle-secondary" checked />
<input type="checkbox" class="toggle toggle-accent" checked />
<input type="checkbox" class="toggle toggle-success" checked />
<input type="checkbox" class="toggle toggle-error" checked />`}
	>
		<Toggle color="primary" checked />
		<Toggle color="secondary" checked />
		<Toggle color="accent" checked />
		<Toggle color="success" checked />
		<Toggle color="error" checked />
	</Section>

	<Section
		title="Track variant"
		svelte={`<Toggle variant="track" color="primary" checked />
<Toggle variant="track" color="accent" checked />
<Toggle variant="track" color="success" checked />`}
		html={`<input type="checkbox" class="toggle toggle-track toggle-primary" checked />
<input type="checkbox" class="toggle toggle-track toggle-accent" checked />
<input type="checkbox" class="toggle toggle-track toggle-success" checked />`}
	>
		<Toggle variant="track" color="primary" checked />
		<Toggle variant="track" color="accent" checked />
		<Toggle variant="track" color="success" checked />
	</Section>
{:else if component === 'range'}
	<Section
		title="Default"
		svelte={`<Range value={40} />`}
		html={`<input type="range" class="range" value="40" />`}
	>
		<Range value={40} />
	</Section>

	<Section
		title="Colors"
		svelte={`<Range color="primary" value={60} />
<Range color="secondary" value={60} />
<Range color="accent" value={60} />`}
		html={`<input type="range" class="range range-primary" value="60" />
<input type="range" class="range range-secondary" value="60" />
<input type="range" class="range range-accent" value="60" />`}
	>
		<Range color="primary" value={60} />
		<Range color="secondary" value={60} />
		<Range color="accent" value={60} />
	</Section>
{:else if component === 'file-input'}
	<Section
		title="Default"
		svelte={`<FileInput />`}
		html={`<input type="file" class="file-input" />`}
	>
		<FileInput />
	</Section>

	<Section
		title="Sizes"
		svelte={`<FileInput fieldSize="xs" />
<FileInput fieldSize="sm" />
<FileInput />
<FileInput fieldSize="lg" />`}
		html={`<input type="file" class="file-input file-input-xs" />
<input type="file" class="file-input file-input-sm" />
<input type="file" class="file-input" />
<input type="file" class="file-input file-input-lg" />`}
	>
		<FileInput fieldSize="xs" />
		<FileInput fieldSize="sm" />
		<FileInput />
		<FileInput fieldSize="lg" />
	</Section>
{:else if component === 'chip'}
	<Section
		title="Sizes"
		svelte={`<Chip size="xs">Xsmall</Chip>
<Chip size="sm">Small</Chip>
<Chip>Medium</Chip>
<Chip size="lg">Large</Chip>`}
		html={`<span class="chip chip-xs">Xsmall</span>
<span class="chip chip-sm">Small</span>
<span class="chip">Medium</span>
<span class="chip chip-lg">Large</span>`}
	>
		<Chip size="xs">Xsmall</Chip>
		<Chip size="sm">Small</Chip>
		<Chip>Medium</Chip>
		<Chip size="lg">Large</Chip>
	</Section>

	<Section
		title="Colors"
		svelte={`<Chip color="primary">Primary</Chip>
<Chip color="secondary">Secondary</Chip>
<Chip color="accent">Accent</Chip>
<Chip color="info">Info</Chip>
<Chip color="success">Success</Chip>
<Chip color="warning">Warning</Chip>
<Chip color="error">Error</Chip>`}
		html={`<span class="chip chip-primary">Primary</span>
<span class="chip chip-secondary">Secondary</span>
<span class="chip chip-accent">Accent</span>
<span class="chip chip-info">Info</span>
<span class="chip chip-success">Success</span>
<span class="chip chip-warning">Warning</span>
<span class="chip chip-error">Error</span>`}
	>
		<Chip color="primary">Primary</Chip>
		<Chip color="secondary">Secondary</Chip>
		<Chip color="accent">Accent</Chip>
		<Chip color="info">Info</Chip>
		<Chip color="success">Success</Chip>
		<Chip color="warning">Warning</Chip>
		<Chip color="error">Error</Chip>
	</Section>

	<Section
		title="Variants"
		svelte={`<Chip variant="soft" color="primary">Soft</Chip>
<Chip variant="outline" color="primary">Outline</Chip>
<Chip variant="dash" color="primary">Dash</Chip>
<Chip variant="ghost">Ghost</Chip>`}
		html={`<span class="chip chip-soft chip-primary">Soft</span>
<span class="chip chip-outline chip-primary">Outline</span>
<span class="chip chip-dash chip-primary">Dash</span>
<span class="chip chip-ghost">Ghost</span>`}
	>
		<Chip variant="soft" color="primary">Soft</Chip>
		<Chip variant="outline" color="primary">Outline</Chip>
		<Chip variant="dash" color="primary">Dash</Chip>
		<Chip variant="ghost">Ghost</Chip>
	</Section>
{:else if component === 'badge'}
	<Section
		title="Indicator"
		subtitle="A floating chip anchored to a host element via the `badge` snippet."
		svelte={`<Badge side="top" align="end">
	{#snippet badge()}99+{/snippet}
	<Button>Notifications</Button>
</Badge>`}
		html={`<div class="badge badge-top badge-end">
	<button class="btn">Notifications</button>
	<span class="chip">99+</span>
</div>`}
	>
		<Badge side="top" align="end">
			{#snippet badge()}99+{/snippet}
			<Button>Notifications</Button>
		</Badge>
	</Section>

	<Section
		title="Positions"
		svelte={`<Badge side="top" align="start">
	{#snippet badge()}new{/snippet}
	<Button color="primary">Start</Button>
</Badge>
<Badge side="bottom" align="end">
	{#snippet badge()}✓{/snippet}
	<Button>Bottom</Button>
</Badge>`}
		html={`<div class="badge badge-top badge-start">
	<button class="btn btn-primary">Start</button>
	<span class="chip">new</span>
</div>
<div class="badge badge-bottom badge-end">
	<button class="btn">Bottom</button>
	<span class="chip">✓</span>
</div>`}
	>
		<Badge side="top" align="start">
			{#snippet badge()}new{/snippet}
			<Button color="primary">Start</Button>
		</Badge>
		<Badge side="bottom" align="end">
			{#snippet badge()}✓{/snippet}
			<Button>Bottom</Button>
		</Badge>
	</Section>
{:else if component === 'tab'}
	<Section
		title="Border"
		svelte={`<Tabs variant="border">
	<Tab active>Tab 1</Tab>
	<Tab>Tab 2</Tab>
	<Tab>Tab 3</Tab>
</Tabs>`}
		html={`<div role="tablist" class="tabs tabs-border">
	<button role="tab" class="tab" aria-selected="true">Tab 1</button>
	<button role="tab" class="tab">Tab 2</button>
	<button role="tab" class="tab">Tab 3</button>
</div>`}
	>
		<Tabs variant="border">
			<Tab active>Tab 1</Tab>
			<Tab>Tab 2</Tab>
			<Tab>Tab 3</Tab>
		</Tabs>
	</Section>

	<Section
		title="Box"
		svelte={`<Tabs variant="box">
	<Tab active>Tab 1</Tab>
	<Tab>Tab 2</Tab>
	<Tab>Tab 3</Tab>
</Tabs>`}
		html={`<div role="tablist" class="tabs tabs-box">
	<button role="tab" class="tab" aria-selected="true">Tab 1</button>
	<button role="tab" class="tab">Tab 2</button>
	<button role="tab" class="tab">Tab 3</button>
</div>`}
	>
		<Tabs variant="box">
			<Tab active>Tab 1</Tab>
			<Tab>Tab 2</Tab>
			<Tab>Tab 3</Tab>
		</Tabs>
	</Section>
{:else if component === 'loading'}
	<Section
		title="Types"
		svelte={`<Loading kind="spinner" />
<Loading kind="dots" />
<Loading kind="ring" />
<Loading kind="ball" />
<Loading kind="bars" />
<Loading kind="infinity" />`}
		html={`<span class="loading loading-spinner"></span>
<span class="loading loading-dots"></span>
<span class="loading loading-ring"></span>
<span class="loading loading-ball"></span>
<span class="loading loading-bars"></span>
<span class="loading loading-infinity"></span>`}
	>
		<Loading kind="spinner" />
		<Loading kind="dots" />
		<Loading kind="ring" />
		<Loading kind="ball" />
		<Loading kind="bars" />
		<Loading kind="infinity" />
	</Section>

	<Section
		title="Sizes"
		svelte={`<Loading size="xs" />
<Loading size="sm" />
<Loading />
<Loading size="lg" />`}
		html={`<span class="loading loading-spinner loading-xs"></span>
<span class="loading loading-spinner loading-sm"></span>
<span class="loading loading-spinner"></span>
<span class="loading loading-spinner loading-lg"></span>`}
	>
		<Loading size="xs" />
		<Loading size="sm" />
		<Loading />
		<Loading size="lg" />
	</Section>
{:else if component === 'progress'}
	<Section
		title="Default"
		svelte={`<Progress value={40} />`}
		html={`<progress class="progress" value="40" max="100"></progress>`}
	>
		<Progress value={40} />
	</Section>

	<Section
		title="Colors"
		svelte={`<Progress color="primary" value={60} />
<Progress color="secondary" value={60} />
<Progress color="success" value={60} />
<Progress color="error" value={60} />`}
		html={`<progress class="progress progress-primary" value="60" max="100"></progress>
<progress class="progress progress-secondary" value="60" max="100"></progress>
<progress class="progress progress-success" value="60" max="100"></progress>
<progress class="progress progress-error" value="60" max="100"></progress>`}
	>
		<Progress color="primary" value={60} />
		<Progress color="secondary" value={60} />
		<Progress color="success" value={60} />
		<Progress color="error" value={60} />
	</Section>
{:else if component === 'radial-progress'}
	<Section
		title="Values"
		svelte={`<RadialProgress value={25} />
<RadialProgress value={50} />
<RadialProgress value={75} />
<RadialProgress value={100} />`}
		html={`<div class="radial-progress" style="--value:25">25%</div>
<div class="radial-progress" style="--value:50">50%</div>
<div class="radial-progress" style="--value:75">75%</div>
<div class="radial-progress" style="--value:100">100%</div>`}
	>
		<RadialProgress value={25} />
		<RadialProgress value={50} />
		<RadialProgress value={75} />
		<RadialProgress value={100} />
	</Section>

	<Section
		title="Sizes & colors"
		svelte={`<RadialProgress size="sm" value={70} style="color:var(--color-primary)" />
<RadialProgress value={70} style="color:var(--color-accent)" />
<RadialProgress size="lg" value={70} style="color:var(--color-success)" />`}
		html={`<div class="radial-progress radial-progress-sm" style="--value:70; color:var(--color-primary)">70%</div>
<div class="radial-progress" style="--value:70; color:var(--color-accent)">70%</div>
<div class="radial-progress radial-progress-lg" style="--value:70; color:var(--color-success)">70%</div>`}
	>
		<RadialProgress size="sm" value={70} style="color:var(--color-primary)" />
		<RadialProgress value={70} style="color:var(--color-accent)" />
		<RadialProgress size="lg" value={70} style="color:var(--color-success)" />
	</Section>
{:else if component === 'skeleton'}
	<Section
		title="Line"
		svelte={`<Skeleton style="width:12rem; height:1rem; border-radius:4px" />`}
		html={`<div class="skeleton" style="width:12rem; height:1rem; border-radius:4px"></div>`}
	>
		<Skeleton style="width:12rem; height:1rem; border-radius:4px" />
	</Section>

	<Section
		title="Card"
		svelte={`<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
	<Skeleton style="width:3rem; height:3rem; border-radius:9999px" />
	<Skeleton style="height:0.75rem; border-radius:4px" />
	<Skeleton style="height:0.75rem; width:80%; border-radius:4px" />
	<Skeleton style="height:0.75rem; width:65%; border-radius:4px" />
</div>`}
		html={`<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
	<div class="skeleton" style="width:3rem; height:3rem; border-radius:9999px"></div>
	<div class="skeleton" style="height:0.75rem; border-radius:4px"></div>
	<div class="skeleton" style="height:0.75rem; width:80%; border-radius:4px"></div>
	<div class="skeleton" style="height:0.75rem; width:65%; border-radius:4px"></div>
</div>`}
	>
		<div style="display:flex; flex-direction:column; gap:0.5rem; width:14rem;">
			<Skeleton style="width:3rem; height:3rem; border-radius:9999px" />
			<Skeleton style="height:0.75rem; border-radius:4px" />
			<Skeleton style="height:0.75rem; width:80%; border-radius:4px" />
			<Skeleton style="height:0.75rem; width:65%; border-radius:4px" />
		</div>
	</Section>
{:else if component === 'list'}
	<Section
		title="Rows"
		svelte={`<List style="width:24rem; border:1px solid var(--color-surface-2);">
	<li class="list-row">
		<div>
			<p style="font-weight:600;">Item title</p>
			<p style="opacity:.6; font-size:.875em;">Secondary info</p>
		</div>
		<div class="list-col-grow" style="text-align:right; opacity:.6;">Right</div>
	</li>
</List>`}
		html={`<ul class="list" style="width:24rem; border:1px solid var(--color-surface-2);">
	<li class="list-row">
		<div>
			<p style="font-weight:600;">Item title</p>
			<p style="opacity:.6; font-size:.875em;">Secondary info</p>
		</div>
		<div class="list-col-grow" style="text-align:right; opacity:.6;">Right</div>
	</li>
</ul>`}
	>
		<List style="width:24rem; border:1px solid var(--color-surface-2);">
			<li class="list-row">
				<div>
					<p style="font-weight:600;">Item title</p>
					<p style="opacity:.6; font-size:.875em;">Secondary info</p>
				</div>
				<div class="list-col-grow" style="text-align:right; opacity:.6;">Right</div>
			</li>
			<li class="list-row">
				<div>
					<p style="font-weight:600;">Another item</p>
					<p style="opacity:.6; font-size:.875em;">More info here</p>
				</div>
				<div class="list-col-grow" style="text-align:right; opacity:.6;">Value</div>
			</li>
		</List>
	</Section>
{:else if component === 'text'}
	<Section
		title="Headings"
		svelte={`<Text variant="title">Title — .title</Text>
<Text variant="subtitle-s1">Subtitle s1</Text>
<Text variant="subtitle-s2">Subtitle s2</Text>`}
		html={`<p class="title">Title — .title</p>
<p class="subtitle-s1">Subtitle s1</p>
<p class="subtitle-s2">Subtitle s2</p>`}
	>
		<div style="text-align:center;">
			<Text variant="title">Title — .title</Text>
			<Text variant="subtitle-s1">Subtitle s1</Text>
			<Text variant="subtitle-s2">Subtitle s2</Text>
		</div>
	</Section>

	<Section
		title="Body"
		svelte={`<Text variant="text-s2-b1">Base, semibold</Text>
<Text variant="text-s2-b2">Base, medium</Text>
<Text variant="text-s2-b3">Base, regular</Text>`}
		html={`<p class="text-s2-b1">Base, semibold</p>
<p class="text-s2-b2">Base, medium</p>
<p class="text-s2-b3">Base, regular</p>`}
	>
		<div style="text-align:center;">
			<Text variant="text-s2-b1">Base, semibold</Text>
			<Text variant="text-s2-b2">Base, medium</Text>
			<Text variant="text-s2-b3">Base, regular</Text>
		</div>
	</Section>
{:else if component === 'link'}
	<Section
		title="Default"
		svelte={`<Link href="#demo">Default link</Link>`}
		html={`<a class="link" href="#demo">Default link</a>`}
	>
		<Link href="#demo">Default link</Link>
	</Section>

	<Section
		title="Colors"
		svelte={`<Link color="primary" href="#demo">Primary</Link>
<Link color="secondary" href="#demo">Secondary</Link>
<Link color="accent" href="#demo">Accent</Link>
<Link color="success" href="#demo">Success</Link>
<Link color="error" href="#demo">Error</Link>`}
		html={`<a class="link link-primary" href="#demo">Primary</a>
<a class="link link-secondary" href="#demo">Secondary</a>
<a class="link link-accent" href="#demo">Accent</a>
<a class="link link-success" href="#demo">Success</a>
<a class="link link-error" href="#demo">Error</a>`}
	>
		<Link color="primary" href="#demo">Primary</Link>
		<Link color="secondary" href="#demo">Secondary</Link>
		<Link color="accent" href="#demo">Accent</Link>
		<Link color="success" href="#demo">Success</Link>
		<Link color="error" href="#demo">Error</Link>
	</Section>
{:else if component === 'breadcrumbs'}
	<Section
		title="Breadcrumbs"
		svelte={`<Breadcrumbs>
	<li><a href="#demo">Home</a></li>
	<li><a href="#demo">Documents</a></li>
	<li>Add Document</li>
</Breadcrumbs>`}
		html={`<nav class="breadcrumbs">
	<ul>
		<li><a href="#demo">Home</a></li>
		<li><a href="#demo">Documents</a></li>
		<li>Add Document</li>
	</ul>
</nav>`}
	>
		<Breadcrumbs>
			<li><a href="#demo">Home</a></li>
			<li><a href="#demo">Documents</a></li>
			<li>Add Document</li>
		</Breadcrumbs>
	</Section>
{:else if component === 'dock'}
	<Section
		title="Dock"
		svelte={`<Dock>
	<button><span class="dock-label">Home</span></button>
	<button class="dock-active"><span class="dock-label">Search</span></button>
	<button><span class="dock-label">Mail</span></button>
</Dock>`}
		html={`<nav class="dock">
	<button><span class="dock-label">Home</span></button>
	<button class="dock-active"><span class="dock-label">Search</span></button>
	<button><span class="dock-label">Mail</span></button>
</nav>`}
	>
		<div style="width:24rem; position:relative; height:5rem;">
			<Dock style="position:absolute;">
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" /></svg>
					<span class="dock-label">Home</span>
				</button>
				<button class="dock-active">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" /></svg>
					<span class="dock-label">Search</span>
				</button>
				<button>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" /></svg>
					<span class="dock-label">Mail</span>
				</button>
			</Dock>
		</div>
	</Section>
{:else if component === 'join'}
	<Section
		title="Buttons"
		svelte={`<Join>
	<Button class="join-item">Left</Button>
	<Button class="join-item" color="primary">Center</Button>
	<Button class="join-item">Right</Button>
</Join>`}
		html={`<div class="join">
	<button class="btn join-item">Left</button>
	<button class="btn join-item btn-primary">Center</button>
	<button class="btn join-item">Right</button>
</div>`}
	>
		<Join>
			<Button class="join-item">Left</Button>
			<Button class="join-item" color="primary">Center</Button>
			<Button class="join-item">Right</Button>
		</Join>
	</Section>

	<Section
		title="Input + button"
		svelte={`<Join>
	<Input class="join-item" placeholder="Search…" />
	<Button class="join-item" color="primary">Go</Button>
</Join>`}
		html={`<div class="join">
	<input type="text" class="input join-item" placeholder="Search…" />
	<button class="btn btn-primary join-item">Go</button>
</div>`}
	>
		<Join>
			<Input class="join-item" placeholder="Search…" />
			<Button class="join-item" color="primary">Go</Button>
		</Join>
	</Section>

	<Section
		title="Vertical"
		svelte={`<Join vertical>
	<Button class="join-item">Top</Button>
	<Button class="join-item" color="primary">Middle</Button>
	<Button class="join-item">Bottom</Button>
</Join>`}
		html={`<div class="join join-vertical">
	<button class="btn join-item">Top</button>
	<button class="btn join-item btn-primary">Middle</button>
	<button class="btn join-item">Bottom</button>
</div>`}
	>
		<Join vertical>
			<Button class="join-item">Top</Button>
			<Button class="join-item" color="primary">Middle</Button>
			<Button class="join-item">Bottom</Button>
		</Join>
	</Section>
{:else if component === 'validator'}
	<Section
		title="Email"
		subtitle="Pair a `.validator` input with a ValidatorHint shown when invalid."
		svelte={`<fieldset class="fieldset" style="width:20rem;">
	<legend class="fieldset-legend">Email</legend>
	<Input type="email" required class="validator" placeholder="name@example.com" />
	<ValidatorHint>Enter a valid email address</ValidatorHint>
</fieldset>`}
		html={`<fieldset class="fieldset" style="width:20rem;">
	<legend class="fieldset-legend">Email</legend>
	<input type="email" required class="input validator" placeholder="name@example.com" />
	<p class="validator-hint">Enter a valid email address</p>
</fieldset>`}
	>
		<fieldset class="fieldset" style="width:20rem;">
			<legend class="fieldset-legend">Email</legend>
			<Input type="email" required class="validator" placeholder="name@example.com" />
			<ValidatorHint>Enter a valid email address</ValidatorHint>
		</fieldset>
	</Section>
{:else}
	<p>Unknown component.</p>
{/if}
