import { IsString, IsEmail, IsOptional, IsBoolean, IsInt, Min, Max, Matches, IsNotEmpty } from 'class-validator';

export class CreateComplejoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{22}$/, { message: 'CBU debe tener 22 dígitos' })
  cbu?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9.]{6,20}$/, { message: 'Alias debe tener entre 6-20 caracteres (solo minúsculas, números y puntos)' })
  alias?: string;

  @IsString()
  @IsOptional()
  titular?: string;

  @IsBoolean()
  @IsOptional()
  requiereSeña?: boolean;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  porcentajeSeña?: number;

  @IsInt()
  @Min(5)
  @IsOptional()
  minutosExpiracion?: number;

  @IsBoolean()
  @IsOptional()
  permiteTurnosFijos?: boolean;

  @IsString()
  @IsOptional()
  numeroWhatsapp?: string;
}