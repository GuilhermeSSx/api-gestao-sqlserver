import express from 'express';
import { userRoutes } from './routes/user.routes';
import { cadastrosRoutes } from './routes/cadastros.routes';
import { favorecidosRoutes } from './routes/favorecidos.routes';
import { config } from 'dotenv';
import cors, { CorsOptions } from 'cors';


config();

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN;

if (!allowedOrigin) {
    throw new Error('A variável de ambiente ALLOWED_ORIGIN não está definida.');
}

const allowedOriginHostname = new URL(allowedOrigin).hostname;

// Adicione o tipo : CorsOptions ao seu objeto de configuração
const corsOptions: CorsOptions = {
    // Agora use os tipos corretos para os parâmetros
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        
        // Permite requisições sem 'origin'
        if (!origin) {
            return callback(null, true);
        }

        const requestHostname = new URL(origin).hostname;

        if (origin === allowedOrigin || requestHostname.endsWith(`.${allowedOriginHostname}`)) {
            callback(null, true);
        } else {
            const error = new Error('Não permitido pela política de CORS');
            callback(error);
        }
    },
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/user', userRoutes);
app.use('/cadastros', cadastrosRoutes);
app.use('/favorecidos', favorecidosRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
    console.log(`[ server start : port ${PORT} - OK ]`);
});