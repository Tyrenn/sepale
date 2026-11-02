<script lang="ts">
	import { highlight } from '../highlight.js';

	const TYRENN = 'https://github.com/Tyrenn';
	const REPO = `${TYRENN}/u.u`;

	const HELICE = `const { query, args } = db.select('post')
	.where({ published: true })
	.build();`;

	const MOUSSE = `new Mousse()
	.get('/users/:id', (c) => ({ id: c.param('id') }))
	.sse('/events', (c) => c.send('welcome'))
	.listen(3000);`;

	const SETUP = `git clone https://github.com/<you>/u.u
cd u.u && pnpm install
git checkout -b my-change`;
</script>

<svelte:head>
	<title>About: Sépale</title>
	<meta name="description" content="Sépale is developed and maintained by Guillaume Vailland. How to contribute, and two other projects: Hélice and Mousse." />
</svelte:head>

<main class="s-page s-about">
	<h1 class="s-h1 s-about-title">About</h1>
	<p class="s-about-lead">
		Hello there ! I'm <a class="s-link" href="https://www.linkedin.com/in/guillaume-vailland-136408125/">Guillaume Vailland</a> (Tyren), a humble
		typescript developer from Nantes, France.
	</p>
	<p class="s-about-lead">
		Sépale is a library of UI components, as CSS classes or Svelte components. I develop and maintain it on my own, so support and
		contributions are very welcome.
	</p>
	<p class="s-about-lead">
		“Sépale”, pronounced <em>say-pal</em>, is French for sepal, the small leaf that holds a flower. The families are named after flowers.
	</p>

	<h2 class="s-h2 s-about-more">My other work</h2>
	<div class="s-others">
		<section class="s-other">
			<div class="s-other-title">
				<!-- The propeller of Hélice's own logo. -->
				<svg viewBox="1438 583 237 445" style:width="21px" style:height="40px" aria-hidden="true">
					<g transform="matrix(0.567761,0,0,0.601602,0,0)">
						<path transform="translate(1324.132645,33.154557)" d="M1492.416,1172.276L1502.176,1155.371C1502.758,1155.367 1503.341,1155.37 1503.925,1155.381C1540.264,1156.077 1543.528,1198.366 1543.583,1198.488L1561.57,1165.811C1577.847,1170.333 1612.396,1165.496 1616.77,1164.883C1607.528,1180.45 1532.914,1306.115 1500.084,1358.78L1308.043,1666.788C1286.494,1660.403 1257.203,1665.153 1252.843,1665.86L1409.028,1419.234C1404.996,1421.531 1369.567,1456.702 1330.434,1455.953C1329.839,1455.942 1329.252,1455.919 1328.674,1455.886L1337.478,1440.637C1353.488,1436.676 1396.588,1402.129 1432.591,1358.78C1448.322,1339.841 1460.714,1322.136 1471.092,1305.667C1501.845,1263.245 1517.039,1228.069 1517.039,1200.137C1517.039,1183.96 1511.76,1174.098 1501.203,1170.552C1499.359,1169.932 1496.346,1170.56 1492.416,1172.276Z" fill="#f2c6c6" />
						<path transform="translate(1324.131123,33.157025)" d="M1328.674,1455.886C1293.989,1453.883 1290.83,1412.966 1290.777,1412.846L1272.789,1445.523C1256.512,1441.002 1221.963,1445.838 1217.589,1446.451C1226.832,1430.884 1301.445,1305.219 1334.275,1252.554L1526.316,944.546C1547.865,950.931 1577.157,946.181 1581.516,945.474L1425.331,1192.101C1429.303,1189.838 1463.742,1155.674 1502.176,1155.371L1492.416,1172.276C1473.852,1180.381 1434.82,1212.759 1401.768,1252.554C1386.038,1271.494 1372.984,1289.198 1362.606,1305.667C1331.852,1348.089 1317.32,1383.266 1317.32,1411.197C1317.32,1427.374 1322.599,1437.236 1333.156,1440.782C1334.223,1441.141 1335.679,1441.082 1337.478,1440.637L1328.674,1455.886Z" fill="#a92626" />
					</g>
				</svg>
				<h3 class="s-h3 s-other-name">Hélice</h3>
			</div>
			<p class="s-other-text">
				A fluent query builder for PostgreSQL. Describe your tables as plain TypeScript types, and your editor checks and completes your
				queries against them.
			</p>
			<div class="s-code">
				<pre>{@html highlight(HELICE)}</pre>
			</div>
			<p class="s-other-aside">
				In French, <em>hélice</em> (ay-lees) is a propeller, which looks a bit like a <em>q</em> and a <em>b</em> stacked on top of each other.
			</p>
			<span class="s-other-links">
				<a class="s-link" href="https://tyrenn.github.io/helice/">Discover Hélice</a>
				<a class="s-link" href="{TYRENN}/helice">Tyrenn/helice</a>
			</span>
		</section>

		<section class="s-other">
			<div class="s-other-title">
				<!-- The bubbles of Mousse's own logo. -->
				<svg viewBox="90 57 103 95" style:width="40px" style:height="37px" aria-hidden="true">
					<circle cx="124.423" cy="105.239" r="33.669" fill="#0e9fff" />
					<path d="M111.841,78.449l8.28,1.008c-9.114,5.788 -18.439,14.986 -19.769,29.44c-0.894,-13.304 4.721,-23.333 11.488,-30.449Z" fill="#fff" />
					<circle cx="141.275" cy="74.384" r="16.852" fill="#b6e2ff" />
					<path d="M134.977,60.975l4.144,0.505c-4.562,2.897 -9.229,7.501 -9.894,14.735c-0.448,-6.659 2.363,-11.678 5.75,-15.24Z" fill="#fff" />
					<circle cx="167.748" cy="91.235" r="24.269" fill="#80ccff" />
					<path d="M158.678,71.925l5.969,0.727c-6.57,4.172 -13.291,10.802 -14.249,21.221c-0.645,-9.589 3.403,-16.819 8.281,-21.948Z" fill="#fff" />
					<circle cx="152.089" cy="118.92" r="32.274" fill="#005a95" />
					<path d="M140.028,93.24l7.937,0.967c-8.736,5.548 -17.675,14.365 -18.949,28.22c-0.857,-12.752 4.525,-22.366 11.012,-29.187Z" fill="#fff" />
				</svg>
				<h3 class="s-h3 s-other-name">Mousse</h3>
			</div>
			<p class="s-other-text">
				A typed Node.js framework built on top of µWebSockets, for HTTP, WebSockets and Server-Sent Events, with Standard Schema validation,
				rate limiting and documentation generation.
			</p>
			<div class="s-code">
				<pre>{@html highlight(MOUSSE)}</pre>
			</div>
			<p class="s-other-aside">
				In French, <em>mousse</em> is soap foam : thousands of bubbles, the requests.
			</p>
			<span class="s-other-links">
				<a class="s-link" href="https://tyrenn.github.io/mousse/">Discover Mousse</a>
				<a class="s-link" href="{TYRENN}/mousse">Tyrenn/mousse</a>
			</span>
		</section>
	</div>

	<h2 class="s-h2 s-about-more" id="contributing">Contributing</h2>
	<p class="s-about-intro">
		Bug reports, ideas, pull requests, anything really. The simplest contribution is to test Sépale and
		<a class="s-link" href="{REPO}/issues">open issues</a>. For code contributions:
	</p>
	<ol class="s-steps">
		<li>
			<strong>Fork</strong> <a class="s-link" href={REPO}>the repository</a> and create a branch from <code class="s-about-code">main</code>.
			<div class="s-code"><pre>{SETUP}</pre></div>
		</li>
		<li>
			<strong>Make your change</strong>, then look at it: run the site and walk the component in a light and a dark theme. A look is judged by rendering.
			<div class="s-code"><pre>pnpm run dev</pre></div>
		</li>
		<li>
			<strong>Check the types.</strong> To add a family, follow
			<a class="s-link" href="{REPO}/blob/main/docs/families.md"><code class="s-about-code">docs/families.md</code></a>.
			<div class="s-code"><pre>pnpm run check</pre></div>
		</li>
		<li>
			<strong>Open a pull request</strong> against <code class="s-about-code">main</code>.
		</li>
	</ol>
</main>

<style>
	/* A single reading column, centered by .s-page. */
	.s-about {
		--s-page: 52rem;
		padding-block: clamp(32px, 5vw, 64px);
	}

	.s-about-title {
		font-size: clamp(2.2rem, 5vw, 3rem);
	}

	.s-about-lead {
		margin: 16px 0 0;
		font-size: 1.1rem;
	}

	.s-about-more {
		margin-block: 48px 16px;
		font-size: 1.75rem;
	}

	.s-others {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 20px;
	}

	.s-other {
		padding: 24px;
		border: 1px solid var(--s-line);
		border-radius: 18px;
		background: var(--s-surface-raised);
	}

	.s-other-title {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 40px;
		margin-bottom: 14px;
	}

	.s-other-name {
		font-size: 1.5rem;
	}

	.s-other-text {
		margin: 0 0 14px;
	}

	.s-other-aside {
		margin: 14px 0;
		color: var(--s-text-muted);
		font-size: 0.9rem;
	}

	.s-other-links {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 20px;
	}

	.s-about-intro {
		margin: 0 0 20px;
	}

	.s-steps {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 20px;
		margin: 0;
		padding-left: 1.4rem;
		list-style: decimal;
	}

	.s-steps li {
		min-width: 0;
	}

	.s-steps li::marker {
		color: var(--s-text-muted);
		font-family: var(--s-font-display);
	}

	.s-steps .s-code {
		margin-top: 10px;
	}

	.s-about-code {
		font-family: var(--s-font-mono);
		font-size: 0.88em;
		font-variant-ligatures: none;
	}
</style>
