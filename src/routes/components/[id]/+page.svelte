<script lang="ts">
	// One component at a time — the reference gallery, with its code tabs.
	import Showcase from '../../Showcase.svelte';
	import { COMPONENTS } from '../../playground.svelte.js';
	import { page } from '$app/state';

	let id = $derived(page.params.id ?? 'button');
	let label = $derived(
		COMPONENTS.flatMap((g) => g.items).find((i) => i.id === id)?.label ?? id
	);
</script>

<main class="content">
	<section class="gallery">
		<h2 class="gallery-title">{label}</h2>
		<Showcase component={id} />
	</section>
</main>
