import { Module } from '@nestjs/common';
import { DeportesService } from './deportes.service';
import { DeportesController } from './deportes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeportesController],
  providers: [DeportesService],
  exports: [DeportesService],
})
export class DeportesModule {}