<script lang="ts">
	import type { Trip, TripType } from '$lib/models/types';
	import TripCard from './TripCard.svelte';

	interface Props {
		trips: Trip[];
		ondelete?: (id: string) => void;
		onedit?: (id: string, updates: { busNumber?: number; mtsLine?: string; type?: TripType }) => void;
		emptyMessage?: string;
	}

	let { trips, ondelete, onedit, emptyMessage = 'No trips yet' }: Props = $props();
</script>

{#if trips.length === 0}
	<p class="py-8 text-center text-base-content/50">{emptyMessage}</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each trips as trip (trip.id)}
			<TripCard {trip} {ondelete} {onedit} />
		{/each}
	</div>
{/if}
