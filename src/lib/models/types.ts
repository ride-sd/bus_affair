export type FuelType = 'CNG' | 'Electric' | 'Diesel' | 'LPG' | 'Gasoline';

export type TripType = 'seen' | 'boarded';

export interface BusModel {
	id?: string;
	manufacturer: string;
	model: string;
	lengthFt: number;
	fuelType: FuelType;
	yearIntroduced: number;
	division?: string;
	description?: string;
}

export interface GeoLocation {
	latitude: number;
	longitude: number;
}

export interface Trip {
	id: string;
	busNumber: number;
	timestamp: string;
	busModel: BusModel | null;
	mtsLine?: string;
	type?: TripType;
	location?: GeoLocation;
}

export interface FleetEntry {
	rangeStart: number;
	rangeEnd: number;
	model: BusModel;
}

export interface TripService {
	getTrips(): Promise<Trip[]>;
	addTrip(busNumber: number, mtsLine?: string, type?: TripType, location?: GeoLocation): Promise<Trip>;
	updateTrip(id: string, updates: { busNumber?: number; mtsLine?: string; type?: TripType }): Promise<Trip>;
	deleteTrip(id: string): Promise<void>;
	clearAllTrips(): Promise<void>;
}
