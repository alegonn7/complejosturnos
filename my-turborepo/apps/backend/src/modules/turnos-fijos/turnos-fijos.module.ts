import { Module } from '@nestjs/common';
import { TurnosFijosService } from './turnos-fijos.service';
import { TurnosFijosController } from './turnos-fijos.controller';
import { TurnosFijosCron } from './turnos-fijos.cron';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TurnosFijosController],
  providers: [TurnosFijosService, TurnosFijosCron],
  exports: [TurnosFijosService],
})
export class TurnosFijosModule {}