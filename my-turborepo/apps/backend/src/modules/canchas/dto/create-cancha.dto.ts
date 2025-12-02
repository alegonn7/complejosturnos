import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPositive, IsEnum } from 'class-validator';
import { EstadoCancha } from '@prisma/client';

export class CreateCanchaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  precioBase: number;

  @IsString()
  @IsNotEmpty()
  complejoId: string;

  @IsString()
  @IsNotEmpty()
  deporteId: string;

  @IsEnum(EstadoCancha)
  @IsOptional()
  estado?: EstadoCancha;
}