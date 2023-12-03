"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
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
userRoutes.get('/get-users', (request, response) => {
    userRepository.getUsers(request, response);
});
userRoutes.delete('/delete-user/:id', (request, response) => {
    userRepository.deleteUser(request, response);
});
userRoutes.post('/criar-perfil-acesso', (request, response) => {
    userRepository.criarPerfilAcesso(request, response);
});
userRoutes.get('/get-perfil-acessos', (request, response) => {
    userRepository.getPerfilAcessos(request, response);
});
userRoutes.delete('/excluir-perfil-acesso', (request, response) => {
    userRepository.excluirPerfilAcesso(request, response);
});
userRoutes.post('/get-perfil-acesso', (request, response) => {
    userRepository.carregarPerfilAcesso(request, response);
});
userRoutes.put('/update-acesso-modulo', (request, response) => {
    userRepository.updateAcessoModulo(request, response);
});
userRoutes.put('/update-acesso-funcionalidade', (request, response) => {
    userRepository.updateAcessoFuncionalidade(request, response);
});
userRoutes.post('/get-usuario-filtrado', (request, response) => {
    userRepository.UsuariosFiltrados(request, response);
});
