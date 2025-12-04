import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TurnoFijo } from '@/types/api.types';

export function useTurnosFijos(complejoId?: string) {
  const queryClient = useQueryClient();

  const { data: turnosFijos, isLoading } = useQuery({
    queryKey: ['turnos-fijos', complejoId],
    queryFn: async () => {
      const { data } = await api.get<TurnoFijo[]>(`/turnos-fijos/complejo/${complejoId}`);
      return data;
    },
    enabled: !!complejoId,
  });

  const pausarTurnoFijo = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/turnos-fijos/${id}/pausar`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos-fijos'] });
    },
  });

  const reactivarTurnoFijo = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/turnos-fijos/${id}/reactivar`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos-fijos'] });
    },
  });

  const cancelarTurnoFijo = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/turnos-fijos/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos-fijos'] });
    },
  });

  return {
    turnosFijos,
    isLoading,
    pausarTurnoFijo,
    reactivarTurnoFijo,
    cancelarTurnoFijo,
  };
}