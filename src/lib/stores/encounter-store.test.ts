// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { encounterStore } from './encounter-store.svelte';
import { createEncounterService } from '$lib/services/encounter-service';
import type { Encounter, EncounterService } from '$lib/models/types';

vi.mock('$lib/services/encounter-service');
vi.mock('$lib/services/bus-lookup.svelte', () => ({
	lookupBusModel: () => null
}));

const mockService: EncounterService = {
	getEncounters: vi.fn(),
	addEncounter: vi.fn(),
	updateEncounter: vi.fn(),
	deleteEncounter: vi.fn(),
	clearAllEncounters: vi.fn()
};

const serverEncounter = (id = 'server-id'): Encounter => ({
	id,
	busNumber: 827,
	timestamp: '2026-03-10T10:00:00.000Z',
	busModel: null,
	agency: 'MTS',
	type: 'seen',
	syncStatus: 'synced'
});

beforeEach(async () => {
	localStorage.clear();
	vi.mocked(createEncounterService).mockReturnValue(mockService);
	vi.mocked(mockService.getEncounters).mockResolvedValue([]);
	vi.mocked(mockService.addEncounter).mockReset();
	vi.mocked(mockService.deleteEncounter).mockResolvedValue(undefined);
	vi.mocked(mockService.clearAllEncounters).mockResolvedValue(undefined);
	await encounterStore.init('user-1');
});

describe('addEncounter', () => {
	it('shows as pending immediately, then synced on success', async () => {
		let resolveAdd!: (e: Encounter) => void;
		vi.mocked(mockService.addEncounter).mockImplementation(
			() => new Promise((res) => { resolveAdd = res; })
		);

		const promise = encounterStore.addEncounter(827);
		expect(encounterStore.encounters[0].syncStatus).toBe('pending');

		resolveAdd(serverEncounter());
		await promise;
		expect(encounterStore.encounters[0].syncStatus).toBe('synced');
		expect(encounterStore.encounters[0].id).toBe('server-id');
	});

	it('shows as failed when the backend call throws', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValue(new Error('Network error'));
		await encounterStore.addEncounter(827);
		expect(encounterStore.encounters[0].syncStatus).toBe('failed');
	});

	it('saves to outbox immediately so failures survive a page reload', async () => {
		let resolveAdd!: (e: Encounter) => void;
		vi.mocked(mockService.addEncounter).mockImplementation(
			() => new Promise((res) => { resolveAdd = res; })
		);

		const promise = encounterStore.addEncounter(827);
		const outbox = JSON.parse(localStorage.getItem('bus-affair-outbox') ?? '[]');
		expect(outbox).toHaveLength(1);
		expect(outbox[0].busNumber).toBe(827);

		resolveAdd(serverEncounter());
		await promise;
	});

	it('removes from outbox after successful sync', async () => {
		vi.mocked(mockService.addEncounter).mockResolvedValue(serverEncounter());
		await encounterStore.addEncounter(827);
		const outbox = JSON.parse(localStorage.getItem('bus-affair-outbox') ?? '[]');
		expect(outbox).toHaveLength(0);
	});

	it('keeps in outbox after failed sync', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValue(new Error('Network error'));
		await encounterStore.addEncounter(827);
		const outbox = JSON.parse(localStorage.getItem('bus-affair-outbox') ?? '[]');
		expect(outbox).toHaveLength(1);
	});
});

describe('retryEncounter', () => {
	it('transitions to synced on retry success', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValueOnce(new Error('Network error'));
		await encounterStore.addEncounter(827);
		expect(encounterStore.encounters[0].syncStatus).toBe('failed');

		vi.mocked(mockService.addEncounter).mockResolvedValueOnce(serverEncounter());
		await encounterStore.retryEncounter(encounterStore.encounters[0].id);
		expect(encounterStore.encounters[0].syncStatus).toBe('synced');
	});

	it('stays failed if retry also fails', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValue(new Error('Network error'));
		await encounterStore.addEncounter(827);
		const id = encounterStore.encounters[0].id;

		await encounterStore.retryEncounter(id);
		expect(encounterStore.encounters[0].syncStatus).toBe('failed');
	});

	it('removes from outbox after successful retry', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValueOnce(new Error('Network error'));
		await encounterStore.addEncounter(827);
		const id = encounterStore.encounters[0].id;

		vi.mocked(mockService.addEncounter).mockResolvedValueOnce(serverEncounter());
		await encounterStore.retryEncounter(id);
		const outbox = JSON.parse(localStorage.getItem('bus-affair-outbox') ?? '[]');
		expect(outbox).toHaveLength(0);
	});
});

describe('init', () => {
	it('surfaces unsynced outbox items as failed on reload', async () => {
		// Simulate a previous session that failed to sync
		const outboxItem = {
			id: 'orphan-id',
			timestamp: '2026-03-10T09:00:00.000Z',
			busNumber: 301,
			type: 'boarded'
		};
		localStorage.setItem('bus-affair-outbox', JSON.stringify([outboxItem]));

		// Backend doesn't have this encounter
		vi.mocked(mockService.getEncounters).mockResolvedValue([]);
		await encounterStore.init('user-1');

		expect(encounterStore.encounters).toHaveLength(1);
		expect(encounterStore.encounters[0].id).toBe('orphan-id');
		expect(encounterStore.encounters[0].syncStatus).toBe('failed');
	});

	it('does not re-surface outbox items that already exist in the backend', async () => {
		const outboxItem = {
			id: 'server-id',
			timestamp: '2026-03-10T09:00:00.000Z',
			busNumber: 827,
			type: 'seen'
		};
		localStorage.setItem('bus-affair-outbox', JSON.stringify([outboxItem]));

		// Backend already has this encounter (previous retry succeeded)
		vi.mocked(mockService.getEncounters).mockResolvedValue([serverEncounter('server-id')]);
		await encounterStore.init('user-1');

		const failed = encounterStore.encounters.filter((e) => e.syncStatus === 'failed');
		expect(failed).toHaveLength(0);
		expect(encounterStore.encounters).toHaveLength(1);
	});
});

describe('deleteEncounter', () => {
	it('removes a failed encounter from both state and outbox', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValue(new Error('Network error'));
		await encounterStore.addEncounter(827);
		const id = encounterStore.encounters[0].id;

		await encounterStore.deleteEncounter(id);
		expect(encounterStore.encounters).toHaveLength(0);
		const outbox = JSON.parse(localStorage.getItem('bus-affair-outbox') ?? '[]');
		expect(outbox).toHaveLength(0);
	});
});

describe('clearAll', () => {
	it('clears the outbox alongside backend encounters', async () => {
		vi.mocked(mockService.addEncounter).mockRejectedValue(new Error('Network error'));
		await encounterStore.addEncounter(827);

		await encounterStore.clearAll();
		const outbox = JSON.parse(localStorage.getItem('bus-affair-outbox') ?? '[]');
		expect(outbox).toHaveLength(0);
		expect(encounterStore.encounters).toHaveLength(0);
	});
});
