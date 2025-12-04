import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Deporte } from '@/types/api.types';

export function useDeportes(complejoId?: string) {
  const queryClient = useQueryClient();

  const { data: deportes, isLoading } = useQuery({
    queryKey: ['deportes', complejoId],
    queryFn: async () => {
      const { data } = await api.get<Deporte[]>(`/deportes/complejo/${complejoId}`);
      return data;
    },
    enabled: !!complejoId,
  });

  const crearDeporte = useMutation({
    mutationFn: async (deporte: Partial<Deporte>) => {
      const { data } = await api.post('/deportes', deporte);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deportes'] });
    },
  });

  const editarDeporte = useMutation({
    mutationFn: async ({ id, ...deporte }: Partial<Deporte> & { id: string }) => {
      const { data } = await api.patch(`/deportes/${id}`, deporte);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deportes'] });
    },
  });

  const eliminarDeporte = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/deportes/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deportes'] });
    },
  });

  return {
    deportes,
    isLoading,
    crearDeporte,
    editarDeporte,
    eliminarDeporte,
  };
}