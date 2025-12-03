import { Module } from '@nestjs/common';
import { CanchasService } from './canchas.service.js';
import { CanchasController } from './canchas.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CanchasController],
  providers: [CanchasService],
  exports: [CanchasService],
})
export class CanchasModule {} 