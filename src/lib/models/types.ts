export type FuelType = 'CNG' | 'Electric' | 'Diesel' | 'LPG' | 'Gasoline';

export interface BusModel {
	manufacturer: string;
	model: string;
	lengthFt: number;
	fuelType: FuelType;
	yearIntroduced: number;
	division?: string;
	description?: string;
}

export interface Trip {
	id: string;
	busNumber: number;
	timestamp: string;
	busModel: BusModel | null;
	mtsLine?: string;
}

export interface FleetEntry {
	rangeStart: number;
	rangeEnd: number;
	model: BusModel;
}

export interface TripService {
	getTrips(): Promise<Trip[]>;
	addTrip(busNumber: number, mtsLine?: string): Promise<Trip>;
	deleteTrip(id: string): Promise<void>;
	clearAllTrips(): Promise<void>;
}
