import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum } from 'class-validator';
import { MetodoPago } from '@prisma/client';

export class EnviarComprobanteDto {
  @IsString()
  @IsNotEmpty()
  turnoId: string;

  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodo: MetodoPago;

  @IsNumber()
  @IsPositive()
  monto: number;
}