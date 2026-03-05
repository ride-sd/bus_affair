import { supabase } from '$lib/supabase';
import type { BusModel, GeoLocation, Encounter, EncounterService, EncounterType } from '$lib/models/types';

interface EncounterRow {
	id: string;
	bus_number: number;
	agency: string;
	route_id: string | null;
	type: EncounterType;
	latitude: number | null;
	longitude: number | null;
	created_at: string;
	bus_models: {
		slug: string;
		manufacturer: string;
		model: string;
		length_ft: number;
		fuel_type: string;
		year_introduced: number;
		division: string | null;
		description: string | null;
	} | null;
	bus_routes: {
		route: string;
		agency: string;
		name: string;
	} | null;
}

function rowToEncounter(row: EncounterRow): Encounter {
	const busModel: BusModel | null = row.bus_models
		? {
				id: row.bus_models.slug,
				manufacturer: row.bus_models.manufacturer,
				model: row.bus_models.model,
				lengthFt: row.bus_models.length_ft,
				fuelType: row.bus_models.fuel_type as BusModel['fuelType'],
				yearIntroduced: row.bus_models.year_introduced,
				...(row.bus_models.division && { division: row.bus_models.division }),
				...(row.bus_models.description && { description: row.bus_models.description })
			}
		: null;

	return {
		id: row.id,
		busNumber: row.bus_number,
		timestamp: row.created_at,
		busModel,
		...(row.bus_routes?.route && { route: row.bus_routes.route }),
		agency: row.agency,
		type: row.type,
		...(row.latitude != null &&
			row.longitude != null && {
				location: { latitude: row.latitude, longitude: row.longitude }
			})
	};
}

const ENCOUNTER_SELECT = `id, bus_number, agency, route_id, type, latitude, longitude, created_at, bus_models (slug, manufacturer, model, length_ft, fuel_type, year_introduced, division, description), bus_routes (route, agency, name)`;

async function lookupRouteId(route: string): Promise<string | null> {
	const { data } = await supabase
		.from('bus_routes')
		.select('id')
		.eq('route', route)
		.eq('agency', 'MTS')
		.single();
	return data?.id ?? null;
}

export function createSupabaseEncounterService(userId: string): EncounterService {
	return {
		async getEncounters(): Promise<Encounter[]> {
			const { data, error } = await supabase
				.from('encounters')
				.select(ENCOUNTER_SELECT)
				.order('created_at', { ascending: false });

			if (error) throw error;
			return (data as unknown as EncounterRow[]).map(rowToEncounter);
		},

		async addEncounter(
			busNumber: number,
			route?: string,
			type?: EncounterType,
			location?: GeoLocation
		): Promise<Encounter> {
			const agency = 'MTS';
			const { data: busModelId } = await supabase.rpc('lookup_bus_model', {
				bus_number: busNumber,
				agency
			});

			const routeId = route ? await lookupRouteId(route) : null;

			const { data, error } = await supabase
				.from('encounters')
				.insert({
					user_id: userId,
					bus_number: busNumber,
					agency,
					bus_model_id: busModelId ?? null,
					route_id: routeId,
					type: type ?? 'seen',
					latitude: location?.latitude ?? null,
					longitude: location?.longitude ?? null
				})
				.select(ENCOUNTER_SELECT)
				.single();

			if (error) throw error;
			return rowToEncounter(data as unknown as EncounterRow);
		},

		async updateEncounter(
			id: string,
			updates: { busNumber?: number; route?: string; type?: EncounterType }
		): Promise<Encounter> {
			const patch: Record<string, unknown> = {};

			if (updates.busNumber !== undefined) {
				patch.bus_number = updates.busNumber;
				const { data: busModelId } = await supabase.rpc('lookup_bus_model', {
					bus_number: updates.busNumber,
					agency: 'MTS'
				});
				patch.bus_model_id = busModelId ?? null;
			}
			if (updates.route !== undefined) {
				patch.route_id = updates.route ? await lookupRouteId(updates.route) : null;
			}
			if (updates.type !== undefined) {
				patch.type = updates.type;
			}

			const { data, error } = await supabase
				.from('encounters')
				.update(patch)
				.eq('id', id)
				.select(ENCOUNTER_SELECT)
				.single();

			if (error) throw error;
			return rowToEncounter(data as unknown as EncounterRow);
		},

		async deleteEncounter(id: string): Promise<void> {
			const { error } = await supabase.from('encounters').delete().eq('id', id);
			if (error) throw error;
		},

		async clearAllEncounters(): Promise<void> {
			const { error } = await supabase.from('encounters').delete().eq('user_id', userId);
			if (error) throw error;
		}
	};
}
