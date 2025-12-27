import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplejoDto } from './dto/create-complejo.dto';
import { UpdateComplejoDto } from './dto/update-complejo.dto';
import { UpdateDatosBancariosDto } from './dto/update-datos-bancarios.dto';
import { AsignarPropietarioDto } from './dto/asignar-propietario.dto';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import * as bcrypt from 'bcrypt';
import { ConfiguracionTemaService } from '../configuracion-tema/configuracion-tema.service.js';

@Injectable()
export class ComplejosService {
  constructor(private prisma: PrismaService, private configuracionTemaService: ConfiguracionTemaService) { }

  // ============ PÚBLICO ============
  async findAll() {
    return this.prisma.complejo.findMany({
      select: {
        id: true,
        nombre: true,
        direccion: true,
        telefono: true,
        email: true,
        numeroWhatsapp: true,
        requiereSeña: true,
        porcentajeSeña: true,
        permiteTurnosFijos: true,
      },
    });
  }

  async findOne(id: string) {
    const complejo = await this.prisma.complejo.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        telefono: true,
        email: true,
        numeroWhatsapp: true,
        requiereSeña: true,
        porcentajeSeña: true,
        minutosExpiracion: true,
        permiteTurnosFijos: true,
        cbu: true,
        alias: true,
        titular: true,
      },
    });

    if (!complejo) {
      throw new NotFoundException('Complejo no encontrado');
    }

    return complejo;
  }

  // ============ SUPERADMIN ============
  async create(createComplejoDto: CreateComplejoDto) {
    // Generar slug desde nombre
    const baseSlug = this.generateSlug(createComplejoDto.nombre);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Crear complejo
    const complejo = await this.prisma.complejo.create({
      data: {
        ...createComplejoDto,
        slug,
      },
    });

    // Crear configuración de tema default
    await this.configuracionTemaService.createDefault(
      complejo.id,
      complejo.nombre
    );
    return complejo;
  }
  async updateSlug(id: string, newSlug: string) {
    // Validar formato
    if (!/^[a-z0-9-]+$/.test(newSlug)) {
      throw new BadRequestException(
        'El slug solo puede contener letras minúsculas, números y guiones'
      );
    }

    // Verificar unicidad
    const existing = await this.prisma.complejo.findUnique({
      where: { slug: newSlug },
    });

    if (existing && existing.id !== id) {
      throw new ConflictException('Ya existe un complejo con ese slug');
    }

    return this.prisma.complejo.update({
      where: { id },
      data: { slug: newSlug },
    });
  }

  // HELPERS
  private generateSlug(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.complejo.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async remove(id: string) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id },
  });

  if (!complejo) {
    throw new NotFoundException('Complejo no encontrado');
  }

  await this.prisma.complejo.delete({
    where: { id },
  });

  return { message: 'Complejo eliminado correctamente' };
}

  async asignarPropietario(id: string, asignarPropietarioDto: AsignarPropietarioDto) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id },
  });

  if (!complejo) {
    throw new NotFoundException('Complejo no encontrado');
  }

  const usuario = await this.prisma.usuario.findUnique({
    where: { id: asignarPropietarioDto.propietarioId },
  });

  if (!usuario) {
    throw new NotFoundException('Usuario no encontrado');
  }

  if (usuario.rol !== 'DUENO') {
    throw new ForbiddenException('El usuario debe tener rol DUENO');
  }

  return this.prisma.complejo.update({
    where: { id },
    data: {
      propietarioId: asignarPropietarioDto.propietarioId,
    },
  });
}

  // ============ DUEÑO/EMPLEADO ============
  async findMyComplejo(userId: string, userRole: string) {
  if (userRole === 'SUPERADMIN') {
    throw new ForbiddenException('Superadmin debe usar GET /complejos');
  }

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

  return this.findOne(complejoId);
}

  async update(id: string, updateComplejoDto: UpdateComplejoDto) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id },
  });

  if (!complejo) {
    throw new NotFoundException('Complejo no encontrado');
  }

  return this.prisma.complejo.update({
    where: { id },
    data: updateComplejoDto,
  });
}

  async updateDatosBancarios(id: string, updateDatosBancariosDto: UpdateDatosBancariosDto) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id },
  });

  if (!complejo) {
    throw new NotFoundException('Complejo no encontrado');
  }

  return this.prisma.complejo.update({
    where: { id },
    data: updateDatosBancariosDto,
  });
}

  // ============ EMPLEADOS ============
  async createEmpleado(complejoId: string, createEmpleadoDto: CreateEmpleadoDto) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id: complejoId },
  });

  if (!complejo) {
    throw new NotFoundException('Complejo no encontrado');
  }

  // Verificar si el teléfono ya existe
  const existingUser = await this.prisma.usuario.findUnique({
    where: { telefono: createEmpleadoDto.telefono },
  });

  if (existingUser) {
    throw new ConflictException('El teléfono ya está registrado');
  }

  // Verificar email si fue proporcionado
  if (createEmpleadoDto.email) {
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: createEmpleadoDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  const hashedPassword = await bcrypt.hash(createEmpleadoDto.password, 10);

  return this.prisma.usuario.create({
    data: {
      telefono: createEmpleadoDto.telefono,
      nombre: createEmpleadoDto.nombre,
      apellido: createEmpleadoDto.apellido,
      email: createEmpleadoDto.email,
      dni: createEmpleadoDto.dni,
      password: hashedPassword,
      rol: 'EMPLEADO',
      complejoId,
    },
    select: {
      id: true,
      telefono: true,
      nombre: true,
      apellido: true,
      email: true,
      dni: true,
      rol: true,
    },
  });
}
  async findBySlug(slug: string) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { slug },
    include: {
      deportes: true,
      canchas: {
        include: {
          deporte: true,
        },
      },
      configuracionTema: true, // 👈 INCLUIR CONFIG TEMA
    },
  });

  if (!complejo) {
    throw new NotFoundException(`Complejo con slug "${slug}" no encontrado`);
  }

  return complejo;
}
  async findEmpleados(complejoId: string) {
  const complejo = await this.prisma.complejo.findUnique({
    where: { id: complejoId },
    select: {
      empleados: {
        select: {
          id: true,
          telefono: true,
          nombre: true,
          apellido: true,
          email: true,
          dni: true,
          createdAt: true,
        },
      },
    },
  });

  if (!complejo) {
    throw new NotFoundException('Complejo no encontrado');
  }

  return complejo.empleados;
}

  async removeEmpleado(complejoId: string, empleadoId: string) {
  const empleado = await this.prisma.usuario.findFirst({
    where: {
      id: empleadoId,
      complejoId,
      rol: 'EMPLEADO',
    },
  });

  if (!empleado) {
    throw new NotFoundException('Empleado no encontrado en este complejo');
  }

  await this.prisma.usuario.update({
    where: { id: empleadoId },
    data: { complejoId: null },
  });

  return { message: 'Empleado desvinculado del complejo' };
}

}