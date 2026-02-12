<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { TripType } from '$lib/models/types';
	import { lookupFleetEntry } from '$lib/services/bus-lookup';
	import { tripStore } from '$lib/stores/trip-store.svelte';
	import TripList from '$lib/components/TripList.svelte';

	const busNumber = $derived(Number(page.params.number));
	const entry = $derived(lookupFleetEntry(busNumber));
	const busTrips = $derived(tripStore.trips.filter((t) => t.busNumber === busNumber));

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

{#if entry}
	<div class="flex flex-col gap-6">
		<div class="flex items-center gap-3">
			<a href="/" class="btn btn-ghost btn-sm btn-circle" aria-label="Back">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
			</a>
			<h1 class="text-3xl font-bold tabular-nums">Bus #{busNumber}</h1>
		</div>

		<span class="badge badge-outline w-fit">Fleet {entry.rangeStart}–{entry.rangeEnd}</span>

		{#if entry.model.description}
			<p class="text-base-content/70">{entry.model.description}</p>
		{/if}

		<div class="card bg-base-200 shadow-sm">
			<div class="card-body gap-0 p-4">
				<div class="flex justify-between border-b border-base-300 py-2">
					<span class="text-base-content/60">Manufacturer</span>
					<span class="font-medium">{entry.model.manufacturer}</span>
				</div>
				<div class="flex justify-between border-b border-base-300 py-2">
					<span class="text-base-content/60">Model</span>
					<span class="font-medium">{entry.model.model}</span>
				</div>
				<div class="flex justify-between border-b border-base-300 py-2">
					<span class="text-base-content/60">Length</span>
					<span class="font-medium">{entry.model.lengthFt} ft</span>
				</div>
				<div class="flex justify-between border-b border-base-300 py-2">
					<span class="text-base-content/60">Fuel Type</span>
					<span class="font-medium">{entry.model.fuelType}</span>
				</div>
				<div class="flex justify-between py-2">
					<span class="text-base-content/60">Year Introduced</span>
					<span class="font-medium">{entry.model.yearIntroduced}</span>
				</div>
			</div>
		</div>

		<h2 class="text-xl font-bold">Your Trips</h2>
		{#if tripStore.loading}
			<div class="flex justify-center py-4">
				<span class="loading loading-spinner loading-md"></span>
			</div>
		{:else}
			<TripList
				trips={busTrips}
				ondelete={handleDelete}
				onedit={handleEdit}
				emptyMessage="No trips logged for this bus yet."
			/>
		{/if}
	</div>
{:else}
	<div class="flex flex-col items-center gap-4 py-12">
		<h1 class="text-2xl font-bold">Unknown Bus</h1>
		<p class="text-base-content/60">Bus #{busNumber} wasn't found in the fleet database.</p>
		<a href="/" class="btn btn-primary">Back to Home</a>
	</div>
{/if}
