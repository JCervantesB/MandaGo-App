import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { DeliveryOrder, OrderPriority } from '@/types/delivery-order';

interface UseAvailableOrdersReturn {
  orders: DeliveryOrder[];
  isLoading: boolean;
  fetchOrders: () => void;
}

// Hook para obtener órdenes disponibles para el repartidor
export function useAvailableOrders(): UseAvailableOrdersReturn {
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
      setOrders(data ?? []);
    } catch (err) {
      console.error('Error fetching available orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, fetchOrders };
}

interface UseActiveOrdersReturn {
  orders: DeliveryOrder[];
  isLoading: boolean;
  fetchOrders: () => void;
}

// Hook para obtener órdenes asignadas al repartidor
export function useActiveOrders(): UseActiveOrdersReturn {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/assigned`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar ordenes');
      const data = await response.json();
      setOrders(data ?? []);
    } catch (err) {
      console.error('Error fetching active orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, fetchOrders };
}

interface ClaimOrderReturn {
  claimOrder: (orderId: number) => Promise<boolean>;
  isClaiming: boolean;
}

// Hook para reclamar una orden disponible
export function useClaimOrder(onSuccess?: () => void): ClaimOrderReturn {
  const [isClaiming, setIsClaiming] = useState(false);

  const claimOrder = useCallback(async (orderId: number): Promise<boolean> => {
    setIsClaiming(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${orderId}/claim`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'No se pudo aceptar el pedido');
      }
      onSuccess?.();
      return true;
    } catch (err) {
      console.error('Error claiming order:', err);
      return false;
    } finally {
      setIsClaiming(false);
    }
  }, [onSuccess]);

  return { claimOrder, isClaiming };
}

interface UpdateOrderStatusReturn {
  updateStatus: (orderId: number, status: string) => Promise<boolean>;
  isUpdating: boolean;
}

// Hook para actualizar el estado de una orden
export function useUpdateOrderStatus(onSuccess?: () => void): UpdateOrderStatusReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(async (orderId: number, status: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'No se pudo actualizar el estado');
      }
      onSuccess?.();
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [onSuccess]);

  return { updateStatus, isUpdating };
}

export function getNextAction(status: DeliveryOrder['status']): string | null {
  const nextActions: Partial<Record<typeof status, string>> = {
    asignado: 'Aceptar',
    aceptado: 'Iniciar recorrido',
    en_recorrido: 'Marcar recogido',
    recogido: 'Iniciar entrega',
    en_entrega: 'Confirmar entrega',
  };
  return nextActions[status] ?? null;
}

export function getPriorityConfig(priority: OrderPriority) {
  const config = {
    normal: { label: 'Normal', color: '#2563EB', bgColor: '#DBEAFE' },
    express: { label: 'Express', color: '#D97706', bgColor: '#FEF3C7' },
    urgente: { label: 'Urgente', color: '#DC2626', bgColor: '#FEE2E2' },
  };
  return config[priority] ?? config.normal;
}