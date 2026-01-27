import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/user.routes';
import { prisma } from './lib/prisma';

config();

const app = express();

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

app.use(express.json());

app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).send('OK');
    } catch (error) {
        console.error("🚨 Healthcheck falhou:", error);
        res.status(500).send('Database Offline');
    }
});

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.send('Bem-vindo a API Simples Ágil.');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`[ server start : port ${PORT} - OK ]`);
});

export default app;