import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export function getUsers() {
    return prisma.usuarios.findMany();
}

class UserRepository {

    async cadastrar(request: Request, response: Response) {
        // Adicionei tenant_id aqui caso venha do front, ou definimos padrão
        const { name, email, password, role_id, tenant_id } = request.body;

        try {
            const passwordHash = await hash(password, 10);

            await prisma.usuarios.create({
                data: {
                    name,
                    email,
                    password: passwordHash,
                    role_id: Number(role_id),
                    // Como definimos tenant_id NOT NULL no banco, precisamos passar algo.
                    // Se você ainda não tem login, assumimos o cliente 1 por enquanto.
                    tenant_id: tenant_id ? Number(tenant_id) : 1
                }
            });

            return response.status(200).json({ message: 'Usuário criado com sucesso!' });

        } catch (error: any) {
            // Tratamento de Erro do Prisma para PostgreSQL
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // O Postgres retorna qual campo falhou dentro de meta.target
                const target = error.meta?.target as string[];

                if (target && target.includes('name')) {
                    return response.status(409).json({ message: 'Este nome já está em uso.' });
                }
                if (target && target.includes('email')) {
                    return response.status(409).json({ message: 'Este e-mail já está em uso.' });
                }

                return response.status(409).json({ message: 'Dados duplicados no sistema.' });
            }

            return response.status(400).json({ message: 'Erro ao cadastrar usuário.', erro: error.message });
        }
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        try {
            // Verifica se usuario existe E se não foi deletado (Soft Delete)
            const user = await prisma.usuarios.findFirst({
                where: {
                    email,
                    deleted_at: null
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
                    role_id: user.role_id,
                    tenant_id: user.tenant_id // Importante colocar no token para usar depois
                },
                process.env.SECRET as string,
                { expiresIn: "1d" }
            );

            return response.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                token
            });
        } catch (error) {
            // console.error("ERRO DETALHADO:", error); // <--- ADICIONA ISTO
            return response.status(500).json({ message: 'Erro interno no login.' });
        }
    }

    async editUsuario(request: Request, response: Response) {
        const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;

        try {
            const dataToUpdate: any = {
                name: NAME,
                email: EMAIL,
                role_id: Number(ROLE_ID),
                updated_at: new Date() // Atualiza a data de modificação
            };

            // Só faz hash se a senha foi enviada
            if (PASSWORD && PASSWORD.trim() !== "") {
                dataToUpdate.password = await hash(PASSWORD, 10);
            }

            // Atualiza direto pelo Prisma (sem Procedure)
            await prisma.usuarios.update({
                where: { id: Number(ID) },
                data: dataToUpdate
            });

            return response.status(200).json({ message: `Usuário ${NAME} atualizado com sucesso!` });

        } catch (error: any) {
            // Mesmo tratamento de erro do Cadastrar (Unique Constraint)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target as string[];

                if (target && target.includes('name')) return response.status(409).json({ message: 'Este nome já está em uso.' });
                if (target && target.includes('email')) return response.status(409).json({ message: 'Este e-mail já está em uso.' });
            }

            console.error("Erro no editUsuario:", error);
            return response.status(500).json({ message: 'Erro interno ao processar edição.' });
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const usuarios = await prisma.usuarios.findMany({
                where: {
                    deleted_at: null // Traz apenas quem não foi excluído
                },
                select: { id: true, name: true, email: true, role_id: true },
                orderBy: { name: 'asc' }
            });
            return response.status(200).json({ usuarios });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao buscar usuários.' });
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        if (id === '585') { // Mantive sua trava de segurança hardcoded
            return response.status(401).json({ message: 'Ação não autorizada para este administrador.' });
        }

        try {
            // Soft Delete: Não apaga, apenas marca a data
            await prisma.usuarios.update({
                where: { id: Number(id) },
                data: { deleted_at: new Date() }
            });

            return response.status(200).json({ message: 'Usuário excluído com sucesso', id });
        } catch (error) {
            return response.status(404).json({ message: 'Usuário não encontrado ou erro ao excluir.' });
        }
    }

    async UsuariosFiltrados(request: Request, response: Response) {
        const { search } = request.body;

        try {
            // Busca nativa do Prisma (muito melhor que Procedure)
            const usuarios_filtrados = await prisma.usuarios.findMany({
                where: {
                    deleted_at: null, // Ignora excluídos
                    OR: [
                        // Busca case-insensitive (tanto faz maiúscula ou minúscula)
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                },
                select: { id: true, name: true, email: true, role_id: true }
            });

            return response.status(200).json({ usuarios_filtrados });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao filtrar usuários.' });
        }
    }

    async consultarRoleIdUsuario(request: Request, response: Response) {
        const { user_id } = request.body;

        try {
            const user = await prisma.usuarios.findUnique({
                where: { id: Number(user_id) },
                select: { role_id: true }
            });

            if (!user) return response.status(404).json({ message: 'Usuário não encontrado' });

            return response.status(200).json(user.role_id);

        } catch (error) {
            return response.status(500).json({ message: 'Erro ao consultar Role ID.' });
        }
    }
}

export { UserRepository };