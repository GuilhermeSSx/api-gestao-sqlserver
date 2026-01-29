// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

// Carrega as variáveis de ambiente
dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`

// 1. Configura a conexão usando o driver 'pg'
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// 2. Passa o adapter para o PrismaClient
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Iniciando o seed...')

    // 1. Criar o Tenant (A Loja "Simples Ágil")
    const tenant = await prisma.tenant.create({
        data: {
            name: 'Simples Ágil Matriz',
            slug: 'simples-agil-matriz'
        }
    })

    console.log(`✅ Tenant criado: ${tenant.id}`)

    // 2. Criar o Usuário Admin
    const user = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@simplesagil.com.br',
            password: 'senha_hash_temporaria',
            tenantId: tenant.id
        }
    })

    console.log(`✅ Usuário criado: ${user.id}`)

    // 3. Criar um Produto de Exemplo
    const produto = await prisma.product.create({
        data: {
            tenantId: tenant.id,
            name: 'Camiseta Developer 2026',
            sku: 'DEV-2026-TS',
            priceSale: 89.90,
            priceCost: 45.00,
            stockQuantity: 100,
            specifications: {
                cor: 'Preta',
                tamanho: 'G',
                material: 'Algodão Egípcio'
            },
            images: {
                create: {
                    imageUrl: 'https://simplesagil.com.br/demo/camiseta.jpg',
                    isCover: true
                }
            }
        }
    })

    console.log(`✅ Produto criado: ${produto.id}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })