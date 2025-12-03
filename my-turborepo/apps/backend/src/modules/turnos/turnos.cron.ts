import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TurnosService } from './turnos.service.js';

@Injectable()
export class TurnosCron {
  private readonly logger = new Logger(TurnosCron.name);

  constructor(private readonly turnosService: TurnosService) {}

  // Ejecutar cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpirarTurnos() {
    this.logger.debug('Ejecutando tarea: Expirar turnos vencidos');
    
    try {
      const result = await this.turnosService.expirarTurnosVencidos();
      this.logger.log(`Turnos expirados: ${result.count}`);
    } catch (error) {
      this.logger.error('Error al expirar turnos', error);
    }
  }
}