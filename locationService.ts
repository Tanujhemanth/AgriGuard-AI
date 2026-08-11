import { LocationData } from '@/types';

// In-memory cache for reverse geocoding results
const geocodeCache = new Map<string, { village: string; district: string; state: string; country: string; displayName: string }>();

export async function reverseGeocodeLocation(lat: number, lon: number): Promise<{
  village: string;
  district: string;
  state: string;
  country: string;
  displayName: string;
}> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AgriGuard-AI-Agronomic-Platform/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`Reverse geocode returned status ${res.status}`);
    }

    const data = await res.json();
    const address = data.address || {};

    const village = address.village || address.suburb || address.neighbourhood || address.hamlet || address.town || address.city || 'Field Sector';
    const district = address.county || address.state_district || address.city_district || address.city || 'Agricultural Region';
    const state = address.state || 'Territory';
    const country = address.country || 'Global';

    const displayName = `${village}, ${district}, ${state}, ${country}`;

    const result = { village, district, state, country, displayName };
    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocoding warning, fallback display constructed:', err);
    return {
      village: 'Field Location',
      district: `${lat.toFixed(2)}°N`,
      state: `${lon.toFixed(2)}°E`,
      country: 'Agriculture Zone',
      displayName: `Coordinates: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
    };
  }
}

export function getCurrentBrowserGeolocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this environment.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 15);

        const geoDetails = await reverseGeocodeLocation(latitude, longitude);

        resolve({
          latitude,
          longitude,
          accuracy,
          village: geoDetails.village,
          district: geoDetails.district,
          state: geoDetails.state,
          country: geoDetails.country,
          displayName: geoDetails.displayName,
          isGpsLocked: true,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
