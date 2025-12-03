import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerarTurnosDto } from './dto/generar-turnos.dto.js';
import { ReservarTurnoDto } from './dto/reservar-turno.dto.js';
import { UpdateTurnoDto } from './dto/update-turno.dto.js';
import { CancelarTurnoDto } from './dto/cancelar-turno.dto.js';
import { MarcarAusenteDto } from './dto/marcar-ausente.dto.js';
import { ConsultarDisponibilidadDto } from './dto/consultar-disponibilidad.dto.js';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TurnosService {
    // Anti-bot: almacenamiento temporal en memoria
    private reservasPorTelefono: Map<string, number[]> = new Map();
    private readonly MAX_RESERVAS_POR_PERIODO = 5;
    private readonly PERIODO_MINUTOS = 10;

    constructor(private prisma: PrismaService) { }

    // ============ GENERACIÓN DE TURNOS ============
    async generarTurnos(generarTurnosDto: GenerarTurnosDto, userId: string, userRole: string) {
        const { canchaId, diasAdelante = 30 } = generarTurnosDto;

        // Verificar que la cancha existe
        const cancha = await this.prisma.cancha.findUnique({
            where: { id: canchaId },
            include: {
                complejo: {
                    select: {
                        id: true,
                        propietarioId: true,
                        empleados: {
                            where: { id: userId },
                            select: { id: true },
                        },
                    },
                },
                configuracionHorarios: {
                    where: { activo: true },
                },
                preciosDinamicos: true,
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

        if (cancha.configuracionHorarios.length === 0) {
            throw new BadRequestException('La cancha no tiene configuración de horarios');
        }

        // Generar turnos
        const turnosGenerados = [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        for (let i = 0; i < diasAdelante; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() + i);
            const diaSemana = fecha.getDay();

            // Buscar configuración para este día
            const config = cancha.configuracionHorarios.find(c => c.diaSemana === diaSemana);

            if (!config) continue;

            // Buscar precio dinámico para este día
            const precioDinamico = cancha.preciosDinamicos.find(p => p.diaSemana === diaSemana);
            const porcentaje = precioDinamico ? precioDinamico.porcentaje : 100;
            const precioTotal = Number(cancha.precioBase) * (porcentaje / 100);

            // Generar turnos para este día
            const [horaInicioHH, horaInicioMM] = config.horaInicio.split(':').map(Number);
            const [horaFinHH, horaFinMM] = config.horaFin.split(':').map(Number);

            let horaActual = new Date(fecha);
            horaActual.setHours(horaInicioHH, horaInicioMM, 0, 0);

            const horaFin = new Date(fecha);
            horaFin.setHours(horaFinHH, horaFinMM, 0, 0);

            while (horaActual < horaFin) {
                const horaSiguiente = new Date(horaActual);
                horaSiguiente.setMinutes(horaSiguiente.getMinutes() + config.duracionTurno);

                if (horaSiguiente > horaFin) break;

                // Verificar si ya existe un turno en esta fecha/hora
                const turnoExistente = await this.prisma.turno.findFirst({
                    where: {
                        canchaId,
                        fecha: horaActual,
                    },
                });

                if (!turnoExistente) {
                    turnosGenerados.push({
                        fecha: new Date(horaActual),
                        duracion: config.duracionTurno,
                        precioTotal: new Decimal(precioTotal.toFixed(2)),
                        estado: 'DISPONIBLE' as const,
                        canchaId,
                        complejoId: cancha.complejoId,
                    });
                }

                horaActual = horaSiguiente;
            }
        }

        // Crear turnos en batch
        if (turnosGenerados.length > 0) {
            await this.prisma.turno.createMany({
                data: turnosGenerados,
                skipDuplicates: true,
            });
        }

        return {
            message: `Se generaron ${turnosGenerados.length} turnos correctamente`,
            turnosGenerados: turnosGenerados.length,
        };
    }

    // ============ CONSULTAR DISPONIBILIDAD (PÚBLICO) ============
    async consultarDisponibilidad(consultarDisponibilidadDto: ConsultarDisponibilidadDto) {
        const { canchaId, fecha, fechaFin } = consultarDisponibilidadDto;

        // Verificar que la cancha existe
        const cancha = await this.prisma.cancha.findUnique({
            where: { id: canchaId },
            select: {
                id: true,
                nombre: true,
                estado: true,
            },
        });

        if (!cancha) {
            throw new NotFoundException('Cancha no encontrada');
        }

        if (cancha.estado !== 'HABILITADA') {
            throw new BadRequestException('La cancha no está habilitada');
        }

        // Construir filtro de fechas
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);

        const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date(fecha);
        fechaFinDate.setHours(23, 59, 59, 999);

        // Buscar turnos disponibles
        const turnos = await this.prisma.turno.findMany({
            where: {
                canchaId,
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFinDate,
                },
                estado: 'DISPONIBLE',
            },
            select: {
                id: true,
                fecha: true,
                duracion: true,
                precioTotal: true,
            },
            orderBy: {
                fecha: 'asc',
            },
        });

        return {
            cancha: {
                id: cancha.id,
                nombre: cancha.nombre,
            },
            turnos,
        };
    }

    // ============ RESERVAR TURNO (PÚBLICO) ============
    async reservarTurno(reservarTurnoDto: ReservarTurnoDto, userId?: string) {
        const { turnoId, telefonoCliente, nombreCliente, apellidoCliente, dni } = reservarTurnoDto;

        // Anti-bot: verificar límite de reservas por teléfono
        this.verificarLimiteReservas(telefonoCliente);

        // Verificar límite de turnos activos por teléfono
        const turnosActivos = await this.prisma.turno.count({
            where: {
                telefonoCliente,
                estado: {
                    in: ['RESERVADO', 'SENA_ENVIADA', 'CONFIRMADO'],
                },
            },
        });

        if (turnosActivos >= 3) {
            throw new BadRequestException(
                'Ya tienes 3 turnos activos. Cancela o completa alguno antes de reservar otro.',
            );
        }

        // Buscar el turno
        const turno = await this.prisma.turno.findUnique({
            where: { id: turnoId },
            include: {
                complejo: {
                    select: {
                        requiereSeña: true,
                        porcentajeSeña: true,
                        minutosExpiracion: true,
                    },
                },
            },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        if (turno.estado !== 'DISPONIBLE') {
            throw new ConflictException('El turno ya no está disponible');
        }

        // Verificar que el turno no esté en el pasado
        if (turno.fecha < new Date()) {
            throw new BadRequestException('No se puede reservar un turno en el pasado');
        }

        // Calcular datos según si requiere seña
        const requiereSeña = turno.complejo.requiereSeña;
        const nuevoEstado = requiereSeña ? 'RESERVADO' : 'CONFIRMADO';
        const montoSeña = requiereSeña
            ? Number(turno.precioTotal) * (turno.complejo.porcentajeSeña / 100)
            : null;

        const fechaExpiracion = requiereSeña
            ? new Date(Date.now() + turno.complejo.minutosExpiracion * 60 * 1000)
            : null;

        // Actualizar turno
        const turnoActualizado = await this.prisma.turno.update({
            where: { id: turnoId },
            data: {
                estado: nuevoEstado,
                telefonoCliente,
                nombreCliente,
                apellidoCliente,
                dni,
                usuarioId: userId || null,
                montoSeña: montoSeña ? new Decimal(montoSeña.toFixed(2)) : null,
                fechaReserva: new Date(),
                fechaExpiracion,
                fechaConfirmacion: requiereSeña ? null : new Date(),
            },
            include: {
                cancha: {
                    select: {
                        nombre: true,
                    },
                },
                complejo: {
                    select: {
                        nombre: true,
                        cbu: true,
                        alias: true,
                        titular: true,
                    },
                },
            },
        });

        // Registrar reserva para anti-bot
        this.registrarReserva(telefonoCliente);

        return {
            turno: turnoActualizado,
            requiereSeña,
            montoSeña,
            fechaExpiracion,
        };
    }

    // ============ CANCELAR TURNO ============
    async cancelarTurno(turnoId: string, cancelarTurnoDto: CancelarTurnoDto, userId?: string, userRole?: string) {
        const turno = await this.prisma.turno.findUnique({
            where: { id: turnoId },
            select: {
                id: true,
                estado: true,
                usuarioId: true,
                telefonoCliente: true,
                complejoId: true,
            },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        // Verificar permisos si es un cliente
        if (userRole === 'CLIENTE' && turno.usuarioId !== userId) {
            throw new ForbiddenException('No tienes permisos para cancelar este turno');
        }

        // Verificar que el turno se pueda cancelar
        if (!['RESERVADO', 'SENA_ENVIADA', 'CONFIRMADO'].includes(turno.estado)) {
            throw new BadRequestException('El turno no se puede cancelar en su estado actual');
        }

        // Cancelar turno
        await this.prisma.turno.update({
            where: { id: turnoId },
            data: {
                estado: 'CANCELADO',
            },
        });

        return { message: 'Turno cancelado correctamente' };
    }

    // ============ VER MIS TURNOS (CLIENTE) ============
    async findMyTurnos(userId: string) {
        return this.prisma.turno.findMany({
            where: {
                usuarioId: userId,
                estado: {
                    in: ['RESERVADO', 'SENA_ENVIADA', 'CONFIRMADO'],
                },
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
                    },
                },
                complejo: {
                    select: {
                        nombre: true,
                        direccion: true,
                    },
                },
            },
            orderBy: {
                fecha: 'asc',
            },
        });
    }

    // ============ VER TURNOS DEL COMPLEJO (DUEÑO/EMPLEADO) ============
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

        return this.prisma.turno.findMany({
            where: { complejoId },
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
        });
    }

    // ============ VER TURNOS DE UNA CANCHA ============
    async findByCancha(canchaId: string, userId: string, userRole: string) {
        const cancha = await this.prisma.cancha.findUnique({
            where: { id: canchaId },
            select: {
                id: true,
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

        return this.prisma.turno.findMany({
            where: { canchaId },
            orderBy: {
                fecha: 'asc',
            },
        });
    }

    // ============ VER DETALLE DE UN TURNO ============
    async findOne(id: string) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
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
                    },
                },
                complejo: {
                    select: {
                        nombre: true,
                        direccion: true,
                        telefono: true,
                        cbu: true,
                        alias: true,
                        titular: true,
                    },
                },
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        telefono: true,
                    },
                },
                pago: true,
            },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        return turno;
    }

    // ============ ACTUALIZAR TURNO (DUEÑO/EMPLEADO) ============
    async update(id: string, updateTurnoDto: UpdateTurnoDto) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        const dataToUpdate: any = {};

        if (updateTurnoDto.fecha) {
            dataToUpdate.fecha = new Date(updateTurnoDto.fecha);
        }

        if (updateTurnoDto.nombreCliente) {
            dataToUpdate.nombreCliente = updateTurnoDto.nombreCliente;
        }

        if (updateTurnoDto.apellidoCliente) {
            dataToUpdate.apellidoCliente = updateTurnoDto.apellidoCliente;
        }

        if (updateTurnoDto.telefonoCliente) {
            dataToUpdate.telefonoCliente = updateTurnoDto.telefonoCliente;
        }

        if (updateTurnoDto.dni) {
            dataToUpdate.dni = updateTurnoDto.dni;
        }

        return this.prisma.turno.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    // ============ CONFIRMAR TURNO (DUEÑO/EMPLEADO) ============
    async confirmarTurno(id: string) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        if (turno.estado !== 'SENA_ENVIADA') {
            throw new BadRequestException('Solo se pueden confirmar turnos con seña enviada');
        }

        return this.prisma.turno.update({
            where: { id },
            data: {
                estado: 'CONFIRMADO',
                fechaConfirmacion: new Date(),
            },
        });
    }

    // ============ MARCAR AUSENTE ============
    async marcarAusente(id: string, marcarAusenteDto: MarcarAusenteDto) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        if (turno.estado !== 'CONFIRMADO') {
            throw new BadRequestException('Solo se pueden marcar como ausente turnos confirmados');
        }

        // Verificar que el turno ya pasó
        if (turno.fecha > new Date()) {
            throw new BadRequestException('No se puede marcar como ausente un turno futuro');
        }

        return this.prisma.turno.update({
            where: { id },
            data: {
                estado: 'AUSENTE',
            },
        });
    }
    // ============ CANCELAR TURNO INDIVIDUAL DE TURNO FIJO ============
    async cancelarTurnoIndividual(turnoId: string, userId: string, userRole: string) {
        const turno = await this.prisma.turno.findUnique({
            where: { id: turnoId },
            select: {
                id: true,
                estado: true,
                usuarioId: true,
                turnoFijoId: true,
                fecha: true,
            },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        // Verificar que pertenezca a un turno fijo
        if (!turno.turnoFijoId) {
            throw new BadRequestException('Este turno no pertenece a un turno fijo');
        }

        // Verificar permisos
        if (userRole === 'CLIENTE' && turno.usuarioId !== userId) {
            throw new ForbiddenException('No tienes permisos para cancelar este turno');
        }

        // Verificar que el turno se pueda cancelar
        if (!['RESERVADO', 'SENA_ENVIADA', 'CONFIRMADO'].includes(turno.estado)) {
            throw new BadRequestException('El turno no se puede cancelar en su estado actual');
        }

        // Verificar que sea un turno futuro
        if (turno.fecha < new Date()) {
            throw new BadRequestException('No se puede cancelar un turno pasado');
        }

        // Cancelar turno y volver a DISPONIBLE
        await this.prisma.turno.update({
            where: { id: turnoId },
            data: {
                estado: 'DISPONIBLE',
                // Limpiar datos pero mantener turnoFijoId para auditoría
                nombreCliente: null,
                apellidoCliente: null,
                telefonoCliente: null,
                dni: null,
                usuarioId: null,
                montoSeña: null,
                fechaReserva: null,
                fechaExpiracion: null,
                fechaConfirmacion: null,
            },
        });

        return {
            message: 'Turno individual cancelado. El turno fijo sigue activo y se volverá a generar.',
        };
    }
    // ============ BLOQUEAR TURNO ============
    async bloquearTurno(id: string) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        if (turno.estado !== 'DISPONIBLE') {
            throw new BadRequestException('Solo se pueden bloquear turnos disponibles');
        }

        return this.prisma.turno.update({
            where: { id },
            data: {
                estado: 'BLOQUEADO',
            },
        });
    }

    // ============ ELIMINAR TURNO ============
    async remove(id: string) {
        const turno = await this.prisma.turno.findUnique({
            where: { id },
        });

        if (!turno) {
            throw new NotFoundException('Turno no encontrado');
        }

        await this.prisma.turno.delete({
            where: { id },
        });

        return { message: 'Turno eliminado correctamente' };
    }

    // ============ ANTI-BOT HELPERS ============
    private verificarLimiteReservas(telefono: string) {
        const ahora = Date.now();
        const limiteInferior = ahora - this.PERIODO_MINUTOS * 60 * 1000;

        // Obtener reservas del teléfono
        const reservas = this.reservasPorTelefono.get(telefono) || [];

        // Filtrar solo las reservas dentro del periodo
        const reservasRecientes = reservas.filter(timestamp => timestamp > limiteInferior);

        if (reservasRecientes.length >= this.MAX_RESERVAS_POR_PERIODO) {
            throw new BadRequestException(
                `Has alcanzado el límite de ${this.MAX_RESERVAS_POR_PERIODO} reservas en ${this.PERIODO_MINUTOS} minutos. Intenta más tarde.`,
            );
        }

        // Actualizar el mapa
        this.reservasPorTelefono.set(telefono, reservasRecientes);
    }

    private registrarReserva(telefono: string) {
        const reservas = this.reservasPorTelefono.get(telefono) || [];
        reservas.push(Date.now());
        this.reservasPorTelefono.set(telefono, reservas);
    }

    // ============ EXPIRAR TURNOS (CRON JOB) ============
    async expirarTurnosVencidos() {
        const ahora = new Date();

        const turnosExpirados = await this.prisma.turno.updateMany({
            where: {
                estado: 'RESERVADO',
                fechaExpiracion: {
                    lt: ahora,
                },
            },
            data: {
                estado: 'EXPIRADO',
            },
        });

        return {
            message: `Se expiraron ${turnosExpirados.count} turnos`,
            count: turnosExpirados.count,
        };
    }
}