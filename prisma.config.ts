import { defineConfig } from "prisma/config";

export default defineConfig({
  // Se o seu seed for via TSX, isso é ótimo manter aqui
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  // O schema e a URL o Prisma 7 já detecta automaticamente do schema.prisma e .env
});