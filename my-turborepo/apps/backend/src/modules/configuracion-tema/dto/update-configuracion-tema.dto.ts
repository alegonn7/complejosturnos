import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracionTemaDto } from './create-configuracion-tema.dto.js';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateConfiguracionTemaDto extends PartialType(
  OmitType(CreateConfiguracionTemaDto, ['complejoId'] as const)
) {}