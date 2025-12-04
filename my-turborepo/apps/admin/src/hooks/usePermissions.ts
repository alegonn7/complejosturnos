import { useAuthStore } from '@/stores/authStore';
import { RolUsuario } from '@/types/enums';

export function usePermissions() {
  const usuario = useAuthStore((state) => state.usuario);

  const isSuperAdmin = usuario?.rol === RolUsuario.SUPERADMIN;
  const isDueno = usuario?.rol === RolUsuario.DUENO;
  const isEmpleado = usuario?.rol === RolUsuario.EMPLEADO;
  const isCliente = usuario?.rol === RolUsuario.CLIENTE;

  // Permisos específicos
  const canManageComplejos = isSuperAdmin;
  const canManageEmpleados = isSuperAdmin || isDueno;
  const canEditComplejo = isSuperAdmin || isDueno;
  const canDeleteCanchas = isSuperAdmin || isDueno;
  const canViewEstadisticas = isSuperAdmin || isDueno || isEmpleado;
  const canManagePagos = isSuperAdmin || isDueno || isEmpleado;
  const canManageTurnos = isSuperAdmin || isDueno || isEmpleado;

  return {
    usuario,
    isSuperAdmin,
    isDueno,
    isEmpleado,
    isCliente,
    canManageComplejos,
    canManageEmpleados,
    canEditComplejo,
    canDeleteCanchas,
    canViewEstadisticas,
    canManagePagos,
    canManageTurnos,
  };
}