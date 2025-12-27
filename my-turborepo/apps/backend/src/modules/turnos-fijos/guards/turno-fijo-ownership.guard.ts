import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TurnoFijoOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const turnoFijoId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Obtener el turno fijo con su cancha y complejo
    const turnoFijo = await this.prisma.turnoFijo.findUnique({
      where: { id: turnoFijoId },
      select: {
        id: true,
        usuarioId: true,
        cancha: {
          select: {
            complejoId: true,
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
        },
      },
    });

    if (!turnoFijo) {
      throw new ForbiddenException('Turno fijo no encontrado');
    }

    // Si es CLIENTE, solo puede acceder a sus propios turnos fijos
    if (user.rol === 'CLIENTE') {
      if (turnoFijo.usuarioId !== user.id) {
        throw new ForbiddenException('No tienes permisos sobre este turno fijo');
      }
      return true;
    }

    // Si es DUENO o EMPLEADO, verificar que sea del complejo
    const isDueno = turnoFijo.cancha.complejo.propietarioId === user.id;
    const isEmpleado = turnoFijo.cancha.complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre este turno fijo');
    }

    // Guardar info en request
    request.isDueno = isDueno;
    request.isEmpleado = isEmpleado;

    return true;
  }
}