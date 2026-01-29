import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {

    async cadastrar(request: Request, response: Response) {
        // Agora tenant_id é string (UUID), não converta para Number
        const { name, email, password, role_id, tenant_id } = request.body;

        try {
            const passwordHash = await hash(password, 10);

            // Verifica se tem tenant_id (obrigatório agora com UUID)
            if (!tenant_id) {
                return response.status(400).json({ message: 'tenant_id é obrigatório.' });
            }

            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: passwordHash,
                    roleId: Number(role_id), // Mantido Number pois no schema é Int
                    tenantId: tenant_id // Passa direto como string (UUID)
                }
            });

            return response.status(200).json({ message: 'Usuário criado com sucesso!' });

        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target as string[] || [];
                const errorMessage = error.message || "";

                // Ajuste para pegar os nomes dos índices que definimos no map: "idx_users_..."
                const isEmailConflict = target.includes('email') || errorMessage.includes('idx_users_email');
                const isNameConflict = target.includes('name') || errorMessage.includes('idx_users_name');

                if (isNameConflict) {
                    return response.status(409).json({ message: 'Este nome já está em uso.' });
                }
                if (isEmailConflict) {
                    return response.status(409).json({ message: 'Este e-mail já está em uso.' });
                }

                return response.status(409).json({ message: 'Dados duplicados.' });
            }

            return response.status(400).json({ message: 'Erro ao cadastrar usuário.', erro: error.message });
        }
    }

    async editUsuario(request: Request, response: Response) {
        // ID agora é string (UUID)
        const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;

        try {
            const dataToUpdate: any = {
                name: NAME,
                email: EMAIL,
                roleId: Number(ROLE_ID), // Mantido Number
                updatedAt: new Date()    // Corrigido para camelCase (updatedAt) conforme schema
            };

            if (PASSWORD && PASSWORD.trim() !== "") {
                dataToUpdate.password = await hash(PASSWORD, 10);
            }

            await prisma.user.update({
                where: { id: ID }, // Sem Number(), UUID é string
                data: dataToUpdate
            });

            return response.status(200).json({ message: `Usuário ${NAME} atualizado com sucesso!` });

        } catch (error: any) {
            // Lógica de erro de duplicidade mantida
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target as string[] || [];
                const errorMessage = error.message || "";
                
                if (target.includes('name') || errorMessage.includes('idx_users_name')) {
                     return response.status(409).json({ message: 'Este nome já está em uso.' });
                }
                if (target.includes('email') || errorMessage.includes('idx_users_email')) {
                    return response.status(409).json({ message: 'Este e-mail já está em uso.' });
                }
            }

            console.error("Erro no editUsuario:", error);
            return response.status(500).json({ message: 'Erro interno ao processar edição.' });
        }
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        try {
            const user = await prisma.user.findFirst({
                where: {
                    email,
                    deletedAt: null
                }
            });

            if (!user) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                return response.status(401).json({ message: 'Erro na autenticação' });
            }

            const token = sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role_id: user.roleId,
                    tenant_id: user.tenantId // UUID String
                },
                process.env.SECRET as string,
                { expiresIn: "1d" }
            );

            return response.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.roleId,
                token
            });
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno no login.' });
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const usuarios = await prisma.user.findMany({
                where: {
                    deletedAt: null
                },
                select: { id: true, name: true, email: true, roleId: true },
                orderBy: { name: 'asc' }
            });
            return response.status(200).json({ usuarios });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao buscar usuários.' });
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        // ATENÇÃO: A lógica antiga (id === '585') não funciona com UUID.
        // Se você quiser proteger o admin, verifique pelo email ou flag no banco.
        /* if (id === 'uuid-do-admin-aqui') { 
            return response.status(401).json({ message: 'Ação não autorizada.' });
        }
        */

        try {
            await prisma.user.update({
                where: { id: id }, // Sem Number(), UUID é string
                data: { deletedAt: new Date() }
            });

            return response.status(200).json({ message: 'Usuário excluído com sucesso', id });
        } catch (error) {
            return response.status(404).json({ message: 'Usuário não encontrado ou erro ao excluir.' });
        }
    }

    async UsuariosFiltrados(request: Request, response: Response) {
        const { search } = request.body;

        try {
            const usuarios_filtrados = await prisma.user.findMany({
                where: {
                    deletedAt: null,
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                },
                select: { id: true, name: true, email: true, roleId: true }
            });

            return response.status(200).json({ usuarios_filtrados });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao filtrar usuários.' });
        }
    }

    async consultarRoleIdUsuario(request: Request, response: Response) {
        const { user_id } = request.body;

        try {
            // Se user_id vier vazio ou undefined, findUnique quebra. Validamos antes.
            if (!user_id) return response.status(400).json({ message: 'user_id obrigatório' });

            const user = await prisma.user.findUnique({
                where: { id: user_id }, // UUID direto
                select: { roleId: true }
            });

            if (!user) return response.status(404).json({ message: 'Usuário não encontrado' });

            return response.status(200).json(user.roleId);
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno.' });
        }
    }
}