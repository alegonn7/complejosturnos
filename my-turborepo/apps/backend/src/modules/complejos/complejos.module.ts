import { Module } from '@nestjs/common';
import { ComplejosService } from './complejos.service';
import { ComplejosController } from './complejos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfiguracionTemaModule } from '../configuracion-tema/configuracion-tema.module.js'; // 👈 IMPORTAR

@Module({
  imports: [PrismaModule, ConfiguracionTemaModule],
  controllers: [ComplejosController],
  providers: [ComplejosService],
  exports: [ComplejosService],
})
export class ComplejosModule {}