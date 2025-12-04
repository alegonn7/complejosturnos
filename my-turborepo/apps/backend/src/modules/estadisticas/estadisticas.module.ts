import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}