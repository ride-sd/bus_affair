<script lang="ts">
	import type { Trip } from '$lib/models/types';
	import BusModelBadge from './BusModelBadge.svelte';

	interface Props {
		trip: Trip;
		ondelete?: (id: string) => void;
	}

	let { trip, ondelete }: Props = $props();

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="card shadow-sm {trip.type === 'boarded' ? 'bg-primary/10' : 'bg-base-200'}">
	<div class="card-body p-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/bus/{trip.busNumber}" class="text-2xl font-bold tabular-nums hover:underline">#{trip.busNumber}</a>
				{#if trip.mtsLine}
					<span class="text-base text-base-content/60 font-medium">· Line {trip.mtsLine}</span>
				{/if}
				<BusModelBadge model={trip.busModel} />
			{#if trip.type === 'boarded'}
					<span class="inline-flex items-center gap-1 text-sm text-primary">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
							<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
						</svg>
						Boarded
					</span>
				{:else}
					<span class="badge badge-ghost badge-sm gap-1">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
							<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
							<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
						</svg>
						Seen
					</span>
				{/if}
			</div>
			{#if ondelete}
				<button
					class="btn btn-ghost btn-sm btn-circle"
					onclick={() => ondelete?.(trip.id)}
					aria-label="Delete trip"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
				</button>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			<p class="text-sm text-base-content/60">{formatTime(trip.timestamp)}</p>
			{#if trip.location}
				<a
					href="https://www.google.com/maps?q={trip.location.latitude},{trip.location.longitude}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary"
					aria-label="View location on map"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
					</svg>
					Map
				</a>
			{/if}
		</div>
	</div>
</div>
