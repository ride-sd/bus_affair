import type { TripService } from '$lib/models/types';
import { createLocalStorageTripService } from './local-storage-trip-service';

export function createTripService(): TripService {
	return createLocalStorageTripService();
}
