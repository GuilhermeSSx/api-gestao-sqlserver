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
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use('/user', user_routes_1.userRoutes);
app.use('/cadastros', cadastros_routes_1.cadastrosRoutes);
app.use('/favorecidos', favorecidos_routes_1.favorecidosRoutes);
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
    console.log(`[ server start : port ${PORT} - OK ]`);
});
