import { ConnectionPool } from 'mssql';
import { config } from 'dotenv';

config(); // Carregue as variáveis de ambiente do arquivo .env


const pool = new ConnectionPool({
    server: String(process.env.HOST_DATABASE),
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    database: process.env.DATABASE,
    port: Number(process.env.PORT_DATABASE),
    options: {
        trustServerCertificate: true, // Adicione esta linha para ignorar a verificação SSL
        encrypt: true
    }
});

export { pool };

// MUDADO PARA O GOOGLE CLOUD SQLSERVER