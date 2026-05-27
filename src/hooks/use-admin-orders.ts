import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';

export interface AdminOrder {
  id: number;
  publicId: string;
  userId: string;
  status: string;
  priority: string;
  packageDescription: string;
  packageSize: string;
  packageWeight: string;
  destName: string;
  destPhone: string;
  destAddress: string;
  serviceFee: number;
  createdAt: string;
}

interface PaginationState {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
}

interface UseAdminOrdersReturn {
  orders: AdminOrder[];
  isLoading: boolean;
  pagination: PaginationState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  fetchPage: (page: number) => void;
}

// Hook para obtener órdenes del admin con paginación y filtros por estado
export function useAdminOrders(): UseAdminOrdersReturn {
  const [activeTab, setActiveTab] = useState('todos');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 0,
  });

  const ACTIVE_STATUSES = ['creado', 'asignado', 'aceptado', 'en_recorrido', 'recogido', 'en_entrega'];
  const COMPLETED_STATUSES = ['entregado'];
  const CANCELLED_STATUSES = ['cancelado'];

  // Obtener filtro de estado en base a la pestaña activa
  const getStatusFilter = (tab: string): string | undefined => {
    switch (tab) {
      case 'activo': return ACTIVE_STATUSES.join(',');
      case 'completado': return COMPLETED_STATUSES.join(',');
      case 'cancelado': return CANCELLED_STATUSES.join(',');
      default: return undefined;
    }
  };

  // Obtener órdenes del admin con paginación y filtro de estado
  const fetchOrders = useCallback(async (page: number, statusFilter?: string) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/admin/orders?page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar ordenes');

      const data = await response.json();
      setOrders(data.data ?? []);
      setPagination({
        currentPage: data.page,
        totalItems: data.total,
        itemsPerPage: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1, getStatusFilter(activeTab));
  }, [activeTab, fetchOrders]);

  const fetchPage = useCallback((page: number) => {
    fetchOrders(page, getStatusFilter(activeTab));
  }, [activeTab, fetchOrders]);

  return {
    orders,
    isLoading,
    pagination,
    activeTab,
    setActiveTab,
    fetchPage,
  };
}