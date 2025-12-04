import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types/api.types';

export function useEstadisticas(complejoId?: string) {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard', complejoId],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/estadisticas/dashboard', {
        params: { complejoId },
      });
      return data;
    },
    enabled: !!complejoId,
    refetchInterval: 60000, // Refetch cada 1 minuto
  });

  return {
    dashboard,
    isLoading,
  };
}