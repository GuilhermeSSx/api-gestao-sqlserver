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
