<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { EncounterType } from '$lib/models/types';
	import { lookupFleetEntry } from '$lib/services/bus-lookup.svelte';
	import { encounterStore } from '$lib/stores/encounter-store.svelte';
	import EncounterList from '$lib/components/EncounterList.svelte';
	import FleetEntryCard from '$lib/components/FleetEntryCard.svelte';

	const busNumber = $derived(Number(page.params.number));
	const entry = $derived(lookupFleetEntry(busNumber, 'MTS'));
	const busEncounters = $derived(encounterStore.encounters.filter((e) => e.busNumber === busNumber));

	onMount(() => {
		encounterStore.load();
	});

	async function handleDelete(id: string) {
		await encounterStore.deleteEncounter(id);
	}

	async function handleEdit(id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }) {
		await encounterStore.updateEncounter(id, updates);
	}

	async function handleRetry(id: string) {
		await encounterStore.retryEncounter(id);
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

		<FleetEntryCard {entry} />

		<h2 class="text-xl font-bold">Your Encounters</h2>
		{#if encounterStore.loading}
			<div class="flex justify-center py-4">
				<span class="loading loading-spinner loading-md"></span>
			</div>
		{:else}
			<EncounterList
				encounters={busEncounters}
				ondelete={handleDelete}
				onedit={handleEdit}
				onretry={handleRetry}
				emptyMessage="No encounters logged for this bus yet."
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
