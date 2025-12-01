import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ComplejosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.complejo.findMany({
      select: {
        id: true,
        nombre: true,
        direccion: true,
        telefono: true,
        numeroWhatsapp: true,
      },
    });
  }

  async findOne(id: string) {
    const complejo = await this.prisma.complejo.findUnique({
      where: { id },
      include: {
        deportes: {
          select: {
            id: true,
            nombre: true,
            icono: true,
          },
        },
      },
    });

    if (!complejo) {
      throw new NotFoundException('Complejo no encontrado');
    }

    return complejo;
  }

  async getDeportes(complejoId: string) {
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
    });
  }
}