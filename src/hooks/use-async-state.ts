import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook para manejar estados asíncronos con limpieza automática en unmount.
 * Proporciona execute para operaciones async y manejo de errores.
 */
interface AsyncDataState<DataType> {
  data: DataType | null;
  isLoading: boolean;
  errorMessage: string | null;
}

interface AsyncStateOptions<DataType> {
  initialData?: DataType | null;
  onError?: (error: unknown) => void;
}

interface AsyncStateReturn<DataType> extends AsyncDataState<DataType> {
  execute: (asyncOperation: () => Promise<DataType>) => Promise<DataType | null>;
  reset: () => void;
}

// Hook para manejar estados asíncronos con limpieza en unmount
export function useAsyncState<DataType>({
  initialData = null,
  onError,
}: AsyncStateOptions<DataType> = {}): AsyncStateReturn<DataType> {
  const [data, setData] = useState<DataType | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const componentMountedRef = useRef(true);

  // Mantener estado del componente en ref para detectar si está montado
  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  // Ejecutar operación async y manejar estado
  // Si el componente está montado, actualizar estado
  // Si no está montado, devolver null
  const executeAsyncOperation = useCallback(
    async (asyncOperation: () => Promise<DataType>): Promise<DataType | null> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await asyncOperation();
        if (componentMountedRef.current) {
          setData(result);
          return result;
        }
        return null;
      } catch (errorObject) {
        if (componentMountedRef.current) {
          const errorMessageText = errorObject instanceof Error ? errorObject.message : 'Error desconocido';
          setErrorMessage(errorMessageText);
          onError?.(errorObject);
        }
        return null;
      } finally {
        if (componentMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [onError],
  );

  // Resetear estado a inicial
  const resetState = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setErrorMessage(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    errorMessage,
    execute: executeAsyncOperation,
    reset: resetState,
  };
}

export type { AsyncStateOptions, AsyncStateReturn };