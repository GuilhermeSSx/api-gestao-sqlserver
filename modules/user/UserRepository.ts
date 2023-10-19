import { pool } from '../../sqlserver';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';

class UserRepository {

    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }

    async cadastrar(request: Request, response: Response) {
        const { name, email, password } = request.body;
        try {
            const passwordHash = await hash(password, 10);
            const request = pool.request();
            request.input('name', name);
            request.input('email', email);
            request.input('password', passwordHash);

            await request.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)');
            response.status(200).json({ message: 'Usuário criado com sucesso!' });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async login(request: Request, response: Response) {
        let email: string; // Declare a variável 'email' aqui
        if (request.body && request.body.email) {
            email = request.body.email;
        } else {
            return this.handleError(response, 400, 'Email não fornecido');
        }

        try {
            const password = request.body.password;
            const poolRequest = pool.request();
            poolRequest.input('email', email);

            const result = await poolRequest.query('SELECT * FROM usuarios WHERE email = @email');
            if (result.recordset.length === 0) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            const passwordMatch = await compare(password, result.recordset[0].password);
            if (!passwordMatch) {
                return this.handleError(response, 400, 'Erro na sua autenticação');
            }

            const { id, name, role } = result.recordset[0]; // Removi 'email' daqui
            const token = sign({ id, name, email, role }, process.env.SECRET as string, { expiresIn: "1d" });

            response.status(200).json({ id, name, email, role, token });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const request = pool.request();
            const result = await request.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC');
            if (result.recordset) {
                response.status(200).json({ usuarios: result.recordset });
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

        try {
            const request = pool.request();
            request.input('id', id);

            const result = await request.query('DELETE FROM usuarios WHERE id = @id');
            if (result.rowsAffected[0] === 0) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            response.status(200).json({ message: 'Usuário excluído com sucesso', id });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async criarPerfilAcesso(request: Request, response: Response) {
        const { nome_perfil_acesso } = request.body;

        try {
            const poolRequest = pool.request();
            poolRequest.input('NomePerfilAcesso', nome_perfil_acesso);
            const result = await poolRequest.execute('NomeDaSuaStoredProcedure');

            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
            } else {
                response.status(400).json({ error: 'Erro ao criar o perfil de acesso' });
            }
        } catch (error) {
            this.handleError(response, 500, error);
        }
    }
}

export { UserRepository };
