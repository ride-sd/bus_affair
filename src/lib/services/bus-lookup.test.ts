import { describe, it, expect } from 'vitest';
import { generateModelId, lookupBusModel, lookupFleetEntry } from './bus-lookup';
import type { BusModel } from '$lib/models/types';

describe('generateModelId', () => {
	it('produces a slug from model fields', () => {
		const model: BusModel = {
			manufacturer: 'Gillig',
			model: 'Low Floor CNG 40\'',
			lengthFt: 40,
			fuelType: 'CNG',
			yearIntroduced: 2015
		};
		expect(generateModelId(model)).toBe('2015-gillig-low-floor-cng-40');
	});

	it('strips special characters and collapses dashes', () => {
		const model: BusModel = {
			manufacturer: 'Ford/ElDorado',
			model: 'F-550/Aero Elite',
			lengthFt: 25,
			fuelType: 'Gasoline',
			yearIntroduced: 2014
		};
		expect(generateModelId(model)).toBe('2014-ford-eldorado-f-550-aero-elite');
	});

	it('handles model names with no special characters', () => {
		const model: BusModel = {
			manufacturer: 'New Flyer',
			model: 'XN40',
			lengthFt: 40,
			fuelType: 'CNG',
			yearIntroduced: 2025
		};
		expect(generateModelId(model)).toBe('2025-new-flyer-xn40');
	});
});

describe('lookupBusModel', () => {
	it('returns a model for a valid bus number', () => {
		const result = lookupBusModel(210);
		expect(result).not.toBeNull();
		expect(result!.manufacturer).toBe('Gillig');
		expect(result!.id).toBe('2015-gillig-low-floor-cng-40');
	});

	it('returns null for an out-of-range bus number', () => {
		expect(lookupBusModel(9999)).toBeNull();
	});

	it('returns null for bus number 0', () => {
		expect(lookupBusModel(0)).toBeNull();
	});

	it('matches the start of a range', () => {
		const result = lookupBusModel(201);
		expect(result).not.toBeNull();
		expect(result!.manufacturer).toBe('Gillig');
		expect(result!.yearIntroduced).toBe(2015);
	});

	it('matches the end of a range', () => {
		const result = lookupBusModel(223);
		expect(result).not.toBeNull();
		expect(result!.manufacturer).toBe('Gillig');
		expect(result!.yearIntroduced).toBe(2015);
	});

	it('returns null just outside a range', () => {
		expect(lookupBusModel(200)).toBeNull();
		expect(lookupBusModel(224)).toBeNull();
	});

	it('looks up a New Flyer articulated bus', () => {
		const result = lookupBusModel(1810);
		expect(result).not.toBeNull();
		expect(result!.manufacturer).toBe('New Flyer');
		expect(result!.model).toBe('XN60');
		expect(result!.lengthFt).toBe(60);
	});

	it('looks up an electric bus', () => {
		const result = lookupBusModel(1503);
		expect(result).not.toBeNull();
		expect(result!.fuelType).toBe('Electric');
		expect(result!.model).toBe('XE40');
	});
});

describe('lookupFleetEntry', () => {
	it('returns full entry with range info for a valid bus', () => {
		const entry = lookupFleetEntry(350);
		expect(entry).not.toBeNull();
		expect(entry!.rangeStart).toBe(301);
		expect(entry!.rangeEnd).toBe(390);
		expect(entry!.model.manufacturer).toBe('New Flyer');
	});

	it('returns null for an unknown bus number', () => {
		expect(lookupFleetEntry(100)).toBeNull();
	});

	it('returns entry for a cutaway shuttle', () => {
		const entry = lookupFleetEntry(3105);
		expect(entry).not.toBeNull();
		expect(entry!.model.manufacturer).toBe('Ford/ElDorado');
		expect(entry!.model.fuelType).toBe('LPG');
	});
});
