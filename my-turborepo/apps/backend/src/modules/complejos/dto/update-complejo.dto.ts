import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateComplejoDto } from './create-complejo.dto.js';

export class UpdateComplejoDto extends PartialType(
  OmitType(CreateComplejoDto, ['cbu', 'alias', 'titular'] as const)
) {}