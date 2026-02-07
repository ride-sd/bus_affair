<script lang="ts">
	import { onMount } from 'svelte';
	import BusNumberInput from '$lib/components/BusNumberInput.svelte';
	import TripList from '$lib/components/TripList.svelte';
	import { tripStore } from '$lib/stores/trip-store.svelte';

	onMount(() => {
		tripStore.load();
	});

	async function handleSubmit(busNumber: number) {
		await tripStore.addTrip(busNumber);
	}
</script>

<div class="flex flex-col gap-6">
	<BusNumberInput onsubmit={handleSubmit} />

	{#if tripStore.recentTrips.length > 0}
		<div>
			<h2 class="mb-2 text-lg font-semibold text-base-content/70">Recent Trips</h2>
			<TripList trips={tripStore.recentTrips} />
		</div>
	{/if}
</div>
