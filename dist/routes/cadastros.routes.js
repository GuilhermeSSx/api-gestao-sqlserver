"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastrosRoutes = void 0;
const express_1 = require("express");
const login_1 = require("../middleware/login");
const CadastrosRepository_1 = require("../modules/cadastros/CadastrosRepository");
const cadastrosRoutes = (0, express_1.Router)();
exports.cadastrosRoutes = cadastrosRoutes;
const cadastrosRepository = new CadastrosRepository_1.CadastrosRepository();
// rotas
cadastrosRoutes.post('/centro-custo', login_1.login, (request, response) => {
    cadastrosRepository.cadastroCentroCusto(request, response);
});
cadastrosRoutes.get('/get-centros-custos', login_1.login, (request, response) => {
    cadastrosRepository.getCentrosCusto(request, response);
});
cadastrosRoutes.put('/update-centro-custo', login_1.login, (request, response) => {
    cadastrosRepository.updateCentroCusto(request, response);
});
cadastrosRoutes.delete('/excluir-centro-custo/:id_centro_custo', login_1.login, (request, response) => {
    cadastrosRepository.excluirCentroCusto(request, response);
});
cadastrosRoutes.post('/class-saida', login_1.login, (request, response) => {
    cadastrosRepository.cadastroClassSaida(request, response);
});
cadastrosRoutes.get('/get-class-saida', login_1.login, (request, response) => {
    cadastrosRepository.getClassSaida(request, response);
});
cadastrosRoutes.put('/update-class-saida', login_1.login, (request, response) => {
    cadastrosRepository.updateClassSaida(request, response);
});
cadastrosRoutes.delete('/excluir-class-saida/:id_class_saida', login_1.login, (request, response) => {
    cadastrosRepository.excluirClassSaida(request, response);
});
