import { Module } from '@nestjs/common';
import { ComplejosService } from './complejos.service.js';
import { ComplejosController } from './complejos.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ComplejosController],
  providers: [ComplejosService],
  exports: [ComplejosService],
})
export class ComplejosModule {}