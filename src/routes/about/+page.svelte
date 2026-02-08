<script lang="ts">
	import { onMount } from 'svelte';
	import { tripStore } from '$lib/stores/trip-store.svelte';
	import { generateModelId } from '$lib/services/bus-lookup';

	onMount(() => {
		tripStore.load();
	});

	function exportTrips() {
		const trips = tripStore.trips.map((trip) => {
			if (trip.busModel && !trip.busModel.id) {
				return { ...trip, busModel: { id: generateModelId(trip.busModel), ...trip.busModel } };
			}
			return trip;
		});
		const json = JSON.stringify(trips, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `bus-affair-export-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-bold">About Bus Affair</h1>

	<div class="card bg-base-200 shadow-sm">
		<div class="card-body">
			<h2 class="card-title">What is this?</h2>
			<p class="text-base-content/70">
				Bus Affair is a simple tool to track which San Diego MTS buses you ride. Log a bus
				number each time you board and build a record of every bus you've encountered.
			</p>
		</div>
	</div>

	<div class="card bg-base-200 shadow-sm">
		<div class="card-body">
			<h2 class="card-title">How it works</h2>
			<ul class="list-disc space-y-1 pl-5 text-base-content/70">
				<li>Enter the bus number you see on the vehicle</li>
				<li>Optionally select the route/line you're riding</li>
				<li>Tap <span class="badge badge-primary badge-sm">Log Trip</span> to save it</li>
			</ul>
			<p class="mt-2 text-base-content/70">
				The app looks up bus model details — manufacturer, fuel type, length, and more — based
				on the fleet number.
			</p>
		</div>
	</div>

	<div class="card bg-base-200 shadow-sm">
		<div class="card-body">
			<h2 class="card-title">Your data</h2>
			<p class="text-base-content/70">
				All trip data stays on your device using your browser's local storage. Nothing is sent
				to a server. You can
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<span class="link link-hover" onclick={exportTrips}>download your data</span> at any time.
			</p>
		</div>
	</div>
</div>
