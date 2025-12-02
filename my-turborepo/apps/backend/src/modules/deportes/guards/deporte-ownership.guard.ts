import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DeporteOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const deporteId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Obtener el deporte con su complejo
    const deporte = await this.prisma.deporte.findUnique({
      where: { id: deporteId },
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

    if (!deporte) {
      throw new ForbiddenException('Deporte no encontrado');
    }

    const isDueno = deporte.complejo.propietarioId === user.id;
    const isEmpleado = deporte.complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre este deporte');
    }

    // Guardar info en request
    request.isDueno = isDueno;
    request.isEmpleado = isEmpleado;

    return true;
  }
}