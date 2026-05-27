import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import type {
  WalletTransaction,
  WalletBalanceResponse,
  WalletTopupResponse,
} from '@/types/shipment-types';

interface UseWalletReturn {
  balance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  topup: (packageCredits: 100 | 200 | 500) => Promise<WalletTopupResponse>;
}

// Hook para manejar cartera de créditos (balance, transacciones, recargas)
export function useWallet(): UseWalletReturn {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener el saldo');
      }

      const data: WalletBalanceResponse = await response.json();
      setBalance(data.balance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    }
  }, []);

  // Función para obtener las transacciones de la cartera
  // Utiliza la API para obtener las transacciones
  // Llama a fetchBalance para actualizar el saldo después de la actualización
  // Llama a fetchTransactions para actualizar las transacciones después de la actualización
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/transactions?limit=50`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener transacciones');
      }

      const data = await response.json();
      const txList = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      setTransactions(txList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para recargar créditos en la cartera
  // Utiliza la API para recargar créditos
  // Llama a fetchBalance para actualizar el saldo después de la recarga
  // Llama a fetchTransactions para actualizar las transacciones después de la recarga
  const topup = useCallback(async (packageCredits: 100 | 200 | 500): Promise<WalletTopupResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ packageCredits, provider: 'mock' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al recargar créditos');
      }

      const data: WalletTopupResponse = await response.json();
      setBalance(data.balance);
      await fetchTransactions();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  return {
    balance,
    transactions,
    isLoading,
    error,
    fetchBalance,
    fetchTransactions,
    topup,
  };
}