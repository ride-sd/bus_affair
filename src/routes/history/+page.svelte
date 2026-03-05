<script lang="ts">
	import { onMount } from 'svelte';
	import type { EncounterType } from '$lib/models/types';
	import EncounterList from '$lib/components/EncounterList.svelte';
	import { encounterStore } from '$lib/stores/encounter-store.svelte';

	onMount(() => {
		encounterStore.load();
	});

	async function handleDelete(id: string) {
		await encounterStore.deleteEncounter(id);
	}

	async function handleEdit(id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }) {
		await encounterStore.updateEncounter(id, updates);
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">Encounter History</h1>

	{#if encounterStore.loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<EncounterList
			encounters={encounterStore.encounters}
			ondelete={handleDelete}
			onedit={handleEdit}
			emptyMessage="No encounters logged yet. Go log your first encounter!"
		/>
	{/if}
</div>
