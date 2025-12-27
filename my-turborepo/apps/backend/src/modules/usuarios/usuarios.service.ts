import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeRolDto } from './dto/change-rol.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  // ============ SUPERADMIN ============
  async create(createUsuarioDto: CreateUsuarioDto) {
    // Verificar teléfono único
    const existingPhone = await this.prisma.usuario.findUnique({
      where: { telefono: createUsuarioDto.telefono },
    });

    if (existingPhone) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    // Verificar email único si fue proporcionado
    if (createUsuarioDto.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: createUsuarioDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar DNI único si fue proporcionado
    if (createUsuarioDto.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: createUsuarioDto.dni },
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Verificar que el complejo existe si fue proporcionado
    if (createUsuarioDto.complejoId) {
      const complejo = await this.prisma.complejo.findUnique({
        where: { id: createUsuarioDto.complejoId },
      });

      if (!complejo) {
        throw new NotFoundException('Complejo no encontrado');
      }
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        password: hashedPassword,
        rol: createUsuarioDto.rol || 'CLIENTE',
      },
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        rol: true,
        complejoId: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        rol: true,
        complejoId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        rol: true,
        complejoId: true,
        createdAt: true,
        updatedAt: true,
        complejo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar teléfono único si se está cambiando
    if (updateUsuarioDto.telefono && updateUsuarioDto.telefono !== usuario.telefono) {
      const existingPhone = await this.prisma.usuario.findUnique({
        where: { telefono: updateUsuarioDto.telefono },
      });

      if (existingPhone) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Verificar email único si se está cambiando
    if (updateUsuarioDto.email && updateUsuarioDto.email !== usuario.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: updateUsuarioDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar DNI único si se está cambiando
    if (updateUsuarioDto.dni && updateUsuarioDto.dni !== usuario.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: updateUsuarioDto.dni },
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Verificar que el complejo existe si se está cambiando
    if (updateUsuarioDto.complejoId) {
      const complejo = await this.prisma.complejo.findUnique({
        where: { id: updateUsuarioDto.complejoId },
      });

      if (!complejo) {
        throw new NotFoundException('Complejo no encontrado');
      }
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        rol: true,
        complejoId: true,
        updatedAt: true,
      },
    });
  }

  async changeRol(id: string, changeRolDto: ChangeRolDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.usuario.update({
      where: { id },
      data: { rol: changeRolDto.rol },
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        rol: true,
      },
    });
  }

  async changePasswordByAdmin(id: string, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async remove(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado correctamente' };
  }

  // ============ DUEÑO ============
  async findEmpleadosByDueno(duenoId: string) {
    // Obtener el complejo del dueño
    const complejo = await this.prisma.complejo.findFirst({
      where: { propietarioId: duenoId },
      select: { id: true },
    });

    if (!complejo) {
      throw new NotFoundException('No tienes un complejo asignado');
    }

    return this.prisma.usuario.findMany({
      where: {
        complejoId: complejo.id,
        rol: 'EMPLEADO',
      },
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateEmpleado(empleadoId: string, updateEmpleadoDto: UpdateEmpleadoDto) {
    const empleado = await this.prisma.usuario.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Verificar teléfono único si se está cambiando
    if (updateEmpleadoDto.telefono && updateEmpleadoDto.telefono !== empleado.telefono) {
      const existingPhone = await this.prisma.usuario.findUnique({
        where: { telefono: updateEmpleadoDto.telefono },
      });

      if (existingPhone) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Verificar email único si se está cambiando
    if (updateEmpleadoDto.email && updateEmpleadoDto.email !== empleado.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: updateEmpleadoDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar DNI único si se está cambiando
    if (updateEmpleadoDto.dni && updateEmpleadoDto.dni !== empleado.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: updateEmpleadoDto.dni },
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    return this.prisma.usuario.update({
      where: { id: empleadoId },
      data: updateEmpleadoDto,
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        updatedAt: true,
      },
    });
  }

  async changeEmpleadoPassword(empleadoId: string, changePasswordDto: ChangePasswordDto) {
    const empleado = await this.prisma.usuario.findUnique({
      where: { id: empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: empleadoId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña del empleado actualizada correctamente' };
  }

  // ============ USUARIO (SELF) ============
  async updateMe(userId: string, updateMeDto: UpdateMeDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar teléfono único si se está cambiando
    if (updateMeDto.telefono && updateMeDto.telefono !== usuario.telefono) {
      const existingPhone = await this.prisma.usuario.findUnique({
        where: { telefono: updateMeDto.telefono },
      });

      if (existingPhone) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    // Verificar email único si se está cambiando
    if (updateMeDto.email && updateMeDto.email !== usuario.email) {
      const existingEmail = await this.prisma.usuario.findUnique({
        where: { email: updateMeDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar DNI único si se está cambiando
    if (updateMeDto.dni && updateMeDto.dni !== usuario.dni) {
      const existingDni = await this.prisma.usuario.findUnique({
        where: { dni: updateMeDto.dni },
      });

      if (existingDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    return this.prisma.usuario.update({
      where: { id: userId },
      data: updateMeDto,
      select: {
        id: true,
        telefono: true,
        nombre: true,
        apellido: true,
        email: true,
        dni: true,
        rol: true,
        updatedAt: true,
      },
    });
  }

  async changeMyPassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario || !usuario.password) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    if (!changePasswordDto.currentPassword) {
      throw new BadRequestException('La contraseña actual es requerida');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      usuario.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}