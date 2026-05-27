import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

/**
 * Cliente de TanStack Query configurado para toda la aplicación.
 * Proporciona fetching, caching y gestión de estado asíncrono.
 * 
 * Configuración:
 * - retry: 1 - Reintentar fallas una vez
 * - staleTime: 15_000 - Datos frescos por 15 segundos
 * 
 * Referencias:
 * - Fase 11.1: Configurar TanStack Query
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
    },
  },
});

export function AppQueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

