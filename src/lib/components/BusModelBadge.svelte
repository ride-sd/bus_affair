<script lang="ts">
	import type { BusModel } from '$lib/models/types';

	interface Props {
		model: BusModel | null;
	}

	let { model }: Props = $props();

	const fuelColor: Record<string, string> = {
		CNG: 'badge-info',
		Electric: 'badge-success',
		Diesel: 'badge-warning',
		LPG: 'badge-secondary'
	};
</script>

{#if model}
	<div class="flex flex-wrap gap-1.5">
		<span class="badge badge-secondary">{model.manufacturer}</span>
		<span class="badge badge-primary h-auto whitespace-normal">{model.model}</span>
		{#if model.fuelType === 'Electric'}
			<span class="badge badge-success gap-1">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
				</svg>
				EV
			</span>
		{/if}
		<span class="badge badge-ghost">{model.lengthFt}ft</span>
		<span class="badge badge-ghost">{model.yearIntroduced}</span>
	</div>
{:else}
	<span class="badge badge-neutral">Unknown bus</span>
{/if}
