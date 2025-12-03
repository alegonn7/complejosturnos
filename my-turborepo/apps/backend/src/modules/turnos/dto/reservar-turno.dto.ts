import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReservarTurnoDto {
  @IsString()
  @IsNotEmpty()
  turnoId: string;

  @IsString()
  @IsNotEmpty()
  telefonoCliente: string;

  @IsString()
  @IsNotEmpty()
  nombreCliente: string;

  @IsString()
  @IsNotEmpty()
  apellidoCliente: string;

  @IsString()
  @IsNotEmpty()
  dni: string;
}