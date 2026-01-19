"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_mssql_1 = require("@prisma/adapter-mssql");
const globalForPrisma = global;
const connectionString = process.env.DATABASE_URL;
const adapter = new adapter_mssql_1.PrismaMssql(connectionString);
exports.prisma = globalForPrisma.prisma || new client_1.PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
