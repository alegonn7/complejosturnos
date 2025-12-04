import { EstadoTurno, EstadoPago, EstadoCancha } from '@/types/enums';

// Colores para badges según estado de turno
export const TURNO_COLORS: Record<EstadoTurno, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  [EstadoTurno.DISPONIBLE]: 'gray',
  [EstadoTurno.RESERVADO]: 'blue',
  [EstadoTurno.SENA_ENVIADA]: 'yellow',
  [EstadoTurno.CONFIRMADO]: 'green',
  [EstadoTurno.CANCELADO]: 'red',
  [EstadoTurno.EXPIRADO]: 'red',
  [EstadoTurno.AUSENTE]: 'red',
  [EstadoTurno.BLOQUEADO]: 'gray',
};

// Labels para estados de turno
export const TURNO_LABELS: Record<EstadoTurno, string> = {
  [EstadoTurno.DISPONIBLE]: 'Disponible',
  [EstadoTurno.RESERVADO]: 'Reservado',
  [EstadoTurno.SENA_ENVIADA]: 'Seña Enviada',
  [EstadoTurno.CONFIRMADO]: 'Confirmado',
  [EstadoTurno.CANCELADO]: 'Cancelado',
  [EstadoTurno.EXPIRADO]: 'Expirado',
  [EstadoTurno.AUSENTE]: 'Ausente',
  [EstadoTurno.BLOQUEADO]: 'Bloqueado',
};

// Colores para badges según estado de pago
export const PAGO_COLORS: Record<EstadoPago, 'gray' | 'blue' | 'yellow' | 'green' | 'red'> = {
  [EstadoPago.PENDIENTE]: 'gray',
  [EstadoPago.ENVIADO]: 'yellow',
  [EstadoPago.APROBADO]: 'green',
  [EstadoPago.RECHAZADO]: 'red',
};

// Labels para estados de pago
export const PAGO_LABELS: Record<EstadoPago, string> = {
  [EstadoPago.PENDIENTE]: 'Pendiente',
  [EstadoPago.ENVIADO]: 'Enviado',
  [EstadoPago.APROBADO]: 'Aprobado',
  [EstadoPago.RECHAZADO]: 'Rechazado',
};

// Colores para badges según estado de cancha
export const CANCHA_COLORS: Record<EstadoCancha, 'green' | 'red' | 'yellow'> = {
  [EstadoCancha.HABILITADA]: 'green',
  [EstadoCancha.DESHABILITADA]: 'red',
  [EstadoCancha.EN_MANTENIMIENTO]: 'yellow',
};

// Labels para estados de cancha
export const CANCHA_LABELS: Record<EstadoCancha, string> = {
  [EstadoCancha.HABILITADA]: 'Habilitada',
  [EstadoCancha.DESHABILITADA]: 'Deshabilitada',
  [EstadoCancha.EN_MANTENIMIENTO]: 'En Mantenimiento',
};

// Días de la semana
export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];