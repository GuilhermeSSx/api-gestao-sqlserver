import { Router } from "express";
import { login } from "../middleware/login";
import { UserRepository } from "../modules/user/UserRepository";

const userRoutes = Router();
const userRepository = new UserRepository();

// --- Rotas Públicas ---
userRoutes.post('/sign-up', (req, res) => userRepository.cadastrar(req, res));
userRoutes.post('/sign-in', (req, res) => userRepository.login(req, res));

// --- Rotas Privadas (Protegidas pelo middleware login) ---
// Adicionei o login nestas duas rotas por segurança. Se precisarem ser públicas, pode remover.
userRoutes.post('/get-usuario-filtrado', login, (req, res) => userRepository.UsuariosFiltrados(req, res));
userRoutes.post('/consultar-role-id', (req, res) => userRepository.consultarRoleIdUsuario(req, res));

userRoutes.get('/get-users', login, (req, res) => userRepository.getUsers(req, res));
userRoutes.delete('/delete-user/:id', login, (req, res) => userRepository.deleteUser(req, res));
userRoutes.put('/edit-usuario', login, (req, res) => userRepository.editUsuario(req, res));

export { userRoutes };