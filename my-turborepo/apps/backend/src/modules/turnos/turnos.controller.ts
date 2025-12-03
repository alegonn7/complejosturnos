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
    Query,
} from '@nestjs/common';
import { TurnosService } from './turnos.service.js';
import { GenerarTurnosDto } from './dto/generar-turnos.dto.js';
import { ReservarTurnoDto } from './dto/reservar-turno.dto.js';
import { UpdateTurnoDto } from './dto/update-turno.dto.js';
import { CancelarTurnoDto } from './dto/cancelar-turno.dto.js';
import { MarcarAusenteDto } from './dto/marcar-ausente.dto.js';
import { ConsultarDisponibilidadDto } from './dto/consultar-disponibilidad.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { TurnoOwnershipGuard } from './guards/turno-ownership.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('turnos')
@UseGuards(RolesGuard)
export class TurnosController {
    constructor(private readonly turnosService: TurnosService) { }

    // ============ PÚBLICO ============
    @Public()
    @Get('disponibilidad')
    consultarDisponibilidad(@Query() consultarDisponibilidadDto: ConsultarDisponibilidadDto) {
        return this.turnosService.consultarDisponibilidad(consultarDisponibilidadDto);
    }

    @Public()
    @Post('reservar')
    reservarTurnoPublico(@Body() reservarTurnoDto: ReservarTurnoDto) {
        return this.turnosService.reservarTurno(reservarTurnoDto);
    }

    @Public()
    @Post(':id/cancelar-publico')
    cancelarTurnoPublico(
        @Param('id') id: string,
        @Body() cancelarTurnoDto: CancelarTurnoDto,
    ) {
        return this.turnosService.cancelarTurno(id, cancelarTurnoDto);
    }

    // ============ CLIENTE AUTENTICADO ============
    @Get('mis-turnos')
    @Roles('CLIENTE', 'DUENO', 'EMPLEADO')
    findMyTurnos(@CurrentUser() user: any) {
        return this.turnosService.findMyTurnos(user.id);
    }

    @Post('reservar-autenticado')
    @Roles('CLIENTE', 'DUENO', 'EMPLEADO')
    reservarTurnoAutenticado(
        @Body() reservarTurnoDto: ReservarTurnoDto,
        @CurrentUser() user: any,
    ) {
        return this.turnosService.reservarTurno(reservarTurnoDto, user.id);
    }

    @Post(':id/cancelar')
    @UseGuards(TurnoOwnershipGuard)
    cancelarTurno(
        @Param('id') id: string,
        @Body() cancelarTurnoDto: CancelarTurnoDto,
        @CurrentUser() user: any,
    ) {
        return this.turnosService.cancelarTurno(id, cancelarTurnoDto, user.id, user.rol);
    }

    // ============ DUEÑO/EMPLEADO/SUPERADMIN ============
    @Post('generar')
    @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
    generarTurnos(@Body() generarTurnosDto: GenerarTurnosDto, @CurrentUser() user: any) {
        return this.turnosService.generarTurnos(generarTurnosDto, user.id, user.rol);
    }

    @Get('complejo/:complejoId')
    @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
    findByComplejo(@Param('complejoId') complejoId: string, @CurrentUser() user: any) {
        return this.turnosService.findByComplejo(complejoId, user.id, user.rol);
    }

    @Get('cancha/:canchaId')
    @Roles('SUPERADMIN', 'DUENO', 'EMPLEADO')
    findByCancha(@Param('canchaId') canchaId: string, @CurrentUser() user: any) {
        return this.turnosService.findByCancha(canchaId, user.id, user.rol);
    }

    @Get(':id')
    @UseGuards(TurnoOwnershipGuard)
    findOne(@Param('id') id: string) {
        return this.turnosService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(TurnoOwnershipGuard)
    update(
        @Param('id') id: string,
        @Body() updateTurnoDto: UpdateTurnoDto,
        @Req() request: any,
    ) {
        // Solo dueño y empleado pueden editar
        if (request.user.rol === 'CLIENTE') {
            throw new ForbiddenException('Los clientes no pueden editar turnos');
        }

        return this.turnosService.update(id, updateTurnoDto);
    }

    @Post(':id/confirmar')
    @UseGuards(TurnoOwnershipGuard)
    confirmarTurno(@Param('id') id: string, @Req() request: any) {
        // Solo dueño y empleado pueden confirmar
        if (request.user.rol === 'CLIENTE') {
            throw new ForbiddenException('Los clientes no pueden confirmar turnos');
        }

        return this.turnosService.confirmarTurno(id);
    }

    @Post(':id/ausente')
    @UseGuards(TurnoOwnershipGuard)
    marcarAusente(
        @Param('id') id: string,
        @Body() marcarAusenteDto: MarcarAusenteDto,
        @Req() request: any,
    ) {
        // Solo dueño y empleado pueden marcar ausente
        if (request.user.rol === 'CLIENTE') {
            throw new ForbiddenException('Los clientes no pueden marcar ausentes');
        }

        return this.turnosService.marcarAusente(id, marcarAusenteDto);
    }

    @Post(':id/bloquear')
    @UseGuards(TurnoOwnershipGuard)
    bloquearTurno(@Param('id') id: string, @Req() request: any) {
        // Solo dueño y empleado pueden bloquear
        if (request.user.rol === 'CLIENTE') {
            throw new ForbiddenException('Los clientes no pueden bloquear turnos');
        }

        return this.turnosService.bloquearTurno(id);
    }

    @Delete(':id')
    @UseGuards(TurnoOwnershipGuard)
    remove(@Param('id') id: string, @Req() request: any) {
        // Solo dueño y superadmin pueden eliminar
        if (request.isEmpleado && !request.isDueno && request.user.rol !== 'SUPERADMIN') {
            throw new ForbiddenException('Los empleados no pueden eliminar turnos');
        }

        return this.turnosService.remove(id);
    }

    // ============ CRON JOB (INTERNO) ============
    @Post('expirar-vencidos')
    @Roles('SUPERADMIN')
    expirarTurnosVencidos() {
        return this.turnosService.expirarTurnosVencidos();
    }
    @Post(':id/cancelar-individual')
    @UseGuards(TurnoOwnershipGuard)
    cancelarTurnoIndividual(@Param('id') id: string, @CurrentUser() user: any) {
        return this.turnosService.cancelarTurnoIndividual(id, user.id, user.rol);
    }
}