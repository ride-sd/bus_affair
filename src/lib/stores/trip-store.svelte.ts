import type { GeoLocation, Trip, TripService, TripType } from '$lib/models/types';
import { createTripService } from '$lib/services/trip-service';

let service: TripService | null = null;
let trips = $state<Trip[]>([]);
let loading = $state(true);

function requireService(): TripService {
	if (!service) throw new Error('tripStore not initialized — call init(userId) first');
	return service;
}

export const tripStore = {
	get trips() {
		return trips;
	},
	get recentTrips() {
		return trips.slice(0, 5);
	},
	get loading() {
		return loading;
	},

	async init(userId: string) {
		service = createTripService(userId);
		loading = true;
		trips = await service.getTrips();
		loading = false;
	},

	async load() {
		loading = true;
		trips = await requireService().getTrips();
		loading = false;
	},

	async addTrip(busNumber: number, route?: string, type?: TripType, location?: GeoLocation) {
		const trip = await requireService().addTrip(busNumber, route, type, location);
		trips = [trip, ...trips];
		return trip;
	},

	async updateTrip(id: string, updates: { busNumber?: number; route?: string; type?: TripType }) {
		const updated = await requireService().updateTrip(id, updates);
		trips = trips.map((t) => (t.id === id ? updated : t));
		return updated;
	},

	async deleteTrip(id: string) {
		await requireService().deleteTrip(id);
		trips = trips.filter((t) => t.id !== id);
	},

	async clearAll() {
		await requireService().clearAllTrips();
		trips = [];
	}
};
