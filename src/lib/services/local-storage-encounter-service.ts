import type { GeoLocation, Encounter, EncounterService, EncounterType } from '$lib/models/types';
import { lookupBusModel } from './bus-lookup.svelte';

const STORAGE_KEY = 'bus-affair-trips';

function loadEncounters(): Encounter[] {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as Encounter[];
	} catch {
		return [];
	}
}

function saveEncounters(encounters: Encounter[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(encounters));
}

export function createLocalStorageEncounterService(): EncounterService {
	return {
		async getEncounters(): Promise<Encounter[]> {
			return loadEncounters();
		},

		async addEncounter(busNumber: number, route?: string, type?: EncounterType, location?: GeoLocation): Promise<Encounter> {
			const encounterType = type ?? 'seen';
			const encounter: Encounter = {
				id: crypto.randomUUID(),
				busNumber,
				timestamp: new Date().toISOString(),
				busModel: lookupBusModel(busNumber, 'MTS'),
				...(route && { route }),
				agency: 'MTS',
				type: encounterType,
				...(location && { location })
			};
			const encounters = loadEncounters();
			encounters.unshift(encounter);
			saveEncounters(encounters);
			return encounter;
		},

		async updateEncounter(
			id: string,
			updates: { busNumber?: number; route?: string; type?: EncounterType }
		): Promise<Encounter> {
			const encounters = loadEncounters();
			const index = encounters.findIndex((e) => e.id === id);
			if (index === -1) throw new Error(`Encounter not found: ${id}`);

			const encounter = encounters[index];
			if (updates.busNumber !== undefined) {
				encounter.busNumber = updates.busNumber;
				encounter.busModel = lookupBusModel(updates.busNumber, 'MTS');
			}
			if (updates.route !== undefined) {
				encounter.route = updates.route || undefined;
			}
			if (updates.type !== undefined) {
				encounter.type = updates.type;
			}
			encounters[index] = encounter;
			saveEncounters(encounters);
			return encounter;
		},

		async deleteEncounter(id: string): Promise<void> {
			const encounters = loadEncounters().filter((e) => e.id !== id);
			saveEncounters(encounters);
		},

		async clearAllEncounters(): Promise<void> {
			saveEncounters([]);
		}
	};
}
