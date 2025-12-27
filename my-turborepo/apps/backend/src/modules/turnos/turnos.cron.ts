import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TurnosService } from './turnos.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TurnosCron {
  private readonly logger = new Logger(TurnosCron.name);

  constructor(
    private readonly turnosService: TurnosService,
    private readonly prisma: PrismaService,
  ) {}

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

  // ✅ NUEVO: CRON diario a las 2 AM
  @Cron('0 2 * * *')
  async handleGenerarTurnos() {
    this.logger.debug('🔄 Ejecutando tarea: Generar turnos automáticamente');
    
    try {
      const result = await this.generarTurnosParaTodasLasCanchas();
      this.logger.log(`✅ Total de turnos generados: ${result.totalGenerados}`);
    } catch (error) {
      this.logger.error('❌ Error al generar turnos automáticamente', error);
    }
  }

  // ✅ NUEVO: Método público para llamar manualmente
  async generarTurnosParaTodasLasCanchas() {
    const canchas = await this.prisma.cancha.findMany({
      where: { estado: 'HABILITADA' },
      include: {
        configuracionHorarios: {
          where: { activo: true },
        },
      },
    });

    let totalGenerados = 0;

    for (const cancha of canchas) {
      if (cancha.configuracionHorarios.length === 0) {
        this.logger.warn(`⚠️  Cancha ${cancha.nombre} no tiene configuración de horarios`);
        continue;
      }

      try {
        const result = await this.turnosService.generarTurnos(
          { canchaId: cancha.id, diasAdelante: 30 },
          'SYSTEM',
          'SUPERADMIN',
        );
        
        totalGenerados += result.turnosGenerados;
        this.logger.log(`✅ Cancha ${cancha.nombre}: ${result.turnosGenerados} turnos generados`);
      } catch (error: any) {
        this.logger.error(`❌ Error generando turnos para cancha ${cancha.nombre}:`, error.message);
      }
    }

    return { 
      totalGenerados,
      mensaje: `Se generaron ${totalGenerados} turnos correctamente`
    };
  }
}