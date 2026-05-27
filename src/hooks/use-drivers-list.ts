import { useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { Driver, PaginatedResponse } from '@/types/admin.types';

export type DriverStatus = 'pending_onboarding' | 'active' | 'disabled';

interface UseDriversListOptions {
  status: DriverStatus;
  initialPage?: number;
  initialLimit?: number;
}

interface DriversListReturn {
  drivers: Driver[];
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

const statusEndpoints: Record<DriverStatus, string> = {
  pending_onboarding: '/users/pending-onboarding/paginated?role=repartidor',
  active: '/users/active/paginated?role=repartidor',
  disabled: '/users/disabled/paginated?role=repartidor',
};

// Hook para obtener lista de repartidores con paginación por status
export function useDriversList({
  status,
  initialPage = 1,
  initialLimit = 10,
}: UseDriversListOptions): DriversListReturn {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalItems: 0,
    itemsPerPage: initialLimit,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener repartidores paginados por status
  // Utiliza la API para obtener repartidores paginados
  const fetchDrivers = async (page: number, limit: number): Promise<Driver[]> => {
    const endpoint = statusEndpoints[status];
    const response = await fetch(
      `${API_BASE_URL}${endpoint}&page=${page}&limit=${limit}`,
      { credentials: 'include' }
    );

    if (!response.ok) {
      throw new Error('Error al cargar repartidores');
    }

    const result: PaginatedResponse<Driver> = await response.json();
    return result.data;
  };

  // Función para obtener una página de repartidores
  // Utiliza la API para obtener una página de repartidores
  const fetchPage = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedDrivers = await fetchDrivers(page, pagination.itemsPerPage);
      setDrivers(fetchedDrivers);
      setPagination((previous) => ({
        ...previous,
        currentPage: page,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextPage = async () => {
    if (pagination.currentPage < pagination.totalPages) {
      await fetchPage(pagination.currentPage + 1);
    }
  };

  const goToPreviousPage = async () => {
    if (pagination.currentPage > 1) {
      await fetchPage(pagination.currentPage - 1);
    }
  };

  const refresh = async () => {
    await fetchPage(pagination.currentPage);
  };

  return {
    drivers,
    isLoading,
    error,
    pagination,
    fetchPage,
    goToNextPage,
    goToPreviousPage,
    refresh,
  };
}