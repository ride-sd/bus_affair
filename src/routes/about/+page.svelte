<script lang="ts">
	import { onMount } from 'svelte';
	import { encounterStore } from '$lib/stores/encounter-store.svelte';
	import { supabase } from '$lib/supabase';
	import { authStore } from '$lib/stores/auth-store.svelte';
	import type { Encounter } from '$lib/models/types';

	const LOCAL_STORAGE_KEY = 'bus-affair-trips';

	let localEncounterCount = $state(0);
	let importStatus = $state<string | null>(null);
	let importing = $state(false);
	let fileInput: HTMLInputElement;

	onMount(() => {
		encounterStore.load();
		countLocalEncounters();
	});

	function countLocalEncounters(): void {
		try {
			const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as unknown[];
				localEncounterCount = parsed.length;
			}
		} catch {
			localEncounterCount = 0;
		}
	}

	function clearAll() {
		if (confirm('Delete all encounters? This cannot be undone.')) {
			encounterStore.clearAll();
		}
	}

	function exportEncounters() {
		const json = JSON.stringify(encounterStore.encounters, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `bus-affair-export-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function importEncounters(encounters: Encounter[]): Promise<void> {
		const userId = authStore.user?.id;
		if (!userId) return;

		if (encounters.length === 0) {
			importStatus = 'No encounters found.';
			return;
		}

		importing = true;
		importStatus = null;

		try {
			const ids = encounters.map((e) => e.id);
			const { data: existing } = await supabase
				.from('encounters')
				.select('id')
				.in('id', ids);

			const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id));
			const toInsert = encounters.filter((e) => !existingIds.has(e.id));

			if (toInsert.length > 0) {
				const routeStrings = [
					...new Set(
						toInsert
							.map((e) => (e as Encounter & { mtsLine?: string }).mtsLine ?? e.route)
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

				const slugs = [
					...new Set(
						toInsert
							.map((e) => e.busModel?.id)
							.filter((s): s is string => !!s)
					)
				];
				const busModelIdMap = new Map<string, string>();
				if (slugs.length > 0) {
					const { data: modelRows } = await supabase
						.from('bus_models')
						.select('id, slug')
						.in('slug', slugs);
					for (const m of modelRows ?? []) {
						busModelIdMap.set(m.slug, m.id);
					}
				}

				const rows = toInsert.map((e) => {
					const route = (e as Encounter & { mtsLine?: string }).mtsLine ?? e.route ?? null;
					return {
						id: e.id,
						user_id: userId,
						bus_number: e.busNumber,
						agency: e.agency ?? 'MTS',
						bus_model_id: e.busModel?.id ? (busModelIdMap.get(e.busModel.id) ?? null) : null,
						route_id: route ? (routeIdMap.get(route) ?? null) : null,
						type: e.type ?? 'seen',
						latitude: e.location?.latitude ?? null,
						longitude: e.location?.longitude ?? null,
						created_at: e.timestamp
					};
				});

				const { error } = await supabase.from('encounters').insert(rows);
				if (error) throw error;
			}

			const skipped = encounters.length - toInsert.length;
			importStatus = `Imported ${toInsert.length} of ${encounters.length} encounter${encounters.length === 1 ? '' : 's'}${skipped > 0 ? ` (${skipped} already existed)` : ''}.`;

			await encounterStore.load();
		} catch (err) {
			importStatus = `Import failed: ${err instanceof Error ? err.message : String(err)}`;
		} finally {
			importing = false;
		}
	}

	async function importLocalEncounters() {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (!raw) return;

		let localEncounters: Encounter[];
		try {
			localEncounters = JSON.parse(raw) as Encounter[];
		} catch {
			importStatus = 'Failed to parse localStorage data.';
			return;
		}

		await importEncounters(localEncounters);
	}

	async function importFromFile() {
		const file = fileInput?.files?.[0];
		if (!file) return;

		let encounters: Encounter[];
		try {
			const text = await file.text();
			encounters = JSON.parse(text) as Encounter[];
		} catch {
			importStatus = 'Failed to parse JSON file.';
			return;
		}

		await importEncounters(encounters);
		fileInput.value = '';
	}

	function clearLocalStorage() {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		localEncounterCount = 0;
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
				<li>Tap <span class="badge badge-primary badge-sm">Log Sighting</span> or <span class="badge badge-primary badge-sm">Log Boarding</span> to save it</li>
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
				Encounter data is stored in the cloud and synced to your account.
			</p>
			<div class="mt-2 flex flex-wrap items-center gap-3">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<span class="link link-hover text-sm text-base-content/70" onclick={exportEncounters}>Download your data</span>
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

	{#if localEncounterCount > 0}
		<div class="card border border-info bg-info/10 shadow-sm">
			<div class="card-body">
				<h2 class="card-title text-info">Local Storage Encounters</h2>
				<p class="text-base-content/70">
					You have {localEncounterCount} encounter{localEncounterCount === 1 ? '' : 's'} saved in your browser's local storage. Import them to your account to keep them synced.
				</p>
				<div class="card-actions mt-2">
					<button class="btn btn-info btn-sm" onclick={importLocalEncounters} disabled={importing}>
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

	{#if authStore.profile?.is_admin}
		<div class="card bg-base-200 shadow-sm">
			<div class="card-body">
				<h2 class="card-title">Administration</h2>
				<p class="text-base-content/70">Manage users and approve new account requests.</p>
				<div class="card-actions mt-2">
					<a href="/admin" class="btn btn-neutral btn-sm">Open Admin Panel</a>
				</div>
			</div>
		</div>
	{/if}

	<div class="card border border-error bg-error/10 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-error">Danger Zone</h2>
			<p class="text-base-content/70">Once you delete your encounters, there is no going back.</p>
			<div class="card-actions mt-2">
				<button class="btn btn-error btn-sm" onclick={clearAll}>Delete all encounters</button>
			</div>
		</div>
	</div>
</div>
