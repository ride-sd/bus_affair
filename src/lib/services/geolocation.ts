import type { GeoLocation } from '$lib/models/types';

export function getCurrentLocation(): Promise<GeoLocation | null> {
	if (!navigator.geolocation) {
		return Promise.resolve(null);
	}

	return new Promise((resolve) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				});
			},
			() => {
				resolve(null);
			},
			{ timeout: 5000, enableHighAccuracy: false }
		);
	});
}
