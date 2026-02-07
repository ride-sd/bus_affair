<script lang="ts">
	import type { TripType } from '$lib/models/types';
	import { onMount } from 'svelte';
	import BusNumberInput from '$lib/components/BusNumberInput.svelte';
	import TripList from '$lib/components/TripList.svelte';
	import { tripStore } from '$lib/stores/trip-store.svelte';
	import { getCurrentLocation, requestLocationPermission } from '$lib/services/geolocation';

	onMount(() => {
		tripStore.load();
		requestLocationPermission();
	});

	async function handleSubmit(busNumber: number, mtsLine?: string, type?: TripType) {
		const location = (await getCurrentLocation()) ?? undefined;
		await tripStore.addTrip(busNumber, mtsLine, type, location);
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
