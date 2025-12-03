import { IsString, IsOptional } from 'class-validator';

export class CancelarTurnoDto {
  @IsString()
  @IsOptional()
  motivo?: string;
}