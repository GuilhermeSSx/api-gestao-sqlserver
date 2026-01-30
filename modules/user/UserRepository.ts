import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt'; // Recomendo usar bcryptjs para evitar problemas de compilação em alguns OS
import { sign } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Prisma, Role } from '@prisma/client'; // <--- Importar o Enum Role

export class UserRepository {

    async cadastrar(request: Request, response: Response) {
        // Recebemos 'role' (ex: "ADMIN") e tenant_id como string
        const { name, email, password, role, tenant_id } = request.body;

        try {
            const passwordHash = await hash(password, 10);

            if (!tenant_id) {
                return response.status(400).json({ message: 'tenant_id é obrigatório.' });
            }

            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: passwordHash,
                    // Agora usamos o campo 'role' com o Enum.
                    // Se não vier nada, assume USER por segurança.
                    role: (role as Role) || Role.USER,
                    tenantId: tenant_id
                }
            });

            return response.status(200).json({ message: 'Usuário criado com sucesso!' });

        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target as string[] || [];
                const errorMessage = error.message || "";

                const isEmailConflict = target.includes('email') || errorMessage.includes('idx_users_email');
                const isNameConflict = target.includes('name') || errorMessage.includes('idx_users_name');

                if (isNameConflict) return response.status(409).json({ message: 'Este nome já está em uso.' });
                if (isEmailConflict) return response.status(409).json({ message: 'Este e-mail já está em uso.' });

                return response.status(409).json({ message: 'Dados duplicados.' });
            }
            return response.status(400).json({ message: 'Erro ao cadastrar usuário.', erro: error.message });
        }
    }

    async editUsuario(request: Request, response: Response) {
        // Mantendo compatibilidade com seu Front (chaves em maiúsculo)
        // ROLE_ID agora deve vir como string (ex: "ADMIN" ou "USER")
        const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;

        try {
            const dataToUpdate: any = {
                name: NAME,
                email: EMAIL,
                // Atualiza o enum role
                role: ROLE_ID as Role,
                updatedAt: new Date()
            };

            if (PASSWORD && PASSWORD.trim() !== "") {
                dataToUpdate.password = await hash(PASSWORD, 10);
            }

            await prisma.user.update({
                where: { id: ID },
                data: dataToUpdate
            });

            return response.status(200).json({ message: `Usuário ${NAME} atualizado com sucesso!` });

        } catch (error: any) {
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
                    role: user.role, // Agora retorna a string do Enum (SUPER_ADMIN, ADMIN, etc)
                    tenant_id: user.tenantId
                },
                process.env.SECRET as string,
                { expiresIn: "1d" }
            );

            return response.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenant_id: user.tenantId,
                token
            });
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno no login.' });
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const usuarios = await prisma.user.findMany({
                where: { deletedAt: null },
                // Seleciona role em vez de roleId
                select: { id: true, name: true, email: true, role: true },
                orderBy: { name: 'asc' }
            });
            return response.status(200).json({ usuarios });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao buscar usuários.' });
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        try {
            // Buscamos o usuário antes de tentar excluir
            const userToDelete = await prisma.user.findUnique({
                where: { id }
            });

            if (!userToDelete) {
                return response.status(404).json({ message: 'Usuário não encontrado.' });
            }

            // --- TRAVA DE SEGURANÇA ---
            // 1. Protege o SUPER_ADMIN (Você)
            if (userToDelete.role === 'SUPER_ADMIN') {
                return response.status(403).json({ message: 'Operação não permitida: Não é possível excluir o Super Admin.' });
            }

            // 2. Protege o ADMIN (Dono da Loja/Cliente Pagante)
            if (userToDelete.role === 'ADMIN') {
                return response.status(403).json({
                    message: 'Atenção: Não é possível excluir o Dono da Loja. Para encerrar o acesso, é necessário cancelar a assinatura da empresa.'
                });
            }

            // Se for MANAGER ou USER, prossegue com a exclusão (Soft Delete)
            await prisma.user.update({
                where: { id: id },
                data: { deletedAt: new Date() }
            });

            return response.status(200).json({ message: 'Usuário excluído com sucesso', id });

        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            return response.status(500).json({ message: 'Erro interno ao tentar excluir o usuário.' });
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
                select: { id: true, name: true, email: true, role: true } // role atualizado
            });

            return response.status(200).json({ usuarios_filtrados });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao filtrar usuários.' });
        }
    }

    async consultarRoleUsuario(request: Request, response: Response) {
        // Alterei o nome do método para consultarRoleUsuario (sem ID no nome)
        // Mas a rota pode continuar a mesma se quiser
        const { user_id } = request.body;

        try {
            if (!user_id) return response.status(400).json({ message: 'user_id obrigatório' });

            const user = await prisma.user.findUnique({
                where: { id: user_id },
                select: { role: true } // Seleciona role
            });

            if (!user) return response.status(404).json({ message: 'Usuário não encontrado' });

            return response.status(200).json(user.role); // Retorna "ADMIN", "USER", etc.
        } catch (error) {
            return response.status(500).json({ message: 'Erro interno.' });
        }
    }
}