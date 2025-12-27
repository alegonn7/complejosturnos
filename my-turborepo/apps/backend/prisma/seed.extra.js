const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed complementario (JS)...')

  // 🔹 Traer datos base ya existentes
  const complejo = await prisma.complejo.findFirst()
  if (!complejo) throw new Error('No hay complejo')

  const cancha = await prisma.cancha.findFirst()
  if (!cancha) throw new Error('No hay cancha')

  const usuario = await prisma.usuario.findFirst({
    where: { rol: 'CLIENTE' },
  })

  if (!usuario) {
    console.log('⚠️ No hay cliente, creando uno')
  }

  const cliente =
    usuario ??
    (await prisma.usuario.create({
      data: {
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+5491199999999',
        dni: '30123456',
        rol: 'CLIENTE',
      },
    }))

  // 🔹 Turno fijo
  const turnoFijo = await prisma.turnoFijo.create({
    data: {
      diaSemana: 2, // martes
      horaInicio: '20:00',
      duracion: 60,
      fechaInicio: new Date(),
      requiereSeña: true,
      usuarioId: cliente.id,
      canchaId: cancha.id,
    },
  })

  // 🔹 Turno generado desde turno fijo
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + 1)
  fecha.setHours(20, 0, 0, 0)

  const turno = await prisma.turno.create({
    data: {
      fecha,
      duracion: 60,
      estado: 'CONFIRMADO',
      precioTotal: cancha.precioBase,
      montoSeña: cancha.precioBase.mul(0.5),
      canchaId: cancha.id,
      complejoId: complejo.id,
      usuarioId: cliente.id,
      turnoFijoId: turnoFijo.id,
    },
  })

}

main()
  .catch((e) => {
    console.error('❌ Error seed extra:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
s