import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class GenerarTurnosDto {
  @IsString()
  @IsNotEmpty()
  canchaId: string;

  @IsInt()
  @Min(1)
  @Max(90)
  @IsOptional()
  diasAdelante?: number; // Cuántos días hacia adelante generar (default: 30)
}