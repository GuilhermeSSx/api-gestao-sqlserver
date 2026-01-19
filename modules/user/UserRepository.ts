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
        const { name, email, password, role_id } = request.body;

        try {
            const passwordHash = await hash(password, 10);

            await prisma.usuarios.create({
                data: {
                    name,
                    email,
                    password: passwordHash,
                    role_id: Number(role_id)
                }
            });

            return response.status(200).json({ message: 'Usuário criado com sucesso!' });
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // Extrai a mensagem real do driver do SQL Server
                const driverError = (error.meta?.driverAdapterError as any)?.cause?.originalMessage || "";
                const fullMessage = error.message + driverError;

                // Mapeamento direto das constraints do seu Banco de Dados
                const nameConflict = fullMessage.includes('NomeUnico');
                const emailConflict = fullMessage.includes('EmailUnico');

                if (nameConflict) {
                    return response.status(409).json({ message: 'Este nome já está em uso.' });
                }
                if (emailConflict) {
                    return response.status(409).json({ message: 'Este e-mail já está em uso.' });
                }

                return response.status(409).json({ message: 'Este registro já existe no sistema.' });
            }

            return response.status(400).json({ message: 'Erro ao cadastrar usuário.' });
        }
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        try {
            const user = await prisma.usuarios.findUnique({ where: { email } });

            if (!user) {
                return response.status(404).json({ message: 'Usuário não encontrado' });
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                return response.status(401).json({ message: 'Erro na autenticação' });
            }

            const token = sign(
                { id: user.id, name: user.name, email: user.email, role_id: user.role_id },
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
            return response.status(500).json({ message: 'Erro interno no login.' });
        }
    }

    async editUsuario(request: Request, response: Response) {
        const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;

        try {
            let passwordHash: string | null = null;
            if (PASSWORD && PASSWORD.trim() !== "") {
                passwordHash = await hash(PASSWORD, 10);
            }

            // Executa a procedure e captura o SELECT ERROR_MESSAGE() do seu BEGIN CATCH
            const result: any[] = await prisma.$queryRaw`
            EXEC uspEditUsuario 
                @ID = ${ID}, 
                @NAME = ${NAME}, 
                @EMAIL = ${EMAIL}, 
                @PASSWORD = ${passwordHash}, 
                @ROLE_ID = ${ROLE_ID}
        `;

            const sqlError = result?.[0]?.Retorno;

            if (sqlError) {
                // Mapeamento direto usando os nomes das constraints que testamos no banco
                const nameConflict = sqlError.includes('NomeUnico');
                const emailConflict = sqlError.includes('EmailUnico');

                if (nameConflict) {
                    return response.status(409).json({ message: 'Não foi possível atualizar: este nome já está em uso.' });
                }
                if (emailConflict) {
                    return response.status(409).json({ message: 'Não foi possível atualizar: este e-mail já está em uso.' });
                }

                // Caso seja outro erro capturado pelo CATCH da procedure
                return response.status(400).json({ message: sqlError });
            }

            return response.status(200).json({ message: `Usuário ${NAME} atualizado com sucesso!` });

        } catch (error: any) {
            console.error("Erro crítico no editUsuario:", error);
            return response.status(500).json({ message: 'Erro interno ao processar edição.' });
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const usuarios = await prisma.usuarios.findMany({
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

        if (id === '585') {
            return response.status(401).json({ message: 'Ação não autorizada para este administrador.' });
        }

        try {
            await prisma.usuarios.delete({ where: { id: Number(id) } });
            return response.status(200).json({ message: 'Usuário excluído com sucesso', id });
        } catch (error) {
            return response.status(404).json({ message: 'Usuário não encontrado ou erro ao excluir.' });
        }
    }

    async UsuariosFiltrados(request: Request, response: Response) {
        const { search } = request.body;
        try {
            const usuarios_filtrados = await prisma.$queryRaw`EXEC uspFiltrarUsuarios @SEARCH = ${search}`;
            return response.status(200).json({ usuarios_filtrados });
        } catch (error) {
            return response.status(400).json({ message: 'Erro ao filtrar usuários.' });
        }
    }

    async consultarRoleIdUsuario(request: Request, response: Response) {
        const { user_id } = request.body;
        try {
            const result: any = await prisma.$queryRaw`EXEC uspConsultarRoleId @USER_ID = ${user_id}`;
            return response.status(200).json(result[0]);
        } catch (error) {
            return response.status(500).json({ message: 'Erro ao consultar Role ID.' });
        }
    }
}

export { UserRepository };