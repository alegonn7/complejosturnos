import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmpleadoOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const empleadoId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Si no es DUEÑO, no puede continuar
    if (user.rol !== 'DUENO') {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }

    // Verificar que el empleado pertenezca al complejo del dueño
    const empleado = await this.prisma.usuario.findFirst({
      where: {
        id: empleadoId,
        rol: 'EMPLEADO',
        complejoId: {
          not: null,
        },
      },
      select: {
        id: true,
        complejoId: true,
      },
    });

    if (!empleado) {
      throw new ForbiddenException('Empleado no encontrado');
    }

    // Verificar que el dueño sea propietario del complejo donde trabaja el empleado
    const complejo = await this.prisma.complejo.findFirst({
      where: {
        id: empleado.complejoId!,
        propietarioId: user.id,
      },
    });

    if (!complejo) {
      throw new ForbiddenException('No tienes permisos sobre este empleado');
    }

    return true;
  }
}