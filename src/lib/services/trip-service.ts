import type { TripService } from '$lib/models/types';
import { createSupabaseTripService } from './supabase-trip-service';

export function createTripService(userId: string): TripService {
	return createSupabaseTripService(userId);
}
