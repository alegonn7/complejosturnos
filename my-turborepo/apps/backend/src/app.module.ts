import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ComplejosModule } from './modules/complejos/complejos.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';
import { DeportesModule } from './modules/deportes/deportes.module.js';
import { CanchasModule } from './modules/canchas/canchas.module.js';
import { TurnosModule } from './modules/turnos/turnos.module.js';
import { PagosModule } from './modules/pagos/pagos.module.js';
import { TurnosFijosModule } from './modules/turnos-fijos/turnos-fijos.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ComplejosModule,
    UsuariosModule,
    DeportesModule,
    CanchasModule,
    TurnosModule,
    PagosModule,
    TurnosFijosModule,
    EstadisticasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}