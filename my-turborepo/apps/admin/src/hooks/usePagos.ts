import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Pago } from '@/types/api.types';

export function usePagos(complejoId?: string) {
  const queryClient = useQueryClient();

  // Obtener pagos pendientes
  const { data: pagosPendientes, isLoading } = useQuery({
    queryKey: ['pagos', 'pendientes', complejoId],
    queryFn: async () => {
      const { data } = await api.get<Pago[]>('/pagos/pendientes', {
        params: { complejoId },
      });
      return data;
    },
    enabled: !!complejoId,
  });

  // Aprobar pago
  const aprobarPago = useMutation({
    mutationFn: async (pagoId: string) => {
      const { data } = await api.patch(`/pagos/${pagoId}/aprobar`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Rechazar pago
  const rechazarPago = useMutation({
    mutationFn: async ({ pagoId, motivo }: { pagoId: string; motivo: string }) => {
      const { data } = await api.patch(`/pagos/${pagoId}/rechazar`, {
        motivoRechazo: motivo,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
  });

  return {
    pagosPendientes,
    isLoading,
    aprobarPago,
    rechazarPago,
  };
}