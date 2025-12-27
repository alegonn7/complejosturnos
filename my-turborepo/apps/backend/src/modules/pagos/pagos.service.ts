import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnviarComprobanteDto } from './dto/enviar-comprobante.dto';
import { RechazarPagoDto } from './dto/rechazar-pago.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  // ============ CLIENTE / PÚBLICO ============
  async enviarComprobante(enviarComprobanteDto: EnviarComprobanteDto) {
    const { turnoId, metodo, monto } = enviarComprobanteDto;

    // Buscar el turno
    const turno = await this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        pago: true,
        complejo: {
          select: {
            requiereSeña: true,
          },
        },
      },
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // Validar que el turno esté en estado RESERVADO
    if (turno.estado !== 'RESERVADO') {
      throw new BadRequestException('El turno no está en estado reservado');
    }

    // Validar que requiera seña
    if (!turno.complejo.requiereSeña) {
      throw new BadRequestException('Este turno no requiere seña');
    }

    // Validar que no tenga ya un pago
    if (turno.pago) {
      throw new ConflictException('Este turno ya tiene un pago registrado');
    }

    // Validar método de pago (seña siempre es transferencia o mercadopago)
    if (metodo === 'EFECTIVO') {
      throw new BadRequestException('La seña no puede pagarse en efectivo');
    }

    // Crear el pago
    const pago = await this.prisma.pago.create({
      data: {
        monto: monto,
        metodo,
        estado: 'ENVIADO',
        fechaEnvio: new Date(),
        turnoId,
      },
    });

    // Actualizar estado del turno
    await this.prisma.turno.update({
      where: { id: turnoId },
      data: {
        estado: 'SENA_ENVIADA',
      },
    });

    return {
      pago,
      message: 'Comprobante registrado. El complejo validará tu pago.',
    };
  }

  async findByTurno(turnoId: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { turnoId },
      select: {
        id: true,
        monto: true,
        metodo: true,
        estado: true,
        fechaEnvio: true,
        fechaValidacion: true,
        motivoRechazo: true,
      },
    });

    if (!pago) {
      throw new NotFoundException('No hay pago registrado para este turno');
    }

    return pago;
  }

  // ============ DUEÑO/EMPLEADO ============
  async findPendientes(userId: string, userRole: string) {
    if (userRole === 'SUPERADMIN') {
      throw new ForbiddenException('Superadmin debe especificar el complejo');
    }

    // Obtener el complejo del usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        complejoId: true,
        complejosPropios: {
          select: { id: true },
        },
      },
    });

    let complejoId: string | null = null;

    if (userRole === 'DUENO' && usuario?.complejosPropios.length) {
      complejoId = usuario.complejosPropios[0].id;
    } else if (usuario?.complejoId) {
      complejoId = usuario.complejoId;
    }

    if (!complejoId) {
      throw new NotFoundException('No tienes un complejo asignado');
    }

    return this.prisma.pago.findMany({
      where: {
        estado: 'ENVIADO',
        turno: {
          complejoId,
        },
      },
      include: {
        turno: {
          select: {
            id: true,
            fecha: true,
            nombreCliente: true,
            apellidoCliente: true,
            telefonoCliente: true,
            cancha: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaEnvio: 'asc',
      },
    });
  }

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

    return this.prisma.pago.findMany({
      where: {
        turno: {
          complejoId,
        },
      },
      include: {
        turno: {
          select: {
            id: true,
            fecha: true,
            nombreCliente: true,
            apellidoCliente: true,
            telefonoCliente: true,
            estado: true,
            cancha: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaEnvio: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        turno: {
          include: {
            cancha: {
              select: {
                nombre: true,
              },
            },
            complejo: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return pago;
  }

  async aprobarPago(id: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        turno: true,
      },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estado !== 'ENVIADO') {
      throw new BadRequestException('Solo se pueden aprobar pagos en estado ENVIADO');
    }

    // Actualizar pago
    await this.prisma.pago.update({
      where: { id },
      data: {
        estado: 'APROBADO',
        fechaValidacion: new Date(),
      },
    });

    // Actualizar turno a CONFIRMADO
    await this.prisma.turno.update({
      where: { id: pago.turnoId },
      data: {
        estado: 'CONFIRMADO',
        fechaConfirmacion: new Date(),
      },
    });

    return { message: 'Pago aprobado correctamente' };
  }

  async rechazarPago(id: string, rechazarPagoDto: RechazarPagoDto) {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include: {
        turno: true,
      },
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estado !== 'ENVIADO') {
      throw new BadRequestException('Solo se pueden rechazar pagos en estado ENVIADO');
    }

    // Actualizar pago
    await this.prisma.pago.update({
      where: { id },
      data: {
        estado: 'RECHAZADO',
        fechaValidacion: new Date(),
        motivoRechazo: rechazarPagoDto.motivoRechazo,
      },
    });

    // Volver el turno a DISPONIBLE
    await this.prisma.turno.update({
      where: { id: pago.turnoId },
      data: {
        estado: 'DISPONIBLE',
        // Limpiar datos del cliente anterior
        nombreCliente: null,
        apellidoCliente: null,
        telefonoCliente: null,
        dni: null,
        usuarioId: null,
        montoSeña: null,
        fechaReserva: null,
        fechaExpiracion: null,
      },
    });

    return { 
      message: 'Pago rechazado. El turno volvió a estar disponible.',
      motivoRechazo: rechazarPagoDto.motivoRechazo,
    };
  }

  // ============ EFECTIVO (DUEÑO/EMPLEADO) ============
  async registrarPagoEfectivo(turnoId: string, monto: number) {
    const turno = await this.prisma.turno.findUnique({
      where: { id: turnoId },
      include: {
        pago: true,
      },
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // Validar que el turno esté confirmado
    if (turno.estado !== 'CONFIRMADO') {
      throw new BadRequestException('Solo se puede registrar pago en efectivo para turnos confirmados');
    }

    // Validar que no tenga ya un pago
    if (turno.pago) {
      throw new ConflictException('Este turno ya tiene un pago registrado');
    }

    // Crear el pago en efectivo
    const pago = await this.prisma.pago.create({
      data: {
        monto: monto,
        metodo: 'EFECTIVO',
        estado: 'APROBADO', // Efectivo se aprueba automáticamente
        fechaEnvio: new Date(),
        fechaValidacion: new Date(),
        turnoId,
      },
    });

    return {
      pago,
      message: 'Pago en efectivo registrado correctamente',
    };
  }
}