import { IsString, IsNotEmpty, IsInt, Min, Max, IsBoolean, IsOptional, Matches, IsDateString } from 'class-validator';

export class CreateTurnoFijoDto {
  @IsString()
  @IsNotEmpty()
  canchaId: string;

  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:mm (ej: 20:00)',
  })
  horaInicio: string;

  @IsInt()
  @Min(15)
  @Max(240)
  duracion: number; // minutos

  @IsBoolean()
  @IsOptional()
  requiereSeña?: boolean;

  @IsDateString()
  @IsOptional()
  fechaInicio?: string; // Si no se envía, se usa la fecha actual

  @IsDateString()
  @IsOptional()
  fechaFin?: string; // Puede ser null (indefinido)
}