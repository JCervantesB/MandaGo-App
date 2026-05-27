import {
  PlaceOption,
  GeoapifyAutocompleteResult,
  GeoapifyReverseResult,
  RouteInfo,
  RoutingFeature,
} from '@/types/shipment-types';

export function transformAutocompleteResult(
  result: GeoapifyAutocompleteResult,
  index: number
): PlaceOption {
  return {
    id: `${result.lat}-${result.lon}-${index}`,
    formatted: result.formatted,
    lat: result.lat,
    lon: result.lon,
    type: mapGeoapifyType(result.type),
    city: result.city,
    street: result.address_line1,
    houseNumber: result.address_line2,
    postcode: result.postcode,
    country: result.country,
    state: result.state,
  };
}

export function transformReverseResult(result: GeoapifyReverseResult): PlaceOption {
  return {
    id: `${result.lat}-${result.lon}-${Date.now()}`,
    formatted: result.formatted,
    lat: result.lat,
    lon: result.lon,
    type: 'house',
    city: result.city,
    street: result.address_line1,
    houseNumber: result.address_line2,
    postcode: result.postcode,
    country: result.country,
    state: result.state,
  };
}

export function transformRoutingFeature(feature: RoutingFeature): RouteInfo {
  const rawCoords = feature.geometry.coordinates as unknown;

  let coordsArray: [number, number][];

  if (Array.isArray(rawCoords) && rawCoords.length > 0) {
    const firstItem = (rawCoords as unknown[])[0];
    if (typeof firstItem === 'number') {
      coordsArray = rawCoords as [number, number][];
    } else {
      coordsArray = ((rawCoords as [number, number][][])[0]);
    }
  } else {
    coordsArray = [];
  }

  const coordinates = coordsArray.map(
    (coord: [number, number]) => ({
      lat: Number(coord[1]),
      lon: Number(coord[0]),
    })
  );

  return {
    distance: feature.properties.distance,
    duration: feature.properties.duration,
    geometry: coordinates,
  };
}

function mapGeoapifyType(type: string): PlaceOption['type'] {
  const typeMap: Record<string, PlaceOption['type']> = {
    'poi': 'poi',
    'street': 'street',
    'house': 'house',
    'city': 'city',
    'state': 'state',
    'country': 'country',
  };
  return typeMap[type] || 'street';
}