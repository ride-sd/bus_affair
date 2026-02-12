import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalStorageTripService } from './local-storage-trip-service';
import type { TripService } from '$lib/models/types';

// @vitest-environment jsdom

let service: TripService;

beforeEach(() => {
	localStorage.clear();
	service = createLocalStorageTripService();
});

describe('getTrips', () => {
	it('returns empty array when no trips exist', async () => {
		expect(await service.getTrips()).toEqual([]);
	});

	it('returns empty array when localStorage has invalid JSON', async () => {
		localStorage.setItem('bus-affair-trips', 'not-json');
		expect(await service.getTrips()).toEqual([]);
	});
});

describe('addTrip', () => {
	it('adds a trip and returns it with an id and timestamp', async () => {
		const trip = await service.addTrip(350);
		expect(trip.id).toBeTruthy();
		expect(trip.busNumber).toBe(350);
		expect(trip.timestamp).toBeTruthy();
		expect(trip.type).toBe('seen');
	});

	it('defaults type to seen', async () => {
		const trip = await service.addTrip(350);
		expect(trip.type).toBe('seen');
	});

	it('stores the trip type when provided', async () => {
		const trip = await service.addTrip(350, undefined, 'boarded');
		expect(trip.type).toBe('boarded');
	});

	it('looks up the bus model', async () => {
		const trip = await service.addTrip(350);
		expect(trip.busModel).not.toBeNull();
		expect(trip.busModel!.manufacturer).toBe('New Flyer');
	});

	it('sets busModel to null for unknown bus numbers', async () => {
		const trip = await service.addTrip(9999);
		expect(trip.busModel).toBeNull();
	});

	it('stores mtsLine when provided', async () => {
		const trip = await service.addTrip(350, '215');
		expect(trip.mtsLine).toBe('215');
	});

	it('omits mtsLine when not provided', async () => {
		const trip = await service.addTrip(350);
		expect(trip.mtsLine).toBeUndefined();
	});

	it('stores location when provided', async () => {
		const trip = await service.addTrip(350, undefined, undefined, {
			latitude: 32.7,
			longitude: -117.1
		});
		expect(trip.location).toEqual({ latitude: 32.7, longitude: -117.1 });
	});

	it('persists to localStorage', async () => {
		await service.addTrip(350);
		const trips = await service.getTrips();
		expect(trips).toHaveLength(1);
		expect(trips[0].busNumber).toBe(350);
	});

	it('prepends new trips (newest first)', async () => {
		await service.addTrip(350);
		await service.addTrip(210);
		const trips = await service.getTrips();
		expect(trips[0].busNumber).toBe(210);
		expect(trips[1].busNumber).toBe(350);
	});
});

describe('updateTrip', () => {
	it('updates bus number and re-looks up model', async () => {
		const trip = await service.addTrip(350);
		const updated = await service.updateTrip(trip.id, { busNumber: 210 });
		expect(updated.busNumber).toBe(210);
		expect(updated.busModel!.manufacturer).toBe('Gillig');
	});

	it('updates mtsLine', async () => {
		const trip = await service.addTrip(350, '215');
		const updated = await service.updateTrip(trip.id, { mtsLine: '7' });
		expect(updated.mtsLine).toBe('7');
	});

	it('clears mtsLine when set to empty string', async () => {
		const trip = await service.addTrip(350, '215');
		const updated = await service.updateTrip(trip.id, { mtsLine: '' });
		expect(updated.mtsLine).toBeUndefined();
	});

	it('updates trip type', async () => {
		const trip = await service.addTrip(350);
		expect(trip.type).toBe('seen');
		const updated = await service.updateTrip(trip.id, { type: 'boarded' });
		expect(updated.type).toBe('boarded');
	});

	it('persists updates to localStorage', async () => {
		const trip = await service.addTrip(350);
		await service.updateTrip(trip.id, { busNumber: 210 });
		const trips = await service.getTrips();
		expect(trips[0].busNumber).toBe(210);
	});

	it('throws for unknown trip id', async () => {
		await expect(service.updateTrip('nonexistent', { busNumber: 210 })).rejects.toThrow(
			'Trip not found'
		);
	});

	it('preserves fields not included in updates', async () => {
		const trip = await service.addTrip(350, '215', 'boarded', {
			latitude: 32.7,
			longitude: -117.1
		});
		const updated = await service.updateTrip(trip.id, { type: 'seen' });
		expect(updated.busNumber).toBe(350);
		expect(updated.mtsLine).toBe('215');
		expect(updated.location).toEqual({ latitude: 32.7, longitude: -117.1 });
		expect(updated.type).toBe('seen');
	});
});

describe('deleteTrip', () => {
	it('removes the trip', async () => {
		const trip = await service.addTrip(350);
		await service.deleteTrip(trip.id);
		expect(await service.getTrips()).toEqual([]);
	});

	it('only removes the specified trip', async () => {
		const t1 = await service.addTrip(350);
		await service.addTrip(210);
		await service.deleteTrip(t1.id);
		const trips = await service.getTrips();
		expect(trips).toHaveLength(1);
		expect(trips[0].busNumber).toBe(210);
	});
});

describe('clearAllTrips', () => {
	it('removes all trips', async () => {
		await service.addTrip(350);
		await service.addTrip(210);
		await service.clearAllTrips();
		expect(await service.getTrips()).toEqual([]);
	});
});
