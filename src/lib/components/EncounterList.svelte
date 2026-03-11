<script lang="ts">
	import type { Encounter, EncounterType } from '$lib/models/types';
	import EncounterCard from './EncounterCard.svelte';

	interface Props {
		encounters: Encounter[];
		ondelete?: (id: string) => void;
		onedit?: (id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }) => void;
		onretry?: (id: string) => void;
		emptyMessage?: string;
	}

	let { encounters, ondelete, onedit, onretry, emptyMessage = 'No encounters yet' }: Props = $props();
</script>

{#if encounters.length === 0}
	<p class="py-8 text-center text-base-content/50">{emptyMessage}</p>
{:else}
	<div class="flex flex-col gap-2">
		{#each encounters as encounter (encounter.id)}
			<EncounterCard {encounter} {ondelete} {onedit} {onretry} />
		{/each}
	</div>
{/if}
