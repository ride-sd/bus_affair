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
		<span class="badge badge-primary">{model.manufacturer} {model.model}</span>
		<span class="badge {fuelColor[model.fuelType] ?? 'badge-neutral'}">{model.fuelType}</span>
		<span class="badge badge-ghost">{model.lengthFt}ft</span>
	</div>
{:else}
	<span class="badge badge-neutral">Unknown bus</span>
{/if}
