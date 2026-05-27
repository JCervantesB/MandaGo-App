import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';

export interface ServiceFee {
  id: number;
  priority: string;
  credits: number;
  operationFee: number;
  label: string;
}

interface UseServiceFeesReturn {
  fees: ServiceFee[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFee: (priority: string, credits: number, operationFee: number) => Promise<boolean>;
}

// Hook para obtener y actualizar tarifas de servicio por prioridad
export function useServiceFees(): UseServiceFeesReturn {
  const [fees, setFees] = useState<ServiceFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener tarifas de servicio por prioridad
  // Utiliza la API para actualizar las tarifas
  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/config/service-fees`, { credentials: 'include' });
      if (!response.ok) throw new Error('Error al cargar costos');
      const data = await response.json();
      setFees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFees();
  }, [fetchFees]);

  // Función para actualizar una tarifa de servicio por prioridad
  // Utiliza la API para actualizar la tarifa
  // Llama a fetchFees para actualizar las tarifas después de la actualización
  const updateFee = useCallback(async (priority: string, credits: number, operationFee: number): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/config/service-fees`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priority, credits, operationFee }),
      });
      if (!response.ok) throw new Error('Error al actualizar costo');
      await fetchFees();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchFees]);

  return {
    fees,
    isLoading,
    isSaving,
    error,
    refetch: fetchFees,
    updateFee,
  };
}