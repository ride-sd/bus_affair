import type { EncounterService } from '$lib/models/types';
import { createSupabaseEncounterService } from './supabase-encounter-service';

export function createEncounterService(userId: string): EncounterService {
	return createSupabaseEncounterService(userId);
}
