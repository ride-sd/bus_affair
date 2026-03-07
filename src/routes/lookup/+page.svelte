<script lang="ts">
	import { lookupFleetEntry } from '$lib/services/bus-lookup.svelte';
	import { authStore } from '$lib/stores/auth-store.svelte';
	import FleetEntryCard from '$lib/components/FleetEntryCard.svelte';

	let busNumber = $state<number | null>(null);
	let entry = $derived(busNumber !== null ? lookupFleetEntry(busNumber, 'MTS') : null);
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-2xl font-bold">Bus Lookup</h1>
		<p class="mt-1 text-base-content/60">Enter a bus number to see fleet information.</p>
	</div>

	<input
		type="number"
		inputmode="numeric"
		class="input input-bordered w-full text-2xl tabular-nums"
		placeholder="Bus number"
		bind:value={busNumber}
		min="1"
	/>

	{#if busNumber !== null}
		{#if entry}
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<h2 class="text-3xl font-bold tabular-nums">Bus #{busNumber}</h2>
					<span class="badge badge-outline">Fleet {entry.rangeStart}–{entry.rangeEnd}</span>
				</div>

				{#if entry.model.description}
					<p class="text-base-content/70">{entry.model.description}</p>
				{/if}

				<FleetEntryCard {entry} />

				{#if !authStore.user}
					<div class="card bg-base-200 shadow-sm">
						<div class="card-body items-center text-center gap-2">
							<p class="text-base-content/70">Sign in to log your encounters with this bus.</p>
							<a href="/auth/login" class="btn btn-primary btn-sm">Sign In</a>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center gap-2 py-8 text-center">
				<p class="text-lg font-semibold">Unknown Bus</p>
				<p class="text-base-content/60">Bus #{busNumber} wasn't found in the fleet database.</p>
			</div>
		{/if}
	{/if}
</div>
