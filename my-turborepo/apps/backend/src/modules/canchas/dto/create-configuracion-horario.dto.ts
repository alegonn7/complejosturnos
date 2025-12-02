import { IsInt, IsString, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreateConfiguracionHorarioDto {
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:mm (ej: 08:00)',
  })
  horaInicio: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaFin debe tener formato HH:mm (ej: 22:00)',
  })
  horaFin: string;

  @IsInt()
  @Min(15)
  @Max(240)
  duracionTurno: number; // minutos

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @Min(1)
  @Max(90)
  @IsOptional()
  diasAdelante?: number;
}