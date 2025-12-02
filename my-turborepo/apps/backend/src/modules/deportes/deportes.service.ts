import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDeporteDto } from './dto/create-deporte.dto.js';
import { UpdateDeporteDto } from './dto/update-deporte.dto.js';

@Injectable()
export class DeportesService {
  constructor(private prisma: PrismaService) {}

  // ============ PÚBLICO ============
  async findByComplejo(complejoId: string) {
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: complejoId },
    });

    if (!complejo) {
      throw new NotFoundException('Complejo no encontrado');
    }

    return this.prisma.deporte.findMany({
      where: { complejoId },
      select: {
        id: true,
        nombre: true,
        icono: true,
        _count: {
          select: { canchas: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  // ============ DUEÑO/EMPLEADO ============
  async create(createDeporteDto: CreateDeporteDto, userId: string, userRole: string) {
    // Verificar que el complejo existe
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: createDeporteDto.complejoId },
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

    // Verificar que no exista un deporte con el mismo nombre en el complejo
    const existingDeporte = await this.prisma.deporte.findFirst({
      where: {
        complejoId: createDeporteDto.complejoId,
        nombre: createDeporteDto.nombre,
      },
    });

    if (existingDeporte) {
      throw new ConflictException('Ya existe un deporte con ese nombre en el complejo');
    }

    return this.prisma.deporte.create({
      data: createDeporteDto,
      select: {
        id: true,
        nombre: true,
        icono: true,
        complejoId: true,
      },
    });
  }

  async findMyDeportes(userId: string, userRole: string) {
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

    return this.prisma.deporte.findMany({
      where: { complejoId },
      select: {
        id: true,
        nombre: true,
        icono: true,
        _count: {
          select: { canchas: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const deporte = await this.prisma.deporte.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        icono: true,
        complejoId: true,
        complejo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: { canchas: true },
        },
      },
    });

    if (!deporte) {
      throw new NotFoundException('Deporte no encontrado');
    }

    return deporte;
  }

  async update(id: string, updateDeporteDto: UpdateDeporteDto) {
    const deporte = await this.prisma.deporte.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        complejoId: true,
      },
    });

    if (!deporte) {
      throw new NotFoundException('Deporte no encontrado');
    }

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (updateDeporteDto.nombre && updateDeporteDto.nombre !== deporte.nombre) {
      const existingDeporte = await this.prisma.deporte.findFirst({
        where: {
          complejoId: deporte.complejoId,
          nombre: updateDeporteDto.nombre,
          id: { not: id },
        },
      });

      if (existingDeporte) {
        throw new ConflictException('Ya existe un deporte con ese nombre en el complejo');
      }
    }

    return this.prisma.deporte.update({
      where: { id },
      data: updateDeporteDto,
      select: {
        id: true,
        nombre: true,
        icono: true,
        complejoId: true,
      },
    });
  }

  async remove(id: string) {
    const deporte = await this.prisma.deporte.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { canchas: true },
        },
      },
    });

    if (!deporte) {
      throw new NotFoundException('Deporte no encontrado');
    }

    // Verificar que no tenga canchas asociadas
    if (deporte._count.canchas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el deporte porque tiene ${deporte._count.canchas} cancha(s) asociada(s)`,
      );
    }

    await this.prisma.deporte.delete({
      where: { id },
    });

    return { message: 'Deporte eliminado correctamente' };
  }
}