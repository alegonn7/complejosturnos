import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TurnoOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const turnoId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Obtener el turno con su complejo
    const turno = await this.prisma.turno.findUnique({
      where: { id: turnoId },
      select: {
        id: true,
        complejoId: true,
        usuarioId: true,
        complejo: {
          select: {
            propietarioId: true,
            empleados: {
              where: { id: user.id },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!turno) {
      throw new ForbiddenException('Turno no encontrado');
    }

    // Si es CLIENTE, solo puede acceder a sus propios turnos
    if (user.rol === 'CLIENTE') {
      if (turno.usuarioId !== user.id) {
        throw new ForbiddenException('No tienes permisos sobre este turno');
      }
      return true;
    }

    // Si es DUENO o EMPLEADO, verificar que sea del complejo
    const isDueno = turno.complejo.propietarioId === user.id;
    const isEmpleado = turno.complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre este turno');
    }

    // Guardar info en request
    request.isDueno = isDueno;
    request.isEmpleado = isEmpleado;

    return true;
  }
}