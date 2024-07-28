"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favorecidosRoutes = void 0;
const express_1 = require("express");
const FavorecidosRepository_1 = require("../modules/favorecidos/FavorecidosRepository");
const favorecidosRoutes = (0, express_1.Router)();
exports.favorecidosRoutes = favorecidosRoutes;
const favorecidosRepository = new FavorecidosRepository_1.FavorecidosRepository();
