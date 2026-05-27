import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState, useRef } from 'react';
import { useLocationWatcher } from '@/hooks/use-current-location';
import { API_BASE_URL } from '@/config/api';

/**
 * Estado de la aplicación para manejar el estado de inicialización global.
 * Permite controlar cuándo la aplicación está lista para mostrar contenido.
 */
export type AppState = {
  isReady: boolean;
  setReady: (value: boolean) => void;
  activeOrderIdForTracking: number | null;
  setActiveOrderIdForTracking: (id: number | null) => void;
};

/**
 * Contexto React para el estado global de la aplicación.
 * Proporciona acceso al estado de inicialización de toda la aplicación.
 */
const AppStateContext = createContext<AppState | null>(null);

/**
 * Proveedor de estado de la aplicación.
 * Envuelve la aplicación con el contexto de estado global.
 */
export function AppStateProvider({ children }: PropsWithChildren) {
  const [isReady, setReady] = useState(false);
  const [activeOrderIdForTracking, setActiveOrderIdForTracking] = useState<number | null>(null);

  const value = useMemo<AppState>(() => ({
    isReady,
    setReady,
    activeOrderIdForTracking,
    setActiveOrderIdForTracking
  }), [isReady, activeOrderIdForTracking]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al estado de la aplicación.
 */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState debe usarse dentro de AppStateProvider');
  }
  return ctx;
}

/**
 * Hook global para reportar ubicación del repartidor.
 * Funciona en cualquier pantalla mientras el repartidor esta conectado.
 */
function useGlobalDriverLocationReporter() {
  const { activeOrderIdForTracking } = useAppState();
  const lastReportedRef = useRef<number>(0);

  const handleLocationUpdate = async (location: { latitude: number; longitude: number }) => {
    // Throttle to 30 seconds
    const now = Date.now();
    if (now - lastReportedRef.current < 30000) return;
    lastReportedRef.current = now;

    try {
      const payload: Record<string, unknown> = {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: 10,
      };

      if (activeOrderIdForTracking !== null) {
        payload.orderId = activeOrderIdForTracking;
      }

      await fetch(`${API_BASE_URL}/tracking/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('[GlobalDriverReporter] Error:', error);
    }
  };

  useLocationWatcher(handleLocationUpdate, 30000);
}

/**
 * Componente interno que inicia el reporter global.
 * Se usa dentro del AppStateProvider.
 */
export function GlobalDriverLocationReporter({ children }: PropsWithChildren) {
  useGlobalDriverLocationReporter();
  return <>{children}</>;
}

