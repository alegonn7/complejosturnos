import { Module } from '@nestjs/common';
import { DeportesService } from './deportes.service.js';
import { DeportesController } from './deportes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DeportesController],
  providers: [DeportesService],
  exports: [DeportesService],
})
export class DeportesModule {}