import { RolUsuario, EstadoTurno, EstadoPago, EstadoCancha, MetodoPago } from './enums';

// Usuario
export interface Usuario {
  id: string;
  email: string | null;
  telefono: string;
  dni: string | null;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  complejoId: string | null;
}

// Complejo
export interface Complejo {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string | null;
  cbu: string | null;
  alias: string | null;
  titular: string | null;
  requiereSeña: boolean;
  porcentajeSeña: number;
  minutosExpiracion: number;
  permiteTurnosFijos: boolean;
  numeroWhatsapp: string | null;
  propietarioId: string | null;
}

// Deporte
export interface Deporte {
  id: string;
  nombre: string;
  icono: string | null;
  complejoId: string;
}

// Cancha
export interface Cancha {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: EstadoCancha;
  precioBase: string; // Decimal como string
  complejoId: string;
  deporteId: string;
  deporte?: Deporte;
  complejo?: Complejo;
}

// ConfiguracionHorarioCancha
export interface ConfiguracionHorarioCancha {
  id: string;
  diaSemana: number; // 0-6
  horaInicio: string; // "08:00"
  horaFin: string; // "22:00"
  duracionTurno: number; // minutos
  activo: boolean;
  diasAdelante: number;
  ultimaGeneracion: string | null;
  canchaId: string;
}

// PrecioDinamico
export interface PrecioDinamico {
  id: string;
  diaSemana: number;
  porcentaje: number;
  descripcion: string | null;
  canchaId: string;
}

// Turno
export interface Turno {
  id: string;
  fecha: string; // ISO Date
  duracion: number;
  estado: EstadoTurno;
  dni: string | null;
  nombreCliente: string | null;
  apellidoCliente: string | null;
  telefonoCliente: string | null;
  precioTotal: string; // Decimal como string
  montoSeña: string | null;
  fechaReserva: string | null;
  fechaExpiracion: string | null;
  fechaConfirmacion: string | null;
  canchaId: string;
  complejoId: string;
  usuarioId: string | null;
  turnoFijoId: string | null;
  cancha?: Cancha;
  usuario?: Usuario;
  pago?: Pago;
}

// Pago
export interface Pago {
  id: string;
  monto: string; // Decimal como string
  metodo: MetodoPago;
  estado: EstadoPago;
  fechaEnvio: string | null;
  fechaValidacion: string | null;
  motivoRechazo: string | null;
  turnoId: string;
  turno?: Turno;
}

// TurnoFijo
export interface TurnoFijo {
  id: string;
  diaSemana: number;
  horaInicio: string;
  duracion: number;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
  requiereSeña: boolean;
  usuarioId: string;
  canchaId: string;
  usuario?: Usuario;
  cancha?: Cancha;
}

// Estadísticas - Dashboard
export interface DashboardStats {
  resumenHoy: {
    fecha: string;
    totalTurnos: number;
    turnosConfirmados: number;
    ingresosDia: number;
    ocupacion: number;
  };
  proximosTurnos: Turno[];
  pagosPendientes: number;
  turnosFijosActivos: number;
  alertas: Alerta[];
  tendenciaSemanal: {
    semanaActual: { turnos: number; ingresos: number };
    semanaAnterior: { turnos: number; ingresos: number };
    variacion: { turnos: string; ingresos: string };
  };
}

export interface Alerta {
  tipo: 'PAGOS_PENDIENTES' | 'TURNO_FIJO_SIN_PAGO' | 'CANCHA_DESHABILITADA' | 'OCUPACION_BAJA' | 'AUSENCIAS_CLIENTE';
  mensaje: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  datos?: any;
}