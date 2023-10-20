import { ConnectionPool } from 'mssql';
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

// Função para inicializar o pool de conexão
async function initializePool() {
    try {
        await pool.connect();
        console.log('Conexão com o banco de dados estabelecida.');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}

// Chame a função de inicialização assim que o módulo for importado
initializePool();

export { pool };