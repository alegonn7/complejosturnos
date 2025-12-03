import { Module } from '@nestjs/common';
import { TurnosFijosService } from './turnos-fijos.service.js';
import { TurnosFijosController } from './turnos-fijos.controller.js';
import { TurnosFijosCron } from './turnos-fijos.cron.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TurnosFijosController],
  providers: [TurnosFijosService, TurnosFijosCron],
  exports: [TurnosFijosService],
})
export class TurnosFijosModule {}