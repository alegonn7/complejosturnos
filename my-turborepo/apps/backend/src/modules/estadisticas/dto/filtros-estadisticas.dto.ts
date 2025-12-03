import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class FiltrosEstadisticasDto {
  @IsString()
  @IsNotEmpty()
  complejoId: string;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsString()
  @IsOptional()
  canchaId?: string;

  @IsString()
  @IsOptional()
  deporteId?: string;

  @IsEnum(['dia', 'semana', 'mes'])
  @IsOptional()
  agruparPor?: 'dia' | 'semana' | 'mes';
}