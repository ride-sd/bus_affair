import type { FleetEntry } from '$lib/models/types';

export const fleet: FleetEntry[] = [
	{
		rangeStart: 301,
		rangeEnd: 390,
		model: {
			manufacturer: 'New Flyer',
			model: 'XN40',
			lengthFt: 40,
			fuelType: 'CNG',
			yearIntroduced: 2016
		}
	},
	{
		rangeStart: 391,
		rangeEnd: 450,
		model: {
			manufacturer: 'New Flyer',
			model: 'XN60',
			lengthFt: 60,
			fuelType: 'CNG',
			yearIntroduced: 2016
		}
	},
	{
		rangeStart: 501,
		rangeEnd: 550,
		model: {
			manufacturer: 'Gillig',
			model: 'Low Floor',
			lengthFt: 40,
			fuelType: 'Diesel',
			yearIntroduced: 2012
		}
	},
	{
		rangeStart: 1001,
		rangeEnd: 1099,
		model: {
			manufacturer: 'New Flyer',
			model: 'XE40',
			lengthFt: 40,
			fuelType: 'Electric',
			yearIntroduced: 2020
		}
	}
];
