import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { cadastrosRoutes } from './routes/cadastros.routes';
import { favorecidosRoutes } from './routes/favorecidos.routes';
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
app.use('/cadastros', cadastrosRoutes);
app.use('/favorecidos', favorecidosRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo à API de Gestão!');
});

app.listen(4000, () => {
    console.log("[ server start : port 4000 - OK ]");
});
