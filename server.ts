import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/user.routes';

config();

const app = express();

// 1. Configuração CORS correta e centralizada
app.use(cors({
    origin: "https://simplesagil.com.br/, https://localhost:3000/", // Em produção, troca "*" pela URL do teu frontend (ex: https://meusite.com)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

app.use(express.json());

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});

// 2. AJUSTE DE INICIALIZAÇÃO
// Se for deploy no Coolify/Docker, precisamos do app.listen SEMPRE.
// Só mantém o "if" se tiveres certeza absoluta que vais usar Vercel Functions.
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`[ server start : port ${PORT} - OK ]`);
});

export default app;