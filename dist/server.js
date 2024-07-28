"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("./routes/user.routes");
const cadastros_routes_1 = require("./routes/cadastros.routes");
const favorecidos_routes_1 = require("./routes/favorecidos.routes");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const cors = require('cors');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(cors());
app.use(express_1.default.json());
app.use('/user', user_routes_1.userRoutes);
app.use('/cadastros', cadastros_routes_1.cadastrosRoutes);
app.use('/favorecidos', favorecidos_routes_1.favorecidosRoutes);
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});
//criar o servidor
app.listen(4000, function () {
    console.log("[ server start : port 4000 - OK ]");
});
