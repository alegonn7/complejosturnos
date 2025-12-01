import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  // Así se define en Prisma 7 (uno solo)
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://canchas_user:canchas_password_dev@localhost:5432/canchas_db?schema=public'
  }
});
