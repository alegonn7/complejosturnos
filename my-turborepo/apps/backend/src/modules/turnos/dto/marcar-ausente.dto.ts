import { IsString, IsOptional } from 'class-validator';

export class MarcarAusenteDto {
  @IsString()
  @IsOptional()
  observacion?: string;
}