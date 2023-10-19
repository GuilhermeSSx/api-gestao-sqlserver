"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const mssql_1 = require("mssql");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Carregue as variáveis de ambiente do arquivo .env
const pool = new mssql_1.ConnectionPool({
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    server: 'jpnrgestaoserver.database.windows.net',
    database: process.env.DATABASE,
    options: {
        encrypt: true, // Use isso se você estiver usando o Azure
    },
});
exports.pool = pool;
// Função para inicializar o pool de conexão
function initializePool() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield pool.connect();
            console.log('Conexão com o banco de dados estabelecida.');
        }
        catch (error) {
            console.error('Erro ao conectar ao banco de dados:', error);
        }
    });
}
// Chame a função de inicialização assim que o módulo for importado
initializePool();
