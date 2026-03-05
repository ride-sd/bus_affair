import { supabase } from '$lib/supabase';
import { setFleetData } from '$lib/services/bus-lookup.svelte';
import { setMtsLines } from '$lib/data/mts-lines.svelte';
import type { FleetEntry, FuelType } from '$lib/models/types';

let loading = $state(true);

async function fetchFleetEntries(): Promise<void> {
	const { data, error } = await supabase
		.from('fleet_entries')
		.select('range_start, range_end, bus_models(slug, manufacturer, model, length_ft, fuel_type, year_introduced, description)')
		.order('range_start');

	if (error) {
		console.error('Failed to fetch fleet entries:', error);
		return;
	}

	const entries: FleetEntry[] = (data ?? []).map((row) => {
		const m = row.bus_models as unknown as Record<string, unknown>;
		return {
			rangeStart: row.range_start as number,
			rangeEnd: row.range_end as number,
			model: {
				manufacturer: m.manufacturer as string,
				model: m.model as string,
				lengthFt: m.length_ft as number,
				fuelType: m.fuel_type as FuelType,
				yearIntroduced: m.year_introduced as number,
				description: m.description as string | undefined
			}
		};
	});

	setFleetData(entries);
}

async function fetchRoutes(): Promise<void> {
	const { data, error } = await supabase
		.from('bus_routes')
		.select('route, name')
		.order('route');

	if (error) {
		console.error('Failed to fetch bus routes:', error);
		return;
	}

	const lines = (data ?? [])
		.map((row) => ({ route: row.route as string, name: row.name as string }))
		.sort((a, b) => a.route.localeCompare(b.route, undefined, { numeric: true }));
	setMtsLines(lines);
}

export const fleetStore = {
	get loading() {
		return loading;
	},

	async init(): Promise<void> {
		await Promise.all([fetchFleetEntries(), fetchRoutes()]);
		loading = false;
	}
};
