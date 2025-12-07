import { PrismaClient } from '@prisma/client';

// Singleton pattern para Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};


export * from '@prisma/client';