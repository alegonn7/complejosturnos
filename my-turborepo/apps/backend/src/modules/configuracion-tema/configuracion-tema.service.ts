import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateConfiguracionTemaDto } from './dto/create-configuracion-tema.dto.js';
import { UpdateConfiguracionTemaDto } from './dto/update-configuracion-tema.dto.js';

@Injectable()
export class ConfiguracionTemaService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConfiguracionTemaDto) {
    // Verificar que no exista ya una configuración para este complejo
    const existing = await this.prisma.configuracionTema.findUnique({
      where: { complejoId: dto.complejoId },
    });

    if (existing) {
      throw new ConflictException('Ya existe una configuración de tema para este complejo');
    }

    // Verificar que el complejo existe
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: dto.complejoId },
    });

    if (!complejo) {
      throw new NotFoundException('Complejo no encontrado');
    }

    return this.prisma.configuracionTema.create({
      data: dto,
    });
  }

  async findByComplejoId(complejoId: string) {
    const config = await this.prisma.configuracionTema.findUnique({
      where: { complejoId },
    });

    if (!config) {
      throw new NotFoundException('Configuración de tema no encontrada');
    }

    return config;
  }

  async update(complejoId: string, dto: UpdateConfiguracionTemaDto) {
    // Verificar que existe
    await this.findByComplejoId(complejoId);

    return this.prisma.configuracionTema.update({
      where: { complejoId },
      data: dto,
    });
  }

  async createDefault(complejoId: string, nombreComplejo: string) {
    // Verificar que no exista
    const existing = await this.prisma.configuracionTema.findUnique({
      where: { complejoId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.configuracionTema.create({
      data: {
        complejoId,
        nombreMostrar: nombreComplejo,
        colorPrimario: '#0a0a0a',
        colorSecundario: '#404040',
        colorAccent: '#22c55e',
        colorFondo: '#ffffff',
        fontFamily: 'Inter',
      },
    });
  }
}