"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mssql_1 = require("mssql");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Carregue as variáveis de ambiente do arquivo .env
const connection = new mssql_1.ConnectionPool({
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    server: String(process.env.HOST_DATABASE),
    database: process.env.DATABASE,
    port: Number(process.env.PORT_DATABASE),
    options: {
        encrypt: true, // Use isso se você estiver usando o Azure
    },
});
exports.connection = connection;
connection.connect()
    .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
})
    .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
});
