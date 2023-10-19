"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const mssql_1 = require("mssql");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const pool = new mssql_1.ConnectionPool({
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    server: 'jpnrgestao.database.windows.net',
    database: process.env.DATABASE,
    options: {
        encrypt: true, // Use isso se você estiver usando o Azure
    },
});
exports.pool = pool;
