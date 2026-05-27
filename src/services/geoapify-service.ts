import {
  AutocompleteResponse,
  ReverseGeocodeResponse,
  RoutingResponse,
  Coordinates,
} from '@/types/shipment-types';

const API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const BASE_URL = 'https://api.geoapify.com/v1';

interface RequestOptions {
  signal?: AbortSignal;
}

export async function searchAddress(
  query: string,
  options?: RequestOptions
): Promise<AutocompleteResponse> {
  if (!query || query.length < 3) {
    return { results: [] };
  }

  const params = new URLSearchParams({
    text: query,
    filter: 'countrycode:mx',
    format: 'json',
    apiKey: API_KEY || '',
  });

  const response = await fetch(
    `${BASE_URL}/geocode/autocomplete?${params}`,
    { signal: options?.signal }
  );

  if (!response.ok) {
    throw new Error(`Autocomplete error: ${response.status}`);
  }

  return response.json();
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  options?: RequestOptions
): Promise<ReverseGeocodeResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
    apiKey: API_KEY || '',
  });

  const response = await fetch(
    `${BASE_URL}/geocode/reverse?${params}`,
    { signal: options?.signal }
  );

  if (!response.ok) {
    throw new Error(`Reverse geocode error: ${response.status}`);
  }

  return response.json();
}

export async function getRoute(
  waypoints: Coordinates[],
  options?: RequestOptions
): Promise<RoutingResponse> {
  if (waypoints.length < 2) {
    throw new Error('Se requieren al menos 2 puntos para calcular ruta');
  }

  const wpString = waypoints
    .map(wp => `${wp.lat},${wp.lon}`)
    .join('|');

  const params = new URLSearchParams({
    waypoints: wpString,
    mode: 'drive',
    apiKey: API_KEY || '',
  });

  const response = await fetch(
    `${BASE_URL}/routing?${params}`,
    { signal: options?.signal }
  );

  if (!response.ok) {
    throw new Error(`Routing error: ${response.status}`);
  }

  return response.json();
}