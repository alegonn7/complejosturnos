import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { DashboardDto } from './dto/dashboard.dto';
import { RendimientoDto } from './dto/rendimiento.dto';
import { FiltrosEstadisticasDto } from './dto/filtros-estadisticas.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('estadisticas')
@UseGuards(RolesGuard)
@Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // ============ DASHBOARD PRINCIPAL ============
  @Get('dashboard')
  getDashboard(@Query() dashboardDto: DashboardDto, @CurrentUser() user: any) {
    return this.estadisticasService.getDashboard(dashboardDto, user.id, user.rol);
  }

  // ============ REPORTE DE RENDIMIENTO ============
  @Get('rendimiento')
  getRendimiento(@Query() rendimientoDto: RendimientoDto, @CurrentUser() user: any) {
    return this.estadisticasService.getRendimiento(rendimientoDto, user.id, user.rol);
  }

  // ============ ANÁLISIS DE TURNOS ============
  @Get('turnos/analisis')
  getTurnosAnalisis(@Query() filtrosDto: FiltrosEstadisticasDto, @CurrentUser() user: any) {
    return this.estadisticasService.getTurnosAnalisis(filtrosDto, user.id, user.rol);
  }

  // ============ ANÁLISIS DE CANCHAS ============
  @Get('canchas/analisis')
  getCanchasAnalisis(@Query() filtrosDto: FiltrosEstadisticasDto, @CurrentUser() user: any) {
    return this.estadisticasService.getCanchasAnalisis(filtrosDto, user.id, user.rol);
  }

  // ============ ANÁLISIS DE CLIENTES ============
  @Get('clientes/analisis')
  getClientesAnalisis(@Query() filtrosDto: FiltrosEstadisticasDto, @CurrentUser() user: any) {
    return this.estadisticasService.getClientesAnalisis(filtrosDto, user.id, user.rol);
  }

  // ============ ANÁLISIS DE INGRESOS ============
  @Get('ingresos/analisis')
  getIngresosAnalisis(@Query() filtrosDto: FiltrosEstadisticasDto, @CurrentUser() user: any) {
    return this.estadisticasService.getIngresosAnalisis(filtrosDto, user.id, user.rol);
  }

  // ============ ANÁLISIS DE DEPORTES ============
  @Get('deportes/analisis')
  getDeportesAnalisis(@Query() filtrosDto: FiltrosEstadisticasDto, @CurrentUser() user: any) {
    return this.estadisticasService.getDeportesAnalisis(filtrosDto, user.id, user.rol);
  }

  // ============ OPTIMIZACIÓN DE HORARIOS ============
  @Get('horarios/optimizacion')
  getHorariosOptimizacion(@Query() filtrosDto: FiltrosEstadisticasDto, @CurrentUser() user: any) {
    return this.estadisticasService.getHorariosOptimizacion(filtrosDto, user.id, user.rol);
  }
}