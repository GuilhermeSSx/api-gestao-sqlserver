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
            try {
                const query = 'INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)';
                const params = {
                    name,
                    email,
                    passwordHash,
                };
                yield (0, sqlserver_1.executeQuery)(query, params);
                response.status(200).json({ message: 'Usuário criado com sucesso!' });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            try {
                const query = 'SELECT id, name, role, password FROM usuarios WHERE email = @email';
                const params = {
                    email,
                };
                const result = yield (0, sqlserver_1.executeQuery)(query, params);
                const user = result[0];
                if (!user) {
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                const passwordMatch = yield (0, bcrypt_1.compare)(password, user.password);
                if (!passwordMatch) {
                    return this.handleError(response, 400, 'Erro na autenticação');
                }
                const { id, name, role } = user;
                const token = (0, jsonwebtoken_1.sign)({ id, name, email, role }, process.env.SECRET, { expiresIn: '1d' });
                response.status(200).json({ id, name, email, role, token });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    getUsers(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = 'SELECT id, name, email, role FROM usuarios ORDER BY name ASC';
                const result = yield (0, sqlserver_1.executeQuery)(query);
                const usuarios = result;
                if (usuarios.length > 0) {
                    response.status(200).json({ usuarios });
                }
                else {
                    response.status(404).json({ error: 'Nenhum usuário encontrado' });
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
            try {
                const query = 'DELETE FROM usuarios WHERE id = @id';
                const params = {
                    id,
                };
                const result = yield (0, sqlserver_1.executeQuery)(query, params);
                if (result.rowsAffected[0] === 0) {
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                response.status(200).json({ message: 'Usuário excluído com sucesso', id });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    criarPerfilAcesso(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nome_perfil_acesso } = request.body;
            try {
                const query = 'EXEC NomeDaSuaStoredProcedure @NomePerfilAcesso';
                const params = {
                    NomePerfilAcesso: nome_perfil_acesso,
                };
                const result = yield (0, sqlserver_1.executeQuery)(query, params);
                if (result.returnValue === 0) {
                    response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
                }
                else {
                    response.status(400).json({ error: 'Erro ao criar o perfil de acesso' });
                }
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
