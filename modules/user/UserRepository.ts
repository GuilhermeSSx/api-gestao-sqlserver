import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { pool } from '../../sqlserver';

class UserRepository {
    async cadastrar(request: Request, response: Response) {
        const { name, email, password } = request.body;
        const passwordHash = await hash(password, 10);

        const transaction = pool.transaction();

        try {
            pool.connect();
            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('name', name);
            poolRequest.input('email', email);
            poolRequest.input('password', passwordHash);

            await poolRequest.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)');
            await transaction.commit();

            response.status(200).json({ message: 'Usuário criado com sucesso!' });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        try {
            pool.connect();
            const poolRequest = pool.request();
            poolRequest.input('email', email);

            const result = await poolRequest.query('SELECT id, name, role, password FROM usuarios WHERE email = @email');
            const user = result.recordset[0];

            if (!user) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                return this.handleError(response, 400, 'Erro na autenticação');
            }

            const { id, name, role } = user;
            const token = sign({ id, name, email, role }, process.env.SECRET as string, { expiresIn: "1d" });

            response.status(200).json({ id, name, email, role, token });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            pool.connect();
            const poolRequest = pool.request();
            const result = await poolRequest.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC');
            const usuarios = result.recordset;

            if (usuarios.length > 0) {
                response.status(200).json({ usuarios });
            } else {
                response.status(404).json({ error: "Nenhum usuário encontrado" });
            }
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        if (id === '585') {
            return this.handleError(response, 401, 'Ação não autorizada, contate o administrador do sistema');
        }

        const transaction = pool.transaction();

        try {
            pool.connect();
            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('id', id);

            const result = await poolRequest.query('DELETE FROM usuarios WHERE id = @id');
            const rowsAffected = result.rowsAffected[0];

            if (rowsAffected === 0) {
                await transaction.rollback();
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            await transaction.commit();

            response.status(200).json({ message: 'Usuário excluído com sucesso', id });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }

    async criarPerfilAcesso(request: Request, response: Response) {
        const { nome_perfil_acesso } = request.body;

        const transaction = pool.transaction();

        try {
            pool.connect();
            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('NomePerfilAcesso', nome_perfil_acesso);
            const result = await poolRequest.execute('NomeDaSuaStoredProcedure');

            if (result.returnValue === 0) {
                await transaction.commit();
                response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
            } else {
                await transaction.rollback();
                response.status(400).json({ error: 'Erro ao criar o perfil de acesso' });
            }
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 500, error);
        }
    }

    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }
}

export { UserRepository };
