import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import type { TransactionItem } from '@/types/wallet';

export { TransactionItem } from '@/types/wallet';

interface PaginationState {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
}

interface UseAdminTransactionsReturn {
  transactions: TransactionItem[];
  isLoading: boolean;
  pagination: PaginationState;
  search: string;
  setSearch: (s: string) => void;
  fetchPage: (page: number) => void;
}

// Hook para obtener transacciones de crédito del admin con búsqueda y paginación
export function useAdminTransactions(): UseAdminTransactionsReturn {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 20,
    totalPages: 0,
  });

  // Obtener transacciones de crédito del admin con búsqueda y paginación
  const fetchTransactions = useCallback(async (page: number, searchQuery?: string) => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/admin/credits/transactions?page=${page}&limit=20`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar transacciones');

      const data = await response.json();
      setTransactions(data.data ?? []);
      setPagination({
        currentPage: data.page,
        totalItems: data.total,
        itemsPerPage: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener transacciones de crédito del admin con búsqueda y paginación
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(1, search);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, fetchTransactions]);

  // Obtener transacciones de crédito del admin con búsqueda y paginación
  const fetchPage = useCallback((page: number) => {
    fetchTransactions(page, search);
  }, [search, fetchTransactions]);

  return {
    transactions,
    isLoading,
    pagination,
    search,
    setSearch,
    fetchPage,
  };
}