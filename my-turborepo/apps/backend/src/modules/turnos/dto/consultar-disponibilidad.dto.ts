import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class ConsultarDisponibilidadDto {
  @IsString()
  @IsNotEmpty()
  canchaId: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string; // YYYY-MM-DD

  @IsDateString()
  @IsOptional()
  fechaFin?: string; // Para consultar rango de fechas
}