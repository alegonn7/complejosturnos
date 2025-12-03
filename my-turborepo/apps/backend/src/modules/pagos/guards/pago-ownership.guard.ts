import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PagoOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const pagoId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // SUPERADMIN puede todo
    if (user.rol === 'SUPERADMIN') {
      return true;
    }

    // Obtener el pago con su turno y complejo
    const pago = await this.prisma.pago.findUnique({
      where: { id: pagoId },
      select: {
        id: true,
        turno: {
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

    if (!pago) {
      throw new ForbiddenException('Pago no encontrado');
    }

    const isDueno = pago.turno.complejo.propietarioId === user.id;
    const isEmpleado = pago.turno.complejo.empleados.length > 0;

    if (!isDueno && !isEmpleado) {
      throw new ForbiddenException('No tienes permisos sobre este pago');
    }

    // Guardar info en request
    request.isDueno = isDueno;
    request.isEmpleado = isEmpleado;

    return true;
  }
}