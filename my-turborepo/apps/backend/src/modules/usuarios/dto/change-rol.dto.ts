import { IsEnum, IsNotEmpty } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class ChangeRolDto {
  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;
}