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
import { CanchasService } from './canchas.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { UpdateEstadoCanchaDto } from './dto/update-estado-cancha.dto';
import { CreateConfiguracionHorarioDto } from './dto/create-configuracion-horario.dto';
import { UpdateConfiguracionHorarioDto } from './dto/update-configuracion-horario.dto';
import { CreatePrecioDinamicoDto } from './dto/create-precio-dinamico.dto';
import { UpdatePrecioDinamicoDto } from './dto/update-precio-dinamico.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CanchaOwnershipGuard } from './guards/cancha-ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller('canchas')
@UseGuards(RolesGuard)
export class CanchasController {
constructor(private readonly canchasService: CanchasService) {}
// ============ PÚBLICO ============
@Public()
@Get('complejo/:complejoId')
findByComplejo(@Param('complejoId') complejoId: string) {
return this.canchasService.findByComplejo(complejoId);
}
@Public()
@Get(':id/detalle')
findOne(@Param('id') id: string) {
return this.canchasService.findOne(id);
}
// ============ DUEÑO/EMPLEADO/SUPERADMIN ============
@Post()
@Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
create(@Body() createCanchaDto: CreateCanchaDto, @CurrentUser() user: any) {
return this.canchasService.create(createCanchaDto, user.id, user.rol);
}
@Get('mis-canchas/list')
@Roles('DUENO', 'EMPLEADO')
findMyCanchas(@CurrentUser() user: any) {
return this.canchasService.findMyCanchas(user.id, user.rol);
}
@Get(':id')
@UseGuards(CanchaOwnershipGuard)
findOnePrivate(@Param('id') id: string) {
return this.canchasService.findOne(id);
}
@Patch(':id')
@UseGuards(CanchaOwnershipGuard)
update(@Param('id') id: string, @Body() updateCanchaDto: UpdateCanchaDto) {
return this.canchasService.update(id, updateCanchaDto);
}
@Patch(':id/estado')
@UseGuards(CanchaOwnershipGuard)
updateEstado(
@Param('id') id: string,
@Body() updateEstadoCanchaDto: UpdateEstadoCanchaDto,
) {
return this.canchasService.updateEstado(id, updateEstadoCanchaDto);
}
@Delete(':id')
@UseGuards(CanchaOwnershipGuard)
remove(@Param('id') id: string, @Req() request: any) {
// Solo dueño y superadmin pueden eliminar
if (request.isEmpleado && !request.isDueno) {
throw new ForbiddenException('Los empleados no pueden eliminar canchas');
}
return this.canchasService.remove(id);
}
// ============ CONFIGURACIÓN DE HORARIOS ============
@Post(':id/horarios')
@UseGuards(CanchaOwnershipGuard)
createHorario(
@Param('id') id: string,
@Body() createHorarioDto: CreateConfiguracionHorarioDto,
) {
return this.canchasService.createHorario(id, createHorarioDto);
}
@Get(':id/horarios')
@UseGuards(CanchaOwnershipGuard)
findHorarios(@Param('id') id: string) {
return this.canchasService.findHorarios(id);
}
@Patch(':id/horarios/:horarioId')
@UseGuards(CanchaOwnershipGuard)
updateHorario(
@Param('horarioId') horarioId: string,
@Body() updateHorarioDto: UpdateConfiguracionHorarioDto,
) {
return this.canchasService.updateHorario(horarioId, updateHorarioDto);
}
@Delete(':id/horarios/:horarioId')
@UseGuards(CanchaOwnershipGuard)
removeHorario(@Param('horarioId') horarioId: string) {
return this.canchasService.removeHorario(horarioId);
}
// ============ PRECIOS DINÁMICOS ============
@Post(':id/precios')
@UseGuards(CanchaOwnershipGuard)
createPrecio(
@Param('id') id: string,
@Body() createPrecioDto: CreatePrecioDinamicoDto,
) {
return this.canchasService.createPrecio(id, createPrecioDto);
}
@Get(':id/precios')
@UseGuards(CanchaOwnershipGuard)
findPrecios(@Param('id') id: string) {
return this.canchasService.findPrecios(id);
}
@Patch(':id/precios/:precioId')
@UseGuards(CanchaOwnershipGuard)
updatePrecio(
@Param('precioId') precioId: string,
@Body() updatePrecioDto: UpdatePrecioDinamicoDto,
) {
return this.canchasService.updatePrecio(precioId, updatePrecioDto);
}
@Delete(':id/precios/:precioId')
@UseGuards(CanchaOwnershipGuard)
removePrecio(@Param('precioId') precioId: string) {
return this.canchasService.removePrecio(precioId);
}
}