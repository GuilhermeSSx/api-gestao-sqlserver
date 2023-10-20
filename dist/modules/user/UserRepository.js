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
exports.UserRepository = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const sqlserver_1 = require("../../sqlserver");
class UserRepository {
    cadastrar(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = request.body;
            const passwordHash = yield (0, bcrypt_1.hash)(password, 10);
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('name', name);
                poolRequest.input('email', email);
                poolRequest.input('password', passwordHash);
                yield poolRequest.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)');
                yield transaction.commit();
                response.status(200).json({ message: 'Usuário criado com sucesso!' });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                poolRequest.input('email', email);
                const result = yield poolRequest.query('SELECT id, name, role, password FROM usuarios WHERE email = @email');
                const user = result.recordset[0];
                if (!user) {
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                const passwordMatch = yield (0, bcrypt_1.compare)(password, user.password);
                if (!passwordMatch) {
                    return this.handleError(response, 400, 'Erro na autenticação');
                }
                const { id, name, role } = user;
                const token = (0, jsonwebtoken_1.sign)({ id, name, email, role }, process.env.SECRET, { expiresIn: "1d" });
                response.status(200).json({ id, name, email, role, token });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    getUsers(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                const result = yield poolRequest.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC');
                const usuarios = result.recordset;
                if (usuarios.length > 0) {
                    response.status(200).json({ usuarios });
                }
                else {
                    response.status(404).json({ error: "Nenhum usuário encontrado" });
                }
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    deleteUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            if (id === '585') {
                return this.handleError(response, 401, 'Ação não autorizada, contate o administrador do sistema');
            }
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('id', id);
                const result = yield poolRequest.query('DELETE FROM usuarios WHERE id = @id');
                result.rowsAffected[0];
                yield transaction.commit();
                response.status(200).json({ message: 'Usuário excluído com sucesso', id });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    criarPerfilAcesso(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nome_perfil_acesso } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            const transaction = sqlserver_1.pool.transaction();
            try {
                yield transaction.begin();
                const poolRequest = transaction.request();
                poolRequest.input('NomePerfilAcesso', nome_perfil_acesso);
                const result = yield poolRequest.execute('NomeDaSuaStoredProcedure');
                if (result.returnValue === 0) {
                    yield transaction.commit();
                    response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
                }
                else {
                    yield transaction.rollback();
                    response.status(400).json({ error: 'Erro ao criar o perfil de acesso' });
                }
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 500, error);
            }
        });
    }
    handleError(response, status, error) {
        response.status(status).json({ error: error.toString() });
    }
}
exports.UserRepository = UserRepository;
