import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';


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
        } catch (error) {
            return this.handleError(response, 400, error);
        }
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        try {
            const user = await prisma.usuarios.findUnique({
                where: { email }
            });

            if (!user) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                return this.handleError(response, 400, 'Erro na autenticação');
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
            return this.handleError(response, 400, error);
        }
    }

    async editUsuario(request: Request, response: Response) {
        const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;

        try {
            let passwordHash: string | null = null;
            if (PASSWORD && PASSWORD.trim() !== "") {
                passwordHash = await hash(PASSWORD, 10);
            }

            // Executa a procedure de edição usando tagged template literals
            await prisma.$queryRaw`
            EXEC uspEditUsuario 
                @ID = ${ID}, 
                @NAME = ${NAME}, 
                @EMAIL = ${EMAIL}, 
                @PASSWORD = ${passwordHash}, 
                @ROLE_ID = ${ROLE_ID}
        `;

            return response.status(200).json({ message: `Usuario ${NAME} atualizado com sucesso!` });
        } catch (error) {
            return this.handleError(response, 500, error);
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const usuarios = await prisma.usuarios.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role_id: true
                },
                orderBy: { name: 'asc' }
            });

            return response.status(200).json({ usuarios });
        } catch (error) {
            return this.handleError(response, 400, error);
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        if (id === '585') {
            return this.handleError(response, 401, 'Ação não autorizada, esse é um usuário administrador padrão.');
        }

        try {
            await prisma.usuarios.delete({
                where: { id: Number(id) }
            });

            return response.status(200).json({ message: 'Usuário excluído com sucesso', id });
        } catch (error) {
            return this.handleError(response, 404, 'Usuário não encontrado ou erro ao excluir');
        }
    }

    async UsuariosFiltrados(request: Request, response: Response) {
        const { search } = request.body;
        try {
            // Usando template literal para passar o parâmetro de forma segura
            const usuarios_filtrados = await prisma.$queryRaw`EXEC uspFiltrarUsuarios @SEARCH = ${search}`;

            return response.status(200).json({ usuarios_filtrados });
        } catch (error) {
            return this.handleError(response, 400, error);
        }
    }

    async consultarRoleIdUsuario(request: Request, response: Response) {
        const { user_id } = request.body;
        try {
            // Note que usamos ` ` (crase) e passamos a variável direto no ${}
            const result: any = await prisma.$queryRaw`EXEC uspConsultarRoleId @USER_ID = ${user_id}`;

            return response.status(200).json(result[0]);
        } catch (error) {
            return this.handleError(response, 500, error);
        }
    }

    private handleError(response: Response, status: number, error: any) {
        return response.status(status).json({ error: error.toString() });
    }
}

export { UserRepository };