import type { GeoLocation, Encounter, EncounterService, EncounterType } from '$lib/models/types';
import { createEncounterService } from '$lib/services/encounter-service';

let service: EncounterService | null = null;
let encounters = $state<Encounter[]>([]);
let loading = $state(true);

function requireService(): EncounterService {
	if (!service) throw new Error('encounterStore not initialized — call init(userId) first');
	return service;
}

export const encounterStore = {
	get encounters() {
		return encounters;
	},
	get recentEncounters() {
		return encounters.slice(0, 5);
	},
	get loading() {
		return loading;
	},

	async init(userId: string) {
		service = createEncounterService(userId);
		loading = true;
		encounters = await service.getEncounters();
		loading = false;
	},

	async load() {
		loading = true;
		encounters = await requireService().getEncounters();
		loading = false;
	},

	async addEncounter(busNumber: number, route?: string, type?: EncounterType, location?: GeoLocation) {
		const encounter = await requireService().addEncounter(busNumber, route, type, location);
		encounters = [encounter, ...encounters];
		return encounter;
	},

	async updateEncounter(id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }) {
		const updated = await requireService().updateEncounter(id, updates);
		encounters = encounters.map((e) => (e.id === id ? updated : e));
		return updated;
	},

	async deleteEncounter(id: string) {
		await requireService().deleteEncounter(id);
		encounters = encounters.filter((e) => e.id !== id);
	},

	async clearAll() {
		await requireService().clearAllEncounters();
		encounters = [];
	}
};
