import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol?: RolUsuario;

  @IsString()
  @IsOptional()
  complejoId?: string;
}