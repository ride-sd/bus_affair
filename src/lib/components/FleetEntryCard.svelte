<script lang="ts">
	import type { FleetEntry } from '$lib/models/types';

	interface Props {
		entry: FleetEntry;
	}

	let { entry }: Props = $props();
</script>

<div class="card bg-base-200 shadow-sm">
	<div class="card-body gap-0 p-4">
		<div class="flex justify-between border-b border-base-300 py-2">
			<span class="text-base-content/60">Manufacturer</span>
			<span class="font-medium">{entry.model.manufacturer}</span>
		</div>
		<div class="flex justify-between border-b border-base-300 py-2">
			<span class="text-base-content/60">Model</span>
			<span class="font-medium">{entry.model.model}</span>
		</div>
		<div class="flex justify-between border-b border-base-300 py-2">
			<span class="text-base-content/60">Length</span>
			<span class="font-medium">{entry.model.lengthFt} ft</span>
		</div>
		<div class="flex justify-between border-b border-base-300 py-2">
			<span class="text-base-content/60">Fuel Type</span>
			<span class="font-medium">{entry.model.fuelType}</span>
		</div>
		<div class="flex justify-between py-2">
			<span class="text-base-content/60">Year Introduced</span>
			<span class="font-medium">{entry.model.yearIntroduced}</span>
		</div>
	</div>
</div>
