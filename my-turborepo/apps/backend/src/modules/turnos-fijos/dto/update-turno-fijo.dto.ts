import { IsString, IsInt, Min, Max, IsBoolean, IsOptional, Matches, IsDateString } from 'class-validator';

export class UpdateTurnoFijoDto {
  @IsString()
  @IsOptional()
  canchaId?: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  diaSemana?: number;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:mm',
  })
  horaInicio?: string;

  @IsInt()
  @Min(15)
  @Max(240)
  @IsOptional()
  duracion?: number;

  @IsBoolean()
  @IsOptional()
  requiereSeña?: boolean;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;
}