import { Module } from '@nestjs/common';
import { ConfiguracionTemaService } from './configuracion-tema.service.js';
import { ConfiguracionTemaController } from './configuracion-tema.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionTemaController],
  providers: [ConfiguracionTemaService],
  exports: [ConfiguracionTemaService],
})
export class ConfiguracionTemaModule {}