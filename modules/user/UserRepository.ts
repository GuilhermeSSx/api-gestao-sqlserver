import pool from '../../sqlserver';
import { ConnectionPool, Transaction } from 'mssql';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';

class UserRepository {
    private pool: ConnectionPool;

    constructor() {
        this.pool = pool;
    }

    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }

    private async runTransaction(queries: (request: any) => Promise<any>) {
        const transaction = new Transaction(this.pool);

        try {
            await transaction.begin();
            const requestInstance = transaction.request();
            const result = await queries(requestInstance);
            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async cadastrar(request: Request, response: Response) {
        const { name, email, password } = request.body;
        const passwordHash = await hash(password, 10);

        try {
            const result = await this.runTransaction(async (requestInstance) => {
                requestInstance.input('name', name);
                requestInstance.input('email', email);
                requestInstance.input('password', passwordHash);
                return requestInstance.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)');
            });

            response.status(200).json({ message: 'Usuário criado com sucesso!' });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async login(request: Request, response: Response) {
        let email: string;

        if (request.body && request.body.email) {
            email = request.body.email;
        } else {
            return this.handleError(response, 400, 'Email não fornecido');
        }

        try {
            const result = await this.runTransaction(async (requestInstance) => {
                requestInstance.input('email', email);
                return requestInstance.query('SELECT id, name, role, password FROM usuarios WHERE email = @email');
            });

            if (result.recordset.length === 0) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            const { id, name, role, password } = result.recordset[0];

            const passwordMatch = await compare(request.body.password, password);

            if (!passwordMatch) {
                return this.handleError(response, 400, 'Erro na autenticação');
            }

            const token = sign({ id, name, email, role }, process.env.SECRET as string, { expiresIn: "1d" });

            response.status(200).json({ id, name, email, role, token });
        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async getUsers(request: Request, response: Response) {
        try {
            const result = await this.runTransaction(async (requestInstance) => {
                return requestInstance.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC');
            });

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
            const result = await this.runTransaction(async (requestInstance) => {
                requestInstance.input('id', id);
                return requestInstance.query('DELETE FROM usuarios WHERE id = @id');
            });

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
            const result = await this.runTransaction(async (requestInstance) => {
                requestInstance.input('NomePerfilAcesso', nome_perfil_acesso);
                return requestInstance.execute('NomeDaSuaStoredProcedure');
            });

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
