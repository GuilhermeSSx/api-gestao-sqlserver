"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("prisma/config");
exports.default = (0, config_1.defineConfig)({
    // Se o seu seed for via TSX, isso é ótimo manter aqui
    migrations: {
        seed: 'tsx prisma/seed.ts',
    },
    // O schema e a URL o Prisma 7 já detecta automaticamente do schema.prisma e .env
});
