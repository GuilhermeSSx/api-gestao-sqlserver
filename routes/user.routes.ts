import { Router } from "express";
import { login } from "../middleware/login";
import { UserRepository } from "../modules/user/UserRepository";

const userRoutes = Router();
const userRepository = new UserRepository();

// rotas
userRoutes.post('/sign-up', (request, response) => {
    userRepository.cadastrar(request, response);
})

userRoutes.post('/sign-in', (request, response) => {
    userRepository.login(request, response);
})

userRoutes.get('/get-users', login, (request, response) => {
    userRepository.getUsers(request, response);
})

userRoutes.delete('/delete-user/:id', login, (request, response) => {
    userRepository.deleteUser(request, response);
})

userRoutes.post('/criar-perfil-acesso', login, (request, response) => {
    userRepository.criarPerfilAcesso(request, response);
})

userRoutes.get('/get-perfil-acessos', login, (request, response) => {
    userRepository.getPerfilAcessos(request, response);
})

userRoutes.get('/get-perfil-acessos-usuario', login, (request, response) => {
    userRepository.getPerfilAcessosUsuario(request, response);
})

userRoutes.delete('/excluir-perfil-acesso', login, (request, response) => {
    userRepository.excluirPerfilAcesso(request, response);
})

userRoutes.post('/get-perfil-acesso', login, (request, response) => {
    userRepository.carregarPerfilAcesso(request, response);
})

userRoutes.put('/update-acesso-modulo', login, (request, response) => {
    userRepository.updateAcessoModulo(request, response);
})

userRoutes.put('/update-acesso-funcionalidade', login, (request, response) => {
    userRepository.updateAcessoFuncionalidade(request, response);
})

userRoutes.post('/get-usuario-filtrado', (request, response) => {
    userRepository.UsuariosFiltrados(request, response);
})

userRoutes.put('/edit-usuario', login, (request, response) => {
    userRepository.editUsuario(request, response);
})

userRoutes.post('/consultar-role-id', (request, response) => {
    userRepository.consultarRoleIdUsuario(request, response);
})

// userRoutes.get('/get-user', login, (request, response) => {
//      userRepository.getUser(request, response);
// })

export { userRoutes };