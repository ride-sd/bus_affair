<script lang="ts">
	import type { TripType } from '$lib/models/types';
	import { lookupBusModel } from '$lib/services/bus-lookup';
	import { mtsLines } from '$lib/data/mts-lines';
	import BusModelBadge from './BusModelBadge.svelte';

	interface Props {
		onsubmit: (busNumber: number, mtsLine?: string, type?: TripType) => void;
	}

	let { onsubmit }: Props = $props();

	let input = $state('');
	let selectedLine = $state('');
	let tripType = $state<TripType>('boarded');
	let submitted = $state(false);

	const busNumber = $derived(input.length >= 3 ? parseInt(input, 10) : null);
	const preview = $derived(busNumber !== null ? lookupBusModel(busNumber) : undefined);
	const canSubmit = $derived(input.length >= 3 && input.length <= 4);

	function press(digit: string) {
		if (input.length < 4) {
			input += digit;
			submitted = false;
		}
	}

	function backspace() {
		input = input.slice(0, -1);
		submitted = false;
	}

	function clear() {
		input = '';
		submitted = false;
	}

	function submit() {
		if (!canSubmit) return;
		onsubmit(parseInt(input, 10), selectedLine || undefined, tripType);
		submitted = true;
		input = '';
		selectedLine = '';
		tripType = 'boarded';
	}

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
</script>

<div class="flex flex-col items-center gap-4">
	<!-- Display -->
	<div class="flex w-full flex-col items-center gap-2">
		<div class="text-5xl font-bold tracking-widest tabular-nums min-h-[3.5rem]">
			{input || '\u00A0'}
		</div>

		<!-- Live preview -->
		<div class="min-h-[1.75rem]">
			{#if preview !== undefined}
				<BusModelBadge model={preview} />
			{/if}
		</div>
	</div>

	<!-- Line selector -->
	<select class="select select-bordered w-full max-w-xs" bind:value={selectedLine}>
		<option value="">Line (optional)</option>
		{#each mtsLines as line}
			<option value={line.route}>{line.route} - {line.name}</option>
		{/each}
	</select>

	<!-- Keypad -->
	<div class="grid w-full max-w-xs grid-cols-3 gap-2">
		{#each keys as key}
			<button class="btn btn-lg btn-outline text-xl" onclick={() => press(key)}>
				{key}
			</button>
		{/each}

		<!-- Bottom row: Clear, 0, Backspace -->
		<button class="btn btn-lg btn-ghost text-sm" onclick={clear}>CLR</button>
		<button class="btn btn-lg btn-outline text-xl" onclick={() => press('0')}>0</button>
		<button class="btn btn-lg btn-ghost" onclick={backspace} aria-label="Backspace">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7 11 0 0 14-11 0z" />
			</svg>
		</button>
	</div>

	<!-- Trip type toggle -->
	<div class="join max-w-xs w-full">
		<button
			class="join-item btn btn-sm flex-1"
			class:btn-active={tripType === 'boarded'}
			onclick={() => (tripType = 'boarded')}
		>
			Boarded
		</button>
		<button
			class="join-item btn btn-sm flex-1"
			class:btn-active={tripType === 'seen'}
			onclick={() => (tripType = 'seen')}
		>
			Seen
		</button>
	</div>

	<!-- Submit -->
	<button
		class="btn btn-primary btn-lg btn-block max-w-xs text-lg"
		disabled={!canSubmit}
		onclick={submit}
	>
		{tripType === 'seen' ? 'Log Sighting' : 'Log Trip'}
	</button>

	{#if submitted}
		<div class="text-success text-sm animate-pulse">Trip logged!</div>
	{/if}
</div>
