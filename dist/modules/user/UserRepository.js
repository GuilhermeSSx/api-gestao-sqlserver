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
            const { name, email, password, role_id } = request.body;
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
                poolRequest.input('role_id', role_id);
                yield poolRequest.query('INSERT INTO usuarios (name, email, password, role_id) VALUES (@name, @email, @password, @role_id)');
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
                const result = yield poolRequest.query('SELECT id, name, role_id, password FROM usuarios WHERE email = @email');
                const user = result.recordset[0];
                if (!user) {
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                const passwordMatch = yield (0, bcrypt_1.compare)(password, user.password);
                if (!passwordMatch) {
                    return this.handleError(response, 400, 'Erro na autenticação');
                }
                const { id, name, userEmail, role_id, } = user;
                const token = (0, jsonwebtoken_1.sign)({ id, name, userEmail, role_id }, process.env.SECRET, { expiresIn: "1d" });
                response.status(200).json({ id, name, userEmail, role_id, token });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    editUsuario(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;
            const passwordHash = yield (0, bcrypt_1.hash)(PASSWORD, 10);
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                poolRequest.input('ID', ID);
                poolRequest.input('NAME', NAME);
                poolRequest.input('EMAIL', EMAIL);
                poolRequest.input('PASSWORD', passwordHash);
                poolRequest.input('ROLE_ID', ROLE_ID);
                const result = yield poolRequest.execute('uspEditUsuario');
                if (result.returnValue === 0) {
                    response.status(200).json({ message: `Usuario ${NAME} atualizado com sucesso!` });
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
    getUsers(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                const result = yield poolRequest.query('SELECT id, name, email, role_id FROM usuarios ORDER BY name ASC');
                const usuarios = result.recordset;
                response.status(200).json({ usuarios });
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
                return this.handleError(response, 401, 'Ação não autorizada, esse um usuario adminstrador padrão do sistema.');
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
                const rowsAffected = result.rowsAffected[0];
                if (rowsAffected === 0) {
                    yield transaction.rollback();
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                yield transaction.commit();
                response.status(200).json({ message: 'Usuário excluído com sucesso', id });
            }
            catch (error) {
                yield transaction.rollback();
                this.handleError(response, 400, error);
            }
        });
    }
    UsuariosFiltrados(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                poolRequest.input('SEARCH', search);
                const result = yield poolRequest.execute('uspFiltrarUsuarios');
                const usuarios_filtrados = result.recordset;
                response.status(200).json({ usuarios_filtrados });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    consultarRoleIdUsuario(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = request.body;
            if (!sqlserver_1.pool.connected) {
                yield sqlserver_1.pool.connect();
            }
            try {
                const poolRequest = sqlserver_1.pool.request();
                poolRequest.input('USER_ID', user_id);
                const result = yield poolRequest.execute('uspConsultarRoleId');
                response.status(200).json(result.recordset[0]);
            }
            catch (error) {
                this.handleError(response, 500, error);
            }
        });
    }
    handleError(response, status, error) {
        response.status(status).json({ error: error.toString() });
    }
}
exports.UserRepository = UserRepository;
