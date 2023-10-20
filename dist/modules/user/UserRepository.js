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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const sqlserver_1 = __importDefault(require("../../sqlserver"));
const mssql_1 = require("mssql");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
class UserRepository {
    constructor() {
        this.pool = sqlserver_1.default;
    }
    handleError(response, status, error) {
        response.status(status).json({ error: error.toString() });
    }
    runTransaction(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = new mssql_1.Transaction(this.pool);
            try {
                yield transaction.begin();
                const requestInstance = transaction.request();
                const result = yield queries(requestInstance);
                yield transaction.commit();
                return result;
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
    cadastrar(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = request.body;
            const passwordHash = yield (0, bcrypt_1.hash)(password, 10);
            try {
                const result = yield this.runTransaction((requestInstance) => __awaiter(this, void 0, void 0, function* () {
                    requestInstance.input('name', name);
                    requestInstance.input('email', email);
                    requestInstance.input('password', passwordHash);
                    return requestInstance.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)');
                }));
                response.status(200).json({ message: 'Usuário criado com sucesso!' });
            }
            catch (error) {
                this.handleError(response, 400, error);
            }
        });
    }
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            let email;
            if (request.body && request.body.email) {
                email = request.body.email;
            }
            else {
                return this.handleError(response, 400, 'Email não fornecido');
            }
            try {
                const result = yield this.runTransaction((requestInstance) => __awaiter(this, void 0, void 0, function* () {
                    requestInstance.input('email', email);
                    return requestInstance.query('SELECT id, name, role, password FROM usuarios WHERE email = @email');
                }));
                if (result.recordset.length === 0) {
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                const { id, name, role, password } = result.recordset[0];
                const passwordMatch = yield (0, bcrypt_1.compare)(request.body.password, password);
                if (!passwordMatch) {
                    return this.handleError(response, 400, 'Erro na autenticação');
                }
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
            try {
                const result = yield this.runTransaction((requestInstance) => __awaiter(this, void 0, void 0, function* () {
                    return requestInstance.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC');
                }));
                if (result.recordset) {
                    response.status(200).json({ usuarios: result.recordset });
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
            try {
                const result = yield this.runTransaction((requestInstance) => __awaiter(this, void 0, void 0, function* () {
                    requestInstance.input('id', id);
                    return requestInstance.query('DELETE FROM usuarios WHERE id = @id');
                }));
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
                const result = yield this.runTransaction((requestInstance) => __awaiter(this, void 0, void 0, function* () {
                    requestInstance.input('NomePerfilAcesso', nome_perfil_acesso);
                    return requestInstance.execute('NomeDaSuaStoredProcedure');
                }));
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
}
exports.UserRepository = UserRepository;
