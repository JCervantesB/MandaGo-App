import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaceOption, Coordinates } from '@/types/shipment-types';
import { searchAddress, reverseGeocode, getRoute } from '@/services/geoapify-service';
import { transformAutocompleteResult, transformReverseResult, transformRoutingFeature } from '@/services/shipment-transformers';

// Hook para búsqueda de direcciones con debounce y autocompletado
export function useAddressSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceOption | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchAddress(query, {
          signal: abortControllerRef.current.signal,
        });
        const places = response.results.map(transformAutocompleteResult);
        setResults(places);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs]);

  const selectPlace = useCallback((place: PlaceOption) => {
    setSelectedPlace(place);
    setResults([]);
    setQuery(place.formatted);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setSelectedPlace(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    selectedPlace,
    selectPlace,
    clearResults,
  };
}

// Hook para obtener dirección a partir de coordenadas (geocodificación inversa)
export function useReverseGeocode() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseSearch = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await reverseGeocode(lat, lon);
      if (response.results.length > 0) {
        return transformReverseResult(response.results[0]);
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { reverseSearch, isLoading, error };
}

// Hook para calcular ruta entre dos lugares
export function useRouting() {
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; geometry: Coordinates[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateRoute = useCallback(async (origin: PlaceOption, destination: PlaceOption) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRoute(
        [
          { lat: origin.lat, lon: origin.lon },
          { lat: destination.lat, lon: destination.lon },
        ],
        { signal: abortControllerRef.current.signal }
      );

      if (response.features.length > 0) {
        const route = transformRoutingFeature(response.features[0]);
        setRouteInfo(route);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setRouteInfo(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { calculateRoute, routeInfo, isLoading, error };
}