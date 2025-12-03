import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardDto } from './dto/dashboard.dto.js';
import { RendimientoDto } from './dto/rendimiento.dto.js';
import { FiltrosEstadisticasDto } from './dto/filtros-estadisticas.dto.js';
import { Alerta, ResumenDia, ProximoTurno, TendenciaSemanal } from './interfaces/estadisticas.interface.js';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  // ============ VERIFICAR PERMISOS ============
  private async verificarPermisosComplejo(complejoId: string, userId: string, userRole: string) {
    if (userRole === 'SUPERADMIN') {
      return true;
    }

    const complejo = await this.prisma.complejo.findUnique({
      where: { id: complejoId },
      select: {
        propietarioId: true,
        empleados: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!complejo) {
      throw new NotFoundException('Complejo no encontrado');
    }

    const isDueno = complejo.propietarioId === userId;
    const isEmpleado = complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre este complejo');
    }

    return true;
  }

  // ============ DASHBOARD ============
  async getDashboard(dashboardDto: DashboardDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(dashboardDto.complejoId, userId, userRole);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    // Resumen del día
    const resumenHoy = await this.getResumenDia(dashboardDto.complejoId, hoy, mañana);

    // Próximos turnos (próxima hora)
    const ahora = new Date();
    const unaHoraDespues = new Date(ahora.getTime() + 60 * 60 * 1000);

    const proximosTurnos = await this.prisma.turno.findMany({
      where: {
        complejoId: dashboardDto.complejoId,
        fecha: {
          gte: ahora,
          lte: unaHoraDespues,
        },
        estado: {
          in: ['CONFIRMADO', 'RESERVADO', 'SENA_ENVIADA'],
        },
      },
      include: {
        cancha: {
          select: {
            nombre: true,
            deporte: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'asc',
      },
      take: 5,
    });

    const proximosTurnosFormateados: ProximoTurno[] = proximosTurnos.map(t => ({
      id: t.id,
      fecha: t.fecha,
      cancha: t.cancha.nombre,
      deporte: t.cancha.deporte.nombre,
      cliente: `${t.nombreCliente} ${t.apellidoCliente}`,
      telefono: t.telefonoCliente || '',
      estado: t.estado,
    }));

    // Pagos pendientes
    const pagosPendientes = await this.prisma.pago.count({
      where: {
        estado: 'ENVIADO',
        turno: {
          complejoId: dashboardDto.complejoId,
        },
      },
    });

    // Turnos fijos activos
    const turnosFijosActivos = await this.prisma.turnoFijo.count({
      where: {
        activo: true,
        cancha: {
          complejoId: dashboardDto.complejoId,
        },
      },
    });

    // Alertas
    const alertas = await this.generarAlertas(dashboardDto.complejoId);

    // Tendencia semanal
    const tendencia = await this.getTendenciaSemanal(dashboardDto.complejoId);

    return {
      resumenHoy,
      proximosTurnos: proximosTurnosFormateados,
      pagosPendientes,
      turnosFijosActivos,
      alertas,
      tendenciaSemanal: tendencia,
    };
  }

  // ============ RENDIMIENTO ============
  async getRendimiento(rendimientoDto: RendimientoDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(rendimientoDto.complejoId, userId, userRole);

    const periodo = rendimientoDto.periodo || 'mensual';
    const comparar = rendimientoDto.comparar ?? true;

    const { fechaInicio, fechaFin } = this.calcularRangoPeriodo(periodo);
    const { fechaInicioAnterior, fechaFinAnterior } = this.calcularPeriodoAnterior(periodo, fechaInicio);

    // Datos del período actual
    const periodoActual = await this.calcularMetricasPeriodo(
      rendimientoDto.complejoId,
      fechaInicio,
      fechaFin,
    );

    let comparacion = null;
    if (comparar) {
      const periodoAnterior = await this.calcularMetricasPeriodo(
        rendimientoDto.complejoId,
        fechaInicioAnterior,
        fechaFinAnterior,
      );

      comparacion = this.compararPeriodos(periodoActual, periodoAnterior);
    }

    // Tendencias (últimos 4 períodos)
    const tendencias = await this.calcularTendencias(rendimientoDto.complejoId, periodo);

    // Insights automáticos
    const insights = this.generarInsights(periodoActual, comparacion, tendencias);

    return {
      periodoActual,
      comparacion,
      tendencias,
      insights,
    };
  }

  // ============ ANÁLISIS DE TURNOS ============
  async getTurnosAnalisis(filtrosDto: FiltrosEstadisticasDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(filtrosDto.complejoId, userId, userRole);

    const { fechaInicio, fechaFin } = this.calcularRangoFechas(filtrosDto);

    const where: any = {
      complejoId: filtrosDto.complejoId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    if (filtrosDto.canchaId) {
      where.canchaId = filtrosDto.canchaId;
    }

    if (filtrosDto.deporteId) {
      where.cancha = {
        deporteId: filtrosDto.deporteId,
      };
    }

    // Total de turnos por estado
    const turnosPorEstado = await this.prisma.turno.groupBy({
      by: ['estado'],
      where,
      _count: true,
    });

    // Turnos por fecha (para gráfico)
    const turnosPorFecha = await this.agruparTurnosPorFecha(
      filtrosDto.complejoId,
      fechaInicio,
      fechaFin,
      filtrosDto.agruparPor || 'dia',
    );

    // Turnos por horario
    const turnosPorHorario = await this.calcularTurnosPorHorario(filtrosDto.complejoId, fechaInicio, fechaFin);

    // Turnos por día de semana
    const turnosPorDiaSemana = await this.calcularTurnosPorDiaSemana(
      filtrosDto.complejoId,
      fechaInicio,
      fechaFin,
    );

    return {
      turnosPorEstado: turnosPorEstado.map(t => ({
        estado: t.estado,
        cantidad: t._count,
      })),
      turnosPorFecha,
      turnosPorHorario,
      turnosPorDiaSemana,
    };
  }

  // ============ ANÁLISIS DE CANCHAS ============
  async getCanchasAnalisis(filtrosDto: FiltrosEstadisticasDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(filtrosDto.complejoId, userId, userRole);

    const { fechaInicio, fechaFin } = this.calcularRangoFechas(filtrosDto);

    // Ranking de canchas por ocupación
    const canchas = await this.prisma.cancha.findMany({
      where: {
        complejoId: filtrosDto.complejoId,
      },
      include: {
        turnos: {
          where: {
            fecha: {
              gte: fechaInicio,
              lte: fechaFin,
            },
          },
        },
        deporte: {
          select: {
            nombre: true,
          },
        },
      },
    });

    const ranking = await Promise.all(
      canchas.map(async cancha => {
        const turnosConfirmados = cancha.turnos.filter(
          t => t.estado === 'CONFIRMADO' || t.estado === 'SENA_ENVIADA',
        ).length;
        const turnosTotales = cancha.turnos.length;
        const ocupacion = turnosTotales > 0 ? (turnosConfirmados / turnosTotales) * 100 : 0;

        const ingresos = cancha.turnos
          .filter(t => t.estado === 'CONFIRMADO')
          .reduce((sum, t) => sum + Number(t.precioTotal), 0);

        return {
          canchaId: cancha.id,
          nombre: cancha.nombre,
          deporte: cancha.deporte.nombre,
          turnosConfirmados,
          turnosTotales,
          ocupacion: Math.round(ocupacion * 10) / 10,
          ingresos,
        };
      }),
    );

    ranking.sort((a, b) => b.ocupacion - a.ocupacion);

    return {
      ranking,
      mejorCancha: ranking[0],
      peorCancha: ranking[ranking.length - 1],
    };
  }

  // ============ ANÁLISIS DE CLIENTES ============
  async getClientesAnalisis(filtrosDto: FiltrosEstadisticasDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(filtrosDto.complejoId, userId, userRole);

    const { fechaInicio, fechaFin } = this.calcularRangoFechas(filtrosDto);

    // Top clientes por cantidad de turnos
    const topClientes = await this.prisma.turno.groupBy({
      by: ['telefonoCliente'],
      where: {
        complejoId: filtrosDto.complejoId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          in: ['CONFIRMADO', 'AUSENTE'],
        },
        telefonoCliente: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          telefonoCliente: 'desc',
        },
      },
      take: 10,
    });

    // Obtener nombres de los top clientes
    const topClientesDetalle = await Promise.all(
      topClientes.map(async cliente => {
        const turno = await this.prisma.turno.findFirst({
          where: {
            telefonoCliente: cliente.telefonoCliente,
          },
          select: {
            nombreCliente: true,
            apellidoCliente: true,
            telefonoCliente: true,
          },
        });

        return {
          nombre: `${turno?.nombreCliente} ${turno?.apellidoCliente}`,
          telefono: cliente.telefonoCliente,
          cantidadTurnos: cliente._count,
        };
      }),
    );

    // Clientes con ausencias
    const clientesConAusencias = await this.prisma.turno.groupBy({
      by: ['telefonoCliente'],
      where: {
        complejoId: filtrosDto.complejoId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: 'AUSENTE',
        telefonoCliente: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          telefonoCliente: 'desc',
        },
      },
      take: 10,
    });

    const clientesConAusenciasDetalle = await Promise.all(
      clientesConAusencias.map(async cliente => {
        const turno = await this.prisma.turno.findFirst({
          where: {
            telefonoCliente: cliente.telefonoCliente,
          },
          select: {
            nombreCliente: true,
            apellidoCliente: true,
            telefonoCliente: true,
          },
        });

        return {
          nombre: `${turno?.nombreCliente} ${turno?.apellidoCliente}`,
          telefono: cliente.telefonoCliente,
          cantidadAusencias: cliente._count,
        };
      }),
    );

    // Clientes nuevos
    const clientesNuevos = await this.prisma.turno.groupBy({
      by: ['telefonoCliente'],
      where: {
        complejoId: filtrosDto.complejoId,
        fechaReserva: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        telefonoCliente: {
          not: null,
        },
      },
      _count: true,
      having: {
        telefonoCliente: {
          _count: {
            equals: 1,
          },
        },
      },
    });

    return {
      topClientes: topClientesDetalle,
      clientesConAusencias: clientesConAusenciasDetalle,
      totalClientesNuevos: clientesNuevos.length,
    };
  }

  // ============ ANÁLISIS DE INGRESOS ============
  async getIngresosAnalisis(filtrosDto: FiltrosEstadisticasDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(filtrosDto.complejoId, userId, userRole);

    const { fechaInicio, fechaFin } = this.calcularRangoFechas(filtrosDto);

    // Ingresos totales
    const turnosConfirmados = await this.prisma.turno.findMany({
      where: {
        complejoId: filtrosDto.complejoId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: 'CONFIRMADO',
      },
      select: {
        precioTotal: true,
      },
    });

    const ingresosTotales = turnosConfirmados.reduce((sum, t) => sum + Number(t.precioTotal), 0);

    // Ingresos por método de pago
    const ingresosPorMetodo = await this.prisma.pago.groupBy({
      by: ['metodo'],
      where: {
        estado: 'APROBADO',
        turno: {
          complejoId: filtrosDto.complejoId,
          fecha: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
      },
      _sum: {
        monto: true,
      },
    });

    // Proyección de ingresos (turnos confirmados futuros)
    const hoy = new Date();
    const turnosFuturos = await this.prisma.turno.findMany({
      where: {
        complejoId: filtrosDto.complejoId,
        fecha: {
          gte: hoy,
        },
        estado: 'CONFIRMADO',
      },
      select: {
        precioTotal: true,
      },
    });

    const proyeccionIngresos = turnosFuturos.reduce((sum, t) => sum + Number(t.precioTotal), 0);

    // Ingresos por fecha (para gráfico)
    const ingresosPorFecha = await this.agruparIngresosPorFecha(
      filtrosDto.complejoId,
      fechaInicio,
      fechaFin,
      filtrosDto.agruparPor || 'dia',
    );

    return {
      ingresosTotales: Math.round(ingresosTotales),
      ingresosPorMetodo: ingresosPorMetodo.map(i => ({
        metodo: i.metodo,
        monto: Math.round(Number(i._sum.monto || 0)),
      })),
      proyeccionIngresos: Math.round(proyeccionIngresos),
      ingresosPorFecha,
    };
  }

  // ============ ANÁLISIS DE DEPORTES ============
  async getDeportesAnalisis(filtrosDto: FiltrosEstadisticasDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(filtrosDto.complejoId, userId, userRole);

    const { fechaInicio, fechaFin } = this.calcularRangoFechas(filtrosDto);

    const deportes = await this.prisma.deporte.findMany({
      where: {
        complejoId: filtrosDto.complejoId,
      },
      include: {
        canchas: {
          include: {
            turnos: {
              where: {
                fecha: {
                  gte: fechaInicio,
                  lte: fechaFin,
                },
                estado: 'CONFIRMADO',
              },
            },
          },
        },
      },
    });

    const ranking = deportes.map(deporte => {
      const turnos = deporte.canchas.flatMap(c => c.turnos);
      const cantidadTurnos = turnos.length;
      const ingresos = turnos.reduce((sum, t) => sum + Number(t.precioTotal), 0);

      return {
        deporteId: deporte.id,
        nombre: deporte.nombre,
        cantidadTurnos,
        ingresos: Math.round(ingresos),
      };
    });

    ranking.sort((a, b) => b.cantidadTurnos - a.cantidadTurnos);

    return {
      ranking,
      mejorDeporte: ranking[0],
    };
  }

  // ============ OPTIMIZACIÓN DE HORARIOS ============
  async getHorariosOptimizacion(filtrosDto: FiltrosEstadisticasDto, userId: string, userRole: string) {
    await this.verificarPermisosComplejo(filtrosDto.complejoId, userId, userRole);

    const { fechaInicio, fechaFin } = this.calcularRangoFechas(filtrosDto);

    const turnosPorHorario = await this.calcularTurnosPorHorario(
      filtrosDto.complejoId,
      fechaInicio,
      fechaFin,
    );

    const turnosPorDia = await this.calcularTurnosPorDiaSemana(
      filtrosDto.complejoId,
      fechaInicio,
      fechaFin,
    );

    // Identificar horarios pico y horarios muertos
    const horariosPico = turnosPorHorario
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);

    const horariosMuertos = turnosPorHorario
      .sort((a, b) => a.cantidad - b.cantidad)
      .slice(0, 3);

    const diasPopulares = turnosPorDia
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);

    return {
      horariosPico,
      horariosMuertos,
      diasPopulares,
      turnosPorHorario,
      turnosPorDia,
    };
  }

  // ============ HELPERS PRIVADOS ============

  private async getResumenDia(complejoId: string, fechaInicio: Date, fechaFin: Date): Promise<ResumenDia> {
    const turnos = await this.prisma.turno.findMany({
      where: {
        complejoId,
        fecha: {
          gte: fechaInicio,
          lt: fechaFin,
        },
      },
    });

    const totalTurnos = turnos.length;
    const turnosReservados = turnos.filter(t => t.estado === 'RESERVADO').length;
    const turnosConfirmados = turnos.filter(t => t.estado === 'CONFIRMADO').length;
    const turnosCancelados = turnos.filter(t => t.estado === 'CANCELADO').length;
    const turnosAusentes = turnos.filter(t => t.estado === 'AUSENTE').length;

    const ingresosDia = turnos
      .filter(t => t.estado === 'CONFIRMADO')
      .reduce((sum, t) => sum + Number(t.precioTotal), 0);

    // Calcular ocupación (turnos confirmados vs disponibles totales)
    const turnosDisponibles = turnos.filter(t => t.estado === 'DISPONIBLE').length;
    const turnosOcupados = turnosConfirmados + turnosReservados;
    const ocupacion = totalTurnos > 0 ? (turnosOcupados / totalTurnos) * 100 : 0;

    return {
      fecha: fechaInicio,
      totalTurnos,
      turnosReservados,
      turnosConfirmados,
      turnosCancelados,
      turnosAusentes,
      ingresosDia: Math.round(ingresosDia),
      ocupacion: Math.round(ocupacion * 10) / 10,
    };
  }

  private async generarAlertas(complejoId: string): Promise<Alerta[]> {
    const alertas: Alerta[] = [];

    // Alertas de pagos pendientes
    const pagosPendientes = await this.prisma.pago.count({
      where: {
        estado: 'ENVIADO',
        turno: {
          complejoId,
        },
        fechaEnvio: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace más de 24hs
        },
      },
    });

    if (pagosPendientes >= 10) {
      alertas.push({
        tipo: 'PAGOS_PENDIENTES_CRITICO',
        mensaje: `Tienes ${pagosPendientes} pagos pendientes hace más de 24 horas`,
        prioridad: 'ALTA',
        datos: { cantidad: pagosPendientes },
      });
    } else if (pagosPendientes > 0) {
      alertas.push({
        tipo: 'PAGOS_PENDIENTES',
        mensaje: `Tienes ${pagosPendientes} pagos pendientes de validar`,
        prioridad: 'MEDIA',
        datos: { cantidad: pagosPendientes },
      });
    }

    // Alertas de canchas con baja ocupación
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const canchas = await this.prisma.cancha.findMany({
      where: { complejoId },
      include: {
        turnos: {
          where: {
            fecha: {
              gte: hace7Dias,
            },
          },
        },
      },
    });

    for (const cancha of canchas) {
      const turnosTotales = cancha.turnos.length;
      const turnosOcupados = cancha.turnos.filter(
        t => t.estado === 'CONFIRMADO' || t.estado === 'RESERVADO',
      ).length;

      if (turnosTotales > 0) {
        const ocupacion = (turnosOcupados / turnosTotales) * 100;

        if (ocupacion < 40) {
          alertas.push({
            tipo: 'CANCHA_BAJA_OCUPACION',
            mensaje: `${cancha.nombre} tiene solo ${Math.round(ocupacion)}% de ocupación esta semana`,
            prioridad: 'MEDIA',
            datos: { canchaId: cancha.id, ocupacion: Math.round(ocupacion) },
          });
        }
      }
    }

    // Alertas de turnos fijos sin pago próximo
    const en12Horas = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const turnosFijosSinPago = await this.prisma.turno.count({
      where: {
        complejoId,
        turnoFijoId: {
          not: null,
        },
        fecha: {
          lte: en12Horas,
        },
        estado: 'RESERVADO',
      },
    });

    if (turnosFijosSinPago > 0) {
      alertas.push({
        tipo: 'TURNO_FIJO_SIN_PAGO',
        mensaje: `${turnosFijosSinPago} turnos fijos sin pago en las próximas 12 horas`,
        prioridad: 'ALTA',
        datos: { cantidad: turnosFijosSinPago },
      });
    }

    return alertas;
  }

  private async getTendenciaSemanal(complejoId: string): Promise<TendenciaSemanal> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemanaActual = new Date(hoy);
    inicioSemanaActual.setDate(hoy.getDate() - hoy.getDay());

    const finSemanaActual = new Date(inicioSemanaActual);
    finSemanaActual.setDate(inicioSemanaActual.getDate() + 7);

    const inicioSemanaAnterior = new Date(inicioSemanaActual);
    inicioSemanaAnterior.setDate(inicioSemanaActual.getDate() - 7);

    const finSemanaAnterior = new Date(inicioSemanaActual);

    // Semana actual
    const turnosSemanaActual = await this.prisma.turno.findMany({
      where: {
        complejoId,
        fecha: {
          gte: inicioSemanaActual,
          lt: finSemanaActual,
        },
        estado: 'CONFIRMADO',
      },
    });

    // Semana anterior
    const turnosSemanaAnterior = await this.prisma.turno.findMany({
      where: {
        complejoId,
        fecha: {
          gte: inicioSemanaAnterior,
          lt: finSemanaAnterior,
},
estado: 'CONFIRMADO',
},
});
const turnosActual = turnosSemanaActual.length;
const ingresosActual = turnosSemanaActual.reduce((sum, t) => sum + Number(t.precioTotal), 0);

const turnosAnterior = turnosSemanaAnterior.length;
const ingresosAnterior = turnosSemanaAnterior.reduce((sum, t) => sum + Number(t.precioTotal), 0);

const variacionTurnos = turnosAnterior > 0 
  ? ((turnosActual - turnosAnterior) / turnosAnterior) * 100 
  : 0;

const variacionIngresos = ingresosAnterior > 0 
  ? ((ingresosActual - ingresosAnterior) / ingresosAnterior) * 100 
  : 0;

return {
  semanaActual: {
    turnos: turnosActual,
    ingresos: Math.round(ingresosActual),
  },
  semanaAnterior: {
    turnos: turnosAnterior,
    ingresos: Math.round(ingresosAnterior),
  },
  variacion: {
    turnos: `${variacionTurnos >= 0 ? '+' : ''}${Math.round(variacionTurnos * 10) / 10}%`,
    ingresos: `${variacionIngresos >= 0 ? '+' : ''}${Math.round(variacionIngresos * 10) / 10}%`,
  },
};
}
private calcularRangoPeriodo(periodo: string) {
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
let fechaInicio: Date;
let fechaFin: Date = new Date(hoy);

switch (periodo) {
  case 'semanal':
    fechaInicio = new Date(hoy);
    fechaInicio.setDate(hoy.getDate() - hoy.getDay()); // Inicio de semana
    break;

  case 'mensual':
    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    break;

  case 'anual':
    fechaInicio = new Date(hoy.getFullYear(), 0, 1);
    break;

  case 'historico':
    fechaInicio = new Date(2020, 0, 1); // Desde 2020
    break;

  default:
    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
}

return { fechaInicio, fechaFin };
}
private calcularPeriodoAnterior(periodo: string, fechaInicio: Date) {
let fechaInicioAnterior: Date;
let fechaFinAnterior: Date;
switch (periodo) {
  case 'semanal':
    fechaInicioAnterior = new Date(fechaInicio);
    fechaInicioAnterior.setDate(fechaInicio.getDate() - 7);
    fechaFinAnterior = new Date(fechaInicio);
    break;

  case 'mensual':
    fechaInicioAnterior = new Date(fechaInicio);
    fechaInicioAnterior.setMonth(fechaInicio.getMonth() - 1);
    fechaFinAnterior = new Date(fechaInicio);
    break;

  case 'anual':
    fechaInicioAnterior = new Date(fechaInicio);
    fechaInicioAnterior.setFullYear(fechaInicio.getFullYear() - 1);
    fechaFinAnterior = new Date(fechaInicio);
    break;

  default:
    fechaInicioAnterior = new Date(fechaInicio);
    fechaFinAnterior = new Date(fechaInicio);
}

return { fechaInicioAnterior, fechaFinAnterior };
}