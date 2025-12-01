import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear el pool de conexiones de PostgreSQL
const connectionString = process.env.DATABASE_URL || 
  'postgresql://canchas_user:canchas_password_dev@localhost:5432/canchas_db?schema=public';

const pool = new Pool({ connectionString });

// Crear el adapter
const adapter = new PrismaPg(pool);

// Crear PrismaClient con el adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Crear un superadmin
  const superadmin = await prisma.usuario.upsert({
    where: { email: 'admin@canchas.com' },
    update: {},
    create: {
      email: 'admin@canchas.com',
      telefono: '+5491112345678',
      dni: '12345678',
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'SUPERADMIN',
      password: 'admin123', // En producción esto debe estar hasheado!
    },
  });

  console.log('✅ Superadmin creado:', superadmin.email);

  // Crear un complejo de ejemplo
  const complejo = await prisma.complejo.create({
    data: {
      nombre: 'Complejo Demo',
      direccion: 'Av. Ejemplo 1234',
      telefono: '+5491187654321',
      email: 'info@complejodemo.com',
      cbu: '0000003100010000000001',
      alias: 'complejo.demo',
      titular: 'Complejo Demo SRL',
      numeroWhatsapp: '+5491187654321',
      propietarioId: superadmin.id,
    },
  });

  console.log('✅ Complejo creado:', complejo.nombre);

  // Crear deportes
  const futbol5 = await prisma.deporte.create({
    data: {
      nombre: 'Fútbol 5',
      icono: '⚽',
      complejoId: complejo.id,
    },
  });

  const padel = await prisma.deporte.create({
    data: {
      nombre: 'Pádel',
      icono: '🎾',
      complejoId: complejo.id,
    },
  });

  console.log('✅ Deportes creados');

  // Crear canchas
  const cancha1 = await prisma.cancha.create({
    data: {
      nombre: 'Cancha 1',
      descripcion: 'Cancha de fútbol 5 sintético',
      precioBase: 15000,
      complejoId: complejo.id,
      deporteId: futbol5.id,
    },
  });

  const cancha2 = await prisma.cancha.create({
    data: {
      nombre: 'Cancha 2',
      descripcion: 'Cancha de pádel techada',
      precioBase: 12000,
      complejoId: complejo.id,
      deporteId: padel.id,
    },
  });

  console.log('✅ Canchas creadas');

  // Configurar horarios para Cancha 1 (Lunes a Viernes)
  for (let dia = 1; dia <= 5; dia++) {
    await prisma.configuracionHorarioCancha.create({
      data: {
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '23:00',
        duracionTurno: 60,
        diasAdelante: 30,
        canchaId: cancha1.id,
      },
    });
  }

  // Fines de semana (horario extendido)
  await prisma.configuracionHorarioCancha.create({
    data: {
      diaSemana: 6, // Sábado
      horaInicio: '08:00',
      horaFin: '00:00',
      duracionTurno: 60,
      diasAdelante: 30,
      canchaId: cancha1.id,
    },
  });

  await prisma.configuracionHorarioCancha.create({
    data: {
      diaSemana: 0, // Domingo
      horaInicio: '08:00',
      horaFin: '23:00',
      duracionTurno: 60,
      diasAdelante: 30,
      canchaId: cancha1.id,
    },
  });

  console.log('✅ Horarios configurados');

  // Precios dinámicos (recargo fines de semana)
  await prisma.precioDinamico.create({
    data: {
      diaSemana: 6, // Sábado
      porcentaje: 20, // +20%
      descripcion: 'Recargo fin de semana',
      canchaId: cancha1.id,
    },
  });

  await prisma.precioDinamico.create({
    data: {
      diaSemana: 0, // Domingo
      porcentaje: 20, // +20%
      descripcion: 'Recargo fin de semana',
      canchaId: cancha1.id,
    },
  });

  console.log('✅ Precios dinámicos configurados');

  console.log('🎉 Seed completado!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });