import { fleet } from '$lib/data/bus-fleet';
import type { BusModel } from '$lib/models/types';

export function lookupBusModel(busNumber: number): BusModel | null {
	const entry = fleet.find((e) => busNumber >= e.rangeStart && busNumber <= e.rangeEnd);
	return entry?.model ?? null;
}
