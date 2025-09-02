"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const cadastros_routes_1 = require("./routes/cadastros.routes");
const favorecidos_routes_1 = require("./routes/favorecidos.routes");
const user_routes_1 = require("./routes/user.routes");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use('/user', user_routes_1.userRoutes);
app.use('/cadastros', cadastros_routes_1.cadastrosRoutes);
app.use('/favorecidos', favorecidos_routes_1.favorecidosRoutes);
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});
app.listen(4000, () => {
    console.log("[ server start : port 4000 - OK ]");
});
