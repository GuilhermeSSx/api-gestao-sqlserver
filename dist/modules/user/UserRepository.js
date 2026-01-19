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
exports.getUsers = getUsers;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = require("../../lib/prisma");
function getUsers() {
    return prisma_1.prisma.usuarios.findMany();
}
class UserRepository {
    cadastrar(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role_id } = request.body;
            try {
                const passwordHash = yield (0, bcrypt_1.hash)(password, 10);
                yield prisma_1.prisma.usuarios.create({
                    data: {
                        name,
                        email,
                        password: passwordHash,
                        role_id: Number(role_id)
                    }
                });
                return response.status(200).json({ message: 'Usuário criado com sucesso!' });
            }
            catch (error) {
                return this.handleError(response, 400, error);
            }
        });
    }
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            try {
                const user = yield prisma_1.prisma.usuarios.findUnique({
                    where: { email }
                });
                if (!user) {
                    return this.handleError(response, 404, 'Usuário não encontrado');
                }
                const passwordMatch = yield (0, bcrypt_1.compare)(password, user.password);
                if (!passwordMatch) {
                    return this.handleError(response, 400, 'Erro na autenticação');
                }
                const token = (0, jsonwebtoken_1.sign)({ id: user.id, name: user.name, email: user.email, role_id: user.role_id }, process.env.SECRET, { expiresIn: "1d" });
                return response.status(200).json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    token
                });
            }
            catch (error) {
                return this.handleError(response, 400, error);
            }
        });
    }
    editUsuario(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ID, NAME, EMAIL, PASSWORD, ROLE_ID } = request.body;
            try {
                let passwordHash = null;
                if (PASSWORD && PASSWORD.trim() !== "") {
                    passwordHash = yield (0, bcrypt_1.hash)(PASSWORD, 10);
                }
                // Executa a procedure de edição
                yield prisma_1.prisma.$queryRawUnsafe(`EXEC uspEditUsuario @ID = ?, @NAME = ?, @EMAIL = ?, @PASSWORD = ?, @ROLE_ID = ?`, ID, NAME, EMAIL, passwordHash, ROLE_ID);
                return response.status(200).json({ message: `Usuario ${NAME} atualizado com sucesso!` });
            }
            catch (error) {
                return this.handleError(response, 500, error);
            }
        });
    }
    getUsers(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarios = yield prisma_1.prisma.usuarios.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role_id: true
                    },
                    orderBy: { name: 'asc' }
                });
                return response.status(200).json({ usuarios });
            }
            catch (error) {
                return this.handleError(response, 400, error);
            }
        });
    }
    deleteUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = request.params;
            if (id === '585') {
                return this.handleError(response, 401, 'Ação não autorizada, esse é um usuário administrador padrão.');
            }
            try {
                yield prisma_1.prisma.usuarios.delete({
                    where: { id: Number(id) }
                });
                return response.status(200).json({ message: 'Usuário excluído com sucesso', id });
            }
            catch (error) {
                return this.handleError(response, 404, 'Usuário não encontrado ou erro ao excluir');
            }
        });
    }
    UsuariosFiltrados(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search } = request.body;
            try {
                const usuarios_filtrados = yield prisma_1.prisma.$queryRawUnsafe(`EXEC uspFiltrarUsuarios @SEARCH = ?`, search);
                return response.status(200).json({ usuarios_filtrados });
            }
            catch (error) {
                return this.handleError(response, 400, error);
            }
        });
    }
    consultarRoleIdUsuario(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = request.body;
            try {
                // Note que usamos ` ` (crase) e passamos a variável direto no ${}
                const result = yield prisma_1.prisma.$queryRaw `EXEC uspConsultarRoleId @USER_ID = ${user_id}`;
                return response.status(200).json(result[0]);
            }
            catch (error) {
                return this.handleError(response, 500, error);
            }
        });
    }
    handleError(response, status, error) {
        return response.status(status).json({ error: error.toString() });
    }
}
exports.UserRepository = UserRepository;
