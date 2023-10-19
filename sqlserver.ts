import { ConnectionPool } from 'mssql';
import { config } from 'dotenv';
config();

const pool = new ConnectionPool({
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    server: 'jpnrgestao.database.windows.net',
    database: process.env.DATABASE,
    options: {
        encrypt: true, // Use isso se você estiver usando o Azure
    },
});

export { pool };