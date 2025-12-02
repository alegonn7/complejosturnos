import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreatePrecioDinamicoDto {
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @IsInt()
  @Min(1)
  @Max(500)
  porcentaje: number; // ej: 120 = +20%, 80 = -20%

  @IsString()
  @IsOptional()
  descripcion?: string;
}