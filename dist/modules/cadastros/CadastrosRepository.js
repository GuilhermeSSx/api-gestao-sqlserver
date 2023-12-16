"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CadastrosRepository = void 0;
const sqlserver_1 = require("../../sqlserver");
class CadastrosRepository {
    cadastroCentroCusto(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nome_centro_custo } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('nome_centro_custo', nome_centro_custo);
                yield poolRequest.query('INSERT INTO centro_custo (nome_centro_custo) VALUES (@nome_centro_custo)');
                yield transaction.commit();
                response.status(200).json({ message: 'Centro de custo criado com sucesso!' });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    getCentrosCusto(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                const result = yield poolRequest.query('SELECT id_centro_custo, nome_centro_custo FROM centro_custo ORDER BY nome_centro_custo ASC');
                const centro_custo = result.recordset;
                response.status(200).json({ centro_custo });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    updateCentroCusto(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_centro_custo, nome_centro_custo } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                poolRequest.input('ID_CENTRO_CUSTO', id_centro_custo);
                poolRequest.input('NOME_CENTRO_CUSTO', nome_centro_custo);
                const result = yield poolRequest.execute('uspAtualizarCentroCusto');
                if (result.returnValue === 0) {
                    response.status(200).json({ message: 'Centro de custo atualizado para: ' + nome_centro_custo });
                }
                else {
                    this.handleError(response, 400, result.recordset[0].Retorno);
                }
            }
            catch (error) {
                this.handleError(response, 500, error);
            }
        });
    }
    excluirCentroCusto(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_centro_custo } = request.params;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('id_centro_custo', id_centro_custo);
                const result = yield poolRequest.query('DELETE FROM centro_custo WHERE id_centro_custo = @id_centro_custo');
                const rowsAffected = result.rowsAffected[0];
                if (rowsAffected === 0) {
                    yield transaction.rollback();
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                yield transaction.commit();
                response.status(200).json({ message: 'Centro de custo excluído com sucesso', id_centro_custo });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    cadastroClassSaida(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nome_class_saida } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('nome_class_saida', nome_class_saida);
                yield poolRequest.query('INSERT INTO class_saida (nome_class_saida) VALUES (@nome_class_saida)');
                yield transaction.commit();
                response.status(200).json({ message: 'Classificação de saida criada com sucesso!' });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    getClassSaida(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                const result = yield poolRequest.query('SELECT id_class_saida, nome_class_saida FROM class_saida ORDER BY nome_class_saida ASC');
                const class_saida = result.recordset;
                response.status(200).json({ class_saida });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    updateClassSaida(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_class_saida, nome_class_saida } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                poolRequest.input('ID_CLASS_SAIDA', id_class_saida);
                poolRequest.input('NOME_CLASS_SAIDA', nome_class_saida);
                const result = yield poolRequest.execute('uspAtualizarClassSaida');
                if (result.returnValue === 0) {
                    response.status(200).json({ message: 'Classificação de saida atualizado para: ' + nome_class_saida });
                }
                else {
                    this.handleError(response, 400, result.recordset[0].Retorno);
                }
            }
            catch (error) {
                this.handleError(response, 500, error);
            }
        });
    }
    excluirClassSaida(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_class_saida } = request.params;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('id_class_saida', id_class_saida);
                const result = yield poolRequest.query('DELETE FROM class_saida WHERE id_class_saida = @id_class_saida');
                const rowsAffected = result.rowsAffected[0];
                if (rowsAffected === 0) {
                    yield transaction.rollback();
                    return this.handleError(response, 404, 'Classificação de saida não encontrado');
                }
                yield transaction.commit();
                response.status(200).json({ message: 'Classificação de saida excluído com sucesso', id_class_saida });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    handleError(response, status, error) {
        response.status(status).json({ error: error.toString() });
    }
}
exports.CadastrosRepository = CadastrosRepository;
