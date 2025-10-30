import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { pool } from '../../sqlserver';

class UserRepository {
    async cadastrar(request: Request, response: Response) {
        const { name, email, password, role_id } = request.body;
        const passwordHash = await hash(password, 10);

        if (!pool.connected) {
            await pool.connect();
        }

        const transaction = pool.transaction();

        try {

            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('name', name);
            poolRequest.input('email', email);
            poolRequest.input('password', passwordHash);
            poolRequest.input('role_id', role_id);

            await poolRequest.query('INSERT INTO usuarios (name, email, password, role_id) VALUES (@name, @email, @password, @role_id)');
            await transaction.commit();

            response.status(200).json({ message: 'Usuário criado com sucesso!' });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }

    async login(request: Request, response: Response) {
        const { email, password } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('email', email);

            const result = await poolRequest.query('SELECT id, name, role_id, password FROM usuarios WHERE email = @email');
            const user = result.recordset[0];

            if (!user) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                return this.handleError(response, 400, 'Erro na autenticação');
            }

            const { id, name, userEmail, role_id, } = user;
            const token = sign({ id, name, userEmail, role_id }, process.env.SECRET as string, { expiresIn: "1d" });

            response.status(200).json({ id, name, userEmail, role_id, token });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async getUsers(request: Request, response: Response) {

        if (!pool.connected) {
            await pool.connect();
        }
        try {
            const poolRequest = pool.request();
            const result = await poolRequest.query('SELECT id, name, email, role_id FROM usuarios ORDER BY name ASC');
            const usuarios = result.recordset;

            response.status(200).json({ usuarios });

        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        if (id === '585') {
            return this.handleError(response, 401, 'Ação não autorizada, esse um usuario adminstrador padrão do sistema.');
        }

        if (!pool.connected) {
            await pool.connect();
        }

        const transaction = pool.transaction();

        try {
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

    async UsuariosFiltrados(request: Request, response: Response) {
        const { search } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('SEARCH', search);
            const result = await poolRequest.execute('uspFiltrarUsuarios');
            const usuarios_filtrados = result.recordset;

            response.status(200).json({ usuarios_filtrados });

        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async editUsuario(request: Request, response: Response) {
        const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {

            const poolRequest = pool.request();
            poolRequest.input('ID', ID);
            poolRequest.input('NAME', NAME);
            poolRequest.input('EMAIL', EMAIL);
            poolRequest.input('PASSWORD', PASSWORD);
            poolRequest.input('ROLE_ID', ROLE_ID);

            const result = await poolRequest.execute('uspEditUsuario');

            if (result.returnValue === 0) {
                response.status(200).json({ message: `Usuario ${NAME} atualizado com sucesso!` });
            } else {
                this.handleError(response, 400, result.recordset[0].Retorno);
            }
        } catch (error) {
            this.handleError(response, 500, error);
        }
    }



    async consultarRoleIdUsuario(request: Request, response: Response) {
        const { user_id } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('USER_ID', user_id);
            const result = await poolRequest.execute('uspConsultarRoleId');

            response.status(200).json(result.recordset[0]);

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }

    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }

}




export { UserRepository };