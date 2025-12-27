import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ComplejosModule } from './modules/complejos/complejos.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { DeportesModule } from './modules/deportes/deportes.module';
import { CanchasModule } from './modules/canchas/canchas.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { PagosModule } from './modules/pagos/pagos.module';
import { TurnosFijosModule } from './modules/turnos-fijos/turnos-fijos.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ConfiguracionTemaModule } from './modules/configuracion-tema/configuracion-tema.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    // 👇 Static files (logos, banners, favicons)
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    PrismaModule,
    AuthModule,
    ComplejosModule,
    UploadModule,
    ConfiguracionTemaModule,
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
      useFactory: (reflector: Reflector) => new RolesGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
