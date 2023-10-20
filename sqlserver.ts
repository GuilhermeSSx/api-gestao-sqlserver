import { ConnectionPool } from 'mssql';
import { config } from 'dotenv';

config(); // Carregue as variáveis de ambiente do arquivo .env

const connection = new ConnectionPool({
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
    server: String(process.env.HOST_DATABASE),
    database: process.env.DATABASE,
    port: Number(process.env.PORT_DATABASE),
    options: {
        encrypt: true, // Use isso se você estiver usando o Azure
    },
});

connection.connect()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao banco de dados:', error);
    });

export { connection };
