import type { GeoLocation, Encounter, EncounterService, EncounterType } from '$lib/models/types';
import { createEncounterService } from '$lib/services/encounter-service';
import { lookupBusModel } from '$lib/services/bus-lookup.svelte';

const OUTBOX_KEY = 'bus-affair-outbox';

interface OutboxItem {
	id: string;
	timestamp: string;
	busNumber: number;
	route?: string;
	type?: EncounterType;
	location?: GeoLocation;
}

function loadOutbox(): OutboxItem[] {
	try {
		return JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? '[]');
	} catch {
		return [];
	}
}

function saveOutbox(items: OutboxItem[]) {
	localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

function addToOutbox(item: OutboxItem) {
	saveOutbox([...loadOutbox(), item]);
}

function removeFromOutbox(id: string) {
	saveOutbox(loadOutbox().filter((i) => i.id !== id));
}

function buildOptimisticEncounter(item: OutboxItem, syncStatus: Encounter['syncStatus']): Encounter {
	return {
		id: item.id,
		busNumber: item.busNumber,
		timestamp: item.timestamp,
		busModel: lookupBusModel(item.busNumber, 'MTS'),
		route: item.route,
		agency: 'MTS',
		type: item.type ?? 'seen',
		location: item.location,
		syncStatus
	};
}

let service: EncounterService | null = null;
let encounters = $state<Encounter[]>([]);
let loading = $state(true);

function requireService(): EncounterService {
	if (!service) throw new Error('encounterStore not initialized — call init(userId) first');
	return service;
}

async function syncToBackend(item: OutboxItem): Promise<void> {
	try {
		const saved = await requireService().addEncounter(
			item.busNumber,
			item.route,
			item.type,
			item.location
		);
		removeFromOutbox(item.id);
		encounters = encounters.map((e) =>
			e.id === item.id ? { ...saved, syncStatus: 'synced' } : e
		);
	} catch {
		encounters = encounters.map((e) =>
			e.id === item.id ? { ...e, syncStatus: 'failed' } : e
		);
	}
}

function mergeWithOutbox(synced: Encounter[]): Encounter[] {
	const syncedIds = new Set(synced.map((e) => e.id));
	const failed = loadOutbox()
		.filter((item) => !syncedIds.has(item.id))
		.map((item) => buildOptimisticEncounter(item, 'failed'));
	return [...failed, ...synced.map((e) => ({ ...e, syncStatus: 'synced' as const }))];
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
		const synced = await service.getEncounters().catch(() => [] as Encounter[]);
		encounters = mergeWithOutbox(synced);
		loading = false;
	},

	async load() {
		if (!service) return;
		loading = true;
		const synced = await service.getEncounters();
		encounters = mergeWithOutbox(synced);
		loading = false;
	},

	async addEncounter(busNumber: number, route?: string, type?: EncounterType, location?: GeoLocation) {
		const item: OutboxItem = {
			id: crypto.randomUUID(),
			timestamp: new Date().toISOString(),
			busNumber,
			route,
			type,
			location
		};
		const optimistic = buildOptimisticEncounter(item, 'pending');
		addToOutbox(item);
		encounters = [optimistic, ...encounters];
		await syncToBackend(item);
		return optimistic;
	},

	async retryEncounter(id: string) {
		const item = loadOutbox().find((i) => i.id === id);
		if (!item) return;
		encounters = encounters.map((e) => (e.id === id ? { ...e, syncStatus: 'pending' } : e));
		await syncToBackend(item);
	},

	async updateEncounter(id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }) {
		const updated = await requireService().updateEncounter(id, updates);
		encounters = encounters.map((e) => (e.id === id ? { ...updated, syncStatus: 'synced' } : e));
		return updated;
	},

	async deleteEncounter(id: string) {
		removeFromOutbox(id);
		encounters = encounters.filter((e) => e.id !== id);
		try {
			await requireService().deleteEncounter(id);
		} catch {
			// Already removed from local state; may not exist in backend if never synced
		}
	},

	async clearAll() {
		await requireService().clearAllEncounters();
		saveOutbox([]);
		encounters = [];
	}
};
