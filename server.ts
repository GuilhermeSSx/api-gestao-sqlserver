import express from 'express';
import { userRoutes } from './routes/user.routes';
import { cadastrosRoutes } from './routes/cadastros.routes';
import { favorecidosRoutes } from './routes/favorecidos.routes';
import { config } from 'dotenv';
import cors from 'cors';

config();

const app = express();

const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions)); // Apenas a configuração com o pacote cors()

app.use(express.json());
app.use('/user', userRoutes);
app.use('/cadastros', cadastrosRoutes);
app.use('/favorecidos', favorecidosRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, function() {
    console.log(`[ server start : port ${PORT} - OK ]`);
});