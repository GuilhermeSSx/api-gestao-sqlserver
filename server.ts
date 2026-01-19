import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/user.routes';

config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});

// --- AJUSTE PARA VERCEL ---

// Só inicia o listen se não estiver em ambiente de produção (Vercel)
// Isso evita que a função serverless fique "pendurada" tentando abrir uma porta
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`[ server start : port ${PORT} - OK ]`);
    });
}

// OBRIGATÓRIO: Exportar para que o api/index.js consiga importar
export default app;