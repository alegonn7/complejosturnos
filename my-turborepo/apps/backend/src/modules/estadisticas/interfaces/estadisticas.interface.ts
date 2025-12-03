export interface Alerta {
  tipo: string;
  mensaje: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  datos?: any;
}

export interface ResumenDia {
  fecha: Date;
  totalTurnos: number;
  turnosReservados: number;
  turnosConfirmados: number;
  turnosCancelados: number;
  turnosAusentes: number;
  ingresosDia: number;
  ocupacion: number;
}

export interface ProximoTurno {
  id: string;
  fecha: Date;
  cancha: string;
  deporte: string;
  cliente: string;
  telefono: string;
  estado: string;
}

export interface TendenciaSemanal {
  semanaActual: {
    turnos: number;
    ingresos: number;
  };
  semanaAnterior: {
    turnos: number;
    ingresos: number;
  };
  variacion: {
    turnos: string;
    ingresos: string;
  };
}