import { supabase } from '$lib/supabase';
import type { BusModel, GeoLocation, Trip, TripService, TripType } from '$lib/models/types';

interface TripRow {
	id: string;
	bus_number: number;
	route_id: string | null;
	type: TripType;
	latitude: number | null;
	longitude: number | null;
	created_at: string;
	bus_models: {
		id: string;
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

function rowToTrip(row: TripRow): Trip {
	const busModel: BusModel | null = row.bus_models
		? {
				id: row.bus_models.id,
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
		...(row.bus_routes?.agency && { agency: row.bus_routes.agency }),
		type: row.type,
		...(row.latitude != null &&
			row.longitude != null && {
				location: { latitude: row.latitude, longitude: row.longitude }
			})
	};
}

const TRIP_SELECT = `id, bus_number, route_id, type, latitude, longitude, created_at, bus_models (id, manufacturer, model, length_ft, fuel_type, year_introduced, division, description), bus_routes (route, agency, name)`;

async function lookupRouteId(route: string): Promise<string | null> {
	const { data } = await supabase
		.from('bus_routes')
		.select('id')
		.eq('route', route)
		.eq('agency', 'MTS')
		.single();
	return data?.id ?? null;
}

export function createSupabaseTripService(userId: string): TripService {
	return {
		async getTrips(): Promise<Trip[]> {
			const { data, error } = await supabase
				.from('trips')
				.select(TRIP_SELECT)
				.order('created_at', { ascending: false });

			if (error) throw error;
			return (data as unknown as TripRow[]).map(rowToTrip);
		},

		async addTrip(
			busNumber: number,
			route?: string,
			type?: TripType,
			location?: GeoLocation
		): Promise<Trip> {
			const { data: busModelId } = await supabase.rpc('lookup_bus_model', {
				bus_number: busNumber
			});

			const routeId = route ? await lookupRouteId(route) : null;

			const { data, error } = await supabase
				.from('trips')
				.insert({
					user_id: userId,
					bus_number: busNumber,
					bus_model_id: busModelId ?? null,
					route_id: routeId,
					type: type ?? 'seen',
					latitude: location?.latitude ?? null,
					longitude: location?.longitude ?? null
				})
				.select(TRIP_SELECT)
				.single();

			if (error) throw error;
			return rowToTrip(data as unknown as TripRow);
		},

		async updateTrip(
			id: string,
			updates: { busNumber?: number; route?: string; type?: TripType }
		): Promise<Trip> {
			const patch: Record<string, unknown> = {};

			if (updates.busNumber !== undefined) {
				patch.bus_number = updates.busNumber;
				const { data: busModelId } = await supabase.rpc('lookup_bus_model', {
					bus_number: updates.busNumber
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
				.from('trips')
				.update(patch)
				.eq('id', id)
				.select(TRIP_SELECT)
				.single();

			if (error) throw error;
			return rowToTrip(data as unknown as TripRow);
		},

		async deleteTrip(id: string): Promise<void> {
			const { error } = await supabase.from('trips').delete().eq('id', id);
			if (error) throw error;
		},

		async clearAllTrips(): Promise<void> {
			const { error } = await supabase.from('trips').delete().eq('user_id', userId);
			if (error) throw error;
		}
	};
}
