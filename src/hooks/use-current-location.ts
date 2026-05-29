import { useState, useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

// Hook para obtener la ubicación actual del usuario
export function useCurrentLocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener la ubicación actual del usuario
  // Utiliza la API de Expo para obtener la ubicación actual
  // Maneja errores y carga inicial
  const getCurrentLocation = useCallback(async (): Promise<{ latitude: number; longitude: number } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (err: any) {
      setError(err.message || 'Error al obtener ubicación');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getCurrentLocation, isLoading, error };
}

// Hook para escuchar cambios de ubicación en tiempo real
export function useLocationWatcher(
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void,
  intervalMs: number = 10000
) {
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const callbackRef = useRef(onLocationUpdate);
  callbackRef.current = onLocationUpdate;

  // Función para escuchar cambios de ubicación en tiempo real
  // Utiliza la API de Expo para escuchar cambios de ubicación
  // Maneja errores y carga inicial
  useEffect(() => {
    let isMounted = true;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: intervalMs,
          distanceInterval: 10,
        },
        (location) => {
          if (!isMounted) return;
          callbackRef.current({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    };

    startWatching();

    return () => {
      isMounted = false;
      watchRef.current?.remove();
    };
  }, [intervalMs]);
}