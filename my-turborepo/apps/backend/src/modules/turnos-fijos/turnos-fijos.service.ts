import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoFijoDto } from './dto/create-turno-fijo.dto';
import { UpdateTurnoFijoDto } from './dto/update-turno-fijo.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TurnosFijosService {
  constructor(private prisma: PrismaService) {}

  // ============ CLIENTE ============
  async create(createTurnoFijoDto: CreateTurnoFijoDto, userId: string) {
    const { canchaId, diaSemana, horaInicio, duracion, requiereSeña, fechaInicio, fechaFin } = createTurnoFijoDto;

    // Verificar que la cancha existe y pertenece a un complejo que permite turnos fijos
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
      include: {
        complejo: {
          select: {
            id: true,
            permiteTurnosFijos: true,
          },
        },
      },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    if (!cancha.complejo.permiteTurnosFijos) {
      throw new BadRequestException('Este complejo no permite turnos fijos');
    }

    if (cancha.estado !== 'HABILITADA') {
      throw new BadRequestException('La cancha no está habilitada');
    }

    // Verificar que no exista ya un turno fijo en ese horario
    const turnoFijoExistente = await this.prisma.turnoFijo.findUnique({
      where: {
        canchaId_diaSemana_horaInicio: {
          canchaId,
          diaSemana,
          horaInicio,
        },
      },
    });

    if (turnoFijoExistente) {
      throw new ConflictException('Ya existe un turno fijo en ese horario');
    }

    // Crear turno fijo
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : new Date();
    const fechaFinDate = fechaFin ? new Date(fechaFin) : null;

    const turnoFijo = await this.prisma.turnoFijo.create({
      data: {
        canchaId,
        diaSemana,
        horaInicio,
        duracion,
        requiereSeña: requiereSeña ?? true,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        usuarioId: userId,
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
    });

    // Registrar en historial
    await this.prisma.historialTurnoFijo.create({
      data: {
        turnoFijoId: turnoFijo.id,
        accion: 'CREADO',
        detalle: `Turno fijo creado para ${this.getDiaNombre(diaSemana)} a las ${horaInicio}`,
        usuarioId: userId,
      },
    });

    return turnoFijo;
  }

  async findMyTurnosFijos(userId: string) {
    return this.prisma.turnoFijo.findMany({
      where: {
        usuarioId: userId,
        activo: true,
      },
      include: {
        cancha: {
          select: {
            nombre: true,
            deporte: {
              select: {
                nombre: true,
                icono: true,
              },
            },
            complejo: {
              select: {
                nombre: true,
                direccion: true,
              },
            },
          },
        },
        _count: {
          select: {
            turnosGenerados: true,
          },
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });
  }

  async pausar(id: string, userId: string) {
    const turnoFijo = await this.prisma.turnoFijo.findUnique({
      where: { id },
    });

    if (!turnoFijo) {
      throw new NotFoundException('Turno fijo no encontrado');
    }

    if (turnoFijo.usuarioId !== userId) {
      throw new ForbiddenException('No tienes permisos sobre este turno fijo');
    }

    if (!turnoFijo.activo) {
      throw new BadRequestException('El turno fijo ya está pausado');
    }

    await this.prisma.turnoFijo.update({
      where: { id },
      data: { activo: false },
    });

    // Registrar en historial
    await this.prisma.historialTurnoFijo.create({
      data: {
        turnoFijoId: id,
        accion: 'PAUSADO',
        detalle: 'Turno fijo pausado por el usuario',
        usuarioId: null,
      },
    });

    return { message: 'Turno fijo pausado correctamente' };
  }

  async reactivar(id: string, userId: string) {
    const turnoFijo = await this.prisma.turnoFijo.findUnique({
      where: { id },
    });

    if (!turnoFijo) {
      throw new NotFoundException('Turno fijo no encontrado');
    }

    if (turnoFijo.usuarioId !== userId) {
      throw new ForbiddenException('No tienes permisos sobre este turno fijo');
    }

    if (turnoFijo.activo) {
      throw new BadRequestException('El turno fijo ya está activo');
    }

    await this.prisma.turnoFijo.update({
      where: { id },
      data: { activo: true },
    });

    // Registrar en historial
    await this.prisma.historialTurnoFijo.create({
      data: {
        turnoFijoId: id,
        accion: 'REACTIVADO',
        detalle: 'Turno fijo reactivado por el usuario',
        usuarioId: null,
      },
    });

    return { message: 'Turno fijo reactivado correctamente' };
  }

  async remove(id: string, userId: string, userRole: string) {
    const turnoFijo = await this.prisma.turnoFijo.findUnique({
      where: { id },
      include: {
        cancha: {
          select: {
            complejo: {
              select: {
                propietarioId: true,
              },
            },
          },
        },
      },
    });

    if (!turnoFijo) {
      throw new NotFoundException('Turno fijo no encontrado');
    }

    // Verificar permisos
    const isDueno = turnoFijo.cancha.complejo.propietarioId === userId;
    const isOwner = turnoFijo.usuarioId === userId;

    if (userRole !== 'SUPERADMIN' && !isDueno && !isOwner) {
      throw new ForbiddenException('No tienes permisos para cancelar este turno fijo');
    }

    // Cancelar turnos futuros generados
    await this.prisma.turno.updateMany({
      where: {
        turnoFijoId: id,
        fecha: {
          gte: new Date(),
        },
        estado: {
          in: ['DISPONIBLE', 'RESERVADO', 'SENA_ENVIADA'],
        },
      },
      data: {
        estado: 'CANCELADO',
      },
    });

    // Registrar en historial
    await this.prisma.historialTurnoFijo.create({
      data: {
        turnoFijoId: id,
        accion: 'CANCELADO',
        detalle: 'Turno fijo cancelado',
        usuarioId: null,
      },
    });

    // Eliminar turno fijo
    await this.prisma.turnoFijo.delete({
      where: { id },
    });

    return { message: 'Turno fijo cancelado correctamente' };
  }

  // ============ DUEÑO/EMPLEADO ============
  async findByComplejo(complejoId: string, userId: string, userRole: string) {
    // Verificar permisos
    if (userRole !== 'SUPERADMIN') {
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
    }

    return this.prisma.turnoFijo.findMany({
      where: {
        cancha: {
          complejoId,
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
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true,
          },
        },
        _count: {
          select: {
            turnosGenerados: true,
          },
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });
  }

  async findByCancha(canchaId: string, userId: string, userRole: string) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
      select: {
        complejoId: true,
        complejo: {
          select: {
            propietarioId: true,
            empleados: {
              where: { id: userId },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Verificar permisos
    if (userRole !== 'SUPERADMIN') {
      const isDueno = cancha.complejo.propietarioId === userId;
      const isEmpleado = cancha.complejo.empleados.length > 0;

      if (!isDueno && !isEmpleado) {
        throw new ForbiddenException('No tienes permisos sobre esta cancha');
      }
    }

    return this.prisma.turnoFijo.findMany({
      where: { canchaId },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true,
          },
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horaInicio: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const turnoFijo = await this.prisma.turnoFijo.findUnique({
      where: { id },
      include: {
        cancha: {
          select: {
            nombre: true,
            deporte: {
              select: {
                nombre: true,
              },
            },
            complejo: {
              select: {
                nombre: true,
                direccion: true,
              },
            },
          },
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true,
            email: true,
          },
        },
        historial: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!turnoFijo) {
      throw new NotFoundException('Turno fijo no encontrado');
    }

    return turnoFijo;
  }

  async update(id: string, updateTurnoFijoDto: UpdateTurnoFijoDto, userId: string) {
    const turnoFijo = await this.prisma.turnoFijo.findUnique({
      where: { id },
    });

    if (!turnoFijo) {
      throw new NotFoundException('Turno fijo no encontrado');
    }

    // Si se está cambiando la cancha, validar
    if (updateTurnoFijoDto.canchaId && updateTurnoFijoDto.canchaId !== turnoFijo.canchaId) {
      const nuevaCancha = await this.prisma.cancha.findUnique({
        where: { id: updateTurnoFijoDto.canchaId },
      });

      if (!nuevaCancha) {
        throw new NotFoundException('Nueva cancha no encontrada');
      }

      if (nuevaCancha.estado !== 'HABILITADA') {
        throw new BadRequestException('La nueva cancha no está habilitada');
      }

      // Verificar conflicto en la nueva cancha
      const diaSemana = updateTurnoFijoDto.diaSemana ?? turnoFijo.diaSemana;
      const horaInicio = updateTurnoFijoDto.horaInicio ?? turnoFijo.horaInicio;

      const conflicto = await this.prisma.turnoFijo.findFirst({
        where: {
          canchaId: updateTurnoFijoDto.canchaId,
          diaSemana,
          horaInicio,
          id: { not: id },
        },
      });

      if (conflicto) {
        throw new ConflictException('Ya existe un turno fijo en ese horario en la nueva cancha');
      }

      // Registrar cambio de cancha
      await this.prisma.historialTurnoFijo.create({
        data: {
          turnoFijoId: id,
          accion: 'CANCHA_CAMBIADA',
          detalle: `Cancha cambiada de ${turnoFijo.canchaId} a ${updateTurnoFijoDto.canchaId}`,
          usuarioId: null,
        },
      });
    }

    const dataToUpdate: any = { ...updateTurnoFijoDto };

    if (updateTurnoFijoDto.fechaFin) {
      dataToUpdate.fechaFin = new Date(updateTurnoFijoDto.fechaFin);
    }

    return this.prisma.turnoFijo.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // ============ GENERACIÓN DE TURNOS (CRON) ============
  async generarTurnosParaTurnosFijos() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 30); // 30 días adelante

    // Obtener todos los turnos fijos activos
    const turnosFijos = await this.prisma.turnoFijo.findMany({
      where: {
        activo: true,
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: hoy } },
        ],
      },
      include: {
        cancha: {
          include: {
            complejo: true,
            preciosDinamicos: true,
          },
        },
      },
    });

    let turnosGeneradosTotal = 0;

    for (const turnoFijo of turnosFijos) {
      // Verificar si la cancha sigue habilitada
      if (turnoFijo.cancha.estado !== 'HABILITADA') {
        await this.manejarCanchaDeshabilitada(turnoFijo);
        continue;
      }

      // Generar turnos hasta el límite
      let fecha = new Date(hoy);

      while (fecha <= limite) {
        // Buscar el próximo día que coincida con diaSemana
        while (fecha.getDay() !== turnoFijo.diaSemana) {
          fecha.setDate(fecha.getDate() + 1);
        }

        if (fecha > limite) break;

        // Verificar que esté dentro del rango del turno fijo
        if (fecha < turnoFijo.fechaInicio || (turnoFijo.fechaFin && fecha > turnoFijo.fechaFin)) {
          fecha.setDate(fecha.getDate() + 7);
          continue;
        }

        // Construir fecha/hora del turno
        const [hora, minuto] = turnoFijo.horaInicio.split(':').map(Number);
        const fechaTurno = new Date(fecha);
        fechaTurno.setHours(hora, minuto, 0, 0);

        // Verificar si ya existe el turno
        const turnoExistente = await this.prisma.turno.findFirst({
          where: {
            canchaId: turnoFijo.canchaId,
            fecha: fechaTurno,
          },
        });

        if (!turnoExistente) {
          // Calcular precio
          const precioDinamico = turnoFijo.cancha.preciosDinamicos.find(
            p => p.diaSemana === turnoFijo.diaSemana,
          );
          const porcentaje = precioDinamico ? precioDinamico.porcentaje : 100;
          const precioTotal = Number(turnoFijo.cancha.precioBase) * (porcentaje / 100);

          // Determinar estado inicial
          const estadoInicial = turnoFijo.requiereSeña ? 'RESERVADO' : 'CONFIRMADO';
          const montoSeña = turnoFijo.requiereSeña
            ? precioTotal * (turnoFijo.cancha.complejo.porcentajeSeña / 100)
            : null;

          // Calcular fecha de expiración (24hs antes del turno)
          const fechaExpiracion = turnoFijo.requiereSeña
            ? new Date(fechaTurno.getTime() - 24 * 60 * 60 * 1000)
            : null;

          // Crear turno
          await this.prisma.turno.create({
            data: {
              fecha: fechaTurno,
              duracion: turnoFijo.duracion,
              estado: estadoInicial,
              precioTotal: precioTotal.toFixed(2),
              montoSeña: montoSeña ? montoSeña.toFixed(2) : null,
              fechaExpiracion,
              fechaReserva: estadoInicial === 'RESERVADO' ? new Date() : null,
              fechaConfirmacion: estadoInicial === 'CONFIRMADO' ? new Date() : null,
              canchaId: turnoFijo.canchaId,
              complejoId: turnoFijo.cancha.complejoId,
              usuarioId: turnoFijo.usuarioId,
              turnoFijoId: turnoFijo.id,
            },
          });

          turnosGeneradosTotal++;
        }

        // Avanzar a la próxima semana
        fecha.setDate(fecha.getDate() + 7);
      }
    }

    return {
      message: `Se generaron ${turnosGeneradosTotal} turnos desde turnos fijos`,
      turnosGenerados: turnosGeneradosTotal,
    };
  }

  // ============ MANEJO DE CANCHA DESHABILITADA ============
  private async manejarCanchaDeshabilitada(turnoFijo: any) {
    const complejoId = turnoFijo.cancha.complejoId;

    // Buscar otra cancha del mismo deporte en el complejo
    const canchasDisponibles = await this.prisma.cancha.findMany({
      where: {
        complejoId,
        deporteId: turnoFijo.cancha.deporteId,
        estado: 'HABILITADA',
        id: { not: turnoFijo.canchaId },
      },
    });

    if (canchasDisponibles.length === 0) {
      // No hay canchas disponibles → eliminar turno fijo
      await this.prisma.historialTurnoFijo.create({
        data: {
          turnoFijoId: turnoFijo.id,
          accion: 'CANCELADO',
          detalle: 'Turno fijo cancelado automáticamente: no hay canchas disponibles en el complejo',
          usuarioId: null,
        },
      });

      await this.prisma.turnoFijo.delete({
        where: { id: turnoFijo.id },
      });

      return;
    }

    // Buscar cancha con disponibilidad en ese horario
    for (const canchaAlternativa of canchasDisponibles) {
      const conflicto = await this.prisma.turnoFijo.findFirst({
        where: {
          canchaId: canchaAlternativa.id,
          diaSemana: turnoFijo.diaSemana,
          horaInicio: turnoFijo.horaInicio,
        },
      });

      if (!conflicto) {
        // Reasignar a esta cancha
        await this.prisma.turnoFijo.update({
          where: { id: turnoFijo.id },
          data: { canchaId: canchaAlternativa.id },
        });

        await this.prisma.historialTurnoFijo.create({
          data: {
            turnoFijoId: turnoFijo.id,
            accion: 'CANCHA_CAMBIADA',
            detalle: `Cancha reasignada automáticamente a ${canchaAlternativa.nombre}`,
            usuarioId: null,
          },
        });

        return;
      }
    }

    // Si llegamos acá, hay canchas pero todas ocupadas en ese horario → desactivar
    await this.prisma.turnoFijo.update({
      where: { id: turnoFijo.id },
      data: { activo: false },
    });

    await this.prisma.historialTurnoFijo.create({
      data: {
        turnoFijoId: turnoFijo.id,
        accion: 'PAUSADO',
        detalle: 'Turno fijo pausado automáticamente: todas las canchas disponibles están ocupadas en ese horario',
        usuarioId: null,
      },
    });
  }

  // ============ HELPERS ============
  private getDiaNombre(diaSemana: number): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[diaSemana];
  }
}