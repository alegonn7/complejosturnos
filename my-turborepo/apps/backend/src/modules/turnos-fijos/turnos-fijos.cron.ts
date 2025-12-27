import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TurnosFijosService } from './turnos-fijos.service';

@Injectable()
export class TurnosFijosCron {
  private readonly logger = new Logger(TurnosFijosCron.name);

  constructor(private readonly turnosFijosService: TurnosFijosService) {}

  // Ejecutar cada día a las 2:00 AM
  @Cron('0 2 * * *')
  async handleGenerarTurnos() {
    this.logger.debug('Ejecutando tarea: Generar turnos desde turnos fijos');
    
    try {
      const result = await this.turnosFijosService.generarTurnosParaTurnosFijos();
      this.logger.log(`Turnos generados: ${result.turnosGenerados}`);
    } catch (error) {
      this.logger.error('Error al generar turnos desde turnos fijos', error);
    }
  }
}