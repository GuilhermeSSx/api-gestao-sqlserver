"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const mssql_1 = require("mssql");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Carregue as variáveis de ambiente do arquivo .env
const pool = new mssql_1.ConnectionPool({
    server: String(process.env.HOST_DATABASE),
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    database: process.env.DATABASE,
    port: Number(process.env.PORT_DATABASE),
    options: {
        trustServerCertificate: true // Adicione esta linha para ignorar a verificação SSL
    }
});
exports.pool = pool;
// MUDADO PARA O GOOGLE CLOUD SQLSERVER
