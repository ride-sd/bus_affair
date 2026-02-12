import type { GeoLocation, Trip, TripService, TripType } from '$lib/models/types';
import { lookupBusModel } from './bus-lookup';

const STORAGE_KEY = 'bus-affair-trips';

function loadTrips(): Trip[] {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as Trip[];
	} catch {
		return [];
	}
}

function saveTrips(trips: Trip[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function createLocalStorageTripService(): TripService {
	return {
		async getTrips(): Promise<Trip[]> {
			return loadTrips();
		},

		async addTrip(busNumber: number, mtsLine?: string, type?: TripType, location?: GeoLocation): Promise<Trip> {
			const tripType = type ?? 'seen';
			const trip: Trip = {
				id: crypto.randomUUID(),
				busNumber,
				timestamp: new Date().toISOString(),
				busModel: lookupBusModel(busNumber),
				...(mtsLine && { mtsLine }),
				type: tripType,
				...(location && { location })
			};
			const trips = loadTrips();
			trips.unshift(trip);
			saveTrips(trips);
			return trip;
		},

		async updateTrip(
			id: string,
			updates: { busNumber?: number; mtsLine?: string; type?: TripType }
		): Promise<Trip> {
			const trips = loadTrips();
			const index = trips.findIndex((t) => t.id === id);
			if (index === -1) throw new Error(`Trip not found: ${id}`);

			const trip = trips[index];
			if (updates.busNumber !== undefined) {
				trip.busNumber = updates.busNumber;
				trip.busModel = lookupBusModel(updates.busNumber);
			}
			if (updates.mtsLine !== undefined) {
				trip.mtsLine = updates.mtsLine || undefined;
			}
			if (updates.type !== undefined) {
				trip.type = updates.type;
			}
			trips[index] = trip;
			saveTrips(trips);
			return trip;
		},

		async deleteTrip(id: string): Promise<void> {
			const trips = loadTrips().filter((t) => t.id !== id);
			saveTrips(trips);
		},

		async clearAllTrips(): Promise<void> {
			saveTrips([]);
		}
	};
}
