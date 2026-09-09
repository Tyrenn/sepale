<script lang="ts">
	// The theme preview: composite blocks, not one cell per component. A theme
	// breaks at the joints and in the colour sweep — an input beside a button,
	// four status colours side by side — so each block puts several components
	// together and every semantic colour appears at least once.
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
		Link,
		Tabs,
		Tab,
		Breadcrumbs,
		Dock,
		Join,
		ValidatorHint
	} from '$lib/index.js';

	const COLORS = [
		'primary',
		'secondary',
		'accent',
		'neutral',
		'info',
		'success',
		'warning',
		'error'
	] as const;
</script>

<div class="tp-grid">
	<!-- Actions: the densest colour sweep in the kit. -->
	<section class="tp-block tp-wide">
		<h3 class="tp-title">Actions</h3>
		<div class="tp-row">
			{#each COLORS as c (c)}
				<Button color={c}>{c}</Button>
			{/each}
			<Button>plain</Button>
		</div>
		<div class="tp-row">
			<Button variant="outline" color="primary">outline</Button>
			<Button variant="dash" color="secondary">dash</Button>
			<Button variant="soft" color="accent">soft</Button>
			<Button variant="ghost">ghost</Button>
			<Button variant="link">link</Button>
			<Button active color="primary">active</Button>
			<Button disabled>disabled</Button>
		</div>
		<div class="tp-row">
			<Button size="xs">xs</Button>
			<Button size="sm">sm</Button>
			<Button>base</Button>
			<Button size="lg">lg</Button>
			<Button size="xl">xl</Button>
			<Join>
				<Button>Prev</Button>
				<Button color="primary">1</Button>
				<Button>2</Button>
				<Button>Next</Button>
			</Join>
			<Badge side="top" align="end">
				{#snippet badge()}9+{/snippet}
				<Button>badge</Button>
			</Badge>
		</div>
	</section>

	<!-- Form: fields as they actually appear, stacked and interleaved. -->
	<section class="tp-block">
		<h3 class="tp-title">Form</h3>
		<Input placeholder="Email" />
		<Select>
			<option>Pick an option</option>
			<option>Another option</option>
		</Select>
		<Textarea placeholder="Message"></Textarea>
		<FileInput />
		<Input color="error" value="not-an-email" />
		<ValidatorHint>Enter a valid email address</ValidatorHint>
		<div class="tp-row">
			<Button color="primary">Submit</Button>
			<Button variant="ghost">Cancel</Button>
		</div>
	</section>

	<!-- Selectors: every checked state, in every colour that carries meaning. -->
	<section class="tp-block">
		<h3 class="tp-title">Selectors</h3>
		<div class="tp-row">
			{#each COLORS.slice(0, 5) as c (c)}
				<Checkbox color={c} checked />
			{/each}
			<Checkbox />
			<Checkbox disabled />
		</div>
		<div class="tp-row">
			{#each COLORS.slice(0, 5) as c (c)}
				<Radio name="tp-r-{c}" color={c} checked />
			{/each}
			<Radio name="tp-r0" />
			<Radio name="tp-r1" disabled />
		</div>
		<div class="tp-row">
			{#each COLORS.slice(0, 5) as c (c)}
				<Toggle color={c} checked />
			{/each}
			<Toggle />
			<Toggle disabled />
		</div>
		<Range value={40} />
		<Range color="primary" value={70} />
	</section>

	<!-- Statuses: the four state colours, in every shape that carries them. -->
	<section class="tp-block">
		<h3 class="tp-title">Statuses</h3>
		<div class="tp-row">
			<Chip color="info">info</Chip>
			<Chip color="success">success</Chip>
			<Chip color="warning">warning</Chip>
			<Chip color="error">error</Chip>
		</div>
		<div class="tp-row">
			<Chip color="success" variant="soft">soft</Chip>
			<Chip color="warning" variant="outline">outline</Chip>
			<Chip color="error" variant="dash">dash</Chip>
			<Chip variant="ghost">ghost</Chip>
		</div>
		<Progress color="info" value={30} />
		<Progress color="success" value={60} />
		<Progress color="warning" value={80} />
		<Progress color="error" value={95} />
		<div class="tp-row">
			<RadialProgress value={35} />
			<RadialProgress value={70} />
			<Loading kind="spinner" />
			<Loading kind="dots" />
			<Loading kind="ring" />
			<Loading kind="ball" />
		</div>
	</section>

	<!-- Data: a real list, where badges and chips actually live. -->
	<section class="tp-block">
		<h3 class="tp-title">Data</h3>
		<List style="border:1px solid var(--color-border);">
			<li class="list-row">
				<div>
					<p style="font-weight:600;">Deployment</p>
					<p style="opacity:.6; font-size:.875em;">production</p>
				</div>
				<div class="list-col-grow" style="text-align:right;">
					<Chip color="success">live</Chip>
				</div>
			</li>
			<li class="list-row">
				<div>
					<p style="font-weight:600;">Build</p>
					<p style="opacity:.6; font-size:.875em;">queued 2 min ago</p>
				</div>
				<div class="list-col-grow" style="text-align:right;">
					<Chip color="warning" variant="soft">pending</Chip>
				</div>
			</li>
			<li class="list-row">
				<div>
					<p style="font-weight:600;">Rollback</p>
					<p style="opacity:.6; font-size:.875em;">failed</p>
				</div>
				<div class="list-col-grow" style="text-align:right;">
					<Chip color="error" variant="outline">error</Chip>
				</div>
			</li>
		</List>
		<div class="tp-row">
			<Skeleton style="width:3rem; height:3rem; border-radius:9999px" />
			<Skeleton style="flex:1; height:1rem; border-radius:4px" />
		</div>
	</section>

	<!-- Navigation. -->
	<section class="tp-block">
		<h3 class="tp-title">Navigation</h3>
		<Breadcrumbs>
			<li><a href="#preview">Home</a></li>
			<li><a href="#preview">Library</a></li>
			<li>Theme</li>
		</Breadcrumbs>
		<Tabs variant="border">
			<Tab active>Overview</Tab>
			<Tab>Settings</Tab>
			<Tab>Billing</Tab>
		</Tabs>
		<Tabs variant="box">
			<Tab active>Day</Tab>
			<Tab>Week</Tab>
			<Tab>Month</Tab>
		</Tabs>
		<div class="tp-dock">
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
	</section>

	<!-- Surfaces: the three levels next to each other, which is the only way
	     to judge whether a theme separates them enough — and the only place
	     the depth effect is legible, since it lives on those very edges. -->
	<section class="tp-block">
		<h3 class="tp-title">Surfaces &amp; depth</h3>
		<div class="tp-surfaces">
			<div class="tp-surf" style="background:var(--color-surface);">
				<span>surface</span>
				<Button>plain</Button>
			</div>
			<div class="tp-surf" style="background:var(--color-surface-high);">
				<span>surface-high</span>
				<Button>plain</Button>
			</div>
			<div class="tp-surf" style="background:var(--color-surface-peak);">
				<span>surface-peak</span>
				<Button>plain</Button>
			</div>
		</div>
		<p class="tp-note">
			Depth lives on those edges: a 5% darkened border, a 6% white inset and a
			drop shadow tinted with the button's own colour. Faithful to daisyUI,
			and by design almost invisible on a dark theme.
		</p>
	</section>

	<!-- Typography: the text-natured components, which never scale. -->
	<section class="tp-block">
		<h3 class="tp-title">Typography</h3>
		<p class="text-s1-b1">Section title</p>
		<p class="text-s2-b3">
			Body copy sets the measure everything else sits against — a field's frame
			grows with <em>Element size</em>, this sentence does not.
		</p>
		<p class="text-s3-b3" style="opacity:.7;">Secondary copy, one step down the scale.</p>
		<div class="tp-row">
			<Link href="#preview">Default</Link>
			<Link color="primary" href="#preview">Primary</Link>
			<Link color="success" href="#preview">Success</Link>
			<Link color="error" href="#preview">Error</Link>
		</div>
	</section>
</div>
