import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCanchaDto } from './dto/create-cancha.dto.js';
import { UpdateCanchaDto } from './dto/update-cancha.dto.js';
import { UpdateEstadoCanchaDto } from './dto/update-estado-cancha.dto.js';
import { CreateConfiguracionHorarioDto } from './dto/create-configuracion-horario.dto.js';
import { UpdateConfiguracionHorarioDto } from './dto/update-configuracion-horario.dto.js';
import { CreatePrecioDinamicoDto } from './dto/create-precio-dinamico.dto.js';
import { UpdatePrecioDinamicoDto } from './dto/update-precio-dinamico.dto.js';
import { Prisma } from '@canchas/database';

@Injectable()
export class CanchasService {
  constructor(private prisma: PrismaService) {}

  // ============ PÚBLICO ============
  async findByComplejo(complejoId: string) {
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: complejoId },
    });

    if (!complejo) {
      throw new NotFoundException('Complejo no encontrado');
    }

    return this.prisma.cancha.findMany({
      where: { 
        complejoId,
        estado: 'HABILITADA',
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        precioBase: true,
        deporte: {
          select: {
            id: true,
            nombre: true,
            icono: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        precioBase: true,
        complejoId: true,
        complejo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        deporte: {
          select: {
            id: true,
            nombre: true,
            icono: true,
          },
        },
        configuracionHorarios: {
          select: {
            id: true,
            diaSemana: true,
            horaInicio: true,
            horaFin: true,
            duracionTurno: true,
            activo: true,
            diasAdelante: true,
          },
          orderBy: { diaSemana: 'asc' },
        },
        preciosDinamicos: {
          select: {
            id: true,
            diaSemana: true,
            porcentaje: true,
            descripcion: true,
          },
          orderBy: { diaSemana: 'asc' },
        },
      },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    return cancha;
  }

  // ============ DUEÑO/EMPLEADO ============
  async create(createCanchaDto: CreateCanchaDto, userId: string, userRole: string) {
    // Verificar que el complejo existe
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: createCanchaDto.complejoId },
      select: {
        id: true,
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

    // Verificar permisos (solo si no es SUPERADMIN)
    if (userRole !== 'SUPERADMIN') {
      const isDueno = complejo.propietarioId === userId;
      const isEmpleado = complejo.empleados.length > 0;

      if (!isDueno && !isEmpleado) {
        throw new ForbiddenException('No tienes permisos sobre este complejo');
      }
    }

    // Verificar que el deporte existe y pertenece al mismo complejo
    const deporte = await this.prisma.deporte.findUnique({
      where: { id: createCanchaDto.deporteId },
    });

    if (!deporte) {
      throw new NotFoundException('Deporte no encontrado');
    }

    if (deporte.complejoId !== createCanchaDto.complejoId) {
      throw new BadRequestException('El deporte no pertenece al complejo especificado');
    }

    // Verificar que no exista una cancha con el mismo nombre en el complejo
    const existingCancha = await this.prisma.cancha.findFirst({
      where: {
        complejoId: createCanchaDto.complejoId,
        nombre: createCanchaDto.nombre,
      },
    });

    if (existingCancha) {
      throw new ConflictException('Ya existe una cancha con ese nombre en el complejo');
    }

    return this.prisma.cancha.create({
      data: {
        ...createCanchaDto,
        precioBase: new Prisma.Decimal(createCanchaDto.precioBase),
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        precioBase: true,
        complejoId: true,
        deporte: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async findMyCanchas(userId: string, userRole: string) {
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

    return this.prisma.cancha.findMany({
      where: { complejoId },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        precioBase: true,
        deporte: {
          select: {
            id: true,
            nombre: true,
            icono: true,
          },
        },
        _count: {
          select: {
            configuracionHorarios: true,
            preciosDinamicos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async update(id: string, updateCanchaDto: UpdateCanchaDto) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        complejoId: true,
      },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
    if (updateCanchaDto.nombre && updateCanchaDto.nombre !== cancha.nombre) {
      const existingCancha = await this.prisma.cancha.findFirst({
        where: {
          complejoId: cancha.complejoId,
          nombre: updateCanchaDto.nombre,
          id: { not: id },
        },
      });

      if (existingCancha) {
        throw new ConflictException('Ya existe una cancha con ese nombre en el complejo');
      }
    }

    // Si se está cambiando el deporte, verificar que exista y pertenezca al mismo complejo
    if (updateCanchaDto.deporteId) {
      const deporte = await this.prisma.deporte.findUnique({
        where: { id: updateCanchaDto.deporteId },
      });

      if (!deporte) {
        throw new NotFoundException('Deporte no encontrado');
      }

      if (deporte.complejoId !== cancha.complejoId) {
        throw new BadRequestException('El deporte no pertenece al mismo complejo');
      }
    }

    const dataToUpdate: any = { ...updateCanchaDto };
    if (updateCanchaDto.precioBase !== undefined) {
      dataToUpdate.precioBase = new Prisma.Decimal(updateCanchaDto.precioBase);
    }

    return this.prisma.cancha.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        precioBase: true,
        deporte: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async updateEstado(id: string, updateEstadoCanchaDto: UpdateEstadoCanchaDto) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    return this.prisma.cancha.update({
      where: { id },
      data: { estado: updateEstadoCanchaDto.estado },
      select: {
        id: true,
        nombre: true,
        estado: true,
      },
    });
  }

  async remove(id: string) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            turnos: true,
            turnosFijos: true,
          },
        },
      },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Verificar que no tenga turnos o turnos fijos asociados
    if (cancha._count.turnos > 0 || cancha._count.turnosFijos > 0) {
      throw new BadRequestException(
        'No se puede eliminar la cancha porque tiene turnos asociados',
      );
    }

    await this.prisma.cancha.delete({
      where: { id },
    });

    return { message: 'Cancha eliminada correctamente' };
  }

  // ============ CONFIGURACIÓN DE HORARIOS ============
  async createHorario(canchaId: string, createHorarioDto: CreateConfiguracionHorarioDto) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Verificar que no exista ya una configuración para ese día
    const existingConfig = await this.prisma.configuracionHorarioCancha.findUnique({
      where: {
        canchaId_diaSemana: {
          canchaId,
          diaSemana: createHorarioDto.diaSemana,
        },
      },
    });

    if (existingConfig) {
      throw new ConflictException(`Ya existe una configuración para este día de la semana`);
    }

    // Validar que horaFin sea mayor que horaInicio
    if (createHorarioDto.horaInicio >= createHorarioDto.horaFin) {
      throw new BadRequestException('La hora de fin debe ser mayor que la hora de inicio');
    }

    return this.prisma.configuracionHorarioCancha.create({
      data: {
        ...createHorarioDto,
        canchaId,
      },
      select: {
        id: true,
        diaSemana: true,
        horaInicio: true,
        horaFin: true,
        duracionTurno: true,
        activo: true,
        diasAdelante: true,
      },
    });
  }

  async findHorarios(canchaId: string) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    return this.prisma.configuracionHorarioCancha.findMany({
      where: { canchaId },
      select: {
        id: true,
        diaSemana: true,
        horaInicio: true,
        horaFin: true,
        duracionTurno: true,
        activo: true,
        diasAdelante: true,
        ultimaGeneracion: true,
      },
      orderBy: { diaSemana: 'asc' },
    });
  }

  async updateHorario(horarioId: string, updateHorarioDto: UpdateConfiguracionHorarioDto) {
    const horario = await this.prisma.configuracionHorarioCancha.findUnique({
      where: { id: horarioId },
    });

    if (!horario) {
      throw new NotFoundException('Configuración de horario no encontrada');
    }

    // Validar que horaFin sea mayor que horaInicio si ambos están presentes
    const horaInicio = updateHorarioDto.horaInicio || horario.horaInicio;
    const horaFin = updateHorarioDto.horaFin || horario.horaFin;

    if (horaInicio >= horaFin) {
      throw new BadRequestException('La hora de fin debe ser mayor que la hora de inicio');
    }

    return this.prisma.configuracionHorarioCancha.update({
      where: { id: horarioId },
      data: updateHorarioDto,
      select: {
        id: true,
        diaSemana: true,
        horaInicio: true,
        horaFin: true,
        duracionTurno: true,
        activo: true,
        diasAdelante: true,
      },
    });
  }

  async removeHorario(horarioId: string) {
    const horario = await this.prisma.configuracionHorarioCancha.findUnique({
      where: { id: horarioId },
    });

    if (!horario) {
      throw new NotFoundException('Configuración de horario no encontrada');
    }

    await this.prisma.configuracionHorarioCancha.delete({
      where: { id: horarioId },
    });

    return { message: 'Configuración de horario eliminada correctamente' };
  }

  // ============ PRECIOS DINÁMICOS ============
  async createPrecio(canchaId: string, createPrecioDto: CreatePrecioDinamicoDto) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Verificar que no exista ya un precio para ese día
    const existingPrecio = await this.prisma.precioDinamico.findUnique({
      where: {
        canchaId_diaSemana: {
          canchaId,
          diaSemana: createPrecioDto.diaSemana,
        },
      },
    });

    if (existingPrecio) {
      throw new ConflictException(`Ya existe un precio dinámico para este día de la semana`);
    }

    return this.prisma.precioDinamico.create({
      data: {
        ...createPrecioDto,
        canchaId,
      },
      select: {
        id: true,
        diaSemana: true,
        porcentaje: true,
        descripcion: true,
      },
    });
  }

  async findPrecios(canchaId: string) {
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
    });

    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    return this.prisma.precioDinamico.findMany({
      where: { canchaId },
      select: {
        id: true,
        diaSemana: true,
        porcentaje: true,
        descripcion: true,
      },
      orderBy: { diaSemana: 'asc' },
    });
  }

  async updatePrecio(precioId: string, updatePrecioDto: UpdatePrecioDinamicoDto) {
    const precio = await this.prisma.precioDinamico.findUnique({
      where: { id: precioId },
    });

    if (!precio) {
      throw new NotFoundException('Precio dinámico no encontrado');
    }

    return this.prisma.precioDinamico.update({
      where: { id: precioId },
      data: updatePrecioDto,
      select: {
        id: true,
        diaSemana: true,
        porcentaje: true,
        descripcion: true,
      },
    });
  }

  async removePrecio(precioId: string) {
    const precio = await this.prisma.precioDinamico.findUnique({
      where: { id: precioId },
    });

    if (!precio) {
      throw new NotFoundException('Precio dinámico no encontrado');
    }

    await this.prisma.precioDinamico.delete({
      where: { id: precioId },
    });

    return { message: 'Precio dinámico eliminado correctamente' };
  }
}