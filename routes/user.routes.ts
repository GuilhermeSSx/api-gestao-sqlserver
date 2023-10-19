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

userRoutes.get('/get-users', (request, response) => {
    userRepository.getUsers(request, response);
})

userRoutes.delete('/delete-user/:id', (request, response) => {
    userRepository.deleteUser(request, response);
})

// userRoutes.get('/get-user', login, (request, response) => {
//     userRepository.getUser(request, response);
// })

// Perfil de acesso ⬇️






export { userRoutes };