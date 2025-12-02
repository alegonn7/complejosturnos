import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class UpdateCanchaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  precioBase?: number;

  @IsString()
  @IsOptional()
  deporteId?: string;
}