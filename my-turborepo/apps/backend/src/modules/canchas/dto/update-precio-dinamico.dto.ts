import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdatePrecioDinamicoDto {
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  porcentaje?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}