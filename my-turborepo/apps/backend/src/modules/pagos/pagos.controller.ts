import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PagosService } from './pagos.service.js';
import { EnviarComprobanteDto } from './dto/enviar-comprobante.dto.js';
import { RechazarPagoDto } from './dto/rechazar-pago.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PagoOwnershipGuard } from './guards/pago-ownership.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('pagos')
@UseGuards(RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  // ============ CLIENTE / PÚBLICO ============
  @Public()
  @Post('enviar-comprobante')
  enviarComprobante(@Body() enviarComprobanteDto: EnviarComprobanteDto) {
    return this.pagosService.enviarComprobante(enviarComprobanteDto);
  }

  @Public()
  @Get('turno/:turnoId')
  findByTurno(@Param('turnoId') turnoId: string) {
    return this.pagosService.findByTurno(turnoId);
  }

  // ============ DUEÑO/EMPLEADO ============
  @Get('pendientes')
  @Roles('DUENO', 'EMPLEADO')
  findPendientes(@CurrentUser() user: any) {
    return this.pagosService.findPendientes(user.id, user.rol);
  }

  @Get('complejo/:complejoId')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  findByComplejo(@Param('complejoId') complejoId: string, @CurrentUser() user: any) {
    return this.pagosService.findByComplejo(complejoId, user.id, user.rol);
  }

  @Get(':id')
  @UseGuards(PagoOwnershipGuard)
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }

  @Patch(':id/aprobar')
  @UseGuards(PagoOwnershipGuard)
  aprobarPago(@Param('id') id: string) {
    return this.pagosService.aprobarPago(id);
  }

  @Patch(':id/rechazar')
  @UseGuards(PagoOwnershipGuard)
  rechazarPago(@Param('id') id: string, @Body() rechazarPagoDto: RechazarPagoDto) {
    return this.pagosService.rechazarPago(id, rechazarPagoDto);
  }

  // ============ EFECTIVO (DUEÑO/EMPLEADO) ============
  @Post('efectivo/:turnoId')
  @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
  registrarPagoEfectivo(
    @Param('turnoId') turnoId: string,
    @Body('monto') monto: number,
  ) {
    return this.pagosService.registrarPagoEfectivo(turnoId, monto);
  }
}