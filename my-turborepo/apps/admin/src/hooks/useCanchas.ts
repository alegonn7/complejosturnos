import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Cancha } from '@/types/api.types';

export function useCanchas(complejoId?: string) {
  const queryClient = useQueryClient();

  // Obtener canchas del complejo
  const { data: canchas, isLoading } = useQuery({
    queryKey: ['canchas', complejoId],
    queryFn: async () => {
      const { data } = await api.get<Cancha[]>(`/canchas/complejo/${complejoId}`);
      return data;
    },
    enabled: !!complejoId,
  });

  // Crear cancha
  const crearCancha = useMutation({
    mutationFn: async (cancha: Partial<Cancha>) => {
      const { data } = await api.post('/canchas', cancha);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
    },
  });

  // Editar cancha
  const editarCancha = useMutation({
    mutationFn: async ({ id, ...cancha }: Partial<Cancha> & { id: string }) => {
      const { data } = await api.patch(`/canchas/${id}`, cancha);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
    },
  });

  // Cambiar estado
  const cambiarEstado = useMutation({
    mutationFn: async ({ id, estado }: { id: string; estado: string }) => {
      const { data } = await api.patch(`/canchas/${id}/estado`, { estado });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
    },
  });

  // Eliminar cancha
  const eliminarCancha = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/canchas/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] });
    },
  });

  return {
    canchas,
    isLoading,
    crearCancha,
    editarCancha,
    cambiarEstado,
    eliminarCancha,
  };
}