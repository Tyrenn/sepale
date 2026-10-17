<script lang="ts">
	// The theme preview. First a make-believe app — a small analytics
	// dashboard built from nothing but the kit — because a theme is judged on
	// an interface, not on a catalogue: where a field meets a button, how a
	// card sits on the page, whether the menu, the chips and the charts still
	// read as one product. Then, under it, the sweeps a dashboard would never
	// show at once: every colour, every selector state, the surfaces, the type.
	import {
		Avatar,
		Bubble,
		Stat,
		Stats,
		Button,
		Input,
		Select,
		Checkbox,
		Radio,
		Toggle,
		Range,
		Chip,
		Badge,
		Loading,
		Progress,
		RadialProgress,
		Skeleton,
		List,
		Tabs,
		Breadcrumbs,
		Dock,
		Join,
		Card,
		Carousel,
		Menu,
		Navbar,
		Pagination,
		Fieldset,
		Title,
		Text,
		Alert,
		Steps,
		Switch,
		ChipsInput,
		ColorPicker,
		Dropdown,
		Swatch,
		Rating,
		Toast,
		MobileFrame
	} from '$lib/index.js';
	import { playground } from './playground.svelte.js';
	import { classesByFamily } from '$lib/generated/components.js';

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

	/* Only the colours the active family ships: sunflower has four, daisy
	   eight. A colour it lacks would render as an unstyled default and read
	   as a bug. */
	let colors = $derived(COLORS.filter((c) => classesByFamily[playground.family]?.[`btn-${c}`]));

	/** The colour if the family ships it, else none (the plain variant). */
	const has = <C extends (typeof COLORS)[number]>(c: C): C | undefined =>
		colors.includes(c) ? c : undefined;

	/** The grounds the family lets a theme set, in the editor's order. */
	let surfaces = $derived(playground.tokens.filter((t) => t.type === 'color' && t.kind === 'surface'));

	/* ── The make-believe data ───────────────────────────────────────── */

	const STATS = [
		{ label: 'Revenue', value: '€48.2k', delta: '+12.4%', up: true, progress: 72 },
		{ label: 'Orders', value: '1,284', delta: '+3.1%', up: true, progress: 54 },
		{ label: 'Refunds', value: '23', delta: '-8.0%', up: false, progress: 18 },
		{ label: 'Visitors', value: '19.7k', delta: '+21%', up: true, progress: 88 }
	];

	const CHANNELS = [
		{ name: 'Online store', share: 64, color: 'primary' },
		{ name: 'Marketplace', share: 41, color: 'secondary' },
		{ name: 'Retail', share: 27, color: 'accent' },
		{ name: 'Wholesale', share: 12, color: 'neutral' }
	] as const;

	const ORDERS = [
		{ who: 'Camille Durand', initials: 'CD', what: '2 × Linen shirt', amount: '€118', status: 'paid' },
		{ who: 'Noah Martin', initials: 'NM', what: 'Leather bag', amount: '€249', status: 'pending' },
		{ who: 'Léa Bernard', initials: 'LB', what: '3 × Wool socks', amount: '€36', status: 'refunded' },
		{ who: 'Hugo Petit', initials: 'HP', what: 'Rain jacket', amount: '€189', status: 'paid' }
	] as const;

	const FEATURED = [
		{ title: 'Autumn sale', body: 'Up to 30% off outerwear until Sunday.', tint: 'primary' },
		{ title: 'New arrivals', body: '42 products added this week.', tint: 'success' },
		{ title: 'Stock alert', body: '6 products are running low.', tint: 'error' }
	] as const;

	/* `null`: a row still loading. */
	const ACTIVITY = [
		{ text: 'Noah Martin placed an order', when: '2 min ago' },
		{ text: 'Stock updated for Rain jacket', when: '18 min ago' },
		null,
		null
	] as const;

	/* A face needs a picture; an inline SVG keeps the page offline. */
	const face = `data:image/svg+xml,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#fc6"/><stop offset="1" stop-color="#f69"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="38" r="17" fill="#fff8"/><ellipse cx="48" cy="92" rx="32" ry="26" fill="#fff8"/></svg>'
	)}`;

	let page = $state(1);
	let plan = $state('pro');
	let budget = $state(60);

	/* The campaign card: the newer components, used the way a form would. */
	const CAMPAIGN = [
		{ id: 1, label: 'Audience', complete: true },
		{ id: 2, label: 'Message' },
		{ id: 3, label: 'Launch' }
	];
	let audience = $state('returning');
	let tags = $state(['autumn', 'outerwear']);
	let brand = $state('oklch(62% 0.19 260)');
	let score = $state(4);
	let toast: Toast | undefined = $state();
</script>

{#snippet orderRow(o: (typeof ORDERS)[number])}
	<Avatar size="sm">{o.initials}</Avatar>
	<div class="list-col-grow">
		<div class="db-strong">{o.who}</div>
		<div class="db-muted">{o.what}</div>
	</div>
	<span class="db-strong">{o.amount}</span>
	{#if o.status === 'paid'}
		<Chip color="success" size="sm">paid</Chip>
	{:else if o.status === 'pending'}
		<Chip color={has('warning')} variant="soft" size="sm">pending</Chip>
	{:else}
		<Chip color="error" variant="outline" size="sm">refunded</Chip>
	{/if}
{/snippet}

{#snippet activityRow(a: (typeof ACTIVITY)[number])}
	{#if a}
		<div class="list-col-grow">
			<div>{a.text}</div>
			<div class="db-muted">{a.when}</div>
		</div>
	{:else}
		<!-- Still loading. -->
		<Skeleton style="width:2rem; height:2rem; border-radius:9999px;" />
		<div class="list-col-grow" style="display:flex; flex-direction:column; gap:.35rem;">
			<Skeleton style="width:70%; height:.7rem;" />
			<Skeleton style="width:40%; height:.6rem;" />
		</div>
	{/if}
{/snippet}

<!-- ══ The app ═══════════════════════════════════════════════════════════ -->
<div class="db">
	<div class="db-main">
		<Navbar>
			{#snippet start()}
				<div class="db-brand">
					<Avatar size="sm" color={has('primary')}>O</Avatar>
					<span>Orbit</span>
				</div>
				<Breadcrumbs>
					<li><a href="#preview">Store</a></li>
					<li>Dashboard</li>
				</Breadcrumbs>
			{/snippet}
			{#snippet end()}
				<Input size="sm" type="search" placeholder="Search…" style="width:12rem;">
					{#snippet start()}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
					{/snippet}
				</Input>
				<Badge side="top" align="end">
					{#snippet badge()}3{/snippet}
					<Button size="sm" variant="ghost" shape="circle" aria-label="Notifications">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
					</Button>
				</Badge>
				<Avatar size="sm" src={face} alt="Alex" />
			{/snippet}
		</Navbar>

		<div class="db-body">
			<header class="db-head">
				<div>
					<Title level={2}>Good morning, Alex</Title>
					<Text s="3" class="db-muted">Here is what happened in your store today.</Text>
				</div>
				<div class="db-row">
					<Tabs variant="box" size="sm" tabs={[{ label: 'Day' }, { label: 'Week' }, { label: 'Month' }]} />
					<Button color="primary" size="sm">Export</Button>
				</div>
			</header>

			<!-- Figures: one frame of stats, the way a dashboard leads. -->
			<Stats style="width:100%">
				{#each STATS as s (s.label)}
					<Stat title={s.label} value={s.value}>
						{#snippet desc()}
							<Chip size="xs" color={s.up ? 'success' : 'error'} variant="soft">{s.delta}</Chip>
							vs last week
						{/snippet}
						<Progress color={s.up ? 'primary' : 'error'} value={s.progress} style="margin-top:.5rem" />
					</Stat>
				{/each}
			</Stats>

			<div class="db-grid">
				<!-- Sales by channel -->
				<Card>
					{#snippet title()}Sales by channel{/snippet}
					<div class="db-channels">
						<div class="db-bars">
							{#each CHANNELS as ch (ch.name)}
								<div class="db-bar">
									<div class="db-row db-between">
										<span>{ch.name}</span>
										<span class="db-muted">{ch.share}%</span>
									</div>
									<Progress color={has(ch.color) ?? 'primary'} value={ch.share} />
								</div>
							{/each}
						</div>
						<div class="db-goal">
							<RadialProgress value={72} />
							<span class="db-muted">monthly goal</span>
						</div>
					</div>
				</Card>

				<!-- Featured -->
				<Card>
					{#snippet title()}Featured{/snippet}
					<Carousel items={[...FEATURED]} arrow pagination loop>
						{#snippet children(f)}
							<div class="db-slide" style="--tint: var(--color-{f.tint});">
								<div class="db-strong">{f.title}</div>
								<div class="db-muted">{f.body}</div>
								<div><Button size="sm" color={has(f.tint) ?? 'primary'}>Open</Button></div>
							</div>
						{/snippet}
					</Carousel>
				</Card>

				<!-- Orders -->
				<Card class="db-span">
					{#snippet title()}
						Recent orders
						<Chip size="sm" variant="ghost">128</Chip>
					{/snippet}
					<List rows={[...ORDERS]} row={orderRow} />
					<div class="db-row db-between">
						<span class="db-muted">Showing 4 of 128</span>
						<Pagination count={32} bind:page edges size="sm" />
					</div>
				</Card>

				<!-- Settings -->
				<Card>
					{#snippet title()}Quick settings{/snippet}
					<Fieldset>
						{#snippet legend()}Store email{/snippet}
						<Input type="email" value="hello@orbit.shop" validator required />
					</Fieldset>
					<Fieldset>
						{#snippet legend()}Plan{/snippet}
						<Select
							options={[
								{ value: 'free', name: 'Free' },
								{ value: 'pro', name: 'Pro — €29/month' },
								{ value: 'team', name: 'Team — €99/month' }
							]}
							bind:value={plan}
						/>
					</Fieldset>
					<label class="db-row db-between">
						<span>Email notifications</span>
						<Toggle color="primary" checked />
					</label>
					<label class="db-row"><Checkbox checked /> <span>Weekly digest</span></label>
					<div class="db-row">
						<label class="db-row"><Radio name="db-cur" checked /> EUR</label>
						<label class="db-row"><Radio name="db-cur" /> USD</label>
						<label class="db-row"><Radio name="db-cur" disabled /> GBP</label>
					</div>
					<div>
						<div class="db-row db-between"><span>Ad budget</span><span class="db-muted">€{budget * 10}</span></div>
						<Range color="primary" bind:value={budget} />
					</div>
					{#snippet actions()}
						<Join>
							<Button size="sm">Cancel</Button>
							<Button size="sm" color="primary">Save</Button>
						</Join>
					{/snippet}
				</Card>

				<!-- Support chat -->
				<Card>
					{#snippet title()}
						Support
						<Chip size="sm" color={has('success')} variant="soft">online</Chip>
					{/snippet}
					<div class="db-chat">
						<div class="db-row">
							<Avatar size="xs" color={has('secondary')}>CD</Avatar>
							<span class="db-muted">Camille Durand</span>
						</div>
						<Bubble noTail>Hi! My order hasn't shipped yet.</Bubble>
						<Bubble>It was placed on Monday.</Bubble>
						<Bubble end color={has('primary')}>Sorry about that — it leaves the warehouse today.</Bubble>
						<Bubble>Thanks a lot!</Bubble>
					</div>
					<Input size="sm" placeholder="Write a reply…" />
				</Card>

				<!-- Team -->
				<Card>
					{#snippet title()}Team{/snippet}
					<div class="db-row">
						<Avatar src={face} alt="Alex" color={has('primary')} />
						<Avatar color={has('success')}>LB
							{#snippet badge()}2{/snippet}
						</Avatar>
						<Avatar shape="square">HP</Avatar>
						<Avatar size="sm" color={has('warning')}>NM</Avatar>
					</div>
					<Menu
						size="sm"
						items={[
							{ label: 'Members', active: true },
							{ label: 'Roles' },
							{ divider: true },
							{ label: 'Archive', disabled: true }
						]}
					/>
				</Card>

				<!-- Activity -->
				<Card>
					{#snippet title()}
						Activity
						<Loading variant="dots" size="sm" />
					{/snippet}
					<List rows={[...ACTIVITY]} row={activityRow} />
				</Card>

				<!-- Campaign: the newer components, in a form. -->
				<Card class="db-span">
					{#snippet title()}New campaign{/snippet}
					<Steps steps={CAMPAIGN} current={2} clickable={false} />
					<div class="db-campaign">
						<Fieldset>
							{#snippet legend()}Audience{/snippet}
							<Switch
								block
								size="sm"
								color={has('primary')}
								options={[
									{ value: 'all', label: 'Everyone' },
									{ value: 'returning', label: 'Returning' },
									{ value: 'new', label: 'New' }
								]}
								bind:value={audience}
							/>
						</Fieldset>
						<Fieldset>
							{#snippet legend()}Tags{/snippet}
							<ChipsInput bind:values={tags} size="sm" side="end" placeholder="Add a tag" chipClass="chip-soft" />
						</Fieldset>
						<Fieldset>
							{#snippet legend()}Brand colour{/snippet}
							<Dropdown>
								{#snippet trigger({ props })}
									<Button size="sm" {...props}><Swatch sample={brand} size="xs" shape="circle" /> {brand}</Button>
								{/snippet}
								<ColorPicker flat size="sm" bind:value={brand} />
							</Dropdown>
						</Fieldset>
						<Fieldset>
							{#snippet legend()}Last campaign{/snippet}
							<Rating bind:value={score} size="sm" color={has('warning')} />
						</Fieldset>
					</div>
					<Alert color={has('info')} title="Heads up">Returning customers get the email on Tuesday morning.</Alert>
					{#snippet actions()}
						<Button size="sm" variant="ghost">Save draft</Button>
						<Button
							size="sm"
							color="primary"
							onclick={() => toast?.add({ title: 'Scheduled', message: 'The campaign leaves on Tuesday.', color: has('success') })}
						>Schedule</Button>
					{/snippet}
				</Card>

				<!-- Phone -->
				<Card>
					{#snippet title()}On the phone{/snippet}
					<div class="db-phone">
						<MobileFrame style="--mobile-frame-width: 13em">
							<div class="db-phone-screen">
								<div class="db-strong">Today</div>
								<div class="db-figure">€1,920</div>
								<Progress color="success" value={64} />
								<Alert color={has('success')}>12 orders shipped.</Alert>
							</div>
							<Dock size="sm">
								<button class="dock-active">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>
									<span class="dock-label">Home</span>
								</button>
								<button>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /></svg>
									<span class="dock-label">Stats</span>
								</button>
								<button>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
									<span class="dock-label">Me</span>
								</button>
							</Dock>
						</MobileFrame>
					</div>
				</Card>
			</div>
		</div>
	</div>
</div>

<Toast bind:this={toast} side="bottom" align="end" />

<!-- ══ The sweeps ════════════════════════════════════════════════════════ -->
<div class="tp-grid">
	<!-- Actions: the densest colour sweep in the kit. -->
	<section class="tp-block tp-wide">
		<h3 class="tp-title">Every colour</h3>
		<div class="tp-row">
			{#each colors as c (c)}
				<Button color={c}>{c}</Button>
			{/each}
			<Button>plain</Button>
		</div>
		<div class="tp-row">
			<Button variant="outline" color="primary">outline</Button>
			<Button variant="dash" color={has('secondary')}>dash</Button>
			<Button variant="soft" color={has('accent')}>soft</Button>
			<Button variant="ghost">ghost</Button>
			<Button variant="link">link</Button>
			<Button active color="primary">active</Button>
			<Button disabled>disabled</Button>
		</div>
		<div class="tp-row">
			{#each colors as c (c)}
				<Chip color={c}>{c}</Chip>
			{/each}
		</div>
	</section>

	<!-- Selectors: every checked state, in every colour that carries meaning. -->
	<section class="tp-block">
		<h3 class="tp-title">Selectors</h3>
		<div class="tp-row">
			{#each colors.slice(0, 5) as c (c)}
				<Checkbox color={c} checked />
			{/each}
			<Checkbox />
			<Checkbox disabled />
		</div>
		<div class="tp-row">
			{#each colors.slice(0, 5) as c (c)}
				<Radio name="tp-r-{c}" color={c} checked />
			{/each}
			<Radio name="tp-r0" />
			<Radio name="tp-r1" disabled />
		</div>
		<div class="tp-row">
			{#each colors.slice(0, 5) as c (c)}
				<Toggle color={c} checked />
			{/each}
			<Toggle />
			<Toggle disabled />
		</div>
	</section>

	<!-- Surfaces: the levels next to each other, which is the only way to
	     judge whether a theme separates them enough — and the only place the
	     depth effect is legible, since it lives on those very edges. -->
	<section class="tp-block">
		<h3 class="tp-title">Surfaces &amp; depth</h3>
		<div class="tp-surfaces">
			{#each surfaces as t (t.name)}
				<div class="tp-surf" style="background:var(--{t.name});">
					<span>{t.name.replace(/^color-/, '')}</span>
					<Button>plain</Button>
				</div>
			{/each}
		</div>
	</section>

	<!-- Typography: the text-natured components, which never scale. -->
	<section class="tp-block">
		<h3 class="tp-title">Typography</h3>
		<p class="text-s1 text-b1">Section title</p>
		<p class="text-s2 text-b3">
			Body copy sets the measure everything else sits against — a field's frame
			grows with <em>Element size</em>, this sentence does not.
		</p>
		<div class="tp-row">
			<a class="link" href="#preview">Default</a>
			<a class="link link-primary" href="#preview">Primary</a>
			<a class="link link-success" href="#preview">Success</a>
			<a class="link link-error" href="#preview">Error</a>
		</div>
	</section>
</div>
