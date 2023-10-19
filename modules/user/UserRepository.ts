import { pool } from '../../sqlserver';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response } from 'express';

class UserRepository {

    cadastrar(request: Request, response: Response) {
        const { name, email, password } = request.body;

        pool.connect().then(() => {
            hash(password, 10, (err, passwordHash) => {
                if (err) {
                    pool.close();
                    return response.status(500).json(err);
                }

                const request = pool.request();
                request.input('name', name);
                request.input('email', email);
                request.input('password', passwordHash);

                request.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)')
                    .then(() => {
                        pool.close();
                        response.status(200).json({ message: 'Usuário criado com sucesso!' });
                    })
                    .catch((error) => {
                        pool.close();
                        response.status(400).json(error);
                    });
            });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }

    login(request: Request, response: Response) {
        const { email, password } = request.body;

        pool.connect().then(() => {
            const request = pool.request();
            request.input('email', email);

            request.query('SELECT * FROM usuarios WHERE email = @email')
                .then((result) => {
                    pool.close();

                    if (result.recordset.length === 0) {
                        return response.status(404).json({ error: "Usuário não encontrado" });
                    }

                    compare(password, result.recordset[0].password, (err, passwordMatch) => {
                        if (err || !passwordMatch) {
                            return response.status(400).json({ error: "Erro na sua autenticação!" });
                        }

                        // jsonwebtoken JWT
                        const token = sign({
                            id: result.recordset[0].id,
                            name: result.recordset[0].name,
                            email: result.recordset[0].email,
                            role: result.recordset[0].role
                        }, process.env.SECRET as string, { expiresIn: "1d" });

                        const id = result.recordset[0].id;
                        const name = result.recordset[0].name;
                        const userEmail = result.recordset[0].email;
                        const role = result.recordset[0].role;

                        return response.status(200).json({ id, name, userEmail, role, token: token });
                    });
                })
                .catch((error) => {
                    pool.close();
                    response.status(400).json({ error: "Erro na sua autenticação!" });
                });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }

    getUsers(request: Request, response: Response) {
        pool.connect().then(() => {
            const request = pool.request();

            request.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC')
                .then((result) => {
                    pool.close();
                    if (result.recordset) {
                        response.status(200).json({ usuarios: result.recordset });
                    } else {
                        response.status(404).json({ error: "Nenhum usuário encontrado" });
                    }
                })
                .catch((error) => {
                    pool.close();
                    response.status(400).json({ error: "Erro ao carregar os usuários" });
                });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }

    deleteUser(request: Request, response: Response) {
        const { id } = request.params;

        if (id === '585') {
            return response.status(401).json({ error: "Ação não autorizada, contate o administrador do sistema", id });
        }

        pool.connect().then(() => {
            const request = pool.request();
            request.input('id', id);

            request.query('DELETE FROM usuarios WHERE id = @id')
                .then((result) => {
                    pool.close();

                    if (result.rowsAffected[0] === 0) {
                        return response.status(404).json({ error: "Usuário não encontrado" });
                    }

                    return response.status(200).json({ message: "Usuário excluído com sucesso", id });
                })
                .catch((error) => {
                    pool.close();
                    response.status(500).json({ error: "Erro ao deletar o usuário", id });
                });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }

    async criarPerfilAcesso(request: Request, response: Response) {
        const { nome_perfil_acesso } = request.body;

        try {
            const poolRequest = pool.request();

            // Defina o valor do parâmetro da stored procedure
            poolRequest.input('NomePerfilAcesso', nome_perfil_acesso);

            // Execute a stored procedure
            const result = await poolRequest.execute('NomeDaSuaStoredProcedure');

            // Verifique se a stored procedure foi executada com sucesso
            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
            } else {
                response.status(400).json({ error: 'Erro ao criar o perfil de acesso' });
            }
        } catch (error) {
            response.status(500).json(error);
        }
    }

    





}

export { UserRepository };
