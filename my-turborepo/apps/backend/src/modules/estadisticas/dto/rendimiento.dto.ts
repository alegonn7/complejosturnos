import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class RendimientoDto {
  @IsString()
  @IsNotEmpty()
  complejoId: string;

  @IsEnum(['semanal', 'mensual', 'anual', 'historico'])
  @IsOptional()
  periodo?: 'semanal' | 'mensual' | 'anual' | 'historico';

  @IsBoolean()
  @IsOptional()
  comparar?: boolean;
}