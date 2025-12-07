import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TurnosFijosService } from './turnos-fijos.service.js';
import { CreateTurnoFijoDto } from './dto/create-turno-fijo.dto.js';
import { UpdateTurnoFijoDto } from './dto/update-turno-fijo.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { TurnoFijoOwnershipGuard } from './guards/turno-fijo-ownership.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('turnos-fijos')
@UseGuards(RolesGuard)
export class TurnosFijosController {
  constructor(private readonly turnosFijosService: TurnosFijosService) {}

  // ============ CLIENTE ============
  @Post()
  @Roles('CLIENTE', 'DUENO', 'EMPLEADO')
  create(@Body() createTurnoFijoDto: CreateTurnoFijoDto, @CurrentUser() user: any) {
    return this.turnosFijosService.create(createTurnoFijoDto, user.id);
  }

  @Get('mis-turnos-fijos')
  @Roles('CLIENTE', 'DUENO', 'EMPLEADO')
  findMyTurnosFijos(@CurrentUser() user: any) {
    return this.turnosFijosService.findMyTurnosFijos(user.id);
  }

  @Patch(':id/pausar')
  @UseGuards(TurnoFijoOwnershipGuard)
  pausar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.turnosFijosService.pausar(id, user.id);
  }

  @Patch(':id/reactivar')
  @UseGuards(TurnoFijoOwnershipGuard)
  reactivar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.turnosFijosService.reactivar(id, user.id);
  }

  @Delete(':id')
  @UseGuards(TurnoFijoOwnershipGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.turnosFijosService.remove(id, user.id, user.rol);
  }

  // ============ DUEÑO/EMPLEADO ============
  @Get('complejo/:complejoId')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  findByComplejo(@Param('complejoId') complejoId: string, @CurrentUser() user: any) {
    return this.turnosFijosService.findByComplejo(complejoId, user.id, user.rol);
  }

  @Get('cancha/:canchaId')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  findByCancha(@Param('canchaId') canchaId: string, @CurrentUser() user: any) {
    return this.turnosFijosService.findByCancha(canchaId, user.id, user.rol);
  }

  @Get(':id')
  @UseGuards(TurnoFijoOwnershipGuard)
  findOne(@Param('id') id: string) {
    return this.turnosFijosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(TurnoFijoOwnershipGuard)
  update(
    @Param('id') id: string,
    @Body() updateTurnoFijoDto: UpdateTurnoFijoDto,
    @CurrentUser() user: any,
  ) {
    return this.turnosFijosService.update(id, updateTurnoFijoDto, user.id);
  }

  // ============ CRON JOB (INTERNO) ============
  @Post('generar-turnos')
  @Roles('SUPERADMIN')
  generarTurnosParaTurnosFijos() {
    return this.turnosFijosService.generarTurnosParaTurnosFijos();
  }
}