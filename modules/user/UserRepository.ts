import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { pool } from '../../sqlserver';

class UserRepository {
    async cadastrar(request: Request, response: Response) {
        const { name, email, password, role } = request.body;
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
            poolRequest.input('role', role);

            await poolRequest.query('INSERT INTO usuarios (name, email, password, role) VALUES (@name, @email, @password, @role)');
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

            const result = await poolRequest.query('SELECT id, name, role, password FROM usuarios WHERE email = @email');
            const user = result.recordset[0];

            if (!user) {
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            const passwordMatch = await compare(password, user.password);
            if (!passwordMatch) {
                return this.handleError(response, 400, 'Erro na autenticação');
            }

            const { id, name, userEmail, role, } = user;
            const token = sign({ id, name, userEmail, role }, process.env.SECRET as string, { expiresIn: "1d" });

            response.status(200).json({ id, name, userEmail, role, token });
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
            const result = await poolRequest.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC');
            const usuarios = result.recordset;

            response.status(200).json({ usuarios });

        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        if (id === '585') {
            return this.handleError(response, 401, 'Ação não autorizada, contate o administrador do sistema');
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

    async criarPerfilAcesso(request: Request, response: Response) {
        const { nome_perfil_acesso } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('NOME_PERFIL_ACESSO', nome_perfil_acesso);
            const result = await poolRequest.execute('uspCriarPerfilAcesso');


            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
            } else {
                // console.log(result.recordset[0].Retorno);
                this.handleError(response, 400, result.recordset[0].Retorno);
            }

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }

    async getPerfilAcessos(request: Request, response: Response) {

        if (!pool.connected) {
            await pool.connect();
        }
        try {
            const poolRequest = pool.request();
            const result = await poolRequest.query('SELECT id_perfil_acesso, nome_perfil_acesso FROM perfil_acesso ORDER BY nome_perfil_acesso ASC');
            const perfil_acessos = result.recordset;

            response.status(200).json({ perfil_acessos });

        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async excluirPerfilAcesso(request: Request, response: Response) {
        const { id_perfil_acesso } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('ID_PERFIL_ACESSO', id_perfil_acesso);
            const result = await poolRequest.execute('uspExcluirPerfilAcesso');

            if (result.returnValue === 0) {
                response.status(200).json({ message: result.recordset[0].Retorno });
            } else {
                // console.log(result.recordset[0].Retorno);
                this.handleError(response, 400, result.recordset[0].Retorno);
            }

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }

    async carregarPerfilAcesso(request: Request, response: Response) {
        const { id_perfil_acesso } = request.body;
    
        if (!pool.connected) {
            await pool.connect();
        }
    
        try {
            const poolRequest = pool.request();
            poolRequest.input('ID_PERFIL_ACESSO', id_perfil_acesso);
            const result = await poolRequest.execute('uspCarregarPerfilAcesso');
            let modulos_acessos;
            let funcionalidades_acessos;
    
            if (Array.isArray(result.recordsets)) {
                // Se for um array, você pode acessar o índice '0' para obter os resultados
                modulos_acessos = result.recordsets[0];
                funcionalidades_acessos = result.recordsets[1];
            } else {
                // Caso contrário, é um objeto com índices de string, você pode acessar pelo nome
                modulos_acessos = result.recordsets['0'];
                funcionalidades_acessos = result.recordsets['1'];
            }
    
            if (result.returnValue === 0) {
                response.status(200).json({ modulos_acessos, funcionalidades_acessos });
            } else {
                this.handleError(response, 400, result.recordset[0].Retorno);
            }
        } catch (error) {
            this.handleError(response, 500, error);
        }
    }

    async updateAcessoModulo(request: Request, response: Response) {
        const { ID_MODULO_ACESSO_LIST, ACESSO_LIST } = request.body;

        if (ID_MODULO_ACESSO_LIST === '') {
            return this.handleError(response, 401, 'Nenhum ou algum ID_MODULO_ACESSO_LIST não encontrado.');
        }
    
        if (!pool.connected) {
            await pool.connect();
        }
    
        try {
            const poolRequest = pool.request();
            poolRequest.input('ID_MODULO_ACESSO_LIST', ID_MODULO_ACESSO_LIST);
            poolRequest.input('ACESSO_LIST', ACESSO_LIST);
            const result = await poolRequest.execute('uspAtualizarModuloAcesso');

            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Modulo Acesso atualizado com sucesso!' });
            } else {
                this.handleError(response, 400, result.recordset[0].Retorno);
            }

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }

    async updateAcessoFuncionalidade(request: Request, response: Response) {
        const { ID_FUNCIONALIDADE_ACESSO_LIST, ACESSO_LIST } = request.body;

        if (ID_FUNCIONALIDADE_ACESSO_LIST === '') {
            return this.handleError(response, 401, 'Nenhum ou algum ID_MODULO_ACESSO_LIST não encontrado.');
        }
    
        if (!pool.connected) {
            await pool.connect();
        }
    
        try {
            const poolRequest = pool.request();
            poolRequest.input('ID_FUNCIONALIDADE_ACESSO_LIST', ID_FUNCIONALIDADE_ACESSO_LIST);
            poolRequest.input('ACESSO_LIST', ACESSO_LIST);
            const result = await poolRequest.execute('uspAtualizarFuncionalidadeAcesso');

            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Funcionalidade Acesso atualizado com sucesso!' });
            } else {
                this.handleError(response, 400, result.recordset[0].Retorno);
            }

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }
    





    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }

}

export { UserRepository };
