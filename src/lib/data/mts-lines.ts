export interface MtsLine {
	route: string;
	name: string;
}

export let mtsLines: MtsLine[] = [];

export function setMtsLines(data: MtsLine[]): void {
	mtsLines = data;
}
