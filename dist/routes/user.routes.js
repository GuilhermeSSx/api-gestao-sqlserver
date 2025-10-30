"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const login_1 = require("../middleware/login");
const UserRepository_1 = require("../modules/user/UserRepository");
const userRoutes = (0, express_1.Router)();
exports.userRoutes = userRoutes;
const userRepository = new UserRepository_1.UserRepository();
// rotas
userRoutes.post('/sign-up', (request, response) => {
    userRepository.cadastrar(request, response);
});
userRoutes.post('/sign-in', (request, response) => {
    userRepository.login(request, response);
});
userRoutes.get('/get-users', login_1.login, (request, response) => {
    userRepository.getUsers(request, response);
});
userRoutes.delete('/delete-user/:id', login_1.login, (request, response) => {
    userRepository.deleteUser(request, response);
});
userRoutes.post('/get-usuario-filtrado', (request, response) => {
    userRepository.UsuariosFiltrados(request, response);
});
userRoutes.put('/edit-usuario', login_1.login, (request, response) => {
    userRepository.editUsuario(request, response);
});
userRoutes.post('/consultar-role-id', (request, response) => {
    userRepository.consultarRoleIdUsuario(request, response);
});
