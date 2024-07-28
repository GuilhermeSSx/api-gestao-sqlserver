import { Router } from "express";
import { login } from "../middleware/login";
import { FavorecidosRepository } from "../modules/favorecidos/FavorecidosRepository";

const favorecidosRoutes = Router();
const favorecidosRepository = new FavorecidosRepository();

// rotas


export { favorecidosRoutes }