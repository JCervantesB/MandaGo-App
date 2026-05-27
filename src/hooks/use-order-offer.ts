import { useEffect, useCallback, useState } from 'react';
import { socketClient } from '@/services/socket-client';

export interface OrderOfferData {
  orderId: number;
  distanceKm: number;
  expiresAt: string;
}

interface UseOrderOfferReturn {
  lastOffer: OrderOfferData | null;
  clearOffer: () => void;
}

// Hook para recibir ofertas de órdenes via socket (tiempo real)
export function useOrderOffer(
  driverId: string,
  onOfferReceived?: (offer: OrderOfferData) => void
): UseOrderOfferReturn {
  const [lastOffer, setLastOffer] = useState<OrderOfferData | null>(null);

  // Función para manejar la recepción de ofertas de órdenes
  // Utiliza la API para actualizar la oferta y llamar a la función de callback
  useEffect(() => {
    const socket = socketClient.connect();
    if (!socket) return;

    socketClient.subscribeToDriver(driverId);
    socketClient.joinDriversRoom();

    const handleOffer = (data: unknown) => {
      const offer = data as OrderOfferData;
      console.log('[useOrderOffer] Received order:offer:', JSON.stringify(offer));
      setLastOffer(offer);
      onOfferReceived?.(offer);
    };

    const handleOfferExpired = (data: unknown) => {
      console.log('[useOrderOffer] order:offer_expired:', JSON.stringify(data));
      setLastOffer(null);
    };

    const handleAvailable = (data: unknown) => {
      console.log('[useOrderOffer] order:available:', JSON.stringify(data));
    };

    const handleUnassigned = (data: unknown) => {
      console.log('[useOrderOffer] order:unassigned:', JSON.stringify(data));
    };

    const unsubOffer = socketClient.on('order:offer', handleOffer);
    const unsubExpired = socketClient.on('order:offer_expired', handleOfferExpired);
    const unsubAvailable = socketClient.on('order:available', handleAvailable);
    const unsubUnassigned = socketClient.on('order:unassigned', handleUnassigned);

    return () => {
      unsubOffer();
      unsubExpired();
      unsubAvailable();
      unsubUnassigned();
    };
  }, [driverId, onOfferReceived]);

  const clearOffer = useCallback(() => {
    setLastOffer(null);
  }, []);

  return { lastOffer, clearOffer };
}