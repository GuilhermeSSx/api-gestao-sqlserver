import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Configura a conexão usando o driver nativo 'pg'
const connectionString = `${process.env.DATABASE_URL}`

// Cria o pool de conexões do Postgres
const pool = new Pool({ connectionString })
// Cria o adaptador que liga o Prisma a esse pool
const adapter = new PrismaPg(pool)

// Evita múltiplas conexões durante o desenvolvimento (Hot Reload do tsx watch)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // Usa o adaptador Postgres
    // log: ['query', 'info', 'warn', 'error'],
  })

// Se não estiver em produção, guarda a conexão na variável global
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma