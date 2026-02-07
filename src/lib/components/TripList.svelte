<script lang="ts">
	import type { Trip } from '$lib/models/types';
	import TripCard from './TripCard.svelte';

	interface Props {
		trips: Trip[];
		ondelete?: (id: string) => void;
		emptyMessage?: string;
	}

	let { trips, ondelete, emptyMessage = 'No trips yet' }: Props = $props();
</script>

{#if trips.length === 0}
	<p class="py-8 text-center text-base-content/50">{emptyMessage}</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each trips as trip (trip.id)}
			<TripCard {trip} {ondelete} />
		{/each}
	</div>
{/if}
