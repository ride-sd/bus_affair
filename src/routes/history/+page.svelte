<script lang="ts">
	import { onMount } from 'svelte';
	import TripList from '$lib/components/TripList.svelte';
	import { tripStore } from '$lib/stores/trip-store.svelte';

	onMount(() => {
		tripStore.load();
	});

	async function handleDelete(id: string) {
		await tripStore.deleteTrip(id);
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Trip History</h1>
		{#if tripStore.trips.length > 0}
			<button class="btn btn-error btn-sm" onclick={() => tripStore.clearAll()}>
				Clear All
			</button>
		{/if}
	</div>

	{#if tripStore.loading}
		<div class="flex justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<TripList
			trips={tripStore.trips}
			ondelete={handleDelete}
			emptyMessage="No trips logged yet. Go log your first trip!"
		/>
	{/if}
</div>
