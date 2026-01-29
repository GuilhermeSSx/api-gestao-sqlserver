import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Adicione esta linha abaixo informando para usar o tsx
    seed: "tsx prisma/seed.ts", 
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});