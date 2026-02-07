import type { GeoLocation } from '$lib/models/types';

let permissionState: PermissionState = 'prompt';

export async function requestLocationPermission(): Promise<void> {
	if (!navigator.geolocation) {
		permissionState = 'denied';
		return;
	}

	if (navigator.permissions) {
		const status = await navigator.permissions.query({ name: 'geolocation' });
		permissionState = status.state;
		status.addEventListener('change', () => {
			permissionState = status.state;
		});
	}

	if (permissionState === 'prompt') {
		const result = await getCurrentLocation();
		permissionState = result ? 'granted' : 'denied';
	}
}

export function getCurrentLocation(): Promise<GeoLocation | null> {
	if (!navigator.geolocation || permissionState === 'denied') {
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
