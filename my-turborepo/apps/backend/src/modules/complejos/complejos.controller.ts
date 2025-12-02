import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ComplejosService } from './complejos.service.js';
import { CreateComplejoDto } from './dto/create-complejo.dto.js';
import { UpdateComplejoDto } from './dto/update-complejo.dto.js';
import { UpdateDatosBancariosDto } from './dto/update-datos-bancarios.dto.js';
import { AsignarPropietarioDto } from './dto/asignar-propietario.dto.js';
import { CreateEmpleadoDto } from './dto/create-empleado.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ComplejoOwnershipGuard } from './guards/complejo-ownership.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('complejos')
@UseGuards(RolesGuard)
export class ComplejosController {
  constructor(private readonly complejosService: ComplejosService) {}

  // ============ PÚBLICO ============
  @Public()
  @Get()
  findAll() {
    return this.complejosService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complejosService.findOne(id);
  }

  // ============ SUPERADMIN ============
  @Post()
  @Roles('SUPERADMIN')
  create(@Body() createComplejoDto: CreateComplejoDto) {
    return this.complejosService.create(createComplejoDto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.complejosService.remove(id);
  }

  @Patch(':id/propietario')
  @Roles('SUPERADMIN')
  asignarPropietario(
    @Param('id') id: string,
    @Body() asignarPropietarioDto: AsignarPropietarioDto,
  ) {
    return this.complejosService.asignarPropietario(id, asignarPropietarioDto);
  }

  // ============ DUEÑO/EMPLEADO ============
  @Get('mi-complejo/info')
  @Roles('DUENO', 'EMPLEADO')
  findMyComplejo(@CurrentUser() user: any) {
    return this.complejosService.findMyComplejo(user.id, user.rol);
  }

  @Patch(':id')
  @UseGuards(ComplejoOwnershipGuard)
  update(@Param('id') id: string, @Body() updateComplejoDto: UpdateComplejoDto) {
    return this.complejosService.update(id, updateComplejoDto);
  }

  @Patch(':id/datos-bancarios')
  @UseGuards(ComplejoOwnershipGuard)
  updateDatosBancarios(
    @Param('id') id: string,
    @Body() updateDatosBancariosDto: UpdateDatosBancariosDto,
    @Req() request: any,
  ) {
    // Solo dueño puede editar datos bancarios
    if (request.isEmpleado && !request.isDueno) {
      throw new ForbiddenException('Los empleados no pueden editar datos bancarios');
    }

    return this.complejosService.updateDatosBancarios(id, updateDatosBancariosDto);
  }

  // ============ EMPLEADOS ============
  @Post(':id/empleados')
  @UseGuards(ComplejoOwnershipGuard)
  createEmpleado(
    @Param('id') id: string,
    @Body() createEmpleadoDto: CreateEmpleadoDto,
    @Req() request: any,
  ) {
    // Solo dueño puede crear empleados
    if (request.isEmpleado && !request.isDueno) {
      throw new ForbiddenException('Los empleados no pueden crear otros empleados');
    }

    return this.complejosService.createEmpleado(id, createEmpleadoDto);
  }

  @Get(':id/empleados')
  @UseGuards(ComplejoOwnershipGuard)
  findEmpleados(@Param('id') id: string, @Req() request: any) {
    // Solo dueño puede ver empleados
    if (request.isEmpleado && !request.isDueno) {
      throw new ForbiddenException('Los empleados no pueden ver la lista de empleados');
    }

    return this.complejosService.findEmpleados(id);
  }

  @Delete(':id/empleados/:empleadoId')
  @UseGuards(ComplejoOwnershipGuard)
  removeEmpleado(
    @Param('id') id: string,
    @Param('empleadoId') empleadoId: string,
    @Req() request: any,
  ) {
    // Solo dueño puede eliminar empleados
    if (request.isEmpleado && !request.isDueno) {
      throw new ForbiddenException('Los empleados no pueden eliminar otros empleados');
    }

    return this.complejosService.removeEmpleado(id, empleadoId);
  }
}