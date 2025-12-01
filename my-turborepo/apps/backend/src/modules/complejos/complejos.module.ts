import { Module } from '@nestjs/common';
import { ComplejosController } from './complejos.controller.js';
import { ComplejosService } from './complejos.service.js';

@Module({
  controllers: [ComplejosController],
  providers: [ComplejosService],
})
export class ComplejosModule {}