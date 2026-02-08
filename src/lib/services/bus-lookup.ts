import { fleet } from '$lib/data/bus-fleet';
import type { BusModel, FleetEntry } from '$lib/models/types';

export function generateModelId(model: BusModel): string {
	return `${model.yearIntroduced}-${model.manufacturer}-${model.model}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export function lookupBusModel(busNumber: number): BusModel | null {
	const entry = fleet.find((e) => busNumber >= e.rangeStart && busNumber <= e.rangeEnd);
	if (!entry) return null;
	return { id: generateModelId(entry.model), ...entry.model };
}

export function lookupFleetEntry(busNumber: number): FleetEntry | null {
	return fleet.find((e) => busNumber >= e.rangeStart && busNumber <= e.rangeEnd) ?? null;
}
