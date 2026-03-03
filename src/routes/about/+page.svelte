<script lang="ts">
	import { onMount } from 'svelte';
	import { tripStore } from '$lib/stores/trip-store.svelte';
	import { supabase } from '$lib/supabase';
	import { authStore } from '$lib/stores/auth-store.svelte';
	import type { Trip } from '$lib/models/types';

	const LOCAL_STORAGE_KEY = 'bus-affair-trips';

	let localTripCount = $state(0);
	let importStatus = $state<string | null>(null);
	let importing = $state(false);
	let fileInput: HTMLInputElement;

	onMount(() => {
		tripStore.load();
		countLocalTrips();
	});

	function countLocalTrips(): void {
		try {
			const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as unknown[];
				localTripCount = parsed.length;
			}
		} catch {
			localTripCount = 0;
		}
	}

	function clearAll() {
		if (confirm('Delete all trips? This cannot be undone.')) {
			tripStore.clearAll();
		}
	}

	function exportTrips() {
		const json = JSON.stringify(tripStore.trips, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `bus-affair-export-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function importTrips(trips: Trip[]): Promise<void> {
		const userId = authStore.user?.id;
		if (!userId) return;

		if (trips.length === 0) {
			importStatus = 'No trips found.';
			return;
		}

		importing = true;
		importStatus = null;

		try {
			const ids = trips.map((t) => t.id);
			const { data: existing } = await supabase
				.from('trips')
				.select('id')
				.in('id', ids);

			const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id));
			const toInsert = trips.filter((t) => !existingIds.has(t.id));

			if (toInsert.length > 0) {
				// Build a route-string → bus_routes.id map for all distinct routes
				const routeStrings = [
					...new Set(
						toInsert
							.map((t) => (t as any).mtsLine ?? t.route)
							.filter((r): r is string => !!r)
					)
				];
				const routeIdMap = new Map<string, string>();
				if (routeStrings.length > 0) {
					const { data: routeRows } = await supabase
						.from('bus_routes')
						.select('id, route')
						.eq('agency', 'MTS')
						.in('route', routeStrings);
					for (const r of routeRows ?? []) {
						routeIdMap.set(r.route, r.id);
					}
				}

					// Build a busNumber → bus_model uuid map via lookup_bus_model RPC
				const distinctBusNumbers = [...new Set(toInsert.map((t) => t.busNumber))];
				const busModelIdMap = new Map<number, string>();
				for (const bn of distinctBusNumbers) {
					const { data: modelId } = await supabase.rpc('lookup_bus_model', {
						bus_number: bn
					});
					if (modelId) busModelIdMap.set(bn, modelId);
				}

				const rows = toInsert.map((t) => {
					const route = (t as any).mtsLine ?? t.route ?? null;
					return {
						id: t.id,
						user_id: userId,
						bus_number: t.busNumber,
						bus_model_id: busModelIdMap.get(t.busNumber) ?? null,
						route_id: route ? (routeIdMap.get(route) ?? null) : null,
						type: t.type ?? 'seen',
						latitude: t.location?.latitude ?? null,
						longitude: t.location?.longitude ?? null,
						created_at: t.timestamp
					};
				});

				const { error } = await supabase.from('trips').insert(rows);
				if (error) throw error;
			}

			const skipped = trips.length - toInsert.length;
			importStatus = `Imported ${toInsert.length} of ${trips.length} trips${skipped > 0 ? ` (${skipped} already existed)` : ''}.`;

			await tripStore.load();
		} catch (err) {
			importStatus = `Import failed: ${err instanceof Error ? err.message : String(err)}`;
		} finally {
			importing = false;
		}
	}

	async function importLocalTrips() {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (!raw) return;

		let localTrips: Trip[];
		try {
			localTrips = JSON.parse(raw) as Trip[];
		} catch {
			importStatus = 'Failed to parse localStorage data.';
			return;
		}

		await importTrips(localTrips);
	}

	async function importFromFile() {
		const file = fileInput?.files?.[0];
		if (!file) return;

		let trips: Trip[];
		try {
			const text = await file.text();
			trips = JSON.parse(text) as Trip[];
		} catch {
			importStatus = 'Failed to parse JSON file.';
			return;
		}

		await importTrips(trips);
		fileInput.value = '';
	}

	function clearLocalStorage() {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		localTripCount = 0;
		importStatus = null;
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
				Trip data is stored in the cloud and synced to your account.
			</p>
			<div class="mt-2 flex flex-wrap items-center gap-3">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<span class="link link-hover text-sm text-base-content/70" onclick={exportTrips}>Download your data</span>
				<span class="text-base-content/30">|</span>
				<label class="link link-hover text-sm text-base-content/70">
					Import from file
					<input bind:this={fileInput} type="file" accept=".json" class="hidden" onchange={importFromFile} />
				</label>
			</div>
			{#if importStatus}
				<p class="mt-2 text-sm text-base-content/70">{importStatus}</p>
			{/if}
		</div>
	</div>

	{#if localTripCount > 0}
		<div class="card border border-info bg-info/10 shadow-sm">
			<div class="card-body">
				<h2 class="card-title text-info">Local Storage Trips</h2>
				<p class="text-base-content/70">
					You have {localTripCount} trip{localTripCount === 1 ? '' : 's'} saved in your browser's local storage. Import them to your account to keep them synced.
				</p>
				<div class="card-actions mt-2">
					<button class="btn btn-info btn-sm" onclick={importLocalTrips} disabled={importing}>
						{#if importing}
							<span class="loading loading-spinner loading-xs"></span> Importing…
						{:else}
							Import to account
						{/if}
					</button>
					{#if importStatus?.startsWith('Imported')}
						<button class="btn btn-ghost btn-sm" onclick={clearLocalStorage}>Clear local storage</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<div class="card border border-error bg-error/10 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-error">Danger Zone</h2>
			<p class="text-base-content/70">Once you delete your trips, there is no going back.</p>
			<div class="card-actions mt-2">
				<button class="btn btn-error btn-sm" onclick={clearAll}>Delete all trips</button>
			</div>
		</div>
	</div>
</div>
