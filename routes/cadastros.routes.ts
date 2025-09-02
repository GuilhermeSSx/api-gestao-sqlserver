import { Router } from "express";
import { login } from "../middleware/login";
import { CadastrosRepository } from "../modules/cadastros/CadastrosRepository";

const cadastrosRoutes = Router();
const cadastrosRepository = new CadastrosRepository();

// rotas
cadastrosRoutes.post('/centro-custo', login, (request, response) => {
    cadastrosRepository.cadastroCentroCusto(request, response);
})

cadastrosRoutes.get('/get-centros-custos', login, (request, response) => {
    cadastrosRepository.getCentrosCusto(request, response);
})

cadastrosRoutes.put('/update-centro-custo', login, (request, response) => {
    cadastrosRepository.updateCentroCusto(request, response);
})

cadastrosRoutes.delete('/excluir-centro-custo/:id_centro_custo', login, (request, response) => {
    cadastrosRepository.excluirCentroCusto(request, response);
})

cadastrosRoutes.post('/class-saida', login, (request, response) => {
    cadastrosRepository.cadastroClassSaida(request, response);
})

cadastrosRoutes.get('/get-class-saida', login, (request, response) => {
    cadastrosRepository.getClassSaida(request, response);
})

cadastrosRoutes.put('/update-class-saida', login, (request, response) => {
    cadastrosRepository.updateClassSaida(request, response);
})

cadastrosRoutes.delete('/excluir-class-saida/:id_class_saida', login, (request, response) => {
    cadastrosRepository.excluirClassSaida(request, response);
})


export { cadastrosRoutes }