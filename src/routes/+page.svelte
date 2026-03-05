<script lang="ts">
	import type { EncounterType } from '$lib/models/types';
	import { onMount } from 'svelte';
	import BusNumberInput from '$lib/components/BusNumberInput.svelte';
	import EncounterList from '$lib/components/EncounterList.svelte';
	import { encounterStore } from '$lib/stores/encounter-store.svelte';
	import { getCurrentLocation, requestLocationPermission } from '$lib/services/geolocation';

	onMount(() => {
		encounterStore.load();
		requestLocationPermission();
	});

	async function handleSubmit(busNumber: number, route?: string, type?: EncounterType) {
		const location = (await getCurrentLocation()) ?? undefined;
		await encounterStore.addEncounter(busNumber, route, type, location);
	}
</script>

<div class="flex flex-col gap-6">
	<BusNumberInput onsubmit={handleSubmit} />

	{#if encounterStore.recentEncounters.length > 0}
		<div>
			<h2 class="mb-2 text-lg font-semibold text-base-content/70">Recent Encounters</h2>
			<EncounterList encounters={encounterStore.recentEncounters} />
		</div>
	{/if}
</div>
