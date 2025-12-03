import { IsString, IsNotEmpty } from 'class-validator';

export class RechazarPagoDto {
  @IsString()
  @IsNotEmpty()
  motivoRechazo: string;
}