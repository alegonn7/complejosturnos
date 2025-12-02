import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CanchaOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const canchaId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Obtener la cancha con su complejo
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: canchaId },
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
    });

    if (!cancha) {
      throw new ForbiddenException('Cancha no encontrada');
    }

    const isDueno = cancha.complejo.propietarioId === user.id;
    const isEmpleado = cancha.complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre esta cancha');
    }

    // Guardar info en request
    request.isDueno = isDueno;
    request.isEmpleado = isEmpleado;

    return true;
  }
}