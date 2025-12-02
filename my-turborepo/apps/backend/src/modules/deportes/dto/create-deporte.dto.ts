import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateDeporteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsString()
  @IsNotEmpty()
  complejoId: string;
}