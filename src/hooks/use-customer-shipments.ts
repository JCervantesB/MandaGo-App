import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { CustomerShipment, ShipmentsResponse } from '@/types/shipment-types';

interface UseCustomerShipmentsOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UseCustomerShipmentsReturn {
  shipments: CustomerShipment[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
  };
  fetchPage: (page: number) => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Hook para obtener envíos del cliente con paginación
export function useCustomerShipments({
  initialPage = 1,
  initialLimit = 5,
}: UseCustomerShipmentsOptions = {}): UseCustomerShipmentsReturn {
  const [shipments, setShipments] = useState<CustomerShipment[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalItems: 0,
    itemsPerPage: initialLimit,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener envíos del cliente con paginación
  // Utiliza la API para obtener envíos del cliente
  // Maneja errores y carga inicial
  const fetchShipments = async (page: number, limit: number): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/orders?page=${page}&limit=${limit}`,
      { credentials: 'include' }
    );

    if (!response.ok) {
      throw new Error('Error al cargar envíos');
    }

    const result: ShipmentsResponse = await response.json();
    setShipments(result.data);
    setPagination({
      currentPage: result.page,
      totalItems: result.total,
      itemsPerPage: result.limit,
      totalPages: result.totalPages,
    });
  };

  const fetchPage = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchShipments(page, pagination.itemsPerPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.itemsPerPage]);

  const goToNextPage = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages) {
      await fetchPage(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.totalPages, fetchPage]);

  const goToPreviousPage = useCallback(async () => {
    if (pagination.currentPage > 1) {
      await fetchPage(pagination.currentPage - 1);
    }
  }, [pagination.currentPage, fetchPage]);

  const refresh = useCallback(async () => {
    await fetchPage(pagination.currentPage);
  }, [pagination.currentPage, fetchPage]);

  return {
    shipments,
    isLoading,
    error,
    pagination,
    fetchPage,
    goToNextPage,
    goToPreviousPage,
    refresh,
  };
}