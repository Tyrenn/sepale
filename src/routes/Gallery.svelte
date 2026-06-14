<script lang="ts">
	import {
		Button, Input, Select, Textarea, Checkbox, Radio, Toggle, Range, FileInput,
		Chip, Badge, Loading, Progress, RadialProgress, Skeleton, Link, Text,
		Tabs, Tab, Breadcrumbs, Join, type Color
	} from '$lib/index.js';

	const colors: Color[] = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'];
	let radio = $state('a');
	let range = $state(40);
	let activeTab = $state(0);
</script>

<section class="pg-section">
	<h2>Button</h2>
	<div class="pg-row">
		{#each colors as c (c)}<Button color={c}>{c}</Button>{/each}
	</div>
	<div class="pg-row">
		<Button variant="outline" color="primary">outline</Button>
		<Button variant="dash" color="primary">dash</Button>
		<Button variant="soft" color="primary">soft</Button>
		<Button variant="ghost" color="primary">ghost</Button>
		<Button variant="link" color="primary">link</Button>
	</div>
	<div class="pg-row">
		<Button size="xs">xs</Button>
		<Button size="sm">sm</Button>
		<Button>md</Button>
		<Button size="lg">lg</Button>
		<Button size="xl">xl</Button>
	</div>
</section>

<section class="pg-section">
	<h2>Input</h2>
	<div class="pg-row">
		<Input placeholder="default" />
		<Input color="primary" placeholder="primary" />
		<Input variant="ghost" placeholder="ghost" />
	</div>
	<div class="pg-row">
		<Select>
			<option>One</option>
			<option>Two</option>
		</Select>
		<FileInput />
	</div>
	<div class="pg-row">
		<Textarea placeholder="textarea"></Textarea>
	</div>
</section>

<section class="pg-section">
	<h2>Selection controls</h2>
	<div class="pg-row">
		<Checkbox checked color="primary" />
		<Checkbox variant="square" color="accent" checked />
		<Checkbox variant="outline" color="success" checked />
		<Radio bind:group={radio} value="a" color="primary" />
		<Radio bind:group={radio} value="b" color="primary" />
		<Toggle checked color="primary" />
		<Toggle variant="track" color="accent" checked />
	</div>
	<div class="pg-row">
		<Range bind:value={range} color="primary" />
	</div>
</section>

<section class="pg-section">
	<h2>Display</h2>
	<div class="pg-row">
		<Chip color="primary">chip</Chip>
		<Chip variant="outline" color="accent">outline</Chip>
		<Chip variant="soft" color="success">soft</Chip>
		<Badge align="end" side="top">
			<Button>Inbox</Button>
			{#snippet badge()}<Chip color="error">9</Chip>{/snippet}
		</Badge>
	</div>
	<div class="pg-row">
		<Loading kind="spinner" />
		<Loading kind="dots" />
		<Loading kind="ring" />
		<Loading kind="bars" />
	</div>
	<div class="pg-row">
		<Progress value={60} color="primary" />
		<RadialProgress value={70} color="accent" />
	</div>
	<div class="pg-row" style="width:16rem">
		<Skeleton text />
		<Skeleton text />
	</div>
</section>

<section class="pg-section">
	<h2>Navigation &amp; typography</h2>
	<Tabs variant="box">
		{#each ['Tab A', 'Tab B', 'Tab C'] as label, i (label)}
			<Tab active={activeTab === i} onclick={() => (activeTab = i)}>{label}</Tab>
		{/each}
	</Tabs>
	<div class="pg-row">
		<Breadcrumbs>
			<li><Link hover href="#">Home</Link></li>
			<li><Link hover href="#">Library</Link></li>
			<li>Flat</li>
		</Breadcrumbs>
	</div>
	<div class="pg-row" style="display:block">
		<Text as="h1" variant="title">Title</Text>
		<Text variant="subtitle-s1">Subtitle</Text>
		<Text variant="text-s3-b2">Body text in the flat family.</Text>
	</div>
	<div class="pg-row">
		<Join>
			<Button class="join-item">One</Button>
			<Button class="join-item">Two</Button>
			<Button class="join-item">Three</Button>
		</Join>
	</div>
</section>
