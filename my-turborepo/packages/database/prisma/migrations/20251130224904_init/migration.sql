-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('SUPERADMIN', 'DUENO', 'EMPLEADO', 'CLIENTE');

-- CreateEnum
CREATE TYPE "EstadoCancha" AS ENUM ('HABILITADA', 'DESHABILITADA', 'EN_MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('DISPONIBLE', 'RESERVADO', 'SENA_ENVIADA', 'CONFIRMADO', 'CANCELADO', 'EXPIRADO', 'AUSENTE', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'MERCADOPAGO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'ENVIADO', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT NOT NULL,
    "dni" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'CLIENTE',
    "password" TEXT,
    "complejoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complejo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "cbu" TEXT,
    "alias" TEXT,
    "titular" TEXT,
    "requiereSeña" BOOLEAN NOT NULL DEFAULT true,
    "porcentajeSeña" INTEGER NOT NULL DEFAULT 50,
    "minutosExpiracion" INTEGER NOT NULL DEFAULT 30,
    "permiteTurnosFijos" BOOLEAN NOT NULL DEFAULT true,
    "numeroWhatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propietarioId" TEXT,

    CONSTRAINT "Complejo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deporte" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT,
    "complejoId" TEXT NOT NULL,

    CONSTRAINT "Deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancha" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoCancha" NOT NULL DEFAULT 'HABILITADA',
    "precioBase" DECIMAL(10,2) NOT NULL,
    "complejoId" TEXT NOT NULL,
    "deporteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cancha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionHorarioCancha" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "duracionTurno" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "diasAdelante" INTEGER NOT NULL DEFAULT 30,
    "ultimaGeneracion" TIMESTAMP(3),
    "canchaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionHorarioCancha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrecioDinamico" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "porcentaje" INTEGER NOT NULL,
    "descripcion" TEXT,
    "canchaId" TEXT NOT NULL,

    CONSTRAINT "PrecioDinamico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "duracion" INTEGER NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'DISPONIBLE',
    "dni" TEXT,
    "nombreCliente" TEXT,
    "apellidoCliente" TEXT,
    "telefonoCliente" TEXT,
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "montoSeña" DECIMAL(10,2),
    "fechaReserva" TIMESTAMP(3),
    "fechaExpiracion" TIMESTAMP(3),
    "fechaConfirmacion" TIMESTAMP(3),
    "canchaId" TEXT NOT NULL,
    "complejoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "turnoFijoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "fechaEnvio" TIMESTAMP(3),
    "fechaValidacion" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "turnoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurnoFijo" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "duracion" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "usuarioId" TEXT NOT NULL,
    "canchaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TurnoFijo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_dni_key" ON "Usuario"("dni");

-- CreateIndex
CREATE INDEX "Usuario_telefono_idx" ON "Usuario"("telefono");

-- CreateIndex
CREATE INDEX "Usuario_dni_idx" ON "Usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Deporte_complejoId_nombre_key" ON "Deporte"("complejoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cancha_complejoId_nombre_key" ON "Cancha"("complejoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionHorarioCancha_canchaId_diaSemana_key" ON "ConfiguracionHorarioCancha"("canchaId", "diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "PrecioDinamico_canchaId_diaSemana_key" ON "PrecioDinamico"("canchaId", "diaSemana");

-- CreateIndex
CREATE INDEX "Turno_fecha_canchaId_idx" ON "Turno"("fecha", "canchaId");

-- CreateIndex
CREATE INDEX "Turno_estado_idx" ON "Turno"("estado");

-- CreateIndex
CREATE INDEX "Turno_dni_idx" ON "Turno"("dni");

-- CreateIndex
CREATE INDEX "Turno_telefonoCliente_idx" ON "Turno"("telefonoCliente");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_turnoId_key" ON "Pago"("turnoId");

-- CreateIndex
CREATE UNIQUE INDEX "TurnoFijo_canchaId_diaSemana_horaInicio_key" ON "TurnoFijo"("canchaId", "diaSemana", "horaInicio");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "Complejo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complejo" ADD CONSTRAINT "Complejo_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deporte" ADD CONSTRAINT "Deporte_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "Complejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancha" ADD CONSTRAINT "Cancha_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "Complejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancha" ADD CONSTRAINT "Cancha_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "Deporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionHorarioCancha" ADD CONSTRAINT "ConfiguracionHorarioCancha_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "Cancha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrecioDinamico" ADD CONSTRAINT "PrecioDinamico_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "Cancha"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "Complejo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_turnoFijoId_fkey" FOREIGN KEY ("turnoFijoId") REFERENCES "TurnoFijo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoFijo" ADD CONSTRAINT "TurnoFijo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnoFijo" ADD CONSTRAINT "TurnoFijo_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "Cancha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
