import { IsString, IsOptional } from 'class-validator';

export class UpdateDeporteDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  icono?: string;
}