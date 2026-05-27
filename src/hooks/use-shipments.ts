import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { CustomerShipment } from '@/types/shipment-types';

type StatusTab = 'todos' | 'activo' | 'completado' | 'cancelado';

const ACTIVE_STATUSES = ['creado', 'asignado', 'aceptado', 'en_recorrido', 'recogido', 'en_entrega'];
const COMPLETED_STATUSES = ['entregado'];
const CANCELLED_STATUSES = ['cancelado'];

function getStatusFilter(tab: StatusTab): string | undefined {
  switch (tab) {
    case 'activo': return ACTIVE_STATUSES.join(',');
    case 'completado': return COMPLETED_STATUSES.join(',');
    case 'cancelado': return CANCELLED_STATUSES.join(',');
    default: return undefined;
  }
}

interface PaginationState {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
}

interface UseShipmentsReturn {
  shipments: CustomerShipment[];
  isLoading: boolean;
  pagination: PaginationState;
  activeTab: StatusTab;
  setActiveTab: (tab: StatusTab) => void;
  fetchPage: (page: number) => void;
}

// Hook para obtener envíos del cliente con paginación y filtros por estado
export function useShipments(): UseShipmentsReturn {
  const [activeTab, setActiveTab] = useState<StatusTab>('todos');
  const [shipments, setShipments] = useState<CustomerShipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 0,
  });

  // Función para obtener envíos del cliente con paginación y filtros por estado
  // Utiliza la API para actualizar los envíos y la paginación
  const fetchShipments = useCallback(async (page: number, statusFilter?: string) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/orders?page=${page}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar envíos');

      const data = await response.json();
      setShipments(data.data ?? []);
      setPagination({
        currentPage: data.page,
        totalItems: data.total,
        itemsPerPage: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments(1, getStatusFilter(activeTab));
  }, [activeTab, fetchShipments]);

  const fetchPage = useCallback((page: number) => {
    fetchShipments(page, getStatusFilter(activeTab));
  }, [activeTab, fetchShipments]);

  return {
    shipments,
    isLoading,
    pagination,
    activeTab,
    setActiveTab,
    fetchPage,
  };
}