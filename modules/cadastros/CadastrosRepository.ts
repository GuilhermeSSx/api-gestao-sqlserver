import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { pool } from '../../sqlserver';

class CadastrosRepository {

    async cadastroCentroCusto(request: Request, response: Response) {

        const { nome_centro_custo } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        const transaction = pool.transaction();

        try {

            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('nome_centro_custo', nome_centro_custo);

            await poolRequest.query('INSERT INTO centro_custo (nome_centro_custo) VALUES (@nome_centro_custo)');
            await transaction.commit();

            response.status(200).json({ message: 'Centro de custo criado com sucesso!' });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }


    async getCentrosCusto(request: Request, response: Response) {

        if (!pool.connected) {
            await pool.connect();
        }
        try {
            const poolRequest = pool.request();
            const result = await poolRequest.query('SELECT id_centro_custo, nome_centro_custo FROM centro_custo ORDER BY nome_centro_custo ASC');
            const centro_custo = result.recordset;

            response.status(200).json({ centro_custo });

        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async updateCentroCusto(request: Request, response: Response) {
        const { id_centro_custo, nome_centro_custo } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('ID_CENTRO_CUSTO', id_centro_custo);
            poolRequest.input('NOME_CENTRO_CUSTO', nome_centro_custo);
            const result = await poolRequest.execute('uspAtualizarCentroCusto');

            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Centro de custo atualizado para: ' + nome_centro_custo });
            } else {
                this.handleError(response, 400, result.recordset[0].Retorno);
            }

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }

    async excluirCentroCusto(request: Request, response: Response) {
        const { id_centro_custo } = request.params;

        if (!pool.connected) {
            await pool.connect();
        }

        const transaction = pool.transaction();

        try {
            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('id_centro_custo', id_centro_custo);

            const result = await poolRequest.query('DELETE FROM centro_custo WHERE id_centro_custo = @id_centro_custo');
            const rowsAffected = result.rowsAffected[0];

            if (rowsAffected === 0) {
                await transaction.rollback();
                return this.handleError(response, 404, 'Usuário não encontrado');
            }

            await transaction.commit();

            response.status(200).json({ message: 'Centro de custo excluído com sucesso', id_centro_custo });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }

    async cadastroClassSaida(request: Request, response: Response) {

        const { nome_class_saida } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        const transaction = pool.transaction();

        try {

            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('nome_class_saida', nome_class_saida);

            await poolRequest.query('INSERT INTO class_saida (nome_class_saida) VALUES (@nome_class_saida)');
            await transaction.commit();

            response.status(200).json({ message: 'Classificação de saida criada com sucesso!' });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }


    async getClassSaida(request: Request, response: Response) {

        if (!pool.connected) {
            await pool.connect();
        }
        try {
            const poolRequest = pool.request();
            const result = await poolRequest.query('SELECT id_class_saida, nome_class_saida FROM class_saida ORDER BY nome_class_saida ASC');
            const class_saida = result.recordset;

            response.status(200).json({ class_saida });

        } catch (error) {
            this.handleError(response, 400, error);
        }
    }

    async updateClassSaida(request: Request, response: Response) {
        const { id_class_saida, nome_class_saida } = request.body;

        if (!pool.connected) {
            await pool.connect();
        }

        try {
            const poolRequest = pool.request();
            poolRequest.input('ID_CLASS_SAIDA', id_class_saida);
            poolRequest.input('NOME_CLASS_SAIDA', nome_class_saida);
            const result = await poolRequest.execute('uspAtualizarClassSaida');

            if (result.returnValue === 0) {
                response.status(200).json({ message: 'Classificação de saida atualizado para: ' + nome_class_saida });
            } else {
                this.handleError(response, 400, result.recordset[0].Retorno);
            }

        } catch (error) {
            this.handleError(response, 500, error);
        }
    }


    async excluirClassSaida(request: Request, response: Response) {
        const { id_class_saida } = request.params;

        if (!pool.connected) {
            await pool.connect();
        }

        const transaction = pool.transaction();

        try {
            await transaction.begin();

            const poolRequest = transaction.request();
            poolRequest.input('id_class_saida', id_class_saida);

            const result = await poolRequest.query('DELETE FROM class_saida WHERE id_class_saida = @id_class_saida');
            const rowsAffected = result.rowsAffected[0];

            if (rowsAffected === 0) {
                await transaction.rollback();
                return this.handleError(response, 404, 'Classificação de saida não encontrado');
            }

            await transaction.commit();

            response.status(200).json({ message: 'Classificação de saida excluído com sucesso', id_class_saida });
        } catch (error) {
            await transaction.rollback();
            this.handleError(response, 400, error);
        }
    }








    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }

}

export { CadastrosRepository };