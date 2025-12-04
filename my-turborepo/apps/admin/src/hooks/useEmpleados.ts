import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Usuario } from '@/types/api.types';

export function useEmpleados(complejoId?: string) {
  const queryClient = useQueryClient();

  const { data: empleados, isLoading } = useQuery({
    queryKey: ['empleados', complejoId],
    queryFn: async () => {
      const { data } = await api.get<Usuario[]>(`/complejos/${complejoId}/empleados`);
      return data;
    },
    enabled: !!complejoId,
  });

  const crearEmpleado = useMutation({
    mutationFn: async (empleado: { telefono: string; nombre: string; apellido: string; email?: string; password: string }) => {
      const { data } = await api.post(`/complejos/${complejoId}/empleados`, empleado);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  const editarEmpleado = useMutation({
    mutationFn: async ({ id, ...empleado }: Partial<Usuario> & { id: string }) => {
      const { data } = await api.patch(`/usuarios/empleados/${id}`, empleado);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  const cambiarPassword = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const { data } = await api.patch(`/usuarios/empleados/${id}/password`, { password });
      return data;
    },
  });

  const eliminarEmpleado = useMutation({
    mutationFn: async (empleadoId: string) => {
      const { data } = await api.delete(`/complejos/${complejoId}/empleados/${empleadoId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  return {
    empleados,
    isLoading,
    crearEmpleado,
    editarEmpleado,
    cambiarPassword,
    eliminarEmpleado,
  };
}