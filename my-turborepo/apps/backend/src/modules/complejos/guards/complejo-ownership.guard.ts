import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ComplejoOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const complejoId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Verificar si es dueño o empleado del complejo
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: complejoId },
      select: {
        propietarioId: true,
        empleados: {
          where: { id: user.id },
          select: { id: true },
        },
      },
    });

    if (!complejo) {
      throw new ForbiddenException('Complejo no encontrado');
    }

    const isDueno = complejo.propietarioId === user.id;
    const isEmpleado = complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre este complejo');
    }

    // Guardar info en request para usarla después
    request.isDueno = isDueno;
    request.isEmpleado = isEmpleado;

    return true;
  }
}