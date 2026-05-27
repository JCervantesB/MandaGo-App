import { useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { Client, PaginatedResponse } from '@/types/admin.types';

export type ClientStatus = 'pending_onboarding' | 'active' | 'disabled';

interface UseClientsListOptions {
  status: ClientStatus;
  initialPage?: number;
  initialLimit?: number;
}

interface ClientsListReturn {
  clients: Client[];
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

// Mapa de endpoints para obtener status de clientes
const statusEndpoints: Record<ClientStatus, string> = {
  pending_onboarding: '/users/pending-onboarding/paginated',
  active: '/users/active/paginated',
  disabled: '/users/disabled/paginated',
};

// Hook para obtener lista de clientes con paginación por status
export function useClientsList({
  status,
  initialPage = 1,
  initialLimit = 10,
}: UseClientsListOptions): ClientsListReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalItems: 0,
    itemsPerPage: initialLimit,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener clientes paginados por status
  // Utiliza la API para obtener clientes paginados
  // Maneja errores y carga inicial
  const fetchClients = async (page: number, limit: number): Promise<Client[]> => {
    const endpoint = statusEndpoints[status];
    const response = await fetch(
      `${API_BASE_URL}${endpoint}?page=${page}&limit=${limit}`,
      { credentials: 'include' }
    );

    if (!response.ok) {
      throw new Error('Error al cargar clientes');
    }

    const result: PaginatedResponse<Client> = await response.json();
    return result.data;
  };

  // Función para obtener clientes paginados por status
  // Utiliza la API para obtener clientes paginados
  // Maneja errores y carga inicial
  const fetchPage = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedClients = await fetchClients(page, pagination.itemsPerPage);
      setClients(fetchedClients);
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

  // Navegar a la siguiente página de clientes
  const goToNextPage = async () => {
    if (pagination.currentPage < pagination.totalPages) {
      await fetchPage(pagination.currentPage + 1);
    }
  };

  // Navegar a la página anterior de clientes
  const goToPreviousPage = async () => {
    if (pagination.currentPage > 1) {
      await fetchPage(pagination.currentPage - 1);
    }
  };

  // Refrescar la lista de clientes
  const refresh = async () => {
    await fetchPage(pagination.currentPage);
  };

  return {
    clients,
    isLoading,
    error,
    pagination,
    fetchPage,
    goToNextPage,
    goToPreviousPage,
    refresh,
  };
}