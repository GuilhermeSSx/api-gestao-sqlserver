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
const allowedOrigin = process.env.ALLOWED_ORIGIN;
if (!allowedOrigin) {
    throw new Error('A variável de ambiente ALLOWED_ORIGIN não está definida.');
}
const allowedOriginHostname = new URL(allowedOrigin).hostname;
// Adicione o tipo : CorsOptions ao seu objeto de configuração
const corsOptions = {
    // Agora use os tipos corretos para os parâmetros
    origin: (origin, callback) => {
        // Permite requisições sem 'origin'
        if (!origin) {
            return callback(null, true);
        }
        const requestHostname = new URL(origin).hostname;
        if (origin === allowedOrigin || requestHostname.endsWith(`.${allowedOriginHostname}`)) {
            callback(null, true);
        }
        else {
            const error = new Error('Não permitido pela política de CORS');
            callback(error);
        }
    },
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
