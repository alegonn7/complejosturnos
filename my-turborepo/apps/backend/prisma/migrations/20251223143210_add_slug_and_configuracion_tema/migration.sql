/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Complejo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Complejo" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "ConfiguracionTema" (
    "id" TEXT NOT NULL,
    "complejoId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "nombreMostrar" TEXT NOT NULL,
    "colorPrimario" TEXT NOT NULL DEFAULT '#0a0a0a',
    "colorSecundario" TEXT NOT NULL DEFAULT '#404040',
    "colorAccent" TEXT NOT NULL DEFAULT '#22c55e',
    "colorFondo" TEXT NOT NULL DEFAULT '#ffffff',
    "textoHeroPrincipal" TEXT,
    "textoHeroSecundario" TEXT,
    "textoFooter" TEXT,
    "textoWhatsApp" TEXT,
    "bannerHomeUrl" TEXT,
    "bannerReservaUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "fontFamily" TEXT DEFAULT 'Inter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionTema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionTema_complejoId_key" ON "ConfiguracionTema"("complejoId");

-- CreateIndex
CREATE INDEX "ConfiguracionTema_complejoId_idx" ON "ConfiguracionTema"("complejoId");

-- CreateIndex
CREATE UNIQUE INDEX "Complejo_slug_key" ON "Complejo"("slug");

-- AddForeignKey
ALTER TABLE "ConfiguracionTema" ADD CONSTRAINT "ConfiguracionTema_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "Complejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
