import { IsString, IsNotEmpty } from 'class-validator';

export class DashboardDto {
  @IsString()
  @IsNotEmpty()
  complejoId: string;
}