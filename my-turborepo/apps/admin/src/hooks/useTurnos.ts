import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Turno } from '@/types/api.types';

export function useTurnos(complejoId?: string) {
  const queryClient = useQueryClient();

  // Obtener turnos del complejo
  const { data: turnos, isLoading } = useQuery({
    queryKey: ['turnos', complejoId],
    queryFn: async () => {
      const { data } = await api.get<Turno[]>(`/turnos/complejo/${complejoId}`);
      return data;
    },
    enabled: !!complejoId,
  });

  // Confirmar turno
  const confirmarTurno = useMutation({
    mutationFn: async (turnoId: string) => {
      const { data } = await api.post(`/turnos/${turnoId}/confirmar`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Marcar ausente
  const marcarAusente = useMutation({
    mutationFn: async (turnoId: string) => {
      const { data } = await api.post(`/turnos/${turnoId}/ausente`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  // Bloquear turno
  const bloquearTurno = useMutation({
    mutationFn: async (turnoId: string) => {
      const { data } = await api.post(`/turnos/${turnoId}/bloquear`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  // Cancelar turno
  const cancelarTurno = useMutation({
    mutationFn: async (turnoId: string) => {
      const { data } = await api.delete(`/turnos/${turnoId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  return {
    turnos,
    isLoading,
    confirmarTurno,
    marcarAusente,
    bloquearTurno,
    cancelarTurno,
  };
}