import { useEffect, useState, useCallback, useRef } from 'react';
import { socketClient } from '@/services/socket-client';

export interface DriverLocation {
  driverId: string;
  orderId: number;
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: string;
}

export interface OrderStateChange {
  orderId: number;
  from: string;
  to: string;
  userId: string;
  timestamp: string;
}

interface UseTrackingSocketOptions {
  orderId: number | null;
  onLocationUpdate?: (location: DriverLocation) => void;
  onStateChange?: (change: OrderStateChange) => void;
  enabled?: boolean;
}

interface UseTrackingSocketReturn {
  driverLocation: DriverLocation | null;
  lastStateChange: OrderStateChange | null;
  isConnected: boolean;
}

// Hook para tracking en tiempo real de ubicación del repartidor y cambios de estado
export function useTrackingSocket({
  orderId,
  onLocationUpdate,
  onStateChange,
  enabled = true,
}: UseTrackingSocketOptions): UseTrackingSocketReturn {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [lastStateChange, setLastStateChange] = useState<OrderStateChange | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const previousOrderId = useRef<number | null>(null);

  // Función para manejar la conexión y la desconexion del socket
  // Utiliza la API de Socket.io para conectar y desconectar
  useEffect(() => {
    if (!enabled || orderId === null) {
      if (previousOrderId.current !== null) {
        socketClient.unsubscribeFromOrder(previousOrderId.current);
        previousOrderId.current = null;
      }
      setDriverLocation(null);
      setLastStateChange(null);
      return;
    }

    const socket = socketClient.connect();
    if (!socket) return;

    const handleConnect = () => {
      console.log('[use-tracking-socket] Socket connected, subscribing to order:', orderId);
      setIsConnected(true);
      socketClient.subscribeToOrder(orderId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Función para manejar la recepción de actualizaciones de ubicación
    // Utiliza la API de Socket.io para actualizar la ubicación
    // Llama a la función de callback si se proporciona
    const handleLocationUpdate = (data: unknown) => {
      console.log('[use-tracking-socket] location_update received:', JSON.stringify(data));
      const location = data as DriverLocation;
      if (location.orderId === orderId) {
        console.log('[use-tracking-socket] Order match, updating location');
        setDriverLocation(location);
        onLocationUpdate?.(location);
      } else {
        console.log('[use-tracking-socket] Order mismatch:', location.orderId, 'vs', orderId);
      }
    };

    // Función para manejar la recepción de cambios de estado
    // Utiliza la API de Socket.io para actualizar el último cambio de estado
    // Llama a la función de callback si se proporciona
    const handleStateChange = (data: unknown) => {
      const change = data as OrderStateChange;
      if (change.orderId === orderId) {
        setLastStateChange(change);
        onStateChange?.(change);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('location_update', handleLocationUpdate);
    socket.on('state_change', handleStateChange);

    if (socket.connected) {
      setIsConnected(true);
      socketClient.subscribeToOrder(orderId);
    }

    previousOrderId.current = orderId;

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('location_update', handleLocationUpdate);
      socket.off('state_change', handleStateChange);

      if (previousOrderId.current !== null) {
        socketClient.unsubscribeFromOrder(previousOrderId.current);
        previousOrderId.current = null;
      }
    };
  }, [enabled, orderId, onLocationUpdate, onStateChange]);

  return {
    driverLocation,
    lastStateChange,
    isConnected,
  };
}