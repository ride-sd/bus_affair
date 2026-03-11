<script lang="ts">
	import type { Encounter, EncounterType } from '$lib/models/types';
	import { mtsLines } from '$lib/data/mts-lines.svelte';
	import BusModelBadge from './BusModelBadge.svelte';

	interface Props {
		encounter: Encounter;
		ondelete?: (id: string) => void;
		onedit?: (id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }) => void;
		onretry?: (id: string) => void;
	}

	let { encounter, ondelete, onedit, onretry }: Props = $props();

	let editing = $state(false);
	let editBusNumber = $state(0);
	let editRoute = $state('');
	let editType = $state<EncounterType>('seen');

	function startEdit() {
		editBusNumber = encounter.busNumber;
		editRoute = encounter.route ?? '';
		editType = encounter.type ?? 'seen';
		editing = true;
	}

	function cancelEdit() {
		editing = false;
	}

	function saveEdit() {
		if (!editBusNumber || editBusNumber < 1) return;
		onedit?.(encounter.id, {
			busNumber: editBusNumber,
			route: editRoute,
			type: editType
		});
		editing = false;
	}

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

<div class="card shadow-sm {encounter.syncStatus === 'failed' ? 'border border-error bg-base-200' : encounter.type === 'boarded' ? 'bg-primary/10' : 'bg-base-200'} {encounter.syncStatus === 'pending' ? 'opacity-60' : ''}">
	<div class="card-body p-4">
		{#if editing}
			<div class="flex flex-col gap-3">
				<div class="flex flex-wrap items-end gap-3">
					<label class="form-control w-28">
						<span class="label-text text-xs">Bus #</span>
						<input
							type="number"
							class="input input-bordered input-sm w-full"
							bind:value={editBusNumber}
							min="1"
						/>
					</label>
					<label class="form-control w-48">
						<span class="label-text text-xs">Line</span>
						<select class="select select-bordered select-sm w-full" bind:value={editRoute}>
							<option value="">None</option>
							{#each mtsLines as line}
								<option value={line.route}>{line.route} - {line.name}</option>
							{/each}
						</select>
					</label>
					<div class="join">
						<button
							class="btn btn-sm join-item {editType === 'seen' ? 'btn-active' : ''}"
							onclick={() => (editType = 'seen')}
						>
							Seen
						</button>
						<button
							class="btn btn-sm join-item {editType === 'boarded' ? 'btn-active' : ''}"
							onclick={() => (editType = 'boarded')}
						>
							Boarded
						</button>
					</div>
				</div>
				<div class="flex gap-2">
					<button class="btn btn-primary btn-sm" onclick={saveEdit}>Save</button>
					<button class="btn btn-ghost btn-sm" onclick={cancelEdit}>Cancel</button>
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<a href="/bus/{encounter.busNumber}" class="text-2xl font-bold tabular-nums hover:underline">#{encounter.busNumber}</a>
					{#if encounter.route}
						<span class="text-base text-base-content/60 font-medium">· Line {encounter.route}</span>
					{/if}
					<BusModelBadge model={encounter.busModel} />
				{#if encounter.type === 'boarded'}
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
				<div class="flex items-center gap-1">
					{#if encounter.syncStatus === 'pending'}
						<span class="loading loading-spinner loading-xs text-base-content/40"></span>
					{:else if encounter.syncStatus === 'failed'}
						<span class="text-xs font-medium text-error">Failed</span>
						<button
							class="btn btn-ghost btn-sm btn-circle text-error"
							onclick={() => onretry?.(encounter.id)}
							aria-label="Retry sync"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					{:else}
						{#if onedit}
							<button
								class="btn btn-ghost btn-sm btn-circle"
								onclick={startEdit}
								aria-label="Edit encounter"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
								</svg>
							</button>
						{/if}
						{#if ondelete}
							<button
								class="btn btn-ghost btn-sm btn-circle"
								onclick={() => ondelete?.(encounter.id)}
								aria-label="Delete encounter"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
							</button>
						{/if}
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-2">
				<p class="text-sm text-base-content/60">{formatTime(encounter.timestamp)}</p>
				{#if encounter.location}
					<a
						href="https://www.google.com/maps?q={encounter.location.latitude},{encounter.location.longitude}"
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
		{/if}
	</div>
</div>
