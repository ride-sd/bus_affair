<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { fleetStore } from '$lib/stores/fleet-store.svelte';

	let { children } = $props();

	onMount(() => {
		fleetStore.init();
	});
</script>

<AppShell>
	{@render children()}
</AppShell>
