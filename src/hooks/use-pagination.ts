import { useState, useCallback } from 'react';

/**
 * Estado de paginación que contiene la información de la página actual y total.
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

/**
 * Resultado completo del hook de paginación con datos y controles de navegación.
 * @template T - Tipo de datos paginados
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  fetchPage: (page: number) => Promise<void>;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToPage: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

/**
 * Hook personalizado para manejar la paginación de datos.
 * Proporciona estado de carga, error, datos y controles de navegación.
 * 
 * @template T - Tipo de datos paginados
 * @param fetchFn - Función asíncrona para obtener datos de una página específica
 * @param initialLimit - Número de elementos por página por defecto (opcional, default: 20)
 * @returns Objeto con datos, estado de paginación y funciones de navegación
 * @throws Error si la función fetchFn lanza un error
 */
// Hook genérico para manejar paginación de datos
export function usePagination<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  initialLimit = 20,
): PaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const fetchPage = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(page, pagination.limit);
        setData(result.data);
        setPagination((prev) => ({
          ...prev,
          page,
          total: result.total,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, pagination.limit],
  );

  const goToNextPage = useCallback(() => {
    if (pagination.page < totalPages) {
      fetchPage(pagination.page + 1);
    }
  }, [pagination.page, totalPages, fetchPage]);

  const goToPrevPage = useCallback(() => {
    if (pagination.page > 1) {
      fetchPage(pagination.page - 1);
    }
  }, [pagination.page, fetchPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        fetchPage(page);
      }
    },
    [totalPages, fetchPage],
  );

  return {
    data,
    pagination,
    loading,
    error,
    fetchPage,
    goToNextPage,
    goToPrevPage,
    goToPage,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
    totalPages,
  };
}