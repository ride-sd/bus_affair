import type { Trip, TripService } from '$lib/models/types';
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

		async addTrip(busNumber: number): Promise<Trip> {
			const trip: Trip = {
				id: crypto.randomUUID(),
				busNumber,
				timestamp: new Date().toISOString(),
				busModel: lookupBusModel(busNumber)
			};
			const trips = loadTrips();
			trips.unshift(trip);
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
