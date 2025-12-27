import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { TurnosCron } from './turnos.cron';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TurnosController],
  providers: [TurnosService, TurnosCron],
  exports: [TurnosService],
})
export class TurnosModule {}