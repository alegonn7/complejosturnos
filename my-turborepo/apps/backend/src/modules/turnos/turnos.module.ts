import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service.js';
import { TurnosController } from './turnos.controller.js';
import { TurnosCron } from './turnos.cron.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TurnosController],
  providers: [TurnosService, TurnosCron],
  exports: [TurnosService],
})
export class TurnosModule {}