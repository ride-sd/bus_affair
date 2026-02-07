import type { Trip } from '$lib/models/types';
import { createTripService } from '$lib/services/trip-service';

const service = createTripService();

let trips = $state<Trip[]>([]);
let loading = $state(true);

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

	async load() {
		loading = true;
		trips = await service.getTrips();
		loading = false;
	},

	async addTrip(busNumber: number, mtsLine?: string) {
		const trip = await service.addTrip(busNumber, mtsLine);
		trips = [trip, ...trips];
		return trip;
	},

	async deleteTrip(id: string) {
		await service.deleteTrip(id);
		trips = trips.filter((t) => t.id !== id);
	},

	async clearAll() {
		await service.clearAllTrips();
		trips = [];
	}
};
