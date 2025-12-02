import { IsString, IsBoolean, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';

export class UpdateConfiguracionHorarioDto {
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:mm (ej: 08:00)',
  })
  horaInicio?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaFin debe tener formato HH:mm (ej: 22:00)',
  })
  horaFin?: string;

  @IsInt()
  @Min(15)
  @Max(240)
  @IsOptional()
  duracionTurno?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @Min(1)
  @Max(90)
  @IsOptional()
  diasAdelante?: number;
}