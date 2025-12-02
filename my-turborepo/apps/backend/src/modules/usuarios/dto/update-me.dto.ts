import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateMeDto {
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
}