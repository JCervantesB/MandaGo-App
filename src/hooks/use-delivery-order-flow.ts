import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { useAppState } from '@/state/app-state';
import { socketClient } from '@/services/socket-client';
import type { DeliveryOrder } from '@/types/delivery-order';

interface UseActiveOrderReturn {
  activeOrder: DeliveryOrder | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  updateStatus: (status: string) => Promise<boolean>;
  claimOrder: () => Promise<boolean>;
}

// Hook para manejar la orden activa del repartidor (flujo completo de entrega)
export function useActiveOrder(): UseActiveOrderReturn {
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveOrderIdForTracking } = useAppState();

  const isInDeliveryPhase = (order: DeliveryOrder) =>
    ['asignado', 'aceptado', 'en_recorrido', 'recogido', 'en_entrega'].includes(order.status);

  // Función para obtener la orden activa del repartidor
  // Utiliza la API para obtener la orden activa
  // Maneja errores y carga inicial
  const fetchActiveOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/active`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al cargar ordenes: ${response.status} - ${text}`);
      }
      const orders = await response.json() as DeliveryOrder[];
      setActiveOrder(orders.length > 0 ? orders[0] : null);
    } catch (err) {
      console.error('Error fetching active order:', err);
      setActiveOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrder();
  }, [fetchActiveOrder]);

  // Función para escuchar cambios de estado de la orden activa
  // Utiliza la API de Socket.io para escuchar cambios de estado
  // Maneja errores y carga inicial
  useEffect(() => {
    const socket = socketClient.connect();
    if (!socket) return;

    socketClient.joinDriversRoom();

    const handleUnassigned = (data: unknown) => {
      console.log('[useActiveOrder] order:unassigned received:', JSON.stringify(data));
      fetchActiveOrder();
    };

    const unsub = socketClient.on('order:unassigned', handleUnassigned);

    return () => {
      unsub();
    };
  }, [fetchActiveOrder]);

  // Update global tracking state when active order changes
  useEffect(() => {
    if (activeOrder && isInDeliveryPhase(activeOrder)) {
      console.log('[useActiveOrder] Setting activeOrderIdForTracking:', activeOrder.id, 'status:', activeOrder.status);
      setActiveOrderIdForTracking(activeOrder.id);
    } else {
      setActiveOrderIdForTracking(null);
    }
  }, [activeOrder, setActiveOrderIdForTracking]);

  // Función para aceptar el pedido
  // Utiliza la API para aceptar el pedido
  // Maneja errores y carga inicial
  const claimOrder = useCallback(async (): Promise<boolean> => {
    if (!activeOrder) return false;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${activeOrder.id}/claim`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'No se pudo aceptar el pedido');
      }
      console.log('[claimOrder] API success, calling fetchActiveOrder');
      await fetchActiveOrder();
      console.log('[claimOrder] fetchActiveOrder completed');
      return true;
    } catch (err) {
      console.error('[claimOrder] Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeOrder, fetchActiveOrder]);

  // Función para actualizar el estado de la orden
  // Utiliza la API para actualizar el estado de la orden
  // Maneja errores y carga inicial
  const updateStatus = useCallback(async (status: string): Promise<boolean> => {
    if (!activeOrder) return false;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('No se pudo actualizar el estado');
      await fetchActiveOrder();
      return true;
    } catch (err) {
      console.error('Error actualizando estado de la orden:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeOrder, fetchActiveOrder]);

  return {
    activeOrder,
    isLoading,
    refetch: fetchActiveOrder,
    updateStatus,
    claimOrder,
  };
}

interface UseAvailableOrdersSimpleReturn {
  orders: DeliveryOrder[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

// Hook simple para obtener órdenes disponibles para el repartidor
export function useAvailableOrdersSimple(): UseAvailableOrdersSimpleReturn {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/available`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar ordenes');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al obtener ordenes disponibles:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
}

interface UseDeliveredOrdersReturn {
  orders: DeliveryOrder[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

// Hook para obtener órdenes entregadas por el repartidor
export function useDeliveredOrders(): UseDeliveredOrdersReturn {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/delivered`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar ordenes');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al obtener ordenes entregadas:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, refetch: fetchOrders };
}