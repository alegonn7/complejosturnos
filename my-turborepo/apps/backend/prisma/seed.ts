import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes (opcional - solo desarrollo)
  await prisma.turno.deleteMany();
  await prisma.turnoFijo.deleteMany(); // 👈 FALTA ESTA
  await prisma.pago.deleteMany();
  await prisma.configuracionHorarioCancha.deleteMany();
  await prisma.precioDinamico.deleteMany();
  await prisma.cancha.deleteMany();
  await prisma.deporte.deleteMany();
  await prisma.configuracionTema.deleteMany();
  await prisma.complejo.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🗑️  Datos anteriores eliminados');

  // ========================================
  // USUARIOS
  // ========================================

  const hashedPassword = await bcrypt.hash('  ', 10);

  // Superadmin
  const superadmin = await prisma.usuario.create({
    data: {
      email: 'admin@sistema.com',
      telefono: '1111111111',
      nombre: 'Super',
      apellido: 'Admin',
      rol: 'SUPERADMIN',
      password: hashedPassword,
    },
  });

  // Dueño 1
  const dueno1 = await prisma.usuario.create({
    data: {
      email: 'dueno1@mail.com',
      telefono: '2222222222',
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: 'DUENO',
      password: hashedPassword,
    },
  });

  // Dueño 2
  const dueno2 = await prisma.usuario.create({
    data: {
      email: 'dueno2@mail.com',
      telefono: '3333333333',
      nombre: 'María',
      apellido: 'González',
      rol: 'DUENO',
      password: hashedPassword,
    },
  });

  // Dueño 3
  const dueno3 = await prisma.usuario.create({
    data: {
      email: 'dueno3@mail.com',
      telefono: '4444444444',
      nombre: 'Carlos',
      apellido: 'López',
      rol: 'DUENO',
      password: hashedPassword,
    },
  });

  console.log('✅ Usuarios creados');

  // ========================================
  // COMPLEJO 1: Complejo Norte
  // ========================================

  const complejoNorte = await prisma.complejo.create({
    data: {
      slug: 'complejo-norte',
      nombre: 'Complejo Norte',
      direccion: 'Av. del Libertador 1234, Buenos Aires',
      telefono: '1150001234',
      email: 'info@complejonorte.com',
      numeroWhatsapp: '5491150001234',
      cbu: '0170001234567890123456',
      alias: 'complejo.norte',
      titular: 'Juan Pérez',
      requiereSeña: true,
      porcentajeSeña: 50,
      minutosExpiracion: 30,
      permiteTurnosFijos: true,
      propietarioId: dueno1.id,
    },
  });

  await prisma.configuracionTema.create({
    data: {
      complejoId: complejoNorte.id,
      nombreMostrar: 'Complejo Norte',
      colorPrimario: '#0a0a0a',
      colorSecundario: '#404040',
      colorAccent: '#22c55e',
      colorFondo: '#ffffff',
      textoHeroPrincipal: '⚽ Reservá tu cancha en segundos',
      textoHeroSecundario: 'Fútbol 5 y Pádel - Las mejores canchas de la zona',
      textoFooter: 'Abierto todos los días de 8:00 a 23:00\nAv. del Libertador 1234',
      textoWhatsApp: 'Hola! Quiero consultar disponibilidad',
      metaTitle: 'Complejo Norte - Reservá Online',
      metaDescription: 'Reservá tu cancha de fútbol 5 o pádel en Complejo Norte. Sistema de reservas online simple y rápido.',
      metaKeywords: 'cancha, fútbol 5, pádel, reserva online, complejo deportivo',
      instagramUrl: 'https://instagram.com/complejonorte',
      facebookUrl: 'https://facebook.com/complejonorte',
    },
  });

  // Deportes
  const futbol5Norte = await prisma.deporte.create({
    data: {
      nombre: 'Fútbol 5',
      icono: '⚽',
      complejoId: complejoNorte.id,
    },
  });

  const padelNorte = await prisma.deporte.create({
    data: {
      nombre: 'Pádel',
      icono: '🎾',
      complejoId: complejoNorte.id,
    },
  });

  // Canchas
  const cancha1Norte = await prisma.cancha.create({
    data: {
      nombre: 'Cancha 1',
      descripcion: 'Cancha techada con césped sintético',
      estado: 'HABILITADA',
      precioBase: 3000,
      complejoId: complejoNorte.id,
      deporteId: futbol5Norte.id,
    },
  });

  const cancha2Norte = await prisma.cancha.create({
    data: {
      nombre: 'Cancha 2',
      descripcion: 'Cancha descubierta',
      estado: 'HABILITADA',
      precioBase: 2500,
      complejoId: complejoNorte.id,
      deporteId: futbol5Norte.id,
    },
  });

  const cancha3Norte = await prisma.cancha.create({
    data: {
      nombre: 'Pádel 1',
      descripcion: 'Cancha de pádel techada',
      estado: 'HABILITADA',
      precioBase: 3500,
      complejoId: complejoNorte.id,
      deporteId: padelNorte.id,
    },
  });

  // Configuración de horarios (Lunes a Viernes)
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '08:00',
        horaFin: '23:00',
        duracionTurno: 60,
        activo: true,
        diasAdelante: 30,
        canchaId: cancha1Norte.id,
      },
    });

    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '08:00',
        horaFin: '23:00',
        duracionTurno: 60,
        activo: true,
        diasAdelante: 30,
        canchaId: cancha2Norte.id,
      },
    });

    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '22:00',
        duracionTurno: 90,
        activo: true,
        diasAdelante: 30,
        canchaId: cancha3Norte.id,
      },
    });
  }

  // Precios dinámicos (Viernes más caro)
  await prisma.precioDinamico.create({
    data: {
      diaSemana: 5, // Viernes
      porcentaje: 120,
      descripcion: 'Precio fin de semana',
      canchaId: cancha1Norte.id,
    },
  });

  console.log('✅ Complejo Norte creado');

  // ========================================
  // COMPLEJO 2: Complejo Sur
  // ========================================

  const complejoSur = await prisma.complejo.create({
    data: {
      slug: 'complejo-sur',
      nombre: 'Complejo Sur',
      direccion: 'Av. Rivadavia 5678, Buenos Aires',
      telefono: '1150005678',
      email: 'contacto@complejosur.com',
      numeroWhatsapp: '5491150005678',
      cbu: '0170009876543210987654',
      alias: 'complejo.sur',
      titular: 'María González',
      requiereSeña: true,
      porcentajeSeña: 30,
      minutosExpiracion: 60,
      permiteTurnosFijos: false,
      propietarioId: dueno2.id,
    },
  });

  await prisma.configuracionTema.create({
    data: {
      complejoId: complejoSur.id,
      nombreMostrar: 'Complejo Sur',
      colorPrimario: '#1e40af',
      colorSecundario: '#64748b',
      colorAccent: '#f97316',
      colorFondo: '#ffffff',
      textoHeroPrincipal: '⚽ Fútbol 11 profesional',
      textoHeroSecundario: 'Canchas reglamentarias con la mejor calidad',
      textoFooter: 'Horarios: Lunes a Domingo 7:00 a 24:00\nAv. Rivadavia 5678',
      metaTitle: 'Complejo Sur - Fútbol 11',
      metaDescription: 'Canchas de fútbol 11 profesionales. Reservá online tu turno.',
      metaKeywords: 'fútbol 11, cancha profesional, reserva online',
    },
  });

  const futbol11Sur = await prisma.deporte.create({
    data: {
      nombre: 'Fútbol 11',
      icono: '⚽',
      complejoId: complejoSur.id,
    },
  });

  const cancha1Sur = await prisma.cancha.create({
    data: {
      nombre: 'Cancha Principal',
      descripcion: 'Cancha reglamentaria con césped natural',
      estado: 'HABILITADA',
      precioBase: 8000,
      complejoId: complejoSur.id,
      deporteId: futbol11Sur.id,
    },
  });

  const cancha2Sur = await prisma.cancha.create({
    data: {
      nombre: 'Cancha Auxiliar',
      descripcion: 'Cancha con césped sintético',
      estado: 'HABILITADA',
      precioBase: 6000,
      complejoId: complejoSur.id,
      deporteId: futbol11Sur.id,
    },
  });

  // Horarios todos los días
  for (let dia = 0; dia <= 6; dia++) {
    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '07:00',
        horaFin: '24:00',
        duracionTurno: 90,
        activo: true,
        diasAdelante: 30,
        canchaId: cancha1Sur.id,
      },
    });

    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '07:00',
        horaFin: '24:00',
        duracionTurno: 90,
        activo: true,
        diasAdelante: 30,
        canchaId: cancha2Sur.id,
      },
    });
  }

  console.log('✅ Complejo Sur creado');

  // ========================================
  // COMPLEJO 3: Club Deportivo
  // ========================================

  const clubDeportivo = await prisma.complejo.create({
    data: {
      slug: 'club-deportivo',
      nombre: 'Club Deportivo Elite',
      direccion: 'Calle Falsa 123, Buenos Aires',
      telefono: '1150009999',
      email: 'info@clubdeportivo.com',
      numeroWhatsapp: '5491150009999',
      cbu: '0170005555555555555555',
      alias: 'club.elite',
      titular: 'Carlos López',
      requiereSeña: false, // No requiere seña
      porcentajeSeña: 0,
      minutosExpiracion: 0,
      permiteTurnosFijos: true,
      propietarioId: dueno3.id,
    },
  });

  await prisma.configuracionTema.create({
    data: {
      complejoId: clubDeportivo.id,
      nombreMostrar: 'Club Deportivo Elite',
      colorPrimario: '#dc2626',
      colorSecundario: '#9ca3af',
      colorAccent: '#eab308',
      colorFondo: '#fafafa',
      textoHeroPrincipal: '🏆 Club Deportivo Elite',
      textoHeroSecundario: 'Fútbol 5, Tenis y más - Instalaciones de primer nivel',
      textoFooter: 'Socio del club? Consultá por beneficios especiales\nTel: 11-5000-9999',
      metaTitle: 'Club Deportivo Elite - Reservas Online',
      metaDescription: 'Club deportivo con canchas de fútbol 5 y tenis. Sistema de reservas online.',
      metaKeywords: 'club deportivo, fútbol 5, tenis, reserva online',
      facebookUrl: 'https://facebook.com/clubelite',
    },
  });

  const futbol5Club = await prisma.deporte.create({
    data: {
      nombre: 'Fútbol 5',
      icono: '⚽',
      complejoId: clubDeportivo.id,
    },
  });

  const tenisClub = await prisma.deporte.create({
    data: {
      nombre: 'Tenis',
      icono: '🎾',
      complejoId: clubDeportivo.id,
    },
  });

  // Canchas
  for (let i = 1; i <= 3; i++) {
    const cancha = await prisma.cancha.create({
      data: {
        nombre: `Cancha Fútbol ${i}`,
        descripcion: `Cancha ${i} con césped sintético de última generación`,
        estado: 'HABILITADA',
        precioBase: 3200,
        complejoId: clubDeportivo.id,
        deporteId: futbol5Club.id,
      },
    });

    // Horarios
    for (let dia = 0; dia <= 6; dia++) {
      await prisma.configuracionHorarioCancha.create({
        data: {
          diaSemana: dia,
          horaInicio: '08:00',
          horaFin: '23:00',
          duracionTurno: 60,
          activo: true,
          diasAdelante: 30,
          canchaId: cancha.id,
        },
      });
    }
  }

  const canchaTenis = await prisma.cancha.create({
    data: {
      nombre: 'Cancha Tenis 1',
      descripcion: 'Cancha de tenis polvo de ladrillo',
      estado: 'HABILITADA',
      precioBase: 2000,
      complejoId: clubDeportivo.id,
      deporteId: tenisClub.id,
    },
  });

  for (let dia = 0; dia <= 6; dia++) {
    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '21:00',
        duracionTurno: 60,
        activo: true,
        diasAdelante: 30,
        canchaId: canchaTenis.id,
      },
    });
  }

  console.log('✅ Club Deportivo creado');

  // ========================================
  // RESUMEN
  // ========================================

  console.log('\n🎉 Seed completado!\n');
  console.log('📊 Resumen:');
  console.log('─────────────────────────────────────');
  console.log('Usuarios:');
  console.log(`  • Superadmin: admin@sistema.com / 123456`);
  console.log(`  • Dueño 1: dueno1@mail.com / 123456`);
  console.log(`  • Dueño 2: dueno2@mail.com / 123456`);
  console.log(`  • Dueño 3: dueno3@mail.com / 123456`);
  console.log('\nComplejos:');
  console.log(`  • Complejo Norte (complejo-norte) - Tema Negro/Verde`);
  console.log(`  • Complejo Sur (complejo-sur) - Tema Azul/Naranja`);
  console.log(`  • Club Deportivo (club-deportivo) - Tema Rojo/Blanco`);
  console.log('\n🌐 URLs Cliente:');
  console.log(`  • http://localhost:3002/complejo-norte`);
  console.log(`  • http://localhost:3002/complejo-sur`);
  console.log(`  • http://localhost:3002/club-deportivo`);
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });