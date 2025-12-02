import { IsString, IsNotEmpty } from 'class-validator';

export class AsignarPropietarioDto {
  @IsString()
  @IsNotEmpty()
  propietarioId: string;
}