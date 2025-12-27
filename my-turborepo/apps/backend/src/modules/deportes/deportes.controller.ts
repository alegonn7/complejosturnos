import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { DeportesService } from './deportes.service';
import { CreateDeporteDto } from './dto/create-deporte.dto';
import { UpdateDeporteDto } from './dto/update-deporte.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DeporteOwnershipGuard } from './guards/deporte-ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('deportes')
@UseGuards(RolesGuard)
export class DeportesController {
  constructor(private readonly deportesService: DeportesService) {}

  // ============ PÚBLICO ============
  @Public()
  @Get('complejo/:complejoId')
  findByComplejo(@Param('complejoId') complejoId: string) {
    return this.deportesService.findByComplejo(complejoId);
  }

  // ============ DUEÑO/EMPLEADO/SUPERADMIN ============
  @Post()
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  create(@Body() createDeporteDto: CreateDeporteDto, @CurrentUser() user: any) {
    return this.deportesService.create(createDeporteDto, user.id, user.rol);
  }

  @Get()
  @Roles('DUENO', 'EMPLEADO')
  findMyDeportes(@CurrentUser() user: any) {
    return this.deportesService.findMyDeportes(user.id, user.rol);
  }

  @Get(':id')
  @UseGuards(DeporteOwnershipGuard)
  findOne(@Param('id') id: string) {
    return this.deportesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(DeporteOwnershipGuard)
  update(@Param('id') id: string, @Body() updateDeporteDto: UpdateDeporteDto) {
    return this.deportesService.update(id, updateDeporteDto);
  }

  @Delete(':id')
  @UseGuards(DeporteOwnershipGuard)
  remove(@Param('id') id: string, @Req() request: any) {
    // Solo dueño y superadmin pueden eliminar
    if (request.isEmpleado && !request.isDueno) {
      throw new ForbiddenException('Los empleados no pueden eliminar deportes');
    }

    return this.deportesService.remove(id);
  }
}