import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateDatosBancariosDto {
  @IsString()
  @IsOptional()
  @Matches(/^\d{22}$/, { message: 'CBU debe tener 22 dígitos' })
  cbu?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9.]{6,20}$/, { message: 'Alias debe tener entre 6-20 caracteres' })
  alias?: string;

  @IsString()
  @IsOptional()
  titular?: string;
}