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
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ChangeRolDto } from './dto/change-rol.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { EmpleadoOwnershipGuard } from './guards/empleado-ownership.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // ============ SUPERADMIN ============
  @Post()
  @Roles('SUPERADMIN')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles('SUPERADMIN')
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @Roles('SUPERADMIN')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPERADMIN')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Patch(':id/rol')
  @Roles('SUPERADMIN')
  changeRol(@Param('id') id: string, @Body() changeRolDto: ChangeRolDto) {
    return this.usuariosService.changeRol(id, changeRolDto);
  }

  @Patch(':id/password')
  @Roles('SUPERADMIN')
  changePasswordByAdmin(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usuariosService.changePasswordByAdmin(id, changePasswordDto);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  // ============ DUEÑO ============
  @Get('empleados/list')
  @Roles('DUENO')
  findEmpleados(@CurrentUser() user: any) {
    return this.usuariosService.findEmpleadosByDueno(user.id);
  }

  @Patch('empleados/:id')
  @Roles('DUENO', 'SUPERADMIN')
  @UseGuards(EmpleadoOwnershipGuard)
  updateEmpleado(
    @Param('id') id: string,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    return this.usuariosService.updateEmpleado(id, updateEmpleadoDto);
  }

  @Patch('empleados/:id/password')
  @Roles('DUENO', 'SUPERADMIN')
  @UseGuards(EmpleadoOwnershipGuard)
  changeEmpleadoPassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usuariosService.changeEmpleadoPassword(id, changePasswordDto);
  }

  // ============ CUALQUIER USUARIO AUTENTICADO ============
  @Patch('me/profile')
  updateMe(@CurrentUser() user: any, @Body() updateMeDto: UpdateMeDto) {
    return this.usuariosService.updateMe(user.id, updateMeDto);
  }

  @Patch('me/password')
  changeMyPassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usuariosService.changeMyPassword(user.id, changePasswordDto);
  }
}