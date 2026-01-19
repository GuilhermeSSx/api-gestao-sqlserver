"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});
// --- AJUSTE PARA VERCEL ---
// Só inicia o listen se não estiver em ambiente de produção (Vercel)
// Isso evita que a função serverless fique "pendurada" tentando abrir uma porta
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`[ server start : port ${PORT} - OK ]`);
    });
}
// OBRIGATÓRIO: Exportar para que o api/index.js consiga importar
exports.default = app;
