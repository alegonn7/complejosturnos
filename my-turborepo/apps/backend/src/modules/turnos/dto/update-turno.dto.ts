import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateTurnoDto {
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @IsOptional()
  nombreCliente?: string;

  @IsString()
  @IsOptional()
  apellidoCliente?: string;

  @IsString()
  @IsOptional()
  telefonoCliente?: string;

  @IsString()
  @IsOptional()
  dni?: string;
}