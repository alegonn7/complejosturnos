-- AlterTable
ALTER TABLE "Complejo" ADD COLUMN     "mercadoPagoAccessToken" TEXT,
ADD COLUMN     "mercadoPagoPublicKey" TEXT,
ADD COLUMN     "mercadoPagoQR" TEXT;

-- AlterTable
ALTER TABLE "TurnoFijo" ADD COLUMN     "requiereSeña" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "HistorialTurnoFijo" (
    "id" TEXT NOT NULL,
    "turnoFijoId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialTurnoFijo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistorialTurnoFijo" ADD CONSTRAINT "HistorialTurnoFijo_turnoFijoId_fkey" FOREIGN KEY ("turnoFijoId") REFERENCES "TurnoFijo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
