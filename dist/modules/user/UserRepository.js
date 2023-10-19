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
const sqlserver_1 = require("../../sqlserver");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
class UserRepository {
    cadastrar(request, response) {
        const { name, email, password } = request.body;
        sqlserver_1.pool.connect().then(() => {
            (0, bcrypt_1.hash)(password, 10, (err, passwordHash) => {
                if (err) {
                    sqlserver_1.pool.close();
                    return response.status(500).json(err);
                }
                const request = sqlserver_1.pool.request();
                request.input('name', name);
                request.input('email', email);
                request.input('password', passwordHash);
                request.query('INSERT INTO usuarios (name, email, password) VALUES (@name, @email, @password)')
                    .then(() => {
                    sqlserver_1.pool.close();
                    response.status(200).json({ message: 'Usuário criado com sucesso!' });
                })
                    .catch((error) => {
                    sqlserver_1.pool.close();
                    response.status(400).json(error);
                });
            });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }
    login(request, response) {
        const { email, password } = request.body;
        sqlserver_1.pool.connect().then(() => {
            const request = sqlserver_1.pool.request();
            request.input('email', email);
            request.query('SELECT * FROM usuarios WHERE email = @email')
                .then((result) => {
                sqlserver_1.pool.close();
                if (result.recordset.length === 0) {
                    return response.status(404).json({ error: "Usuário não encontrado" });
                }
                (0, bcrypt_1.compare)(password, result.recordset[0].password, (err, passwordMatch) => {
                    if (err || !passwordMatch) {
                        return response.status(400).json({ error: "Erro na sua autenticação!" });
                    }
                    // jsonwebtoken JWT
                    const token = (0, jsonwebtoken_1.sign)({
                        id: result.recordset[0].id,
                        name: result.recordset[0].name,
                        email: result.recordset[0].email,
                        role: result.recordset[0].role
                    }, process.env.SECRET, { expiresIn: "1d" });
                    const id = result.recordset[0].id;
                    const name = result.recordset[0].name;
                    const userEmail = result.recordset[0].email;
                    const role = result.recordset[0].role;
                    return response.status(200).json({ id, name, userEmail, role, token: token });
                });
            })
                .catch((error) => {
                sqlserver_1.pool.close();
                response.status(400).json({ error: "Erro na sua autenticação!" });
            });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }
    getUsers(request, response) {
        sqlserver_1.pool.connect().then(() => {
            const request = sqlserver_1.pool.request();
            request.query('SELECT id, name, email, role FROM usuarios ORDER BY name ASC')
                .then((result) => {
                sqlserver_1.pool.close();
                if (result.recordset) {
                    response.status(200).json({ usuarios: result.recordset });
                }
                else {
                    response.status(404).json({ error: "Nenhum usuário encontrado" });
                }
            })
                .catch((error) => {
                sqlserver_1.pool.close();
                response.status(400).json({ error: "Erro ao carregar os usuários" });
            });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }
    deleteUser(request, response) {
        const { id } = request.params;
        if (id === '585') {
            return response.status(401).json({ error: "Ação não autorizada, contate o administrador do sistema", id });
        }
        sqlserver_1.pool.connect().then(() => {
            const request = sqlserver_1.pool.request();
            request.input('id', id);
            request.query('DELETE FROM usuarios WHERE id = @id')
                .then((result) => {
                sqlserver_1.pool.close();
                if (result.rowsAffected[0] === 0) {
                    return response.status(404).json({ error: "Usuário não encontrado" });
                }
                return response.status(200).json({ message: "Usuário excluído com sucesso", id });
            })
                .catch((error) => {
                sqlserver_1.pool.close();
                response.status(500).json({ error: "Erro ao deletar o usuário", id });
            });
        }).catch((err) => {
            response.status(500).json({ error: "Erro na sua autenticação!" });
        });
    }
    criarPerfilAcesso(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nome_perfil_acesso } = request.body;
            try {
                const poolRequest = sqlserver_1.pool.request();
                // Defina o valor do parâmetro da stored procedure
                poolRequest.input('NomePerfilAcesso', nome_perfil_acesso);
                // Execute a stored procedure
                const result = yield poolRequest.execute('NomeDaSuaStoredProcedure');
                // Verifique se a stored procedure foi executada com sucesso
                if (result.returnValue === 0) {
                    response.status(200).json({ message: 'Perfil de Acesso criado com sucesso!' });
                }
                else {
                    response.status(400).json({ error: 'Erro ao criar o perfil de acesso' });
                }
            }
            catch (error) {
                response.status(500).json(error);
            }
        });
    }
}
exports.UserRepository = UserRepository;
