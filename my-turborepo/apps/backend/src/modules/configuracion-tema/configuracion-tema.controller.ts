import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { ConfiguracionTemaService } from './configuracion-tema.service.js';
import { CreateConfiguracionTemaDto } from './dto/create-configuracion-tema.dto.js';
import { UpdateConfiguracionTemaDto } from './dto/update-configuracion-tema.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('configuracion-tema')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracionTemaController {
  constructor(
    private readonly configuracionTemaService: ConfiguracionTemaService
  ) {}

  @Post()
  @Roles('SUPERADMIN')
  create(@Body() dto: CreateConfiguracionTemaDto) {
    return this.configuracionTemaService.create(dto);
  }

  @Get('complejo/:complejoId')
  @Public()
  findByComplejo(@Param('complejoId') complejoId: string) {
    return this.configuracionTemaService.findByComplejoId(complejoId);
  }

  @Patch('complejo/:complejoId')
  @Roles('SUPERADMIN', 'DUENO')
  update(
    @Param('complejoId') complejoId: string,
    @Body() dto: UpdateConfiguracionTemaDto
  ) {
    return this.configuracionTemaService.update(complejoId, dto);
  }
}