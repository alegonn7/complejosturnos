import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoCancha } from '@prisma/client';

export class UpdateEstadoCanchaDto {
  @IsEnum(EstadoCancha)
  @IsNotEmpty()
  estado: EstadoCancha;
}