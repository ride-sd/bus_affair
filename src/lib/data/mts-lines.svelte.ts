export interface MtsLine {
	route: string;
	name: string;
}

export let mtsLines: MtsLine[] = $state([]);

export function setMtsLines(data: MtsLine[]): void {
	mtsLines.splice(0, mtsLines.length, ...data);
}
