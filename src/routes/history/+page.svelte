<script lang="ts">
	import { onMount } from 'svelte';
	import type { TripType } from '$lib/models/types';
	import TripList from '$lib/components/TripList.svelte';
	import { tripStore } from '$lib/stores/trip-store.svelte';

	onMount(() => {
		tripStore.load();
	});

	async function handleDelete(id: string) {
		await tripStore.deleteTrip(id);
	}

	async function handleEdit(id: string, updates: { busNumber?: number; mtsLine?: string; type?: TripType }) {
		await tripStore.updateTrip(id, updates);
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">Trip History</h1>

	{#if tripStore.loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<TripList
			trips={tripStore.trips}
			ondelete={handleDelete}
			onedit={handleEdit}
			emptyMessage="No trips logged yet. Go log your first trip!"
		/>
	{/if}
</div>
