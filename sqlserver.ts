import { ConnectionPool, Request as MssqlRequest } from 'mssql';
import { config } from 'dotenv';

config(); // Carregue as variáveis de ambiente do arquivo .env

const pool = new ConnectionPool({
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    server: String(process.env.HOST_DATABASE),
    database: process.env.DATABASE,
    port: Number(process.env.PORT_DATABASE),
    options: {
        encrypt: true, // Use isso se você estiver usando o Azure
    },
});

export async function executeQuery(query: string, params?: Record<string, any>): Promise<any> {
    await pool.connect();
    const request = new MssqlRequest(pool);
    if (params) {
        for (const paramName in params) {
            request.input(paramName, params[paramName]);
        }
    }
    try {
        const result = await request.query(query);
        return result.recordset;
    } finally {
        await pool.close();
    }
}
