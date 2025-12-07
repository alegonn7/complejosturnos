import { QueryClient } from '@tanstack/react-query';

// Función que crea un NUEVO cliente cada vez
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Variable para el cliente del navegador
let browserQueryClient: QueryClient | undefined = undefined;

// Función que retorna el cliente apropiado según el entorno
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Servidor: siempre crea un nuevo cliente
    return makeQueryClient();
  } else {
    // Navegador: reutiliza el mismo cliente
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}