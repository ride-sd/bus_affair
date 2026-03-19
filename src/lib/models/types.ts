export type FuelType = 'CNG' | 'Electric' | 'Diesel' | 'LPG' | 'Gasoline';

export type EncounterType = 'seen' | 'boarded';
export type SyncStatus = 'synced' | 'pending' | 'failed';

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

export interface Encounter {
	id: string;
	busNumber: number;
	timestamp: string;
	busModel: BusModel | null;
	route?: string;
	agency: string;
	type?: EncounterType;
	location?: GeoLocation;
	syncStatus?: SyncStatus;
}

export interface FleetEntry {
	agency: string;
	rangeStart: number;
	rangeEnd: number;
	model: BusModel;
}

export interface EncounterService {
	getEncounters(): Promise<Encounter[]>;
	addEncounter(busNumber: number, route?: string, type?: EncounterType, location?: GeoLocation, timestamp?: string): Promise<Encounter>;
	updateEncounter(id: string, updates: { busNumber?: number; route?: string; type?: EncounterType }): Promise<Encounter>;
	deleteEncounter(id: string): Promise<void>;
	clearAllEncounters(): Promise<void>;
}
